import type { FillResult } from "@/types/fill";
import type { Profile } from "@/types/profile";

export type ContentMessage =
  | { type: "PING" }
  | { type: "SCAN_FIELDS"; profile: Profile }
  | { type: "FILL_FIELDS"; profile: Profile; minConfidence?: number };

export type ContentMessageResponse =
  | { ok: true }
  | { fieldCount: number; matches: Array<{ fieldKey: string; confidence: number; label: string }> }
  | FillResult;
