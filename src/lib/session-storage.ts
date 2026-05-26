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
