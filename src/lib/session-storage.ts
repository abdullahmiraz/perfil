import type { SessionState } from "@/types/vault";

const SESSION_KEY = "perfil_session";

export async function loadSession(): Promise<SessionState | null> {
  const result = await chrome.storage.session.get(SESSION_KEY);
  return (result[SESSION_KEY] as SessionState | undefined) ?? null;
}

export async function saveSession(state: SessionState): Promise<void> {
  await chrome.storage.session.set({ [SESSION_KEY]: state });
}

export async function clearSession(): Promise<void> {
  await chrome.storage.session.remove(SESSION_KEY);
}

const RECOVERY_VERIFIED_KEY = "perfil_recovery_verified";
const RECOVERY_WINDOW_MS = 10 * 60 * 1000;

export async function markRecoveryVerified(): Promise<void> {
  await chrome.storage.session.set({ [RECOVERY_VERIFIED_KEY]: Date.now() });
}

export async function isRecoveryVerified(): Promise<boolean> {
  const result = await chrome.storage.session.get(RECOVERY_VERIFIED_KEY);
  const at = result[RECOVERY_VERIFIED_KEY] as number | undefined;
  if (!at) return false;
  return Date.now() - at < RECOVERY_WINDOW_MS;
}

export async function clearRecoveryVerified(): Promise<void> {
  await chrome.storage.session.remove(RECOVERY_VERIFIED_KEY);
}
