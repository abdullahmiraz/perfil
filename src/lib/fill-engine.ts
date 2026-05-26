import { detectFields, getFieldElement } from "@/lib/field-detector";
import { matchField } from "@/lib/field-matcher";
import type { FillResult } from "@/types/fill";
import type { Profile, ProfileFieldKey } from "@/types/profile";

function setNativeValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string,
): void {
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) {
    setter.call(el, value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.dispatchEvent(new Event("blur", { bubbles: true }));
}

function flash(el: HTMLElement): void {
  const prev = el.style.outline;
  el.style.outline = "2px solid #3d9cf5";
  el.style.outlineOffset = "2px";
  window.setTimeout(() => {
    el.style.outline = prev;
    el.style.outlineOffset = "";
  }, 1200);
}

export function fillPage(
  profile: Profile,
  minConfidence = 0.55,
  root: ParentNode = document,
): FillResult {
  const fields = detectFields(root);
  let filled = 0;
  let skipped = 0;
  const matches: FillResult["matches"] = [];

  for (const field of fields) {
    const match = matchField(field, profile.data);
    if (!match || match.confidence < minConfidence) {
      skipped++;
      continue;
    }
    const value = profile.data[match.fieldKey];
    if (!value) {
      skipped++;
      continue;
    }
    const el = getFieldElement(field.index, root);
    if (!el) {
      skipped++;
      continue;
    }
    setNativeValue(el, value);
    flash(el);
    filled++;
    matches.push({
      fieldKey: match.fieldKey as ProfileFieldKey,
      confidence: match.confidence,
    });
  }

  return { filled, skipped, matches };
}

export function scanPage(profile: Profile, root: ParentNode = document) {
  const fields = detectFields(root);
  const matches = fields
    .map((field) => {
      const match = matchField(field, profile.data);
      if (!match) return null;
      return {
        fieldKey: match.fieldKey,
        confidence: match.confidence,
        label: field.label || field.name || field.id || field.placeholder || "field",
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  return { fieldCount: fields.length, matches };
}
