/** How form drafts are keyed in storage. */
export type FormDraftScope = "domain" | "url";

export interface SiteDraftPrefs {
  /** Remember forms on this site */
  enabled: boolean;
  /** Save while typing (debounced) */
  autoSave: boolean;
  scope: FormDraftScope;
}

export interface FormDraft {
  storageKey: string;
  scope: FormDraftScope;
  hostname: string;
  url: string;
  savedAt: number;
  /** Stable field id → value */
  fields: Record<string, string>;
}

export interface FormDraftStatus {
  hostname: string;
  url: string;
  prefs: SiteDraftPrefs;
  draft: FormDraft | null;
  fillableCount: number;
}
