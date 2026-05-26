import { PROFILE_FIELD_GROUPS, PROFILE_FIELD_LABELS } from "@/shared/profile-fields";
import type { Profile, ProfileFieldKey } from "@/types/profile";

export interface ProfileValueOption {
  /** `email` or `custom:<id>` */
  id: string;
  label: string;
  value: string;
  group: string;
}

/** Non-empty profile values for the per-field picker and context menu. */
export function listProfileValues(profile: Profile): ProfileValueOption[] {
  const items: ProfileValueOption[] = [];

  for (const group of PROFILE_FIELD_GROUPS) {
    for (const key of group.keys) {
      const value = profile.data[key as ProfileFieldKey]?.trim();
      if (!value) continue;
      items.push({
        id: key,
        label: PROFILE_FIELD_LABELS[key as ProfileFieldKey],
        value,
        group: group.title,
      });
    }
  }

  for (const field of profile.customFields) {
    const value = field.value?.trim();
    if (!value) continue;
    items.push({
      id: `custom:${field.id}`,
      label: field.label,
      value,
      group: "Custom fields",
    });
  }

  return items;
}

export function getProfileValueById(profile: Profile, id: string): string | null {
  if (id.startsWith("custom:")) {
    const fieldId = id.slice("custom:".length);
    return profile.customFields.find((f) => f.id === fieldId)?.value ?? null;
  }
  const key = id as ProfileFieldKey;
  if (key in profile.data) {
    return profile.data[key] ?? null;
  }
  return null;
}
