import type { FillResult } from "@/types/fill";
import type { Profile } from "@/types/profile";

export type ContentMessage =
  | { type: "PING" }
  | { type: "SCAN_FIELDS"; profile: Profile }
  | { type: "FILL_FIELDS"; profile: Profile; minConfidence?: number }
  | { type: "GET_FORM_DRAFT_STATUS" }
  | { type: "SNAPSHOT_FORM_DRAFT" }
  | { type: "RESTORE_FORM_DRAFT" }
  | { type: "CLEAR_FORM_DRAFT" };

/** Messages sent from the background script to the content script. */
export type ContentTabMessage =
  | { type: "FILL_CONTEXT_CHANGED" }
  | { type: "OPEN_FIELD_PICKER" };

export type ContentMessageResponse =
  | { ok: true }
  | { fieldCount: number; matches: Array<{ fieldKey: string; confidence: number; label: string }> }
  | FillResult
  | { fillableCount: number }
  | { fieldCount: number; savedAt?: number }
  | { restored: number };
