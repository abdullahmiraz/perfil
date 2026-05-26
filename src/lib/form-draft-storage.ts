import type { FormDraft, SiteDraftPrefs } from "@/types/form-draft";

const DRAFTS_KEY = "perfil_form_drafts_v1";
const PREFS_KEY = "perfil_site_draft_prefs_v1";

type DraftMap = Record<string, FormDraft>;
type PrefsMap = Record<string, SiteDraftPrefs>;

export function defaultSiteDraftPrefs(): SiteDraftPrefs {
  return {
    enabled: false,
    autoSave: false,
    scope: "domain",
  };
}

async function readDrafts(): Promise<DraftMap> {
  const result = await chrome.storage.local.get(DRAFTS_KEY);
  return (result[DRAFTS_KEY] as DraftMap) ?? {};
}

async function readPrefs(): Promise<PrefsMap> {
  const result = await chrome.storage.local.get(PREFS_KEY);
  return (result[PREFS_KEY] as PrefsMap) ?? {};
}

export async function getSiteDraftPrefs(hostname: string): Promise<SiteDraftPrefs> {
  const map = await readPrefs();
  return { ...defaultSiteDraftPrefs(), ...map[hostname] };
}

export async function setSiteDraftPrefs(
  hostname: string,
  patch: Partial<SiteDraftPrefs>,
): Promise<SiteDraftPrefs> {
  const map = await readPrefs();
  const next = { ...defaultSiteDraftPrefs(), ...map[hostname], ...patch };
  map[hostname] = next;
  await chrome.storage.local.set({ [PREFS_KEY]: map });
  return next;
}

export async function getFormDraft(storageKey: string): Promise<FormDraft | null> {
  const map = await readDrafts();
  return map[storageKey] ?? null;
}

export async function saveFormDraft(draft: FormDraft): Promise<void> {
  const map = await readDrafts();
  map[draft.storageKey] = draft;
  await chrome.storage.local.set({ [DRAFTS_KEY]: map });
}

export async function clearFormDraft(storageKey: string): Promise<void> {
  const map = await readDrafts();
  delete map[storageKey];
  await chrome.storage.local.set({ [DRAFTS_KEY]: map });
}
