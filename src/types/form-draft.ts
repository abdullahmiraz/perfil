/** @deprecated Domain scope removed — saves are always exact page URL. */
export type FormDraftScope = "url";

/** One manual save for a specific page URL. */
export interface SavedFormSnapshot {
  id: string;
  /** Full page URL without hash */
  pageUrl: string;
  /** Shown in dropdown, e.g. "Mar 26, 3:45 PM · 5 fields" */
  label: string;
  savedAt: number;
  fields: Record<string, string>;
}

export interface FormDraftStatus {
  pageUrl: string;
  /** Manual saves for this exact URL */
  saved: SavedFormSnapshot[];
  fillableCount: number;
}
