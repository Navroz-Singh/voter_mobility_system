import crypto from "crypto";
// ✅ Correct (Add curly braces)
import { prisma } from "./db.js";

// Master Key for encrypting voter keys (In production, use HSM or AWS KMS)
// Store this in environment variable: MASTER_ENCRYPTION_KEY
const MASTER_KEY =
  process.env.MASTER_ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const MASTER_IV =
  process.env.MASTER_IV || crypto.randomBytes(16).toString("hex");

/**
 * Generates a new AES-256 key for a voter
 * @param {string} voterId - The voter's EPIC number or unique ID
 * @returns {Buffer} - Raw AES-256 key (32 bytes)
 */
export function generateVoterKey(voterId) {
  // Generate a unique key for this voter
  const keyMaterial = crypto
    .createHash("sha256")
    .update(voterId + Date.now() + crypto.randomBytes(16).toString("hex"))
    .digest();

  return keyMaterial; // 32 bytes for AES-256
}

/**
 * Encrypts the voter's key using the master key
 * @param {Buffer} voterKey - Raw voter key
 * @returns {string} - Encrypted key (hex string)
 */
function encryptVoterKeyWithMaster(voterKey) {
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(MASTER_KEY, "hex"),
    Buffer.from(MASTER_IV, "hex")
  );

  let encrypted = cipher.update(voterKey, null, "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  // Store IV and authTag with encrypted key
  return `${encrypted}:${MASTER_IV}:${authTag}`;
}

/**
 * Decrypts the voter's key using the master key
 * @param {string} encryptedKeyString - Encrypted key string
 * @returns {Buffer} - Decrypted voter key
 */
function decryptVoterKeyWithMaster(encryptedKeyString) {
  const [encrypted, iv, authTag] = encryptedKeyString.split(":");

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(MASTER_KEY, "hex"),
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(encrypted, "hex", null);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}

/**
 * Gets or creates an encryption key for a voter
 * @param {string} voterId - The voter's EPIC number
 * @returns {Promise<Buffer>} - The voter's decrypted AES key
 */
export async function getOrCreateVoterKey(voterId) {
  try {
    // Try to find existing key
    const keyRecord = await prisma.encryptionKey.findUnique({
      where: { voter_id: voterId },
    });

    if (keyRecord) {
      // Decrypt the stored key
      return decryptVoterKeyWithMaster(keyRecord.encrypted_key);
    }

    // Create new key
    const rawKey = generateVoterKey(voterId);
    const encryptedKey = encryptVoterKeyWithMaster(rawKey);

    // Store encrypted key in database
    await prisma.encryptionKey.create({
      data: {
        voter_id: voterId,
        encrypted_key: encryptedKey,
      },
    });

    return rawKey;
  } catch (error) {
    console.error("Error getting/creating voter key:", error);
    throw error;
  }
}

/**
 * Encrypts a payload using the voter's key
 * @param {string} voterId - The voter's EPIC number
 * @param {object} payload - The data to encrypt
 * @returns {Promise<{encrypted: string, iv: string}>} - Encrypted data and IV
 */
export async function encryptPayload(voterId, payload) {
  if (!voterId || typeof voterId !== "string") {
    throw new Error("voterId is required and must be a string");
  }
  if (!payload || typeof payload !== "object") {
    throw new Error("payload is required and must be an object");
  }

  try {
    // Get or create voter's key
    const voterKey = await getOrCreateVoterKey(voterId);

    // Generate random IV for this encryption
    const iv = crypto.randomBytes(16);

    // Encrypt using AES-256-GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", voterKey, iv);

    const plaintext = JSON.stringify(payload);
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get authentication tag
    const authTag = cipher.getAuthTag().toString("hex");

    // Return encrypted data with IV and authTag
    return {
      encrypted: `${encrypted}:${authTag}`, // Combine encrypted data and auth tag
      iv: iv.toString("hex"),
    };
  } catch (error) {
    console.error("Error encrypting payload:", error);
    throw error;
  }
}

/**
 * Decrypts a payload using the voter's key
 * @param {string} voterId - The voter's EPIC number
 * @param {string} encryptedData - Encrypted data with auth tag
 * @param {string} ivHex - Initialization vector (hex string)
 * @returns {Promise<object>} - Decrypted payload
 */
export async function decryptPayload(voterId, encryptedData, ivHex) {
  try {
    // Get voter's key
    const keyRecord = await prisma.encryptionKey.findUnique({
      where: { voter_id: voterId },
    });

    if (!keyRecord) {
      throw new Error(
        `Encryption key not found for voter: ${voterId}. Data may have been shredded.`
      );
    }

    // Decrypt the voter key
    const voterKey = decryptVoterKeyWithMaster(keyRecord.encrypted_key);

    // Split encrypted data and auth tag
    const [encrypted, authTag] = encryptedData.split(":");

    if (!encrypted || !authTag) {
      throw new Error("Invalid encrypted data format: missing auth tag");
    }
    const iv = Buffer.from(ivHex, "hex");

    // Decrypt
    const decipher = crypto.createDecipheriv("aes-256-gcm", voterKey, iv);
    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Error decrypting payload:", error);
    throw error;
  }
}

/**
 * Deletes a voter's encryption key (Cryptographic Shredding)
 * @param {string} voterId - The voter's EPIC number
 * @returns {Promise<void>}
 */
export async function deleteVoterKey(voterId) {
  try {
    // Delete the encryption key
    await prisma.encryptionKey.delete({
      where: { voter_id: voterId },
    });

    console.log(
      `✅ Encryption key deleted for voter: ${voterId}. Data is now cryptographically shredded.`
    );
  } catch (error) {
    if (error.code === "P2025") {
      // Key already deleted
      console.log(`Key already deleted for voter: ${voterId}`);
      return;
    }
    console.error("Error deleting voter key:", error);
    throw error;
  }
}

/**
 * Checks if a voter's data can be decrypted (key exists)
 * @param {string} voterId - The voter's EPIC number
 * @returns {Promise<boolean>} - True if key exists, false if shredded
 */
export async function canDecryptVoterData(voterId) {
  try {
    const keyRecord = await prisma.encryptionKey.findUnique({
      where: { voter_id: voterId },
    });
    return !!keyRecord;
  } catch (error) {
    return false;
  }
}
