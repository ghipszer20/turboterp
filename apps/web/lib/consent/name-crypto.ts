import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

// Server-only. The typed name on an agreement record, encrypted so only someone holding
// CONSENT_NAME_SECRET can read it (owner, 2026-10-08: readable for legal purposes).
// AES-256-GCM with a key derived from the secret; stored as "v1:" + base64(iv | tag | ciphertext).
// No imports beyond node:crypto, so scripts/read-agreements.mts can load it directly.

const PREFIX = "v1:";
const IV_BYTES = 12;
const TAG_BYTES = 16;

const key = (secret: string) => Buffer.from(hkdfSync("sha256", secret, "", "turboterp consent name v1", 32));

export function encryptName(name: string, secret: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
  const ct = Buffer.concat([cipher.update(name, "utf8"), cipher.final()]);
  return PREFIX + Buffer.concat([iv, cipher.getAuthTag(), ct]).toString("base64");
}

/** Throws on a wrong secret, a damaged record or an unknown format. */
export function decryptName(blob: string, secret: string): string {
  if (!blob.startsWith(PREFIX)) throw new Error("unknown name format");
  const bytes = Buffer.from(blob.slice(PREFIX.length), "base64");
  if (bytes.length < IV_BYTES + TAG_BYTES) throw new Error("damaged name");
  const decipher = createDecipheriv("aes-256-gcm", key(secret), bytes.subarray(0, IV_BYTES));
  decipher.setAuthTag(bytes.subarray(IV_BYTES, IV_BYTES + TAG_BYTES));
  return Buffer.concat([decipher.update(bytes.subarray(IV_BYTES + TAG_BYTES)), decipher.final()]).toString("utf8");
}
