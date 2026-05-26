import { createProfile, defaultVaultPayload } from "@/lib/profile-defaults";
import { loadEncryptedVault, saveEncryptedVault, vaultExists } from "@/lib/storage";
import type { Profile } from "@/types/profile";
import type { VaultPayload, VaultStatus } from "@/types/vault";

/** Phase 1: encoded local vault. Phase 2 adds AES-GCM encryption. */
export class VaultService {
  private status: VaultStatus = "uninitialized";
  private payload: VaultPayload | null = null;
  private sessionToken: string | null = null;
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.init();
  }

  async whenReady(): Promise<void> {
    await this.ready;
  }

  private async init(): Promise<void> {
    const exists = await vaultExists();
    this.status = exists ? "locked" : "uninitialized";
  }

  getStatus(): { status: VaultStatus; profileCount: number } {
    const count =
      this.status === "unlocked" && this.payload ? this.payload.profiles.length : 0;
    return { status: this.status, profileCount: count };
  }

  isUnlocked(): boolean {
    return this.status === "unlocked" && this.payload !== null;
  }

  async setup(password: string): Promise<{ ok: boolean; error?: string }> {
    await this.whenReady();
    if (password.length < 8) {
      return { ok: false, error: "Master password must be at least 8 characters" };
    }
    const exists = await vaultExists();
    if (exists) {
      return { ok: false, error: "Vault already exists" };
    }

    const payload: VaultPayload = {
      ...defaultVaultPayload(),
      profiles: [createProfile("Personal")],
    };
    payload.settings.defaultProfileId = payload.profiles[0]?.id ?? null;

    await this.persist(payload, password);
    this.unlockInMemory(payload, password);
    return { ok: true };
  }

  async unlock(password: string): Promise<{ ok: boolean; error?: string }> {
    await this.whenReady();
    const blob = await loadEncryptedVault();
    if (!blob) {
      return { ok: false, error: "No vault found. Create one first." };
    }
    if (blob.verifier !== this.verifier(password)) {
      return { ok: false, error: "Incorrect master password" };
    }

    const payload = this.decodePayload(blob.ciphertext);
    this.unlockInMemory(payload, password);
    return { ok: true };
  }

  async lock(): Promise<void> {
    this.payload = null;
    this.sessionToken = null;
    const exists = await vaultExists();
    this.status = exists ? "locked" : "uninitialized";
  }

  getProfiles(): Profile[] {
    return this.payload?.profiles ?? [];
  }

  saveProfile(profile: Profile): Profile {
    if (!this.payload) throw new Error("Vault locked");
    const idx = this.payload.profiles.findIndex((p) => p.id === profile.id);
    const updated = { ...profile, updatedAt: Date.now() };
    if (idx >= 0) {
      this.payload.profiles[idx] = updated;
    } else {
      this.payload.profiles.push(updated);
    }
    void this.persistCurrent();
    return updated;
  }

  deleteProfile(profileId: string): boolean {
    if (!this.payload) return false;
    const before = this.payload.profiles.length;
    this.payload.profiles = this.payload.profiles.filter((p) => p.id !== profileId);
    if (this.payload.settings.defaultProfileId === profileId) {
      this.payload.settings.defaultProfileId = this.payload.profiles[0]?.id ?? null;
    }
    void this.persistCurrent();
    return this.payload.profiles.length < before;
  }

  resolveProfile(profileId?: string): Profile | null {
    if (!this.payload?.profiles.length) return null;
    if (profileId) {
      return this.payload.profiles.find((p) => p.id === profileId) ?? null;
    }
    const defaultId = this.payload.settings.defaultProfileId;
    if (defaultId) {
      return this.payload.profiles.find((p) => p.id === defaultId) ?? this.payload.profiles[0];
    }
    return this.payload.profiles[0] ?? null;
  }

  private unlockInMemory(payload: VaultPayload, password: string): void {
    this.payload = payload;
    this.sessionToken = this.verifier(password);
    this.status = "unlocked";
  }

  private async persist(payload: VaultPayload, password: string): Promise<void> {
    await saveEncryptedVault({
      salt: btoa("perfil-phase1-salt"),
      iv: btoa("perfil-phase1-iv"),
      ciphertext: this.encodePayload(payload),
      verifier: this.verifier(password),
    });
  }

  private async persistCurrent(): Promise<void> {
    const blob = await loadEncryptedVault();
    if (!blob || !this.payload || !this.sessionToken) return;
    await saveEncryptedVault({
      ...blob,
      ciphertext: this.encodePayload(this.payload),
    });
  }

  private verifier(password: string): string {
    return btoa(`perfil-v1:${password}`);
  }

  private encodePayload(payload: VaultPayload): string {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }

  private decodePayload(ciphertext: string): VaultPayload {
    return JSON.parse(decodeURIComponent(escape(atob(ciphertext)))) as VaultPayload;
  }
}
