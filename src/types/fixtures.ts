import type { CustomFieldType, ProfileData } from "@/types/profile";

/** JSON profile fixture — see `fixtures/profiles/`. */
export interface ProfileFixtureCustomField {
  label: string;
  type: CustomFieldType;
  value: string;
  options?: string[];
}

export interface ProfileFixture {
  label: string;
  data: Partial<ProfileData>;
  customFields?: ProfileFixtureCustomField[];
}
