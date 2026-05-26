import type { Profile, ProfileData } from "@/types/profile";
import type { VaultPayload, VaultSettings } from "@/types/vault";

export function emptyProfileData(label = "Personal"): ProfileData {
  return {
    label,
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    dateOfBirth: "",
    linkedIn: "",
    github: "",
    bio: "",
  };
}

export function createProfile(label: string, partial?: Partial<ProfileData>): Profile {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    data: { ...emptyProfileData(label), ...partial },
    customFields: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function defaultVaultPayload(): VaultPayload {
  return {
    version: 2,
    profiles: [],
    settings: defaultVaultSettings(),
  };
}

export function defaultVaultSettings(): VaultSettings {
  return {
    autoLockMinutes: 15,
    defaultProfileId: null,
    pinEnabled: false,
    pinVerifier: null,
    requireMasterPasswordOnRestart: true,
    fieldPickerEnabled: true,
    /** Off by default — enable via popup toggle (avoids clutter on search boxes). */
    contextMenuEnabled: false,
  };
}
