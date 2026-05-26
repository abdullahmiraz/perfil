import { rebuildContextMenus } from "@/background/context-menu";
import { vaultService } from "@/lib/vault-service";
import type { FillContext } from "@/types/fill-context";

export function getFillContext(): FillContext {
  const settings = vaultService.getSettings();
  const profile = vaultService.isUnlocked() ? vaultService.resolveProfile() : null;
  return {
    unlocked: vaultService.isUnlocked(),
    fieldPickerEnabled: settings.fieldPickerEnabled,
    contextMenuEnabled: settings.contextMenuEnabled,
    profile,
    profileLabel: profile?.data.label ?? "",
  };
}

export async function notifyFillContextChanged(): Promise<void> {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id || !tab.url || tab.url.startsWith("chrome://")) continue;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "FILL_CONTEXT_CHANGED" });
    } catch {
      // Tab may not have content script yet
    }
  }
  await rebuildContextMenus();
}

/** Never fail vault unlock/save if menu/tab sync fails. */
export async function safeNotifyFillContextChanged(): Promise<void> {
  try {
    await notifyFillContextChanged();
  } catch (err) {
    console.warn("[perfil] fill context sync failed", err);
  }
}
