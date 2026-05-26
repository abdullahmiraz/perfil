import { fillPage, scanPage } from "@/lib/fill-engine";
import type { ContentMessage } from "@/types/content";

chrome.runtime.onMessage.addListener((message: ContentMessage, _sender, sendResponse) => {
  if (message.type === "PING") {
    sendResponse({ ok: true });
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
});
