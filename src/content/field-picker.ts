import { fillElementValue } from "@/lib/fill-engine";
import { isFillableElement } from "@/lib/field-detector";
import { getProfileValueById, listProfileValues } from "@/lib/profile-values";
import type { FillContext } from "@/types/fill-context";
import type { Profile } from "@/types/profile";

const HOST_ID = "perfil-field-picker-host";

let fillContext: FillContext | null = null;
let activeTarget: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null = null;
let focusTimer: ReturnType<typeof setTimeout> | null = null;
let hostEl: HTMLDivElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let panelEl: HTMLDivElement | null = null;

const PICKER_STYLES = `
  :host { all: initial; }
  .panel {
    box-sizing: border-box;
    min-width: 220px;
    max-width: 320px;
    max-height: 280px;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 8px 6px 8px 8px;
    border-radius: 12px;
    border: 1px solid #2a3344;
    background: #0f141c;
    color: #eef2f7;
    font: 13px/1.4 "Inter", system-ui, sans-serif;
    box-shadow: 0 12px 40px rgba(0,0,0,0.45);
    scrollbar-width: thin;
    scrollbar-color: #3d4f66 transparent;
  }
  .panel::-webkit-scrollbar {
    width: 5px;
  }
  .panel::-webkit-scrollbar-track {
    background: transparent;
    margin: 4px 0;
  }
  .panel::-webkit-scrollbar-thumb {
    background: #3d4f66;
    border-radius: 999px;
  }
  .panel::-webkit-scrollbar-thumb:hover {
    background: #4d627d;
  }
  .title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #8b95a8;
    margin: 0 0 2px 2px;
  }
  .hint {
    font-size: 11px;
    color: #6b7589;
    margin: 0 0 8px 2px;
  }
  .group-label {
    font-size: 10px;
    color: #6b7589;
    margin: 8px 0 4px 2px;
  }
  button.item {
    display: block;
    width: 100%;
    text-align: left;
    border: none;
    border-radius: 8px;
    padding: 8px 10px;
    margin: 2px 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
  }
  button.item:hover, button.item:focus {
    background: #1a2332;
    outline: none;
  }
  .item-label { font-weight: 500; }
  .item-value {
    display: block;
    font-size: 11px;
    color: #8b95a8;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .empty {
    font-size: 12px;
    color: #8b95a8;
    padding: 6px 4px;
  }
  .hidden { display: none !important; }
`;

let pickerProfile: Profile | null = null;

export async function refreshFillContext(): Promise<FillContext | null> {
  try {
    fillContext = await chrome.runtime.sendMessage({ type: "GET_FILL_CONTEXT" });
    return fillContext;
  } catch {
    fillContext = null;
    return null;
  }
}

export function initFieldPicker(): void {
  document.addEventListener("focusin", onFocusIn, true);
  document.addEventListener("mousedown", onDocumentPointer, true);
  document.addEventListener("keydown", onKeyDown, true);
  void refreshFillContext();
}

export async function openFieldPickerForActiveElement(): Promise<void> {
  await refreshFillContext();
  const el = document.activeElement;
  if (el && isFillableElement(el)) {
    await showPicker(el);
  }
}

function onFocusIn(ev: FocusEvent): void {
  const target = ev.target;
  if (!(target instanceof Element) || !isFillableElement(target)) return;
  if (focusTimer) clearTimeout(focusTimer);
  focusTimer = setTimeout(() => {
    void maybeShowOnFocus(target);
  }, 280);
}

async function maybeShowOnFocus(
  target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): Promise<void> {
  const ctx = fillContext ?? (await refreshFillContext());
  if (!ctx?.unlocked || !ctx.fieldPickerEnabled || !ctx.profile) return;
  if (target.type === "password") return;
  await showPicker(target, ctx.profile, ctx.profileLabel);
}

async function showPicker(
  target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  profile?: Profile,
  profileLabel?: string,
): Promise<void> {
  const ctx = fillContext ?? (await refreshFillContext());
  const p = profile ?? ctx?.profile;
  const label = profileLabel ?? ctx?.profileLabel ?? "Profile";
  if (!p) return;

  pickerProfile = p;
  const options = listProfileValues(p);
  activeTarget = target;
  ensureHost();
  renderPanel(options, label);
  positionPanel(target);
  panelEl?.classList.remove("hidden");
}

function ensureHost(): void {
  if (hostEl && shadowRoot && panelEl) return;

  hostEl = document.getElementById(HOST_ID) as HTMLDivElement | null;
  if (!hostEl) {
    hostEl = document.createElement("div");
    hostEl.id = HOST_ID;
    hostEl.style.cssText = "position:fixed;z-index:2147483647;left:0;top:0;";
    document.documentElement.appendChild(hostEl);
  }

  shadowRoot = hostEl.shadowRoot ?? hostEl.attachShadow({ mode: "closed" });
  shadowRoot.innerHTML = `<style>${PICKER_STYLES}</style><div class="panel hidden" part="panel"></div>`;
  panelEl = shadowRoot.querySelector(".panel") as HTMLDivElement;
}

function renderPanel(
  options: ReturnType<typeof listProfileValues>,
  profileLabel: string,
): void {
  if (!panelEl || !shadowRoot) return;

  if (!options.length) {
    panelEl.innerHTML = `<p class="title">Perfil · ${escapeHtml(profileLabel)}</p><p class="empty">No values in this profile yet. Add data in extension options.</p>`;
    return;
  }

  let html = `<p class="title">Fill with ${escapeHtml(profileLabel)}</p><p class="hint">Choose a value</p>`;
  let lastGroup = "";

  for (const opt of options) {
    if (opt.group !== lastGroup) {
      html += `<p class="group-label">${escapeHtml(opt.group)}</p>`;
      lastGroup = opt.group;
    }
    html += `<button type="button" class="item" data-id="${escapeAttr(opt.id)}">
      <span class="item-label">${escapeHtml(opt.label)}</span>
      <span class="item-value">${escapeHtml(opt.value)}</span>
    </button>`;
  }

  panelEl.innerHTML = html;
  panelEl.querySelectorAll("button.item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = (e.currentTarget as HTMLButtonElement).dataset.id;
      if (id && activeTarget && pickerProfile) {
        const value = getProfileValueById(pickerProfile, id);
        if (value != null) fillElementValue(activeTarget, value);
      }
      hidePicker();
    });
  });
}

function positionPanel(target: HTMLElement): void {
  if (!hostEl) return;
  const rect = target.getBoundingClientRect();
  const gap = 6;
  let top = rect.bottom + gap;
  let left = rect.left;

  const panelHeight = 280;
  const panelWidth = 280;
  if (top + panelHeight > window.innerHeight - 8) {
    top = Math.max(8, rect.top - panelHeight - gap);
  }
  if (left + panelWidth > window.innerWidth - 8) {
    left = Math.max(8, window.innerWidth - panelWidth - 8);
  }

  hostEl.style.left = `${left}px`;
  hostEl.style.top = `${top}px`;
}

function hidePicker(): void {
  panelEl?.classList.add("hidden");
  activeTarget = null;
}

function onDocumentPointer(ev: MouseEvent): void {
  if (!panelEl || panelEl.classList.contains("hidden")) return;
  const path = ev.composedPath();
  if (hostEl && path.includes(hostEl)) return;
  if (activeTarget && path.includes(activeTarget)) return;
  hidePicker();
}

function onKeyDown(ev: KeyboardEvent): void {
  if (ev.key === "Escape") hidePicker();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
