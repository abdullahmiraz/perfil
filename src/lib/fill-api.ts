import { detectFields, getFieldElement } from "@/lib/field-detector";
import { fillPage } from "@/lib/fill-engine";
import { matchProfileField } from "@/lib/profile-match";
import type { FillResult } from "@/types/fill";
import type { Profile } from "@/types/profile";

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
  fieldKey: string;
  value: string;
  filled: boolean;
}

export interface FillReport extends FillResult {
  rows: FillFieldRow[];
}

function fieldLabel(field: {
  label: string;
  name: string;
  id: string;
  placeholder: string;
}): string {
  return field.label || field.name || field.id || field.placeholder || "field";
}

export function scanForm(
  profile: Profile,
  root: ParentNode = document,
  minConfidence = 0.55,
): ScanReport {
  const fields = detectFields(root);
  const rows: FieldScanRow[] = fields.map((field) => {
    const match = matchProfileField(field, profile);
    const value = match?.value ?? null;
    const willFill = Boolean(match && match.confidence >= minConfidence && value);
    return {
      index: field.index,
      label: fieldLabel(field),
      name: field.name,
      type: field.type,
      fieldKey: match ? String(match.source) : null,
      confidence: match?.confidence ?? null,
      value,
      willFill,
    };
  });

  return {
    fieldCount: fields.length,
    matchCount: rows.filter((r) => r.willFill).length,
    rows,
  };
}

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
      const expected = r.value ?? "";
      const actual =
        el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.value : "";
      return {
        label: r.label,
        fieldKey: r.fieldKey!,
        value: expected,
        filled: actual === expected,
      };
    });

  return { ...result, rows };
}

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
