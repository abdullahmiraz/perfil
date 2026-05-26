import type { CustomField, Profile, ProfileData } from "@/types/profile";
import type { VaultPayload } from "@/types/vault";
import { defaultVaultSettings } from "@/lib/profile-defaults";

/** Ensure profile has customFields array (v2). */
export function migrateProfile(profile: Profile & { customFields?: CustomField[] }): Profile {
  return {
    ...profile,
    customFields: profile.customFields ?? [],
  };
}

export function migratePayload(raw: unknown): VaultPayload {
  const data = raw as VaultPayload & { version?: number };
  if (data.version === 2 && Array.isArray(data.profiles)) {
    return {
      version: 2,
      profiles: data.profiles.map(migrateProfile),
      settings: { ...defaultVaultSettings(), ...data.settings },
    };
  }

  // v1 payload
  const v1 = data as { profiles?: Profile[]; settings?: VaultPayload["settings"] };
  return {
    version: 2,
    profiles: (v1.profiles ?? []).map(migrateProfile),
    settings: { ...defaultVaultSettings(), ...v1.settings },
  };
}

export function profileDataEntries(data: ProfileData): { key: string; label: string; value: string }[] {
  const skip = new Set(["label"]);
  return (Object.keys(data) as (keyof ProfileData)[])
    .filter((k) => !skip.has(k) && data[k])
    .map((k) => ({
      key: k,
      label: k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
      value: data[k],
    }));
}
