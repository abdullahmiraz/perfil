import { captureFormFields, countFillableFields, restoreFormFields } from "@/lib/form-draft-core";
import {
  addSavedSnapshot,
  deleteSavedSnapshot,
  getSavedSnapshot,
  listSavedForPage,
  pageUrlKey,
} from "@/lib/form-draft-storage";

function pageUrl(): string {
  return (location.href.split("#")[0] ?? location.href);
}

export async function snapshotFormDraft(): Promise<{ fieldCount: number; savedAt: number; id: string }> {
  const fields = captureFormFields();
  const snapshot = await addSavedSnapshot(pageUrl(), fields);
  return {
    fieldCount: Object.keys(fields).length,
    savedAt: snapshot.savedAt,
    id: snapshot.id,
  };
}

export async function applySavedSnapshot(draftId: string): Promise<number> {
  const snapshot = await getSavedSnapshot(draftId);
  if (!snapshot) return 0;
  if (pageUrlKey(snapshot.pageUrl) !== pageUrlKey(pageUrl())) return 0;
  return restoreFormFields(snapshot.fields);
}

export async function applyLatestSavedForPage(): Promise<number> {
  const list = await listSavedForPage(pageUrl());
  const latest = list[0];
  if (!latest) return 0;
  return restoreFormFields(latest.fields);
}

export async function clearSavedSnapshot(draftId: string): Promise<void> {
  await deleteSavedSnapshot(draftId);
}

export function getFormDraftStatusSync(): { fillableCount: number; pageUrl: string } {
  return { fillableCount: countFillableFields(), pageUrl: pageUrl() };
}

/** Manual save/restore only — no auto-save or auto-restore listeners. */
export function initFormDraft(): void {
  // Reserved for future page-level hooks.
}
