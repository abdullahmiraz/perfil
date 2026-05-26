import { draftStorageKey } from "@/lib/form-draft-core";
import {
  clearFormDraft,
  getFormDraft,
  getSiteDraftPrefs,
  setSiteDraftPrefs,
} from "@/lib/form-draft-storage";
import { getActiveTab } from "@/background/fill-tab";
import { isRestrictedUrl, sendTabMessage } from "@/lib/tab-bridge";
import type { FormDraftStatus, SiteDraftPrefs } from "@/types/form-draft";

async function sendToActiveTab<T>(message: object): Promise<T | null> {
  const tab = await getActiveTab();
  if (isRestrictedUrl(tab.url) || !tab.id) return null;
  try {
    return await sendTabMessage<T>(tab.id, message);
  } catch {
    return null;
  }
}

export async function getTabFormDraftStatus(): Promise<FormDraftStatus | { error: string }> {
  const tab = await getActiveTab();
  if (isRestrictedUrl(tab.url)) {
    return { error: "Cannot use form memory on this page" };
  }
  const url = tab.url ?? "";
  const host = new URL(url).hostname;
  const prefs = await getSiteDraftPrefs(host);
  const key = draftStorageKey(url, prefs.scope);
  const draft = await getFormDraft(key);
  const sync = await sendToActiveTab<{ fillableCount: number }>({
    type: "GET_FORM_DRAFT_STATUS",
  });

  return {
    hostname: host,
    url,
    prefs,
    draft,
    fillableCount: sync?.fillableCount ?? 0,
  };
}

export async function setTabSiteDraftPrefs(
  patch: Partial<SiteDraftPrefs>,
): Promise<SiteDraftPrefs | { error: string }> {
  const tab = await getActiveTab();
  if (isRestrictedUrl(tab.url)) return { error: "Cannot change settings on this page" };
  const host = new URL(tab.url ?? "").hostname;
  return setSiteDraftPrefs(host, patch);
}

export async function saveTabFormDraft(): Promise<
  { ok: true; fieldCount: number } | { error: string }
> {
  const res = await sendToActiveTab<{ fieldCount: number }>({ type: "SNAPSHOT_FORM_DRAFT" });
  if (!res) return { error: "Could not read this page. Try refreshing the tab." };
  return { ok: true, fieldCount: res.fieldCount };
}

export async function restoreTabFormDraft(): Promise<
  { ok: true; restored: number } | { error: string }
> {
  const res = await sendToActiveTab<{ restored: number }>({ type: "RESTORE_FORM_DRAFT" });
  if (!res) return { error: "Could not restore on this page. Try refreshing the tab." };
  return { ok: true, restored: res.restored };
}

export async function clearTabFormDraft(): Promise<{ ok: true } | { error: string }> {
  const tab = await getActiveTab();
  if (isRestrictedUrl(tab.url)) return { error: "Cannot clear on this page" };
  const url = tab.url ?? "";
  const host = new URL(url).hostname;
  const prefs = await getSiteDraftPrefs(host);
  await clearFormDraft(draftStorageKey(url, prefs.scope));
  await sendToActiveTab({ type: "CLEAR_FORM_DRAFT" });
  return { ok: true };
}
