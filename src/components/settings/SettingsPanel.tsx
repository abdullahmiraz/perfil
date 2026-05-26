import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { sendMessage } from "@/shared/messages";
import type { AutoLockMinutes, VaultSettings } from "@/types/vault";

const LOCK_OPTIONS: { value: string; label: string }[] = [
  { value: "5", label: "5 minutes" },
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "0", label: "Never (while browser is open)" },
];

export function SettingsPanel() {
  const [settings, setSettings] = useState<VaultSettings | null>(null);
  const [pin, setPin] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void sendMessage({ type: "GET_SETTINGS" }).then((r) => setSettings(r.settings));
  }, []);

  async function save(patch: Partial<VaultSettings>) {
    try {
      const res = await sendMessage({ type: "SAVE_SETTINGS", settings: patch });
      setSettings(res.settings);
      setMessage("Settings saved");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function enablePin() {
    const res = await sendMessage({ type: "SET_PIN", pin, masterPassword });
    if (res.ok) {
      setMessage("PIN enabled");
      setPin("");
      setMasterPassword("");
      const s = await sendMessage({ type: "GET_SETTINGS" });
      setSettings(s.settings);
    } else {
      setError(res.error ?? "Failed");
    }
  }

  async function disablePin() {
    const res = await sendMessage({ type: "CLEAR_PIN", masterPassword });
    if (res.ok) {
      setMessage("PIN disabled");
      setMasterPassword("");
      const s = await sendMessage({ type: "GET_SETTINGS" });
      setSettings(s.settings);
    } else {
      setError(res.error ?? "Failed");
    }
  }

  async function exportJson() {
    const { json } = await sendMessage({ type: "EXPORT_VAULT" });
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `perfil-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Exported");
  }

  async function importJson(file: File) {
    const text = await file.text();
    const res = await sendMessage({ type: "IMPORT_VAULT", json: text, mode: importMode });
    if (res.ok) {
      setMessage(`Imported ${res.count} profile(s)`);
    } else {
      setError(res.error ?? "Import failed");
    }
  }

  if (!settings) {
    return <p className="text-sm text-perfil-muted">Loading settings…</p>;
  }

  return (
    <div className="space-y-6">
      <Panel>
        <h2 className="font-semibold tracking-tight">Security & unlock</h2>
        <p className="mt-1 text-xs leading-relaxed text-perfil-muted">
          Modeled after Bitwarden: stay unlocked while active, optional PIN, stricter unlock after
          browser restart.
        </p>

        <div className="mt-4">
          <Select
            label="Auto-lock after idle"
            value={String(settings.autoLockMinutes)}
            onChange={(e) =>
              save({ autoLockMinutes: Number(e.target.value) as AutoLockMinutes })
            }
            options={LOCK_OPTIONS}
          />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.requireMasterPasswordOnRestart}
            onChange={(e) => save({ requireMasterPasswordOnRestart: e.target.checked })}
          />
          Require master password when browser restarts
        </label>

        <div className="mt-6 border-t border-perfil-border pt-4">
          <h3 className="text-sm font-medium">Unlock with PIN</h3>
          {settings.pinEnabled ? (
            <p className="mt-1 text-xs text-perfil-success">PIN is enabled</p>
          ) : (
            <p className="mt-1 text-xs text-perfil-muted">Use a short PIN instead of your full password</p>
          )}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Input
              label="PIN (4–8 digits)"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <Input
              label="Confirm with master password"
              type="password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={enablePin} className="!w-auto px-4">
              {settings.pinEnabled ? "Change PIN" : "Enable PIN"}
            </Button>
            {settings.pinEnabled && (
              <Button variant="secondary" onClick={disablePin} className="!w-auto px-4">
                Disable PIN
              </Button>
            )}
          </div>
        </div>
      </Panel>

      <Panel>
        <h2 className="font-semibold tracking-tight">Backup</h2>
        <p className="mt-1 text-xs text-perfil-muted">Export or import profiles as JSON</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={exportJson} className="!w-auto px-4">
            Export JSON
          </Button>
          <Select
            label="Import mode"
            value={importMode}
            onChange={(e) => setImportMode(e.target.value as "merge" | "replace")}
            options={[
              { value: "merge", label: "Merge with existing" },
              { value: "replace", label: "Replace all profiles" },
            ]}
            className="min-w-[180px]"
          />
          <label className="btn-secondary !w-auto cursor-pointer px-4 py-2.5 text-sm">
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importJson(f);
              }}
            />
          </label>
        </div>
      </Panel>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
