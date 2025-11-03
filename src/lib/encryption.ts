/**
 * Encryption utilities for securing sensitive data like API keys
 * Uses AES-256-GCM encryption with Node.js crypto module
 */

import crypto from "crypto";

// Algorithm to use for encryption
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // Initialization vector length
const AUTH_TAG_LENGTH = 16; // Authentication tag length
const SALT_LENGTH = 64; // Salt length for key derivation

/**
 * Get encryption key from environment variable
 * In production, this should be stored in a secure environment variable
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY environment variable is not set. " +
      "Please generate a secure key using: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
    );
  }

  // Ensure key is 32 bytes (256 bits) when base64 decoded
  const keyBuffer = Buffer.from(key, "base64");
  if (keyBuffer.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY must be 32 bytes (256 bits) when base64 decoded. " +
      `Current length: ${keyBuffer.length} bytes`,
    );
  }

  return key;
}

/**
 * Encrypt a string value
 * Returns base64 encoded string in format: salt:iv:authTag:encryptedData
 *
 * @param plaintext - The string to encrypt
 * @returns Encrypted string in base64 format
 *
 * @example
 * const encrypted = encrypt("retell_api_key_123abc");
 * // Returns: "base64Salt:base64IV:base64AuthTag:base64EncryptedData"
 */
export function encrypt(plaintext: string): string {
  try {
    // Generate random salt for key derivation
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive key from encryption key + salt
    const key = crypto.pbkdf2Sync(
      Buffer.from(getEncryptionKey(), "base64"),
      salt,
      100000, // iterations
      32, // key length
      "sha256",
    );

    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the data
    let encrypted = cipher.update(plaintext, "utf8", "base64");
    encrypted += cipher.final("base64");

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Combine salt, iv, authTag, and encrypted data
    const result = [
      salt.toString("base64"),
      iv.toString("base64"),
      authTag.toString("base64"),
      encrypted,
    ].join(":");

    return result;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt an encrypted string
 *
 * @param encryptedData - Encrypted string in format: salt:iv:authTag:encryptedData
 * @returns Decrypted plaintext string
 *
 * @example
 * const decrypted = decrypt(encrypted);
 * // Returns: "retell_api_key_123abc"
 */
export function decrypt(encryptedData: string): string {
  try {
    // Split the encrypted data
    const parts = encryptedData.split(":");
    if (parts.length !== 4) {
      throw new Error("Invalid encrypted data format");
    }

    const [saltB64, ivB64, authTagB64, encrypted] = parts;

    // Convert from base64
    const salt = Buffer.from(saltB64, "base64");
    const iv = Buffer.from(ivB64, "base64");
    const authTag = Buffer.from(authTagB64, "base64");

    // Derive the same key using salt
    const key = crypto.pbkdf2Sync(
      Buffer.from(getEncryptionKey(), "base64"),
      salt,
      100000, // must match encryption
      32,
      "sha256",
    );

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data - data may be corrupted or key is wrong");
  }
}

/**
 * Generate a secure random secret for webhooks
 *
 * @param length - Length of the secret in bytes (default: 32)
 * @returns Base64 encoded random secret
 *
 * @example
 * const webhookSecret = generateSecret();
 * // Returns: "base64EncodedRandomString"
 */
export function generateSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString("base64");
}

/**
 * Generate HMAC signature for webhook validation
 *
 * @param secret - Webhook secret
 * @param payload - Payload to sign (usually JSON stringified)
 * @returns HMAC signature as hex string
 *
 * @example
 * const signature = generateHmacSignature(webhookSecret, JSON.stringify(data));
 * // Compare with signature from webhook header
 */
export function generateHmacSignature(secret: string, payload: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

/**
 * Verify HMAC signature for webhook validation
 * Uses timing-safe comparison to prevent timing attacks
 *
 * @param secret - Webhook secret
 * @param payload - Payload to verify
 * @param signature - Signature to verify against
 * @returns True if signature is valid
 *
 * @example
 * const isValid = verifyHmacSignature(
 *   webhookSecret,
 *   JSON.stringify(data),
 *   req.headers['x-webhook-signature']
 * );
 */
export function verifyHmacSignature(
  secret: string,
  payload: string,
  signature: string,
): boolean {
  const expectedSignature = generateHmacSignature(secret, payload);

  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

/**
 * Hash a value (one-way, cannot be decrypted)
 * Useful for storing sensitive data that only needs comparison
 *
 * @param value - Value to hash
 * @returns SHA-256 hash as hex string
 *
 * @example
 * const hashed = hash("sensitive-value");
 * // Use for comparison, not for retrieval
 */
export function hash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

// Export crypto for advanced usage
export { crypto };
