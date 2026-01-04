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

    // Perform shredding in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete the encryption key (this makes data unreadable)
      await deleteVoterKey(normalizedVoterId);

      // 2. Update user status to DELETED
      await tx.user.update({
        where: { id: user.id },
        data: { status: "DELETED" },
      });

      // 3. Log the shredding event to ledger (for audit trail)
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

      await tx.auditLog.create({
        data: {
          userId: user.id,
          eventType: "SHRED_REQUEST",
          encrypted_payload: encrypted, // Placeholder, actual data is now unreadable
          iv: iv,
          signature: "ADMIN_SHRED_SIG",
          prev_hash: prevHash,
          curr_hash: currHash,
        },
      });
    });

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
    const canDecrypt = await canDecryptVoterData(normalizedVoterId);

    return { 
      canDecrypt, 
      message: canDecrypt 
        ? "Data is readable" 
        : "Data has been shredded (key deleted)" 
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