import type { CustomField, CustomFieldType } from "@/types/profile";

export function createCustomField(label: string, type: CustomFieldType = "text"): CustomField {
  return {
    id: crypto.randomUUID(),
    label,
    type,
    value: "",
    options: type === "select" ? ["Option 1"] : undefined,
    order: Date.now(),
  };
}

export function normalizeFieldLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

export function customFieldHints(field: CustomField): string {
  const slug = field.label.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  return `${field.label} ${slug} custom-${field.id}`.toLowerCase();
}

export function sortCustomFields(fields: CustomField[]): CustomField[] {
  return [...fields].sort((a, b) => a.order - b.order);
}

export function duplicateCustomField(field: CustomField): CustomField {
  return {
    ...field,
    id: crypto.randomUUID(),
    order: Date.now(),
    options: field.options ? [...field.options] : undefined,
  };
}
