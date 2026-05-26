import type { FillResult } from "@/types/fill";
import type { Profile } from "@/types/profile";
import type { VaultStatus } from "@/types/vault";

/** Background ↔ popup/options response map (keyed by request type). */
export interface MessageResponses {
  GET_STATUS: { status: VaultStatus; profileCount: number };
  UNLOCK: { ok: boolean; error?: string };
  LOCK: { ok: boolean };
  SETUP: { ok: boolean; error?: string };
  GET_PROFILES: { profiles: Profile[] };
  SAVE_PROFILE: { profile: Profile };
  DELETE_PROFILE: { ok: boolean };
  FILL_ACTIVE_TAB: { result?: FillResult; error?: string };
  SCAN_ACTIVE_TAB: { fields: number; error?: string };
}

export type MessageType = keyof MessageResponses;

export type MessageResponse<T extends MessageType> = MessageResponses[T];

export type MessageRequest =
  | { type: "GET_STATUS" }
  | { type: "LOCK" }
  | { type: "UNLOCK"; password: string }
  | { type: "SETUP"; password: string }
  | { type: "GET_PROFILES" }
  | { type: "SAVE_PROFILE"; profile: Profile }
  | { type: "DELETE_PROFILE"; profileId: string }
  | { type: "FILL_ACTIVE_TAB"; profileId?: string; minConfidence?: number }
  | { type: "SCAN_ACTIVE_TAB" };
