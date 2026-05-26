import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CompactToggle } from "@/components/ui/CompactToggle";
import { Select } from "@/components/ui/Select";
import { sendMessage } from "@/shared/messages";
import type { FormDraftStatus } from "@/types/form-draft";

export interface SiteToolsPanelProps {
  onFeedback: (message: string, variant?: "success" | "error") => void;
}

export function SiteToolsPanel({ onFeedback }: SiteToolsPanelProps) {
  const [contextMenuOn, setContextMenuOn] = useState(false);
  const [status, setStatus] = useState<FormDraftStatus | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [selectedSaveId, setSelectedSaveId] = useState("");
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
      setSelectedSaveId("");
    } else {
      setPageError(null);
      setStatus(draftRes);
      setSelectedSaveId((prev) => {
        if (prev && draftRes.saved.some((s) => s.id === prev)) return prev;
        return draftRes.saved[0]?.id ?? "";
      });
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
    onFeedback(enabled ? "Menu on" : "Menu off", "success");
  }

  async function saveDraft() {
    setBusy(true);
    try {
      const res = await sendMessage({ type: "SAVE_TAB_FORM_DRAFT" });
      if ("error" in res) onFeedback(res.error, "error");
      else {
        onFeedback(`Saved (${res.fieldCount})`, "success");
        setSelectedSaveId(res.id);
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function restoreDraft() {
    if (!selectedSaveId) {
      onFeedback("Pick a saved form first", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await sendMessage({ type: "RESTORE_TAB_FORM_DRAFT", draftId: selectedSaveId });
      if ("error" in res) onFeedback(res.error, "error");
      else onFeedback(`Filled ${res.restored} field${res.restored === 1 ? "" : "s"}`, "success");
    } finally {
      setBusy(false);
    }
  }

  async function clearSelected() {
    if (!selectedSaveId) return;
    setBusy(true);
    try {
      const res = await sendMessage({ type: "CLEAR_TAB_FORM_DRAFT", draftId: selectedSaveId });
      if ("error" in res) onFeedback(res.error, "error");
      else onFeedback("Removed", "success");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const saved = status?.saved ?? [];
  const pathLabel = status?.pageUrl
    ? (() => {
        try {
          return new URL(status.pageUrl).pathname;
        } catch {
          return "this page";
        }
      })()
    : "";

  return (
    <div className="mt-3 space-y-2 border-t border-perfil-border pt-3">
      <CompactToggle
        checked={contextMenuOn}
        onChange={(v) => void toggleContextMenu(v)}
        label="Right-click menu"
        info="Shows on empty page area only — not in search boxes or inputs. Save/restore form from there too."
      />

      <div className="rounded-lg border border-perfil-border/80 bg-perfil-bg/40 px-2 py-2">
        <div className="mb-1.5 flex items-center justify-between gap-1">
          <span className="text-xs font-medium text-perfil-text">Saved forms</span>
          <span
            className="truncate text-[10px] text-perfil-muted"
            title={status?.pageUrl}
          >
            {pathLabel || "—"}
          </span>
        </div>

        {pageError ? (
          <p className="text-[10px] text-perfil-muted">{pageError}</p>
        ) : (
          <>
            <Select
              value={selectedSaveId}
              onChange={(e) => setSelectedSaveId(e.target.value)}
              options={
                saved.length
                  ? saved.map((s) => ({ value: s.id, label: s.label }))
                  : [{ value: "", label: "No saves for this URL" }]
              }
              className="!py-1.5 text-xs"
              disabled={!saved.length}
            />
            <div className="mt-1.5 flex gap-1">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => void saveDraft()}
                className="btn-compact flex-1"
              >
                Save
              </Button>
              <Button
                variant="secondary"
                disabled={busy || !selectedSaveId}
                onClick={() => void restoreDraft()}
                className="btn-compact flex-1"
              >
                Fill
              </Button>
              <Button
                variant="secondary"
                disabled={busy || !selectedSaveId}
                onClick={() => void clearSelected()}
                className="btn-compact !px-2"
                title="Delete selected save"
              >
                ×
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
