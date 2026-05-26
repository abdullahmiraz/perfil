import type { EncryptedVaultBlob, VaultPayload, VaultRecoveryMeta } from "@/types/vault";
import { migratePayload } from "@/lib/profile-migrate";
import { normalizeRecoveryAnswer, recoveryAnswerVerifier } from "@/lib/vault-recovery";

const LEGACY_SALT = btoa("perfil-phase1-salt");
const PBKDF2_ITERATIONS = 310_000;
const IV_BYTES = 12;
const SALT_BYTES = 16;

function bytesToB64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function b64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const buf = new ArrayBuffer(binary.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function isLegacyBlob(blob: EncryptedVaultBlob): boolean {
  return blob.salt === LEGACY_SALT || !blob.wrappedDek;
}

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function derivePinKey(pin: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  return deriveKey(`perfil-pin:${pin}`, salt);
}

async function deriveRecoveryKey(answer: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  return deriveKey(`perfil-recovery:${normalizeRecoveryAnswer(answer)}`, salt);
}

async function encryptBytes(
  key: CryptoKey,
  iv: Uint8Array<ArrayBuffer>,
  data: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> {
  const buf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return new Uint8Array(buf);
}

async function decryptBytes(
  key: CryptoKey,
  iv: Uint8Array<ArrayBuffer>,
  data: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> {
  const buf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new Uint8Array(buf);
}

async function generateDek(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

async function wrapDek(dek: CryptoKey, wrappingKey: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", dek);
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const wrapped = await encryptBytes(wrappingKey, iv, new Uint8Array(raw));
  const combined = new Uint8Array(iv.length + wrapped.length);
  combined.set(iv, 0);
  combined.set(wrapped, iv.length);
  return bytesToB64(combined);
}

async function unwrapDek(wrappedB64: string, wrappingKey: CryptoKey): Promise<CryptoKey> {
  const combined = b64ToBytes(wrappedB64);
  const iv = combined.slice(0, IV_BYTES);
  const wrapped = combined.slice(IV_BYTES);
  const raw = await decryptBytes(wrappingKey, iv, wrapped);
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

function decodeLegacyPayload(ciphertext: string): VaultPayload {
  const json = decodeURIComponent(escape(atob(ciphertext)));
  return migratePayload(JSON.parse(json));
}

export interface SealedVault {
  blob: EncryptedVaultBlob;
  dek: CryptoKey;
  payload: VaultPayload;
}

export interface SealVaultOptions {
  pin?: string | null;
  recoveryAnswer?: string | null;
  existingRecovery?: VaultRecoveryMeta;
}

/** Encrypt payload with AES-256-GCM (envelope: DEK + password/PIN/recovery wraps). */
export async function sealVault(
  payload: VaultPayload,
  password: string,
  opts: SealVaultOptions = {},
): Promise<SealedVault> {
  const { pin, recoveryAnswer, existingRecovery } = opts;
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const dek = await generateDek();
  const plaintext = new TextEncoder().encode(JSON.stringify(migratePayload(payload)));
  const ciphertext = await encryptBytes(dek, iv, plaintext);

  const passwordKey = await deriveKey(password, salt);
  const wrappedDek = await wrapDek(dek, passwordKey);

  let pinWrappedDek: string | undefined;
  if (pin) {
    const pinKey = await derivePinKey(pin, salt);
    pinWrappedDek = await wrapDek(dek, pinKey);
  }

  let recoveryWrappedDek: string | undefined;
  if (recoveryAnswer && existingRecovery) {
    const recoveryKey = await deriveRecoveryKey(recoveryAnswer, salt);
    recoveryWrappedDek = await wrapDek(dek, recoveryKey);
  }

  const blob: EncryptedVaultBlob = {
    encoding: "v3",
    salt: bytesToB64(salt),
    iv: bytesToB64(iv),
    ciphertext: bytesToB64(ciphertext),
    wrappedDek,
    pinWrappedDek: pinWrappedDek ?? null,
    recoveryWrappedDek: recoveryWrappedDek ?? null,
    verifier: btoa(`perfil-v1:${password}`),
    recovery: existingRecovery,
  };

  return { blob, dek, payload: migratePayload(payload) };
}

/** Unlock with master password. Migrates legacy (base64) blobs on success. */
export async function openVaultWithPassword(
  blob: EncryptedVaultBlob,
  password: string,
): Promise<SealedVault> {
  if (blob.verifier !== btoa(`perfil-v1:${password}`)) {
    throw new Error("Incorrect master password");
  }

  if (isLegacyBlob(blob)) {
    const payload = decodeLegacyPayload(blob.ciphertext);
    return sealVault(payload, password, { existingRecovery: blob.recovery });
  }

  const salt = b64ToBytes(blob.salt);
  const passwordKey = await deriveKey(password, salt);
  const dek = await unwrapDek(blob.wrappedDek!, passwordKey);
  const iv = b64ToBytes(blob.iv);
  const ciphertext = b64ToBytes(blob.ciphertext);
  const plain = await decryptBytes(dek, iv, ciphertext);
  const payload = migratePayload(JSON.parse(new TextDecoder().decode(plain)));
  return { blob, dek, payload };
}

/** Unlock with PIN (requires pinWrappedDek on blob). */
export async function openVaultWithPin(
  blob: EncryptedVaultBlob,
  pin: string,
): Promise<SealedVault> {
  if (isLegacyBlob(blob) || !blob.pinWrappedDek) {
    throw new Error("PIN is not enabled");
  }
  const salt = b64ToBytes(blob.salt);
  const pinKey = await derivePinKey(pin, salt);
  const dek = await unwrapDek(blob.pinWrappedDek, pinKey);
  const iv = b64ToBytes(blob.iv);
  const ciphertext = b64ToBytes(blob.ciphertext);
  const plain = await decryptBytes(dek, iv, ciphertext);
  const payload = migratePayload(JSON.parse(new TextDecoder().decode(plain)));
  return { blob, dek, payload };
}

/** Update ciphertext + IV only (same DEK and wraps). */
export async function updateCiphertext(
  payload: VaultPayload,
  dek: CryptoKey,
  blob: EncryptedVaultBlob,
): Promise<EncryptedVaultBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const plaintext = new TextEncoder().encode(JSON.stringify(migratePayload(payload)));
  const ciphertext = await encryptBytes(dek, iv, plaintext);
  return {
    ...blob,
    iv: bytesToB64(iv),
    ciphertext: bytesToB64(ciphertext),
  };
}

export async function resetVaultPassword(
  blob: EncryptedVaultBlob,
  answer: string,
  newPassword: string,
  pin?: string | null,
): Promise<SealedVault> {
  if (!blob.recovery?.answerVerifier) {
    throw new Error("Recovery was not set up");
  }
  if (blob.recovery.answerVerifier !== recoveryAnswerVerifier(answer)) {
    throw new Error("Incorrect recovery answer");
  }

  let payload: VaultPayload;
  if (isLegacyBlob(blob)) {
    payload = decodeLegacyPayload(blob.ciphertext);
  } else {
    if (!blob.recoveryWrappedDek) {
      throw new Error("Recovery cannot reset this vault — update recovery in Settings while logged in");
    }
    const salt = b64ToBytes(blob.salt);
    const recoveryKey = await deriveRecoveryKey(answer, salt);
    const dek = await unwrapDek(blob.recoveryWrappedDek, recoveryKey);
    const iv = b64ToBytes(blob.iv);
    const ciphertext = b64ToBytes(blob.ciphertext);
    const plain = await decryptBytes(dek, iv, ciphertext);
    payload = migratePayload(JSON.parse(new TextDecoder().decode(plain)));
  }

  return sealVault(payload, newPassword, {
    pin,
    recoveryAnswer: answer,
    existingRecovery: blob.recovery,
  });
}

/** Add or replace PIN wrap on an existing v3 blob (vault must be unlocked). */
export async function withPinWrap(
  blob: EncryptedVaultBlob,
  dek: CryptoKey,
  pin: string,
): Promise<EncryptedVaultBlob> {
  const salt = b64ToBytes(blob.salt);
  const pinKey = await derivePinKey(pin, salt);
  const pinWrappedDek = await wrapDek(dek, pinKey);
  return { ...blob, pinWrappedDek };
}

export async function withoutPinWrap(blob: EncryptedVaultBlob): Promise<EncryptedVaultBlob> {
  return { ...blob, pinWrappedDek: null };
}

export async function withRecoveryWrap(
  blob: EncryptedVaultBlob,
  dek: CryptoKey,
  answer: string,
  recovery: VaultRecoveryMeta,
): Promise<EncryptedVaultBlob> {
  const salt = b64ToBytes(blob.salt);
  const recoveryKey = await deriveRecoveryKey(answer, salt);
  const recoveryWrappedDek = await wrapDek(dek, recoveryKey);
  return { ...blob, recovery, recoveryWrappedDek };
}

export { isLegacyBlob };
