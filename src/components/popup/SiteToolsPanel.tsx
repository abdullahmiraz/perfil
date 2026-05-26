import { useCallback, useEffect, useState } from "react";
import { CompactToggle } from "@/components/ui/CompactToggle";
import { InfoTip } from "@/components/ui/InfoTip";
import { Select } from "@/components/ui/Select";
import { sendMessage } from "@/shared/messages";
import type { FormDraftStatus } from "@/types/form-draft";

export interface SiteToolsPanelProps {
  onFeedback: (message: string, variant?: "success" | "error") => void;
}

function ActionButton({
  title,
  onClick,
  disabled,
  children,
  danger,
  accent,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: string;
  danger?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex-1 border-l border-perfil-border px-1 py-1.5 text-[11px] font-medium transition-colors first:border-l-0",
        "disabled:opacity-40",
        accent
          ? "bg-perfil-accent/15 text-perfil-accent hover:bg-perfil-accent/25"
          : "hover:bg-perfil-surface",
        danger ? "text-perfil-danger" : !accent ? "text-perfil-text" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
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
      onFeedback("Pick a snapshot first", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await sendMessage({ type: "RESTORE_TAB_FORM_DRAFT", draftId: selectedSaveId });
      if ("error" in res) onFeedback(res.error, "error");
      else onFeedback(`Restored ${res.restored}`, "success");
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
      else onFeedback("Deleted", "success");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const saved = status?.saved ?? [];
  const hasSaves = saved.length > 0;
  const pathLabel = status?.pageUrl
    ? (() => {
        try {
          return new URL(status.pageUrl).pathname;
        } catch {
          return "";
        }
      })()
    : "";

  return (
    <div className="mt-2 space-y-1.5 border-t border-perfil-border pt-2">
      <CompactToggle
        checked={contextMenuOn}
        onChange={(v) => void toggleContextMenu(v)}
        label="Right-click menu"
        info="Page background only. Save or restore forms from the menu."
      />

      <div className="rounded-lg border border-perfil-border/80 bg-perfil-bg/40 px-2 py-1.5">
        <div className="mb-1 flex items-center gap-1">
          <span className="text-[11px] font-medium text-perfil-text">Saved forms</span>
          <InfoTip text="Saves match this exact URL. Save the page, then restore after refresh." />
          {pathLabel && (
            <span className="ml-auto max-w-[42%] truncate text-[10px] text-perfil-muted" title={status?.pageUrl}>
              {pathLabel}
            </span>
          )}
        </div>

        {pageError ? (
          <p className="text-[10px] text-perfil-muted">{pageError}</p>
        ) : (
          <>
            <Select
              value={selectedSaveId}
              onChange={(e) => setSelectedSaveId(e.target.value)}
              options={
                hasSaves
                  ? saved.map((s) => ({ value: s.id, label: s.label }))
                  : [{ value: "", label: "None saved yet" }]
              }
              className="!py-1 text-[11px]"
              disabled={!hasSaves}
            />
            <div className="mt-1 flex w-full overflow-hidden rounded-md border border-perfil-border bg-perfil-bg/50">
              <ActionButton
                title="Save what's on the page now as a new snapshot"
                disabled={busy}
                accent
                onClick={() => void saveDraft()}
              >
                Save current
              </ActionButton>
              <ActionButton
                title="Fill the page from the selected snapshot"
                disabled={busy || !selectedSaveId}
                onClick={() => void restoreDraft()}
              >
                Restore
              </ActionButton>
              <ActionButton
                title="Delete the selected snapshot"
                disabled={busy || !selectedSaveId}
                onClick={() => void clearSelected()}
                danger
              >
                Delete
              </ActionButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
