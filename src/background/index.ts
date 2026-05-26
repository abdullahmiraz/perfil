import { isRestrictedUrl, sendTabMessage } from "@/lib/tab-bridge";
import { vaultService } from "@/lib/vault-service";
import type { MessageRequest, MessageResponse, MessageType } from "@/types/messages";
import type { FillResult } from "@/types/fill";

chrome.runtime.onMessage.addListener((request: MessageRequest, _sender, sendResponse) => {
  void handleMessage(request)
    .then(sendResponse)
    .catch((err: unknown) => {
      console.error("[perfil]", err);
      sendResponse(fallbackError(request.type, err));
    });
  return true;
});

function fallbackError(type: MessageType, err: unknown): MessageResponse<MessageType> {
  const msg = err instanceof Error ? err.message : String(err);
  switch (type) {
    case "GET_STATUS":
      return { status: "uninitialized", profileCount: 0 };
    case "UNLOCK":
    case "SETUP":
      return { ok: false, error: msg };
    case "LOCK":
    case "DELETE_PROFILE":
      return { ok: false };
    case "GET_PROFILES":
      return { profiles: [] };
    case "SAVE_PROFILE":
      throw err;
    case "SCAN_ACTIVE_TAB":
      return { fields: 0, error: msg };
    case "FILL_ACTIVE_TAB":
      return { error: msg };
    default:
      return { ok: false } as MessageResponse<MessageType>;
  }
}

async function handleMessage(
  request: MessageRequest,
): Promise<MessageResponse<MessageType>> {
  await vaultService.whenReady();

  switch (request.type) {
    case "GET_STATUS":
      return vaultService.getStatus();
    case "UNLOCK":
      return vaultService.unlock(request.password);
    case "LOCK":
      await vaultService.lock();
      return { ok: true };
    case "SETUP":
      return vaultService.setup(request.password);
    case "GET_PROFILES":
      return { profiles: vaultService.getProfiles() };
    case "SAVE_PROFILE":
      return { profile: vaultService.saveProfile(request.profile) };
    case "DELETE_PROFILE":
      return { ok: vaultService.deleteProfile(request.profileId) };
    case "SCAN_ACTIVE_TAB":
      return scanActiveTab();
    case "FILL_ACTIVE_TAB":
      return fillActiveTab(request.profileId, request.minConfidence);
    default:
      throw new Error("Unknown message type");
  }
}

async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab");
  return tab;
}

async function scanActiveTab(): Promise<MessageResponse<"SCAN_ACTIVE_TAB">> {
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

async function fillActiveTab(
  profileId?: string,
  minConfidence?: number,
): Promise<MessageResponse<"FILL_ACTIVE_TAB">> {
  if (!vaultService.isUnlocked()) {
    return { error: "Vault is locked" };
  }
  const tab = await getActiveTab();
  if (isRestrictedUrl(tab.url)) {
    return { error: "Cannot fill this page (browser internal page)" };
  }

  const profile = vaultService.resolveProfile(profileId);
  if (!profile) {
    return { error: "No profile selected" };
  }

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
