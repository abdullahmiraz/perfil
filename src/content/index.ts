import {
  applyLatestSavedForPage,
  applySavedSnapshot,
  clearSavedSnapshot,
  getFormDraftStatusSync,
  initFormDraft,
  snapshotFormDraft,
} from "@/content/form-draft";
import {
  initFieldPicker,
  openFieldPickerForActiveElement,
  refreshFillContext,
} from "@/content/field-picker";
import { fillPage, scanPage } from "@/lib/fill-engine";
import type { ContentMessage, ContentTabMessage } from "@/types/content";

/** Register content-script listeners (called from WXT `defineContentScript` entrypoint). */
export function initContent(): void {
  initFieldPicker();
  initFormDraft();

  chrome.runtime.onMessage.addListener(
    (message: ContentMessage | ContentTabMessage, _sender, sendResponse) => {
      if (message.type === "PING") {
        sendResponse({ ok: true });
        return true;
      }

      if (message.type === "FILL_CONTEXT_CHANGED") {
        void refreshFillContext();
        sendResponse({ ok: true });
        return true;
      }

      if (message.type === "OPEN_FIELD_PICKER") {
        void openFieldPickerForActiveElement();
        sendResponse({ ok: true });
        return true;
      }

      if (message.type === "GET_FORM_DRAFT_STATUS") {
        sendResponse(getFormDraftStatusSync());
        return true;
      }

      if (message.type === "SNAPSHOT_FORM_DRAFT") {
        void snapshotFormDraft().then((r) => sendResponse(r));
        return true;
      }

      if (message.type === "RESTORE_FORM_DRAFT") {
        void (
          message.draftId ? applySavedSnapshot(message.draftId) : applyLatestSavedForPage()
        ).then((restored) => sendResponse({ restored }));
        return true;
      }

      if (message.type === "CLEAR_FORM_DRAFT") {
        if (message.draftId) {
          void clearSavedSnapshot(message.draftId).then(() => sendResponse({ ok: true }));
        } else {
          sendResponse({ ok: true });
        }
        return true;
      }

      if (message.type === "SCAN_FIELDS") {
        const result = scanPage(message.profile);
        sendResponse({ fieldCount: result.fieldCount, matches: result.matches });
        return true;
      }

      if (message.type === "FILL_FIELDS") {
        const result = fillPage(message.profile, message.minConfidence ?? 0.55);
        sendResponse(result);
        return true;
      }

      return false;
    },
  );
}
