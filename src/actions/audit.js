"use server";

import { verifyLedgerIntegrity, verifyVoterChain, verifySingleEntry } from "@/lib/hashVerification";
import { revalidatePath } from "next/cache";

/**
 * Verifies the entire ledger chain integrity
 * @returns {Promise<{success: boolean, result?: object, error?: string}>}
 */
export async function verifyLedgerChainAction() {
  try {
    const result = await verifyLedgerIntegrity();
    revalidatePath("/admin/audit");
    return { success: true, result };
  } catch (error) {
    console.error("Ledger verification error:", error);
    return { success: false, error: "Verification failed" };
  }
}

/**
 * Verifies hash chain for a specific voter
 * @param {string} epicNumber - Voter's EPIC number
 * @returns {Promise<{success: boolean, result?: object, error?: string}>}
 */
export async function verifyVoterChainAction(epicNumber) {
  try {
    if (!epicNumber) {
      return { success: false, error: "EPIC number is required" };
    }

    const result = await verifyVoterChain(epicNumber);
    return { success: true, result };
  } catch (error) {
    console.error("Voter chain verification error:", error);
    return { success: false, error: "Verification failed" };
  }
}



/**
 * Verifies a single ledger entry
 * @param {string} entryId - Entry ID to verify
 * @returns {Promise<{success: boolean, result?: object, error?: string}>}
 */
export async function verifyEntryAction(entryId) {
  try {
    if (!entryId) {
      return { success: false, error: "Entry ID is required" };
    }

    const result = await verifySingleEntry(entryId);
    return { success: true, result };
  } catch (error) {
    console.error("Entry verification error:", error);
    return { success: false, error: "Verification failed" };
  }
}