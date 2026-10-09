/**
 * Encrypt a plaintext string into a self-describing envelope
 * `v1:<iv>:<authTag>:<ciphertext>` (base64 segments). Safe to store as an ordinary
 * string in the settings blob.
 */
export declare function encryptSecret(plaintext: string, secret: string): string;
/**
 * Decrypt an envelope produced by {@link encryptSecret}. Throws if the envelope is
 * malformed, the version is unknown, or authentication fails (wrong key / tampering).
 */
export declare function decryptSecret(envelope: string, secret: string): string;
/**
 * Whether a stored value looks like one of our encryption envelopes. Lets the service
 * tell "already-encrypted ciphertext" from "a value that still needs encrypting"
 * without trying to decrypt.
 */
export declare function isEncryptedSecret(value: unknown): value is string;
//# sourceMappingURL=secret-crypto.d.ts.map