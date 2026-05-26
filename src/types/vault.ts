import type { Profile } from "@/types/profile";

export type VaultStatus = "uninitialized" | "locked" | "unlocked";

export type AutoLockMinutes = 0 | 5 | 15 | 30 | 60;

export interface VaultSettings {
  autoLockMinutes: AutoLockMinutes;
  defaultProfileId: string | null;
  /** Optional short PIN (Bitwarden-style quick unlock) */
  pinEnabled: boolean;
  pinVerifier: string | null;
  /** When true, session token is cleared on browser restart (recommended) */
  requireMasterPasswordOnRestart: boolean;
}

export interface VaultPayload {
  version: 2;
  profiles: Profile[];
  settings: VaultSettings;
}

export interface EncryptedVaultBlob {
  salt: string;
  iv: string;
  ciphertext: string;
  verifier: string;
}

export interface VaultExportBundle {
  version: 2;
  exportedAt: string;
  profiles: Profile[];
  settings: Omit<VaultSettings, "pinVerifier">;
}

export interface SessionState {
  active: boolean;
  lastActivityAt: number;
  unlockMethod: "password" | "pin";
}
