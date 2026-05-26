import { initContextMenu } from "@/background/context-menu";
import { getFillContext, safeNotifyFillContextChanged } from "@/background/fill-context";
import {
  clearTabFormDraft,
  getTabFormDraftStatus,
  restoreTabFormDraft,
  saveTabFormDraft,
} from "@/background/form-draft-tab";
import { fillActiveTab, scanActiveTab } from "@/background/fill-tab";
import { defaultVaultSettings } from "@/lib/profile-defaults";
import { vaultService } from "@/lib/vault-service";
import type { MessageRequest, MessageResponse, MessageType } from "@/types/messages";

/** Register background listeners (called from WXT `defineBackground` entrypoint). */
export function initBackground(): void {
  initContextMenu();

  chrome.runtime.onMessage.addListener((request: MessageRequest, _sender, sendResponse) => {
    void handleMessage(request)
      .then(async (res) => {
        sendResponse(res);
      })
      .catch((err: unknown) => {
        console.error("[perfil]", err);
        sendResponse(fallbackError(request.type, err));
      });
    return true;
  });

  void vaultService.whenReady().then(() => safeNotifyFillContextChanged());
}

function fallbackError(type: MessageType, err: unknown): MessageResponse<MessageType> {
  const msg = err instanceof Error ? err.message : String(err);
  switch (type) {
    case "GET_STATUS":
      return { status: "uninitialized", profileCount: 0 };
    case "GET_SETTINGS":
      return { settings: defaultVaultSettings() };
    case "GET_RECOVERY_INFO":
      return { enabled: false, question: null };
    case "GET_FILL_CONTEXT":
      return {
        unlocked: false,
        fieldPickerEnabled: true,
        contextMenuEnabled: false,
        profile: null,
        profileLabel: "",
      };
    case "UNLOCK":
    case "UNLOCK_PIN":
    case "SETUP":
    case "VERIFY_RECOVERY_ANSWER":
    case "RESET_MASTER_PASSWORD":
    case "CANCEL_RECOVERY_RESET":
    case "UPDATE_RECOVERY":
    case "CLEAR_RECOVERY":
      return { ok: true };
    case "SET_PIN":
    case "CLEAR_PIN":
    case "COPY_CUSTOM_FIELDS":
    case "IMPORT_VAULT":
      return { ok: false, error: msg };
    case "EXPORT_VAULT":
      return { json: "{}" };
    case "LOCK":
    case "TOUCH_ACTIVITY":
    case "DELETE_PROFILE":
      return { ok: false };
    case "GET_PROFILES":
      return { profiles: [] };
    case "SAVE_PROFILE":
      throw err;
    case "SAVE_SETTINGS":
      throw err;
    case "SCAN_ACTIVE_TAB":
      return { fields: 0, error: msg };
    case "FILL_ACTIVE_TAB":
      return { error: msg };
    case "GET_TAB_FORM_DRAFT_STATUS":
      return { error: msg };
    case "SAVE_TAB_FORM_DRAFT":
      return { error: msg };
    case "RESTORE_TAB_FORM_DRAFT":
      return { error: msg };
    case "CLEAR_TAB_FORM_DRAFT":
      return { error: msg };
    default:
      return { ok: false } as MessageResponse<MessageType>;
  }
}

async function handleMessage(request: MessageRequest): Promise<MessageResponse<MessageType>> {
  await vaultService.whenReady();
  if (
    vaultService.isUnlocked() &&
    request.type !== "LOCK" &&
    request.type !== "SETUP" &&
    request.type !== "RESET_MASTER_PASSWORD" &&
    request.type !== "VERIFY_RECOVERY_ANSWER" &&
    request.type !== "CANCEL_RECOVERY_RESET"
  ) {
    vaultService.touchActivity();
  }

  switch (request.type) {
    case "GET_STATUS":
      return vaultService.getStatus();
    case "GET_FILL_CONTEXT":
      return getFillContext();
    case "UNLOCK": {
      const res = await vaultService.unlock(request.password);
      if (res.ok) await safeNotifyFillContextChanged();
      return res;
    }
    case "UNLOCK_PIN": {
      const res = await vaultService.unlockWithPin(request.pin);
      if (res.ok) await safeNotifyFillContextChanged();
      return res;
    }
    case "LOCK":
      await vaultService.lock();
      await safeNotifyFillContextChanged();
      return { ok: true };
    case "SETUP": {
      const res = await vaultService.setup(request.password, request.options);
      if (res.ok) await safeNotifyFillContextChanged();
      return res;
    }
    case "GET_RECOVERY_INFO":
      return vaultService.getRecoveryInfo();
    case "VERIFY_RECOVERY_ANSWER":
      return vaultService.verifyRecoveryAnswer(request.answer);
    case "RESET_MASTER_PASSWORD": {
      const res = await vaultService.resetMasterPassword(request.answer, request.newPassword);
      if (res.ok) await safeNotifyFillContextChanged();
      return res;
    }
    case "CANCEL_RECOVERY_RESET":
      await vaultService.cancelRecoveryReset();
      return { ok: true };
    case "UPDATE_RECOVERY":
      return vaultService.updateRecovery(request.question, request.answer, request.masterPassword);
    case "CLEAR_RECOVERY":
      return vaultService.clearRecovery(request.masterPassword);
    case "GET_PROFILES":
      return { profiles: vaultService.getProfiles() };
    case "GET_SETTINGS":
      return {
        settings: vaultService.isUnlocked()
          ? vaultService.getSettings()
          : await vaultService.getLockedSettings(),
      };
    case "SAVE_SETTINGS": {
      const settings = await vaultService.saveSettings(request.settings);
      await safeNotifyFillContextChanged();
      return { settings };
    }
    case "SET_PIN": {
      const res = await vaultService.setPin(request.pin, request.masterPassword);
      return res;
    }
    case "CLEAR_PIN": {
      const res = await vaultService.clearPin(request.masterPassword);
      return res;
    }
    case "SAVE_PROFILE": {
      const profile = await vaultService.saveProfile(request.profile);
      await safeNotifyFillContextChanged();
      return { profile };
    }
    case "DELETE_PROFILE": {
      const ok = vaultService.deleteProfile(request.profileId);
      if (ok) await safeNotifyFillContextChanged();
      return { ok };
    }
    case "COPY_CUSTOM_FIELDS": {
      const res = vaultService.copyCustomFields(
        request.sourceProfileId,
        request.targetProfileId,
        request.fieldIds,
        request.mode,
      );
      if (res.ok) await safeNotifyFillContextChanged();
      return res;
    }
    case "EXPORT_VAULT":
      return { json: JSON.stringify(vaultService.exportBundle(), null, 2) };
    case "IMPORT_VAULT": {
      const res = await vaultService.importBundle(request.json, request.mode);
      if (res.ok) await safeNotifyFillContextChanged();
      return res;
    }
    case "TOUCH_ACTIVITY":
      vaultService.touchActivity();
      return { ok: true };
    case "SCAN_ACTIVE_TAB":
      return scanActiveTab();
    case "FILL_ACTIVE_TAB":
      return fillActiveTab(request.profileId, request.minConfidence);
    case "GET_TAB_FORM_DRAFT_STATUS":
      return getTabFormDraftStatus();
    case "SAVE_TAB_FORM_DRAFT":
      return saveTabFormDraft();
    case "RESTORE_TAB_FORM_DRAFT":
      return restoreTabFormDraft(request.draftId);
    case "CLEAR_TAB_FORM_DRAFT":
      return clearTabFormDraft(request.draftId);
    default:
      throw new Error("Unknown message type");
  }
}
