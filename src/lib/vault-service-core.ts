import { duplicateCustomField, sortCustomFields } from "@/lib/custom-field";
import { migratePayload, migrateProfile } from "@/lib/profile-migrate";
import { createDefaultPersonalProfile } from "@/lib/default-personal-profile";
import { defaultVaultPayload, defaultVaultSettings } from "@/lib/profile-defaults";
import {
  clearRecoveryVerified,
  clearSession,
  isRecoveryVerified,
  loadSession,
  markRecoveryVerified,
  saveSession,
} from "@/lib/session-storage";
import { loadEncryptedVault, saveEncryptedVault, vaultExists } from "@/lib/storage";
import {
  isLegacyBlob,
  openVaultWithPassword,
  openVaultWithPin,
  resetVaultPassword,
  sealVault,
  updateCiphertext,
  withPinWrap,
  withRecoveryWrap,
  withoutPinWrap,
  type SealedVault,
} from "@/lib/vault-crypto";
import type { Profile } from "@/types/profile";
import { isRecoveryAnswerValid, recoveryAnswerVerifier } from "@/lib/vault-recovery";
import type {
  EncryptedVaultBlob,
  VaultExportBundle,
  VaultPayload,
  VaultRecoveryInfo,
  VaultRecoveryMeta,
  VaultSettings,
  VaultSetupOptions,
  VaultStatus,
} from "@/types/vault";

/** Vault: AES-256-GCM (v3) with legacy base64 migration on unlock. */
export class VaultService {
  private status: VaultStatus = "uninitialized";
  private payload: VaultPayload | null = null;
  private sessionToken: string | null = null;
  private dek: CryptoKey | null = null;
  private vaultBlob: EncryptedVaultBlob | null = null;
  private lastActivityAt = Date.now();
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.init();
  }

  async whenReady(): Promise<void> {
    await this.ready;
  }

  private async init(): Promise<void> {
    const exists = await vaultExists();
    if (!exists) {
      this.status = "uninitialized";
      return;
    }
    await this.tryRestoreSession();
    if (this.status !== "unlocked") {
      this.status = "locked";
    }
  }

  private async tryRestoreSession(): Promise<void> {
    const session = await loadSession();
    if (!session?.active) return;

    const blob = await loadEncryptedVault();
    if (!blob) return;

    if (!isLegacyBlob(blob)) {
      await clearSession();
      return;
    }

    const settings = this.peekSettings(blob);
    if (settings.requireMasterPasswordOnRestart && session.unlockMethod === "password") {
      const restarted = Date.now() - session.lastActivityAt > 60_000 * 60 * 8;
      if (restarted) {
        await clearSession();
        return;
      }
    }

    if (settings.autoLockMinutes > 0) {
      const idleMs = settings.autoLockMinutes * 60_000;
      if (Date.now() - session.lastActivityAt > idleMs) {
        await clearSession();
        return;
      }
    }

    const payload = migratePayload(this.decodeLegacyPayload(blob.ciphertext));
    this.payload = payload;
    this.sessionToken = "session";
    this.status = "unlocked";
    this.lastActivityAt = Date.now();
    this.resetIdleTimer();
  }

  private peekSettings(blob: EncryptedVaultBlob): VaultSettings {
    if (!isLegacyBlob(blob)) {
      return {
        ...defaultVaultSettings(),
        pinEnabled: Boolean(blob.pinWrappedDek),
      };
    }
    try {
      const payload = migratePayload(this.decodeLegacyPayload(blob.ciphertext));
      return payload.settings;
    } catch {
      return defaultVaultSettings();
    }
  }

  private async applySealed(
    sealed: SealedVault,
    token: string,
    method: "password" | "pin",
  ): Promise<void> {
    this.dek = sealed.dek;
    this.vaultBlob = sealed.blob;
    await this.unlockInMemory(sealed.payload, token, method);
  }

  touchActivity(): void {
    if (!this.isUnlocked()) return;
    this.lastActivityAt = Date.now();
    void saveSession({
      active: true,
      lastActivityAt: this.lastActivityAt,
      unlockMethod: this.sessionToken === "pin" ? "pin" : "password",
    });
    this.resetIdleTimer();
  }

  private resetIdleTimer(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    const minutes = this.payload?.settings.autoLockMinutes ?? 15;
    if (minutes === 0 || !this.isUnlocked()) return;
    this.idleTimer = setTimeout(() => {
      void this.lock();
    }, minutes * 60_000);
  }

  getStatus(): { status: VaultStatus; profileCount: number } {
    const count = this.status === "unlocked" && this.payload ? this.payload.profiles.length : 0;
    return { status: this.status, profileCount: count };
  }

  getSettings(): VaultSettings {
    return this.payload?.settings ?? defaultVaultSettings();
  }

  async getLockedSettings(): Promise<VaultSettings> {
    const blob = await loadEncryptedVault();
    if (!blob) return defaultVaultSettings();
    return this.peekSettings(blob);
  }

  async getRecoveryInfo(): Promise<VaultRecoveryInfo> {
    const blob = await loadEncryptedVault();
    if (!blob?.recovery?.question) {
      return { enabled: false, question: null };
    }
    return { enabled: true, question: blob.recovery.question };
  }

  isUnlocked(): boolean {
    return this.status === "unlocked" && this.payload !== null;
  }

  async setup(
    password: string,
    options?: VaultSetupOptions,
  ): Promise<{ ok: boolean; error?: string }> {
    await this.whenReady();
    if (password.length < 8) {
      return { ok: false, error: "Master password must be at least 8 characters" };
    }
    if (await vaultExists()) {
      return { ok: false, error: "Vault already exists" };
    }

    let recoveryMeta: VaultRecoveryMeta | undefined;
    if (options?.recovery) {
      const q = options.recovery.question.trim();
      if (q.length < 5) {
        return { ok: false, error: "Recovery question is too short" };
      }
      if (!isRecoveryAnswerValid(options.recovery.answer)) {
        return { ok: false, error: "Recovery answer must be at least 3 characters" };
      }
      recoveryMeta = {
        question: q,
        answerVerifier: recoveryAnswerVerifier(options.recovery.answer),
      };
    }

    const payload: VaultPayload = {
      ...defaultVaultPayload(),
      profiles: [createDefaultPersonalProfile()],
    };
    payload.settings = {
      ...payload.settings,
      ...options?.settings,
    };
    payload.settings.defaultProfileId = payload.profiles[0]?.id ?? null;

    const sealed = await sealVault(payload, password, {
      recoveryAnswer: options?.recovery?.answer ?? null,
      existingRecovery: recoveryMeta,
    });
    await saveEncryptedVault(sealed.blob);
    await this.applySealed(sealed, password, "password");
    return { ok: true };
  }

  async verifyRecoveryAnswer(answer: string): Promise<{ ok: boolean; error?: string }> {
    await this.whenReady();
    const blob = await loadEncryptedVault();
    if (!blob) return { ok: false, error: "No vault found" };
    if (!blob.recovery?.answerVerifier) {
      return { ok: false, error: "Recovery was not set up" };
    }
    if (blob.recovery.answerVerifier !== recoveryAnswerVerifier(answer)) {
      await clearRecoveryVerified();
      return { ok: false, error: "Incorrect recovery answer" };
    }
    await markRecoveryVerified();
    return { ok: true };
  }

  async resetMasterPassword(
    answer: string,
    newPassword: string,
  ): Promise<{ ok: boolean; error?: string }> {
    await this.whenReady();
    if (newPassword.length < 8) {
      return { ok: false, error: "New password must be at least 8 characters" };
    }
    if (!(await isRecoveryVerified())) {
      return { ok: false, error: "Answer your recovery question first" };
    }
    const blob = await loadEncryptedVault();
    if (!blob) return { ok: false, error: "No vault found" };

    try {
      const sealed = await resetVaultPassword(blob, answer, newPassword, null);
      await saveEncryptedVault(sealed.blob);
      await clearRecoveryVerified();
      await this.applySealed(sealed, newPassword, "password");
      return { ok: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Reset failed";
      return { ok: false, error: msg };
    }
  }

  async cancelRecoveryReset(): Promise<void> {
    await clearRecoveryVerified();
  }

  async updateRecovery(
    question: string,
    answer: string,
    masterPassword: string,
  ): Promise<{ ok: boolean; error?: string }> {
    if (!this.payload) return { ok: false, error: "Vault locked" };
    const blob = await loadEncryptedVault();
    if (!blob || blob.verifier !== this.verifier(masterPassword)) {
      return { ok: false, error: "Master password required" };
    }
    const q = question.trim();
    if (q.length < 5) return { ok: false, error: "Question is too short" };
    if (!isRecoveryAnswerValid(answer)) {
      return { ok: false, error: "Answer must be at least 3 characters" };
    }
    if (!this.dek || !this.vaultBlob) {
      return { ok: false, error: "Vault locked" };
    }
    const recovery: VaultRecoveryMeta = {
      question: q,
      answerVerifier: recoveryAnswerVerifier(answer),
    };
    const updated = await withRecoveryWrap(this.vaultBlob, this.dek, answer, recovery);
    await saveEncryptedVault(updated);
    this.vaultBlob = updated;
    return { ok: true };
  }

  async clearRecovery(masterPassword: string): Promise<{ ok: boolean; error?: string }> {
    if (!this.payload) return { ok: false, error: "Vault locked" };
    const blob = await loadEncryptedVault();
    if (!blob || blob.verifier !== this.verifier(masterPassword)) {
      return { ok: false, error: "Master password required" };
    }
    const { recovery: _r, ...rest } = blob;
    await saveEncryptedVault(rest);
    return { ok: true };
  }

  async unlock(password: string): Promise<{ ok: boolean; error?: string }> {
    await this.whenReady();
    const blob = await loadEncryptedVault();
    if (!blob) return { ok: false, error: "No vault found. Create one first." };
    try {
      const sealed = await openVaultWithPassword(blob, password);
      if (isLegacyBlob(blob)) {
        await saveEncryptedVault(sealed.blob);
      }
      await this.applySealed(sealed, password, "password");
      return { ok: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unlock failed";
      return {
        ok: false,
        error: msg.includes("master password") ? "Incorrect master password" : msg,
      };
    }
  }

  async unlockWithPin(pin: string): Promise<{ ok: boolean; error?: string }> {
    await this.whenReady();
    const blob = await loadEncryptedVault();
    if (!blob) return { ok: false, error: "No vault found" };
    if (!blob.pinWrappedDek) {
      return { ok: false, error: "PIN is not enabled" };
    }
    try {
      const sealed = await openVaultWithPin(blob, pin);
      await this.applySealed(sealed, "pin-session", "pin");
      return { ok: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unlock failed";
      return { ok: false, error: msg.includes("PIN") ? msg : "Incorrect PIN" };
    }
  }

  async setPin(pin: string, masterPassword: string): Promise<{ ok: boolean; error?: string }> {
    if (!this.payload || !this.dek || !this.vaultBlob) {
      return { ok: false, error: "Vault locked" };
    }
    if (this.vaultBlob.verifier !== this.verifier(masterPassword)) {
      return { ok: false, error: "Master password required to set PIN" };
    }
    if (!/^\d{4,8}$/.test(pin)) {
      return { ok: false, error: "PIN must be 4–8 digits" };
    }
    this.payload.settings.pinEnabled = true;
    this.payload.settings.pinVerifier = this.pinVerifier(pin);
    const updated = await withPinWrap(this.vaultBlob, this.dek, pin);
    await saveEncryptedVault(updated);
    this.vaultBlob = updated;
    await this.persistCurrent();
    return { ok: true };
  }

  async clearPin(masterPassword: string): Promise<{ ok: boolean; error?: string }> {
    if (!this.payload || !this.vaultBlob) {
      return { ok: false, error: "Vault locked" };
    }
    if (this.vaultBlob.verifier !== this.verifier(masterPassword)) {
      return { ok: false, error: "Master password required" };
    }
    this.payload.settings.pinEnabled = false;
    this.payload.settings.pinVerifier = null;
    const updated = await withoutPinWrap(this.vaultBlob);
    await saveEncryptedVault(updated);
    this.vaultBlob = updated;
    await this.persistCurrent();
    return { ok: true };
  }

  async saveSettings(settings: Partial<VaultSettings>): Promise<VaultSettings> {
    if (!this.payload) throw new Error("Vault locked");
    this.payload.settings = { ...this.payload.settings, ...settings };
    await this.persistCurrent();
    this.resetIdleTimer();
    return this.payload.settings;
  }

  async lock(): Promise<void> {
    this.payload = null;
    this.sessionToken = null;
    this.dek = null;
    this.vaultBlob = null;
    if (this.idleTimer) clearTimeout(this.idleTimer);
    await clearSession();
    await clearRecoveryVerified();
    const exists = await vaultExists();
    this.status = exists ? "locked" : "uninitialized";
  }

  getProfiles(): Profile[] {
    return this.payload?.profiles ?? [];
  }

  async saveProfile(profile: Profile): Promise<Profile> {
    if (!this.payload) throw new Error("Vault locked");
    const updated = migrateProfile({ ...profile, updatedAt: Date.now() });
    const idx = this.payload.profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) this.payload.profiles[idx] = updated;
    else this.payload.profiles.push(updated);
    await this.persistCurrent();
    this.touchActivity();
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
    this.touchActivity();
    return this.payload.profiles.length < before;
  }

  copyCustomFields(
    sourceProfileId: string,
    targetProfileId: string,
    fieldIds: string[],
    mode: "copy" | "move",
  ): { ok: boolean; error?: string } {
    if (!this.payload) return { ok: false, error: "Vault locked" };
    const source = this.payload.profiles.find((p) => p.id === sourceProfileId);
    const target = this.payload.profiles.find((p) => p.id === targetProfileId);
    if (!source || !target) return { ok: false, error: "Profile not found" };

    const selected = source.customFields.filter((f) => fieldIds.includes(f.id));
    if (!selected.length) return { ok: false, error: "No fields selected" };

    for (const field of selected) {
      target.customFields.push(duplicateCustomField(field));
    }
    target.updatedAt = Date.now();

    if (mode === "move") {
      source.customFields = source.customFields.filter((f) => !fieldIds.includes(f.id));
      source.updatedAt = Date.now();
    }

    void this.persistCurrent();
    this.touchActivity();
    return { ok: true };
  }

  exportBundle(): VaultExportBundle {
    if (!this.payload) throw new Error("Vault locked");
    const { pinVerifier: _p, ...settings } = this.payload.settings;
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      profiles: this.payload.profiles,
      settings,
    };
  }

  async importBundle(
    json: string,
    mode: "merge" | "replace",
  ): Promise<{ ok: boolean; error?: string; count?: number }> {
    if (!this.payload) return { ok: false, error: "Vault locked" };
    try {
      const bundle = JSON.parse(json) as VaultExportBundle;
      if (!bundle.profiles?.length) {
        return { ok: false, error: "No profiles in file" };
      }
      const imported = bundle.profiles.map(migrateProfile);
      if (mode === "replace") {
        this.payload.profiles = imported;
      } else {
        for (const p of imported) {
          const existing = this.payload.profiles.findIndex((x) => x.id === p.id);
          if (existing >= 0) this.payload.profiles[existing] = p;
          else this.payload.profiles.push(p);
        }
      }
      if (bundle.settings) {
        this.payload.settings = {
          ...this.payload.settings,
          ...bundle.settings,
          pinVerifier: this.payload.settings.pinVerifier,
        };
      }
      await this.persistCurrent();
      this.touchActivity();
      return { ok: true, count: imported.length };
    } catch {
      return { ok: false, error: "Invalid JSON file" };
    }
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

  private async unlockInMemory(
    payload: VaultPayload,
    token: string,
    method: "password" | "pin",
  ): Promise<void> {
    this.payload = migratePayload(payload);
    for (const p of this.payload.profiles) {
      p.customFields = sortCustomFields(p.customFields ?? []);
    }
    this.sessionToken = token;
    this.status = "unlocked";
    this.lastActivityAt = Date.now();
    await saveSession({ active: true, lastActivityAt: this.lastActivityAt, unlockMethod: method });
    this.resetIdleTimer();
  }

  private async persistCurrent(): Promise<void> {
    if (!this.payload || !this.dek || !this.vaultBlob || !this.sessionToken) return;
    const updated = await updateCiphertext(this.payload, this.dek, this.vaultBlob);
    await saveEncryptedVault(updated);
    this.vaultBlob = updated;
  }

  private verifier(password: string): string {
    return btoa(`perfil-v1:${password}`);
  }

  private pinVerifier(pin: string): string {
    return btoa(`perfil-pin-v1:${pin}`);
  }

  private decodeLegacyPayload(ciphertext: string): unknown {
    return JSON.parse(decodeURIComponent(escape(atob(ciphertext))));
  }
}
