import { useEffect, useState } from "react";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { sendMessage } from "@/shared/messages";
import {
  mapPinSettingsError,
  validatePinForm,
  type FieldErrorMap,
} from "@/lib/form-errors";
import { RECOVERY_QUESTION_PRESETS } from "@/lib/vault-recovery";
import type { AutoLockMinutes, VaultSettings } from "@/types/vault";

const LOCK_OPTIONS: { value: string; label: string }[] = [
  { value: "5", label: "5 minutes" },
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "0", label: "Never (while browser is open)" },
];

export interface SettingsPanelProps {
  onFeedback?: (message: string, variant: "success" | "error") => void;
}

export function SettingsPanel({ onFeedback }: SettingsPanelProps) {
  const [settings, setSettings] = useState<VaultSettings | null>(null);
  const [pin, setPin] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [shakeKey, setShakeKey] = useState(0);
  const [recoveryEnabled, setRecoveryEnabled] = useState(false);
  const [recoveryPreset, setRecoveryPreset] = useState<string>(RECOVERY_QUESTION_PRESETS[0]);
  const [recoveryCustomQ, setRecoveryCustomQ] = useState("");
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [recoveryMasterPw, setRecoveryMasterPw] = useState("");

  useEffect(() => {
    void Promise.all([
      sendMessage({ type: "GET_SETTINGS" }),
      sendMessage({ type: "GET_RECOVERY_INFO" }),
    ]).then(([settingsRes, recoveryRes]) => {
      setSettings(settingsRes.settings);
      setRecoveryEnabled(recoveryRes.enabled);
    });
  }, []);

  function bumpShake() {
    setShakeKey((k) => k + 1);
  }

  function clearPinErrors() {
    setFieldErrors({});
    setFormError("");
  }

  async function save(patch: Partial<VaultSettings>) {
    try {
      const res = await sendMessage({ type: "SAVE_SETTINGS", settings: patch });
      setSettings(res.settings);
      setMessage("Settings saved");
      onFeedback?.("Settings saved", "success");
      setFormError("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      setFormError(msg);
      onFeedback?.(msg, "error");
      bumpShake();
    }
  }

  async function enablePin() {
    clearPinErrors();
    const clientErr = validatePinForm(pin, masterPassword);
    if (Object.keys(clientErr).length > 0) {
      setFieldErrors(clientErr);
      bumpShake();
      return;
    }
    const res = await sendMessage({ type: "SET_PIN", pin, masterPassword });
    if (res.ok) {
      const msg = settings?.pinEnabled ? "PIN updated" : "PIN enabled";
      setMessage(msg);
      onFeedback?.(msg, "success");
      setPin("");
      setMasterPassword("");
      const s = await sendMessage({ type: "GET_SETTINGS" });
      setSettings(s.settings);
    } else {
      const err = res.error ?? "Failed to set PIN";
      setFieldErrors(mapPinSettingsError(err));
      onFeedback?.(err, "error");
      bumpShake();
    }
  }

  async function disablePin() {
    clearPinErrors();
    if (!masterPassword.trim()) {
      setFieldErrors({ masterPassword: "Enter your master password to disable PIN" });
      bumpShake();
      return;
    }
    const res = await sendMessage({ type: "CLEAR_PIN", masterPassword });
    if (res.ok) {
      setMessage("PIN disabled");
      onFeedback?.("PIN disabled", "success");
      setMasterPassword("");
      const s = await sendMessage({ type: "GET_SETTINGS" });
      setSettings(s.settings);
    } else {
      setFieldErrors(mapPinSettingsError(res.error ?? "Failed to disable PIN"));
      bumpShake();
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
      onFeedback?.("Vault exported", "success");
  }

  async function importJson(file: File) {
    const text = await file.text();
    const res = await sendMessage({ type: "IMPORT_VAULT", json: text, mode: importMode });
    if (res.ok) {
      const msg = `Imported ${res.count} profile(s)`;
      setMessage(msg);
      onFeedback?.(msg, "success");
      setFormError("");
    } else {
      const err = res.error ?? "Import failed";
      setFormError(err);
      onFeedback?.(err, "error");
      bumpShake();
    }
  }

  if (!settings) {
    return <p className="text-sm text-perfil-muted">Loading settings…</p>;
  }

  const pinShake = shakeKey > 0;

  return (
    <div className="space-y-6">
      <AppearanceSettings />

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
            <p className="mt-1 text-xs text-perfil-muted">
              Use a short PIN instead of your full password when opening the popup
            </p>
          )}
          <div key={`pin-row-${shakeKey}`} className="mt-3 grid gap-3 sm:grid-cols-2">
            <Input
              label="PIN (4–8 digits)"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (fieldErrors.pin) setFieldErrors((f) => ({ ...f, pin: undefined }));
              }}
              error={fieldErrors.pin}
              shake={pinShake && Boolean(fieldErrors.pin)}
            />
            <Input
              label="Confirm with master password"
              type="password"
              autoComplete="current-password"
              value={masterPassword}
              onChange={(e) => {
                setMasterPassword(e.target.value);
                if (fieldErrors.masterPassword) {
                  setFieldErrors((f) => ({ ...f, masterPassword: undefined }));
                }
              }}
              error={fieldErrors.masterPassword}
              shake={pinShake && Boolean(fieldErrors.masterPassword)}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
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
        <h2 className="font-semibold tracking-tight">On-page autofill</h2>
        <p className="mt-1 text-xs text-perfil-muted">
          Right-click any page for quick fill, or focus a field to pick a value from your profile.
        </p>
        <label className="mt-4 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={settings.fieldPickerEnabled}
            onChange={(e) => save({ fieldPickerEnabled: e.target.checked })}
          />
          <span>
            <span className="font-medium">Field picker on focus</span>
            <span className="mt-0.5 block text-xs text-perfil-muted">
              When you click into an input, show a small menu to choose which profile value to fill
            </span>
          </span>
        </label>
        <p className="mt-3 text-xs text-perfil-muted">
          Right-click menu: use the <strong className="text-perfil-text">toggle in the popup</strong>{" "}
          (off by default; page background only, not search boxes).
        </p>
      </Panel>

      <Panel>
        <h2 className="font-semibold tracking-tight">Form memory</h2>
        <p className="mt-1 text-xs text-perfil-muted">
          Manual saves per exact page URL — use the extension popup on that tab (Save / Fill dropdown).
        </p>
      </Panel>

      <Panel>
        <h2 className="font-semibold tracking-tight">Password recovery</h2>
        <p className="mt-1 text-xs text-perfil-muted">
          If you forget your master password, answer this question in the popup to set a new one.
          Stored only on this device (hashed).
        </p>
        {recoveryEnabled ? (
          <p className="mt-2 text-xs text-perfil-success">Recovery question is set</p>
        ) : (
          <p className="mt-2 text-xs text-perfil-muted">Not configured yet</p>
        )}
        <div className="mt-3 grid gap-3">
          <Select
            label="Question"
            value={recoveryPreset}
            onChange={(e) => setRecoveryPreset(e.target.value)}
            options={[
              ...RECOVERY_QUESTION_PRESETS.map((q) => ({ value: q, label: q })),
              { value: "custom", label: "Write your own…" },
            ]}
          />
          {recoveryPreset === "custom" && (
            <Input
              label="Your question"
              value={recoveryCustomQ}
              onChange={(e) => setRecoveryCustomQ(e.target.value)}
            />
          )}
          <Input
            label="Answer"
            type="password"
            autoComplete="off"
            value={recoveryAnswer}
            onChange={(e) => setRecoveryAnswer(e.target.value)}
          />
          <Input
            label="Master password (to save)"
            type="password"
            autoComplete="current-password"
            value={recoveryMasterPw}
            onChange={(e) => setRecoveryMasterPw(e.target.value)}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            className="!w-auto px-4"
            onClick={async () => {
              const question =
                recoveryPreset === "custom" ? recoveryCustomQ.trim() : recoveryPreset;
              const res = await sendMessage({
                type: "UPDATE_RECOVERY",
                question,
                answer: recoveryAnswer,
                masterPassword: recoveryMasterPw,
              });
              if (res.ok) {
                setMessage("Recovery updated");
                onFeedback?.("Recovery updated", "success");
                setRecoveryAnswer("");
                setRecoveryMasterPw("");
                setRecoveryEnabled(true);
              } else {
                setFormError(res.error ?? "Failed");
                onFeedback?.(res.error ?? "Failed", "error");
              }
            }}
          >
            {recoveryEnabled ? "Update recovery" : "Set up recovery"}
          </Button>
          {recoveryEnabled && (
            <Button
              variant="secondary"
              className="!w-auto px-4"
              onClick={async () => {
                const res = await sendMessage({
                  type: "CLEAR_RECOVERY",
                  masterPassword: recoveryMasterPw,
                });
                if (res.ok) {
                  setMessage("Recovery removed");
                  onFeedback?.("Recovery removed", "success");
                  setRecoveryEnabled(false);
                  setRecoveryMasterPw("");
                } else {
                  setFormError(res.error ?? "Failed");
                }
              }}
            >
              Remove recovery
            </Button>
          )}
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
      {formError && (
        <div className={shakeKey > 0 ? "perfil-shake" : undefined}>
          <Alert variant="error">{formError}</Alert>
        </div>
      )}
    </div>
  );
}
