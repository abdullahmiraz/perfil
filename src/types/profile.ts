/** Standard personal-info fields — not passwords. */
export interface ProfileData {
  label: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  dateOfBirth: string;
  linkedIn: string;
  github: string;
  bio: string;
}

export type ProfileFieldKey = keyof Omit<ProfileData, "label">;

export type CustomFieldType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "date"
  | "time"
  | "color"
  | "url"
  | "select";

export interface CustomField {
  id: string;
  label: string;
  type: CustomFieldType;
  value: string;
  /** Options for `select` fields */
  options?: string[];
  order: number;
}

export interface Profile {
  id: string;
  data: ProfileData;
  customFields: CustomField[];
  createdAt: number;
  updatedAt: number;
}

export const CUSTOM_FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "textarea", label: "Long text" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "color", label: "Color" },
  { value: "url", label: "URL" },
  { value: "select", label: "Dropdown" },
];
