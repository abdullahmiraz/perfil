import type { Profile } from "@/types/profile";

export type VaultStatus = "uninitialized" | "locked" | "unlocked";

export interface VaultSettings {
  autoLockMinutes: number;
  defaultProfileId: string | null;
}

export interface VaultPayload {
  version: 1;
  profiles: Profile[];
  settings: VaultSettings;
}

export interface EncryptedVaultBlob {
  salt: string;
  iv: string;
  ciphertext: string;
  verifier: string;
}
