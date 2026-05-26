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

export interface Profile {
  id: string;
  data: ProfileData;
  createdAt: number;
  updatedAt: number;
}
