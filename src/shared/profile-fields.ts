import type { ProfileFieldKey } from "@/types/profile";

export interface ProfileFieldGroup {
  title: string;
  keys: ProfileFieldKey[];
}

export const PROFILE_FIELD_GROUPS: ProfileFieldGroup[] = [
  {
    title: "Identity",
    keys: ["firstName", "lastName", "fullName", "email", "phone", "dateOfBirth"],
  },
  {
    title: "Work",
    keys: ["company", "jobTitle", "website", "linkedIn", "github"],
  },
  {
    title: "Address",
    keys: ["addressLine1", "addressLine2", "city", "state", "postalCode", "country"],
  },
  { title: "Other", keys: ["bio"] },
];

export const PROFILE_FIELD_LABELS: Record<ProfileFieldKey, string> = {
  firstName: "First name",
  lastName: "Last name",
  fullName: "Full name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  jobTitle: "Job title",
  website: "Website",
  addressLine1: "Address line 1",
  addressLine2: "Address line 2",
  city: "City",
  state: "State / province",
  postalCode: "Postal code",
  country: "Country",
  dateOfBirth: "Date of birth",
  linkedIn: "LinkedIn",
  github: "GitHub",
  bio: "Bio",
};
