import { isRestrictedUrl, sendTabMessage } from "@/lib/tab-bridge";
import { vaultService } from "@/lib/vault-service";
import type { FillResult } from "@/types/fill";

export async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab");
  return tab;
}

export async function scanActiveTab(): Promise<{ fields: number; error?: string }> {
  if (!vaultService.isUnlocked()) {
    return { fields: 0, error: "Vault is locked" };
  }
  const tab = await getActiveTab();
  if (isRestrictedUrl(tab.url)) {
    return { fields: 0, error: "Cannot scan this page (browser internal page)" };
  }
  const profile = vaultService.resolveProfile();
  if (!profile) return { fields: 0, error: "No profile available" };
  try {
    const response = await sendTabMessage<{ fieldCount: number }>(tab.id!, {
      type: "SCAN_FIELDS",
      profile,
    });
    return { fields: response?.fieldCount ?? 0 };
  } catch {
    return { fields: 0, error: "Could not scan this page. Try refreshing the tab." };
  }
}

export async function fillActiveTab(
  profileId?: string,
  minConfidence?: number,
): Promise<{ result?: FillResult; error?: string }> {
  if (!vaultService.isUnlocked()) {
    return { error: "Vault is locked" };
  }
  const tab = await getActiveTab();
  if (isRestrictedUrl(tab.url)) {
    return { error: "Cannot fill this page (browser internal page)" };
  }
  const profile = vaultService.resolveProfile(profileId);
  if (!profile) return { error: "No profile selected" };
  try {
    const result = await sendTabMessage<FillResult>(tab.id!, {
      type: "FILL_FIELDS",
      profile,
      minConfidence: minConfidence ?? 0.55,
    });
    return { result };
  } catch {
    return { error: "Could not fill this page. Try refreshing the tab." };
  }
}
