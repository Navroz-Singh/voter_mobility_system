import crypto from 'crypto';
import { prisma } from './db';

/**
 * Verifies the integrity of the hash chain using encrypted payloads
 * This ensures the chain is valid without needing to decrypt the data
 * 
 * @param {string} userId - Optional: Verify chain for specific user
 * @returns {Promise<{valid: boolean, errors: Array, verifiedCount: number}>}
 */
export async function verifyLedgerIntegrity(userId = null) {
  const errors = [];
  let verifiedCount = 0;
  let totalEntries = 0;

  try {
    // 1. Get distinct User IDs if we are checking everything
    let targetUserIds = [];
    if (userId) {
      targetUserIds = [userId];
    } else {
      const users = await prisma.user.findMany({ select: { id: true } });
      targetUserIds = users.map(u => u.id);
    }

    // 2. Iterate through EACH user separately (Per-Voter Chain)
    for (const uid of targetUserIds) {
      const ledgerEntries = await prisma.auditLog.findMany({
        where: { userId: uid },
        orderBy: { timestamp: 'asc' }, // Chronological order per user
      });

      if (ledgerEntries.length === 0) continue;

      totalEntries += ledgerEntries.length;
      let prevHash = "0"; // Reset Genesis hash for EVERY new user

      for (let i = 0; i < ledgerEntries.length; i++) {
        const entry = ledgerEntries[i];

        // A. Verify Chain Link
        if (entry.prev_hash !== prevHash) {
          errors.push({
            entryId: entry.id,
            userId: uid,
            issue: 'Broken chain link',
            expected: prevHash,
            actual: entry.prev_hash,
            message: `User ${uid} chain broken at entry ${entry.id}`
          });
          // If link is broken, we reset prevHash to current to try and verify the rest linearly
          // or we can stop verification for this user.
        }

        const signatureToUse = entry.signature || "SYSTEM_SIGNED";

        // B. Recalculate Hash
        const calculatedHash = crypto
          .createHash('sha256')
          .update(
            entry.prev_hash + 
            entry.encrypted_payload + 
            entry.iv + 
            signatureToUse 
          )
          .digest('hex');

        // C. Verify Data Integrity
        if (calculatedHash !== entry.curr_hash) {
          errors.push({
            entryId: entry.id,
            userId: uid,
            issue: 'Hash mismatch',
            expected: calculatedHash,
            actual: entry.curr_hash,
            message: `Data tampering detected in entry ${entry.id}`
          });
        } else {
          verifiedCount++;
        }

        // Set for next iteration
        prevHash = entry.curr_hash;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      verifiedCount,
      totalEntries,
      message: errors.length === 0 
        ? `✅ Integrated Verified: ${verifiedCount}/${totalEntries} entries clean.` 
        : `❌ Integrity Failed: ${errors.length} errors found.`
    };

  } catch (error) {
    console.error('Verification Fatal Error:', error);
    return { valid: false, errors: [error.message] };
  }
}



/**
 * Verifies a specific ledger entry's hash
 * @param {string} entryId - The audit log entry ID
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function verifySingleEntry(entryId) {
  try {
    const entry = await prisma.auditLog.findUnique({
      where: { id: entryId },
      select: {
        id: true,
        userId: true,
        encrypted_payload: true,
        iv: true,
        signature: true,
        prev_hash: true,
        curr_hash: true,
      },
    });

    if (!entry) {
      return { valid: false, error: 'Entry not found' };
    }

    // Get previous entry to verify chain link
    const prevEntry = await prisma.auditLog.findFirst({
      where: {
        userId: entry.userId,
        curr_hash: entry.prev_hash,
      },
    });

    const prevHash = prevEntry?.curr_hash || "0";

    // Recalculate hash using ENCRYPTED payload
    const calculatedHash = crypto
      .createHash('sha256')
      .update(
        prevHash + 
        entry.encrypted_payload + // ✅ Encrypted payload
        entry.iv + 
        entry.signature
      )
      .digest('hex');

    const valid = calculatedHash === entry.curr_hash;
    
    return {
      valid,
      error: valid ? null : 'Hash mismatch - data may have been tampered with',
      calculatedHash,
      storedHash: entry.curr_hash,
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Verifies hash chain for a specific voter
 * @param {string} epicNumber - Voter's EPIC number
 * @returns {Promise<{valid: boolean, errors: Array, verifiedCount: number}>}
 */
export async function verifyVoterChain(epicNumber) {
  try {
    const user = await prisma.user.findUnique({
      where: { epic_number: epicNumber.toUpperCase() },
      select: { id: true },
    });

    if (!user) {
      return {
        valid: false,
        errors: [{ issue: 'User not found', message: `No user found with EPIC: ${epicNumber}` }],
        verifiedCount: 0,
      };
    }

    return await verifyLedgerIntegrity(user.id);
  } catch (error) {
    return {
      valid: false,
      errors: [{ issue: 'Verification failed', message: error.message }],
      verifiedCount: 0,
    };
  }
}