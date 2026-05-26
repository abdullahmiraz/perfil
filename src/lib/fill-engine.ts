import { detectFields, getFieldElement } from "@/lib/field-detector";
import { matchProfileField } from "@/lib/profile-match";
import type { FillResult } from "@/types/fill";
import type { Profile, ProfileFieldKey } from "@/types/profile";

export function setNativeValue(
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

export function flashField(el: HTMLElement): void {
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
    const match = matchProfileField(field, profile);
    if (!match || match.confidence < minConfidence) {
      skipped++;
      continue;
    }
    const el = getFieldElement(field.index, root);
    if (!el) {
      skipped++;
      continue;
    }
    setNativeValue(el, match.value);
    flashField(el);
    filled++;
    if (!String(match.source).startsWith("custom:")) {
      matches.push({
        fieldKey: match.source as ProfileFieldKey,
        confidence: match.confidence,
      });
    }
  }

  return { filled, skipped, matches };
}

export function scanPage(profile: Profile, root: ParentNode = document) {
  const fields = detectFields(root);
  const matches = fields
    .map((field) => {
      const match = matchProfileField(field, profile);
      if (!match) return null;
      return {
        fieldKey: String(match.source),
        confidence: match.confidence,
        label: field.label || field.name || field.id || field.placeholder || "field",
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  return { fieldCount: fields.length, matches };
}

export function fillElementValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string,
): void {
  setNativeValue(el, value);
  flashField(el);
}
