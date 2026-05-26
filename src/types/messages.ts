import type { FillResult } from "@/types/fill";
import type { FillContext } from "@/types/fill-context";
import type { FormDraftStatus } from "@/types/form-draft";
import type { Profile } from "@/types/profile";
import type { VaultRecoveryInfo, VaultSettings, VaultSetupOptions, VaultStatus } from "@/types/vault";

export interface MessageResponses {
  GET_STATUS: { status: VaultStatus; profileCount: number };
  UNLOCK: { ok: boolean; error?: string };
  UNLOCK_PIN: { ok: boolean; error?: string };
  LOCK: { ok: boolean };
  SETUP: { ok: boolean; error?: string };
  GET_RECOVERY_INFO: VaultRecoveryInfo;
  VERIFY_RECOVERY_ANSWER: { ok: boolean; error?: string };
  RESET_MASTER_PASSWORD: { ok: boolean; error?: string };
  CANCEL_RECOVERY_RESET: { ok: boolean };
  UPDATE_RECOVERY: { ok: boolean; error?: string };
  CLEAR_RECOVERY: { ok: boolean; error?: string };
  GET_PROFILES: { profiles: Profile[] };
  GET_SETTINGS: { settings: VaultSettings };
  SAVE_SETTINGS: { settings: VaultSettings };
  SET_PIN: { ok: boolean; error?: string };
  CLEAR_PIN: { ok: boolean; error?: string };
  SAVE_PROFILE: { profile: Profile };
  DELETE_PROFILE: { ok: boolean };
  COPY_CUSTOM_FIELDS: { ok: boolean; error?: string };
  EXPORT_VAULT: { json: string };
  IMPORT_VAULT: { ok: boolean; error?: string; count?: number };
  TOUCH_ACTIVITY: { ok: boolean };
  FILL_ACTIVE_TAB: { result?: FillResult; error?: string };
  SCAN_ACTIVE_TAB: { fields: number; error?: string };
  GET_FILL_CONTEXT: FillContext;
  GET_TAB_FORM_DRAFT_STATUS: FormDraftStatus | { error: string };
  SAVE_TAB_FORM_DRAFT: { ok: true; fieldCount: number; id: string } | { error: string };
  RESTORE_TAB_FORM_DRAFT: { ok: true; restored: number } | { error: string };
  CLEAR_TAB_FORM_DRAFT: { ok: true } | { error: string };
}

export type MessageType = keyof MessageResponses;

export type MessageResponse<T extends MessageType> = MessageResponses[T];

export type MessageRequest =
  | { type: "GET_STATUS" }
  | { type: "LOCK" }
  | { type: "UNLOCK"; password: string }
  | { type: "UNLOCK_PIN"; pin: string }
  | { type: "SETUP"; password: string; options?: VaultSetupOptions }
  | { type: "GET_RECOVERY_INFO" }
  | { type: "VERIFY_RECOVERY_ANSWER"; answer: string }
  | { type: "RESET_MASTER_PASSWORD"; newPassword: string }
  | { type: "CANCEL_RECOVERY_RESET" }
  | {
      type: "UPDATE_RECOVERY";
      question: string;
      answer: string;
      masterPassword: string;
    }
  | { type: "CLEAR_RECOVERY"; masterPassword: string }
  | { type: "GET_PROFILES" }
  | { type: "GET_SETTINGS" }
  | { type: "SAVE_SETTINGS"; settings: Partial<VaultSettings> }
  | { type: "SET_PIN"; pin: string; masterPassword: string }
  | { type: "CLEAR_PIN"; masterPassword: string }
  | { type: "SAVE_PROFILE"; profile: Profile }
  | { type: "DELETE_PROFILE"; profileId: string }
  | {
      type: "COPY_CUSTOM_FIELDS";
      sourceProfileId: string;
      targetProfileId: string;
      fieldIds: string[];
      mode: "copy" | "move";
    }
  | { type: "EXPORT_VAULT" }
  | { type: "IMPORT_VAULT"; json: string; mode: "merge" | "replace" }
  | { type: "TOUCH_ACTIVITY" }
  | { type: "FILL_ACTIVE_TAB"; profileId?: string; minConfidence?: number }
  | { type: "SCAN_ACTIVE_TAB" }
  | { type: "GET_FILL_CONTEXT" }
  | { type: "GET_TAB_FORM_DRAFT_STATUS" }
  | { type: "SAVE_TAB_FORM_DRAFT" }
  | { type: "RESTORE_TAB_FORM_DRAFT"; draftId?: string }
  | { type: "CLEAR_TAB_FORM_DRAFT"; draftId?: string };
