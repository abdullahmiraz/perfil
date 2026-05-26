import {
  clearTabFormDraft,
  restoreTabFormDraft,
  saveTabFormDraft,
} from "@/background/form-draft-tab";
import { fillActiveTab, scanActiveTab } from "@/background/fill-tab";
import { vaultService } from "@/lib/vault-service";

const ROOT_ID = "perfil-root";
const FILL_PAGE_ID = "perfil-fill-page";
const SCAN_ID = "perfil-scan";
const LOCKED_ID = "perfil-locked";
const DRAFT_SAVE_ID = "perfil-draft-save";
const DRAFT_RESTORE_ID = "perfil-draft-restore";
const DRAFT_CLEAR_ID = "perfil-draft-clear";

export function initContextMenu(): void {
  chrome.runtime.onInstalled.addListener(() => {
    void rebuildContextMenus();
  });
  chrome.runtime.onStartup.addListener(() => {
    void rebuildContextMenus();
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    void handleContextClick(info.menuItemId, tab);
  });
}

export async function rebuildContextMenus(): Promise<void> {
  await chrome.contextMenus.removeAll();

  const settings = vaultService.getSettings();
  if (!settings.contextMenuEnabled) return;

  // Page background only — avoids clutter on search boxes and single inputs.
  await chrome.contextMenus.create({
    id: ROOT_ID,
    title: "Perfil",
    contexts: ["page"],
  });

  if (!vaultService.isUnlocked()) {
    await chrome.contextMenus.create({
      id: LOCKED_ID,
      parentId: ROOT_ID,
      title: "Unlock vault in extension popup…",
      enabled: false,
      contexts: ["page"],
    });
    await addDraftMenuItems();
    return;
  }

  const profile = vaultService.resolveProfile();
  const label = profile?.data.label ?? "profile";

  await chrome.contextMenus.create({
    id: FILL_PAGE_ID,
    parentId: ROOT_ID,
    title: `Fill page (${label})`,
    contexts: ["page"],
  });

  await chrome.contextMenus.create({
    id: SCAN_ID,
    parentId: ROOT_ID,
    title: "Scan page for fields",
    contexts: ["page"],
  });

  await addDraftMenuItems();
}

async function addDraftMenuItems(): Promise<void> {
  await chrome.contextMenus.create({
    id: "perfil-draft-sep",
    parentId: ROOT_ID,
    type: "separator",
    contexts: ["page"],
  });
  await chrome.contextMenus.create({
    id: DRAFT_SAVE_ID,
    parentId: ROOT_ID,
    title: "Save form for this site",
    contexts: ["page"],
  });
  await chrome.contextMenus.create({
    id: DRAFT_RESTORE_ID,
    parentId: ROOT_ID,
    title: "Fill saved form (latest)",
    contexts: ["page"],
  });
  await chrome.contextMenus.create({
    id: DRAFT_CLEAR_ID,
    parentId: ROOT_ID,
    title: "Clear saved form",
    contexts: ["page"],
  });
}

async function handleContextClick(
  menuItemId: string | number,
  tab?: chrome.tabs.Tab,
): Promise<void> {
  if (!tab?.id) return;

  switch (menuItemId) {
    case FILL_PAGE_ID:
      await fillActiveTab();
      break;
    case SCAN_ID:
      await scanActiveTab();
      break;
    case DRAFT_SAVE_ID:
      await saveTabFormDraft();
      break;
    case DRAFT_RESTORE_ID:
      await restoreTabFormDraft();
      break;
    case DRAFT_CLEAR_ID:
      await clearTabFormDraft();
      break;
    default:
      break;
  }
}
