import type { SerializableField } from "@/types/fill";

export type { SerializableField };

function labelFor(el: HTMLElement, root: ParentNode): string {
  const id = el.getAttribute("id");
  if (id && "querySelector" in root) {
    const label = root.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (label?.textContent) return label.textContent.trim();
  }
  const parentLabel = el.closest("label");
  if (parentLabel?.textContent) return parentLabel.textContent.trim();
  const aria = el.getAttribute("aria-label");
  if (aria) return aria.trim();
  return "";
}

function isFillable(el: Element): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  if (el instanceof HTMLTextAreaElement) return !el.disabled && !el.readOnly;
  if (el instanceof HTMLSelectElement) return !el.disabled;
  if (!(el instanceof HTMLInputElement)) return false;
  if (el.disabled || el.readOnly) return false;
  const skip = ["hidden", "submit", "button", "reset", "file", "image", "password"];
  return !skip.includes(el.type);
}

export function detectFields(root: ParentNode = document): SerializableField[] {
  const nodes = root.querySelectorAll("input, textarea, select");
  const fields: SerializableField[] = [];

  nodes.forEach((node, index) => {
    if (!isFillable(node)) return;
    const label = labelFor(node, root);
    const hints = [
      node.getAttribute("name"),
      node.getAttribute("id"),
      node.getAttribute("placeholder"),
      node.getAttribute("autocomplete"),
      label,
      node.getAttribute("aria-label"),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    fields.push({
      index,
      tag: node.tagName.toLowerCase(),
      type: node instanceof HTMLInputElement ? node.type : node.tagName.toLowerCase(),
      autocomplete: node.getAttribute("autocomplete") ?? "",
      name: node.getAttribute("name") ?? "",
      id: node.getAttribute("id") ?? "",
      placeholder: node.getAttribute("placeholder") ?? "",
      label,
      hints,
    });
  });

  return fields;
}

export function getFieldElement(
  index: number,
  root: ParentNode = document,
): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null {
  const nodes = root.querySelectorAll("input, textarea, select");
  let fillableIndex = 0;
  for (const node of nodes) {
    if (!isFillable(node)) continue;
    if (fillableIndex === index) return node;
    fillableIndex++;
  }
  return null;
}
