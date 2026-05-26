import type { ProfileFieldKey } from "@/types/profile";

export interface FillResult {
  filled: number;
  skipped: number;
  matches: Array<{ fieldKey: ProfileFieldKey; confidence: number }>;
}

export interface SerializableField {
  index: number;
  tag: string;
  type: string;
  autocomplete: string;
  name: string;
  id: string;
  placeholder: string;
  label: string;
  hints: string;
}

export interface FieldMatchPreview {
  fieldKey: string;
  confidence: number;
  label: string;
}
