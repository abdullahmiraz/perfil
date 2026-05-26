import { detectFields, getFieldElement } from "@/lib/field-detector";
import { matchField } from "@/lib/field-matcher";
import { fillPage, scanPage } from "@/lib/fill-engine";
import type { FillResult } from "@/types/fill";
import type { Profile, ProfileFieldKey } from "@/types/profile";

export interface FieldScanRow {
  index: number;
  label: string;
  name: string;
  type: string;
  fieldKey: string | null;
  confidence: number | null;
  value: string | null;
  willFill: boolean;
}

export interface ScanReport {
  fieldCount: number;
  matchCount: number;
  rows: FieldScanRow[];
}

export interface FillFieldRow {
  label: string;
  fieldKey: ProfileFieldKey;
  value: string;
  filled: boolean;
}

export interface FillReport extends FillResult {
  rows: FillFieldRow[];
}

function fieldLabel(field: { label: string; name: string; id: string; placeholder: string }): string {
  return field.label || field.name || field.id || field.placeholder || "field";
}

/** Programmatic scan API — used by dev harness, tests, and agents. */
export function scanForm(profile: Profile, root: ParentNode = document, minConfidence = 0.55): ScanReport {
  const fields = detectFields(root);
  const rows: FieldScanRow[] = fields.map((field) => {
    const match = matchField(field, profile.data);
    const value = match ? profile.data[match.fieldKey as ProfileFieldKey] : null;
    const willFill = Boolean(
      match && match.confidence >= minConfidence && value,
    );
    return {
      index: field.index,
      label: fieldLabel(field),
      name: field.name,
      type: field.type,
      fieldKey: match?.fieldKey ?? null,
      confidence: match?.confidence ?? null,
      value: value || null,
      willFill,
    };
  });

  return {
    fieldCount: fields.length,
    matchCount: rows.filter((r) => r.willFill).length,
    rows,
  };
}

/** Programmatic fill API — returns structured report of what was filled. */
export function fillForm(
  profile: Profile,
  root: ParentNode = document,
  minConfidence = 0.55,
): FillReport {
  const before = scanForm(profile, root, minConfidence);
  const result = fillPage(profile, minConfidence, root);

  const rows: FillFieldRow[] = before.rows
    .filter((r) => r.willFill && r.fieldKey)
    .map((r) => {
      const el = getFieldElement(r.index, root);
      const expected = profile.data[r.fieldKey as ProfileFieldKey];
      const actual = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.value : "";
      return {
        label: r.label,
        fieldKey: r.fieldKey as ProfileFieldKey,
        value: expected,
        filled: actual === expected,
      };
    });

  return { ...result, rows };
}

/** Read current form values from DOM (for harness / verification). */
export function readFormValues(root: ParentNode = document): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of detectFields(root)) {
    const el = getFieldElement(field.index, root);
    if (!el) continue;
    const key = field.name || field.id || `field-${field.index}`;
    out[key] = el.value;
  }
  return out;
}

export function scanFormSummary(profile: Profile, root?: ParentNode) {
  return scanPage(profile, root);
}
