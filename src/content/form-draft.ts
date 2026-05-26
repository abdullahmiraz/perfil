import {
  buildDraft,
  captureFormFields,
  countFillableFields,
  draftStorageKey,
  restoreFormFields,
} from "@/lib/form-draft-core";
import {
  clearFormDraft,
  getFormDraft,
  getSiteDraftPrefs,
  saveFormDraft,
} from "@/lib/form-draft-storage";
import type { FormDraftScope } from "@/types/form-draft";

const AUTO_SAVE_MS = 900;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let restoredThisLoad = false;

function pageUrl(): string {
  return location.href;
}

function hostname(): string {
  return location.hostname;
}

async function shouldAutoSave(): Promise<boolean> {
  const prefs = await getSiteDraftPrefs(hostname());
  return prefs.enabled && prefs.autoSave;
}

export async function snapshotFormDraft(): Promise<{ fieldCount: number; savedAt: number }> {
  const prefs = await getSiteDraftPrefs(hostname());
  const fields = captureFormFields();
  const draft = buildDraft(pageUrl(), prefs.scope, fields);
  await saveFormDraft(draft);
  return { fieldCount: Object.keys(fields).length, savedAt: draft.savedAt };
}

export async function applyStoredDraft(): Promise<number> {
  const prefs = await getSiteDraftPrefs(hostname());
  if (!prefs.enabled) return 0;
  const key = draftStorageKey(pageUrl(), prefs.scope);
  const draft = await getFormDraft(key);
  if (!draft?.fields || !Object.keys(draft.fields).length) return 0;
  return restoreFormFields(draft.fields);
}

export async function clearStoredDraftForPage(): Promise<void> {
  const prefs = await getSiteDraftPrefs(hostname());
  const key = draftStorageKey(pageUrl(), prefs.scope);
  await clearFormDraft(key);
}

export function getFormDraftStatusSync(): { fillableCount: number } {
  return { fillableCount: countFillableFields() };
}

function scheduleAutoSave(): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void (async () => {
      if (!(await shouldAutoSave())) return;
      const count = Object.keys(captureFormFields()).length;
      if (count === 0) return;
      await snapshotFormDraft();
      showDraftChip(`Saved ${count} field${count === 1 ? "" : "s"}`);
    })();
  }, AUTO_SAVE_MS);
}

function showDraftChip(text: string): void {
  const id = "perfil-draft-chip";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.style.cssText = [
      "position:fixed",
      "bottom:16px",
      "right:16px",
      "z-index:2147483646",
      "padding:8px 12px",
      "border-radius:10px",
      "font:12px/1.3 system-ui,sans-serif",
      "background:#151c28",
      "color:#eef2f7",
      "border:1px solid #263044",
      "box-shadow:0 8px 24px rgba(0,0,0,.35)",
      "pointer-events:none",
      "opacity:0",
      "transition:opacity .2s",
    ].join(";");
    document.documentElement.appendChild(el);
  }
  el.textContent = `Perfil · ${text}`;
  el.style.opacity = "1";
  window.setTimeout(() => {
    if (el) el.style.opacity = "0";
  }, 2200);
}

async function tryAutoRestore(): Promise<void> {
  if (restoredThisLoad) return;
  const prefs = await getSiteDraftPrefs(hostname());
  if (!prefs.enabled) return;
  const n = await applyStoredDraft();
  restoredThisLoad = true;
  if (n > 0) showDraftChip(`Restored ${n} field${n === 1 ? "" : "s"}`);
}

export function initFormDraft(): void {
  const onInput = () => {
    void shouldAutoSave().then((ok) => {
      if (ok) scheduleAutoSave();
    });
  };

  document.addEventListener("input", onInput, true);
  document.addEventListener("change", onInput, true);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.perfil_site_draft_prefs_v1) {
      void tryAutoRestore();
    }
  });

  if (document.readyState === "complete") {
    void tryAutoRestore();
  } else {
    window.addEventListener("load", () => void tryAutoRestore(), { once: true });
  }
}

export async function setPageDraftScope(scope: FormDraftScope): Promise<void> {
  const { setSiteDraftPrefs } = await import("@/lib/form-draft-storage");
  await setSiteDraftPrefs(hostname(), { scope });
}
