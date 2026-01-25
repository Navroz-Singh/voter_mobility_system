"use server";

import { prisma } from "@/lib/db";
import { deleteVoterKey, canDecryptVoterData, decryptPayload, encryptPayload } from "@/lib/encryption";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

/**
 * Shreds a voter's personal data by deleting their encryption key
 * @param {string} voterId - EPIC number or voter ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function shredVoterDataAction(voterId) {
  try {
    if (!voterId) {
      return { success: false, error: "Voter ID is required" };
    }

    // Normalize EPIC to uppercase
    const normalizedVoterId = voterId.toUpperCase();

    // Check if key exists
    const keyExists = await canDecryptVoterData(normalizedVoterId);
    if (!keyExists) {
      return { 
        success: false, 
        error: "Voter data already shredded or key not found" 
      };
    }

    // Get user record to log the shredding event
    const user = await prisma.user.findUnique({
      where: { epic_number: normalizedVoterId },
      include: { auditLogs: { orderBy: { timestamp: "desc" }, take: 1 } },
    });

    if (!user) {
      return { success: false, error: "Voter not found" };
    }

    // 1. Encrypt the shred payload BEFORE starting transaction (avoid nested DB calls)
    const prevHash = user.auditLogs[0]?.curr_hash || "0";

    const shredPayload = {
      action: "SHRED_REQUEST",
      voterId: normalizedVoterId,
      timestamp: new Date().toISOString()
    };
    const { encrypted, iv } = await encryptPayload(normalizedVoterId, shredPayload);

    const currHash = crypto
      .createHash("sha256")
      .update(prevHash + encrypted + iv + "ADMIN_SHRED_SIG")
      .digest("hex");

    // 2. Perform shredding in transaction (only DB writes)
    await prisma.$transaction(async (tx) => {
      // Log the shredding event to ledger
      await tx.auditLog.create({
        data: {
          userId: user.id,
          eventType: "SHRED_REQUEST",
          encrypted_payload: encrypted,
          iv: iv,
          signature: "ADMIN_SHRED_SIG",
          prev_hash: prevHash,
          curr_hash: currHash,
        },
      });

      // Update user status to DELETED
      await tx.user.update({
        where: { id: user.id },
        data: { status: "DELETED" },
      });
    });

    // 3. Delete the encryption key AFTER transaction (this makes data unreadable)
    await deleteVoterKey(normalizedVoterId);

    revalidatePath("/admin/privacy");
    return { success: true, message: "Voter data successfully shredded" };
  } catch (error) {
    console.error("Shredding error:", error);
    return { success: false, error: "Failed to shred voter data" };
  }
}

/**
 * Checks if a voter's data can be decrypted
 * @param {string} voterId - EPIC number
 * @returns {Promise<{canDecrypt: boolean, error?: string}>}
 */
export async function checkVoterDataStatusAction(voterId) {
  try {
    if (!voterId) {
      return { canDecrypt: false, error: "Voter ID is required" };
    }

    const normalizedVoterId = voterId.toUpperCase();

    // First check if encryption key exists
    const canDecrypt = await canDecryptVoterData(normalizedVoterId);

    if (canDecrypt) {
      return {
        canDecrypt: true,
        message: "Data is readable"
      };
    }

    // If no key exists, check if this is a newly claimed user
    // (user exists with a real password but no encrypted data yet)
    const user = await prisma.user.findUnique({
      where: { epic_number: normalizedVoterId },
      select: {
        password_hash: true,
        status: true,
        auditLogs: {
          select: { id: true },
          take: 1
        }
      }
    });

    if (user) {
      // If user exists and has a real password (not placeholder)
      const hasRealPassword = user.password_hash &&
                             user.password_hash !== "PENDING_CLAIM" &&
                             user.password_hash !== "OFFLINE_PROVISIONED_PENDING_CLAIM" &&
                             user.password_hash !== "OFFLINE_ENROLLMENT_PENDING_CLAIM";

      // If user has audit logs but no key, data was shredded
      if (hasRealPassword) {
        return {
          canDecrypt: false,
          message: "Data has been shredded (key deleted)"
        };
      }


      // If user has placeholder password, they're not claimed yet
      if (!hasRealPassword) {
        return {
          canDecrypt: false,
          error: "Account not claimed yet"
        };
      }
    }

    // User doesn't exist or other edge case
    return {
      canDecrypt: false,
      error: "Voter not found"
    };
  } catch (error) {
    console.error("Status check error:", error);
    return { canDecrypt: false, error: "Failed to check status" };
  }
}


/**
 * Attempts to decrypt and return voter data (for testing/verification)
 * @param {string} voterId - EPIC number
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function decryptVoterDataAction(voterId) {
  try {
    if (!voterId) {
      return { success: false, error: "Voter ID is required" };
    }

    const normalizedVoterId = voterId.toUpperCase();

    // Get the latest ledger entry
    const user = await prisma.user.findUnique({
      where: { epic_number: normalizedVoterId },
      include: { 
        auditLogs: { 
          orderBy: { timestamp: "desc" }, 
          take: 1 
        } 
      },
    });

    if (!user || !user.auditLogs[0]) {
      return { success: false, error: "No ledger entry found" };
    }

    const latestLog = user.auditLogs[0];

    // Attempt to decrypt
    try {
      const decrypted = await decryptPayload(
        normalizedVoterId,
        latestLog.encrypted_payload,
        latestLog.iv
      );

      return { success: true, data: decrypted };
    } catch (decryptError) {
      if (decryptError.message.includes("not found") || decryptError.message.includes("shredded")) {
        return { 
          success: false, 
          error: "Data has been cryptographically shredded. Key not found." 
        };
      }
      throw decryptError;
    }
  } catch (error) {
    console.error("Decryption error:", error);
    return { success: false, error: "Failed to decrypt data" };
  }
}