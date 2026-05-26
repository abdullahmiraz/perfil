import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { sendMessage } from "@/shared/messages";
import type { FormDraftScope, FormDraftStatus } from "@/types/form-draft";

function formatSavedAt(ms: number): string {
  const min = Math.round((Date.now() - ms) / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  return `${Math.round(min / 60)}h ago`;
}

export interface SiteToolsPanelProps {
  onFeedback: (message: string, variant?: "success" | "error") => void;
}

export function SiteToolsPanel({ onFeedback }: SiteToolsPanelProps) {
  const [contextMenuOn, setContextMenuOn] = useState(false);
  const [status, setStatus] = useState<FormDraftStatus | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const [settingsRes, draftRes] = await Promise.all([
      sendMessage({ type: "GET_SETTINGS" }),
      sendMessage({ type: "GET_TAB_FORM_DRAFT_STATUS" }),
    ]);
    setContextMenuOn(settingsRes.settings.contextMenuEnabled);
    if ("error" in draftRes) {
      setPageError(draftRes.error);
      setStatus(null);
    } else {
      setPageError(null);
      setStatus(draftRes);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function toggleContextMenu(enabled: boolean) {
    const res = await sendMessage({
      type: "SAVE_SETTINGS",
      settings: { contextMenuEnabled: enabled },
    });
    setContextMenuOn(res.settings.contextMenuEnabled);
    onFeedback(
      enabled ? "Right-click menu enabled (page only)" : "Right-click menu disabled",
      "success",
    );
  }

  async function patchPrefs(patch: Partial<FormDraftStatus["prefs"]>) {
    const res = await sendMessage({ type: "SET_TAB_SITE_DRAFT_PREFS", prefs: patch });
    if ("error" in res) {
      onFeedback(res.error, "error");
      return;
    }
    await refresh();
    onFeedback("Form memory updated for this site", "success");
  }

  async function saveDraft() {
    setBusy(true);
    try {
      const res = await sendMessage({ type: "SAVE_TAB_FORM_DRAFT" });
      if ("error" in res) onFeedback(res.error, "error");
      else onFeedback(`Saved ${res.fieldCount} field${res.fieldCount === 1 ? "" : "s"}`, "success");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function restoreDraft() {
    setBusy(true);
    try {
      const res = await sendMessage({ type: "RESTORE_TAB_FORM_DRAFT" });
      if ("error" in res) onFeedback(res.error, "error");
      else onFeedback(`Restored ${res.restored} field${res.restored === 1 ? "" : "s"}`, "success");
    } finally {
      setBusy(false);
    }
  }

  async function clearDraft() {
    setBusy(true);
    try {
      const res = await sendMessage({ type: "CLEAR_TAB_FORM_DRAFT" });
      if ("error" in res) onFeedback(res.error, "error");
      else onFeedback("Saved form cleared", "success");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const prefs = status?.prefs;
  const draft = status?.draft;
  const fieldCount = draft ? Object.keys(draft.fields).length : 0;

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-perfil-border bg-perfil-surface/60 p-3">
      <Toggle
        checked={contextMenuOn}
        onChange={(v) => void toggleContextMenu(v)}
        label="Right-click menu"
        description="Shows on the page background only — not in search boxes or inputs."
      />

      <div className="border-t border-perfil-border pt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-perfil-muted">
          Form memory
        </p>
        <p className="mt-1 text-xs text-perfil-muted">
          Like{" "}
          <a
            href="https://chromewebstore.google.com/detail/lightning-autofill/nlmmgnhgdeffjkdckmikfpnddkbbfkkk"
            target="_blank"
            rel="noreferrer"
            className="text-perfil-accent hover:underline"
          >
            Lightning Autofill
          </a>
          — keep form data after refresh (per site).
        </p>

        {pageError ? (
          <p className="mt-2 text-xs text-perfil-muted">{pageError}</p>
        ) : prefs ? (
          <>
            <div className="mt-3 space-y-3">
              <Toggle
                checked={prefs.enabled}
                onChange={(v) => void patchPrefs({ enabled: v })}
                label="Remember forms on this site"
              />
              <Toggle
                checked={prefs.autoSave}
                onChange={(v) => void patchPrefs({ autoSave: v })}
                disabled={!prefs.enabled}
                label="Auto-save while typing"
              />
              <Select
                label="Save scope"
                value={prefs.scope}
                disabled={!prefs.enabled}
                onChange={(e) =>
                  void patchPrefs({ scope: e.target.value as FormDraftScope })
                }
                options={[
                  { value: "domain", label: "Whole site (domain)" },
                  { value: "url", label: "This page URL only" },
                ]}
              />
            </div>

            {draft && fieldCount > 0 && (
              <p className="mt-2 text-xs text-perfil-success">
                {fieldCount} field{fieldCount === 1 ? "" : "s"} saved · {formatSavedAt(draft.savedAt)}
              </p>
            )}

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <Button
                variant="secondary"
                fullWidth
                disabled={busy || !prefs.enabled}
                onClick={() => void saveDraft()}
                className="!px-2 text-xs"
              >
                Save
              </Button>
              <Button
                variant="secondary"
                fullWidth
                disabled={busy || !prefs.enabled || fieldCount === 0}
                onClick={() => void restoreDraft()}
                className="!px-2 text-xs"
              >
                Restore
              </Button>
              <Button
                variant="secondary"
                fullWidth
                disabled={busy || fieldCount === 0}
                onClick={() => void clearDraft()}
                className="!px-2 text-xs"
              >
                Clear
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
