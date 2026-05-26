import { listSavedForPage, deleteAllForPage, deleteSavedSnapshot } from "@/lib/form-draft-storage";
import { getActiveTab } from "@/background/fill-tab";
import { isRestrictedUrl, sendTabMessage } from "@/lib/tab-bridge";
import type { FormDraftStatus } from "@/types/form-draft";

async function sendToActiveTab<T>(message: object): Promise<T | null> {
  const tab = await getActiveTab();
  if (isRestrictedUrl(tab.url) || !tab.id) return null;
  try {
    return await sendTabMessage<T>(tab.id, message);
  } catch {
    return null;
  }
}

function tabPageUrl(tab: chrome.tabs.Tab): string {
  return (tab.url ?? "").split("#")[0] ?? "";
}

export async function getTabFormDraftStatus(): Promise<FormDraftStatus | { error: string }> {
  const tab = await getActiveTab();
  if (isRestrictedUrl(tab.url)) {
    return { error: "Not available on this page" };
  }
  const pageUrl = tabPageUrl(tab);
  const saved = await listSavedForPage(pageUrl);
  const sync = await sendToActiveTab<{ fillableCount: number }>({
    type: "GET_FORM_DRAFT_STATUS",
  });

  return {
    pageUrl,
    saved,
    fillableCount: sync?.fillableCount ?? 0,
  };
}

export async function saveTabFormDraft(): Promise<
  { ok: true; fieldCount: number; id: string } | { error: string }
> {
  const res = await sendToActiveTab<{ fieldCount: number; id: string }>({
    type: "SNAPSHOT_FORM_DRAFT",
  });
  if (!res) return { error: "Refresh the tab and try again" };
  return { ok: true, fieldCount: res.fieldCount, id: res.id };
}

export async function restoreTabFormDraft(
  draftId?: string,
): Promise<{ ok: true; restored: number } | { error: string }> {
  const res = await sendToActiveTab<{ restored: number }>({
    type: "RESTORE_FORM_DRAFT",
    draftId,
  });
  if (!res) return { error: "Refresh the tab and try again" };
  return { ok: true, restored: res.restored };
}

export async function clearTabFormDraft(draftId?: string): Promise<{ ok: true } | { error: string }> {
  const tab = await getActiveTab();
  if (isRestrictedUrl(tab.url)) return { error: "Not available on this page" };
  if (draftId) {
    await deleteSavedSnapshot(draftId);
    await sendToActiveTab({ type: "CLEAR_FORM_DRAFT", draftId });
  } else {
    await deleteAllForPage(tabPageUrl(tab));
  }
  return { ok: true };
}
