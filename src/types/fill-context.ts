import type { Profile } from "@/types/profile";

export interface FillContext {
  unlocked: boolean;
  fieldPickerEnabled: boolean;
  contextMenuEnabled: boolean;
  profile: Profile | null;
  profileLabel: string;
}
