import { customFieldHints, normalizeFieldLabel, sortCustomFields } from "@/lib/custom-field";
import { matchField } from "@/lib/field-matcher";
import type { SerializableField } from "@/types/fill";
import type { Profile, ProfileFieldKey } from "@/types/profile";

export interface ProfileFieldMatch {
  value: string;
  confidence: number;
  source: ProfileFieldKey | `custom:${string}`;
}

export function matchProfileField(
  field: SerializableField,
  profile: Profile,
): ProfileFieldMatch | null {
  const builtin = matchField(field, profile.data);
  if (builtin) {
    const value = profile.data[builtin.fieldKey];
    if (value) {
      return {
        value,
        confidence: builtin.confidence,
        source: builtin.fieldKey,
      };
    }
  }

  const haystack = field.hints;
  for (const cf of sortCustomFields(profile.customFields)) {
    if (!cf.value) continue;
    const normalized = normalizeFieldLabel(cf.label);
    const slug = normalized.replace(/\s+/g, "");
    const hints = customFieldHints(cf);
    if (
      haystack.includes(normalized) ||
      haystack.includes(slug) ||
      hints.split(" ").some((token) => token.length > 2 && haystack.includes(token))
    ) {
      return {
        value: cf.value,
        confidence: 0.9,
        source: `custom:${cf.id}`,
      };
    }
  }

  return null;
}
