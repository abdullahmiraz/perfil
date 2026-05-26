import { detectFields, getFieldElement, isFillableElement } from "@/lib/field-detector";
import { fillElementValue } from "@/lib/fill-engine";
import type { SerializableField } from "@/types/fill";
import type { FormDraft, FormDraftScope } from "@/types/form-draft";

export function draftStorageKey(pageUrl: string, scope: FormDraftScope): string {
  const u = new URL(pageUrl);
  if (scope === "domain") return u.hostname;
  return u.href.split("#")[0] ?? u.href;
}

export function fieldStorageKey(field: SerializableField): string {
  if (field.name) return `name:${field.name}`;
  if (field.id) return `id:${field.id}`;
  return `idx:${field.index}`;
}

export function captureFormFields(root: ParentNode = document): Record<string, string> {
  const fields = detectFields(root);
  const out: Record<string, string> = {};
  for (const field of fields) {
    const el = getFieldElement(field.index, root);
    if (!el) continue;
    const value = el.value?.trim();
    if (!value) continue;
    out[fieldStorageKey(field)] = value;
  }
  return out;
}

export function restoreFormFields(
  stored: Record<string, string>,
  root: ParentNode = document,
): number {
  const fields = detectFields(root);
  let restored = 0;

  for (const field of fields) {
    const key = fieldStorageKey(field);
    const value = stored[key];
    if (!value) continue;
    const el = getFieldElement(field.index, root);
    if (!el || !isFillableElement(el)) continue;
    fillElementValue(el, value);
    restored++;
  }

  return restored;
}

export function countFillableFields(root: ParentNode = document): number {
  return detectFields(root).length;
}

export function buildDraft(
  pageUrl: string,
  scope: FormDraftScope,
  fields: Record<string, string>,
): FormDraft {
  const u = new URL(pageUrl);
  return {
    storageKey: draftStorageKey(pageUrl, scope),
    scope,
    hostname: u.hostname,
    url: pageUrl,
    savedAt: Date.now(),
    fields,
  };
}
