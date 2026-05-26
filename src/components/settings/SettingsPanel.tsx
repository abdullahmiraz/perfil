import { useEffect, useState } from "react";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SettingsBlock } from "@/components/ui/SettingsBlock";
import { sendMessage } from "@/shared/messages";
import { mapPinSettingsError, validatePinForm, type FieldErrorMap } from "@/lib/form-errors";
import { RECOVERY_QUESTION_PRESETS } from "@/lib/vault-recovery";
import type { Profile } from "@/types/profile";
import type { AutoLockMinutes, VaultSettings } from "@/types/vault";

const LOCK_OPTIONS: { value: string; label: string }[] = [
  { value: "5", label: "5 min" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "60", label: "1 hour" },
  { value: "0", label: "Never" },
];

const BTN = "btn-compact !w-auto";

export interface SettingsPanelProps {
  onFeedback?: (message: string, variant: "success" | "error") => void;
}

export function SettingsPanel({ onFeedback }: SettingsPanelProps) {
  const [settings, setSettings] = useState<VaultSettings | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
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
      sendMessage({ type: "GET_PROFILES" }),
    ]).then(([settingsRes, recoveryRes, profilesRes]) => {
      setSettings(settingsRes.settings);
      setRecoveryEnabled(recoveryRes.enabled);
      setProfiles(profilesRes.profiles);
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
      const { profiles: list } = await sendMessage({ type: "GET_PROFILES" });
      setProfiles(list);
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
  const profileOptions = profiles.map((p) => ({
    value: p.id,
    label: p.data.label?.trim() || "Unnamed",
  }));

  return (
    <div className="space-y-3">
      <AppearanceSettings />

      {profileOptions.length > 0 && (
        <SettingsBlock
          title="Default profile"
          description="Used for quick fill and context-menu autofill when no profile is chosen"
        >
          <Select
            compact
            label="Profile"
            value={settings.defaultProfileId ?? profiles[0]?.id ?? ""}
            onChange={(e) => save({ defaultProfileId: e.target.value || null })}
            options={profileOptions}
          />
        </SettingsBlock>
      )}

      <SettingsBlock
        title="Security & unlock"
        description="Auto-lock, restart policy, and optional PIN"
      >
        <Select
          compact
          label="Auto-lock after idle"
          value={String(settings.autoLockMinutes)}
          onChange={(e) => save({ autoLockMinutes: Number(e.target.value) as AutoLockMinutes })}
          options={LOCK_OPTIONS}
        />
        <label className="mt-2 flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={settings.requireMasterPasswordOnRestart}
            onChange={(e) => save({ requireMasterPasswordOnRestart: e.target.checked })}
          />
          Require master password when browser restarts
        </label>

        <div className="mt-3 border-t border-perfil-border pt-3">
          <p className="text-xs font-medium text-perfil-text">Unlock with PIN</p>
          {settings.pinEnabled ? (
            <p className="text-[11px] text-perfil-success">PIN enabled</p>
          ) : (
            <p className="text-[11px] text-perfil-muted">Short PIN for popup unlock</p>
          )}
          <div key={`pin-row-${shakeKey}`} className="mt-2 grid gap-2 sm:grid-cols-2">
            <Input
              compact
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
              compact
              label="Master password"
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
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Button onClick={enablePin} className={BTN}>
              {settings.pinEnabled ? "Change PIN" : "Enable PIN"}
            </Button>
            {settings.pinEnabled && (
              <Button variant="secondary" onClick={disablePin} className={BTN}>
                Disable PIN
              </Button>
            )}
          </div>
        </div>
      </SettingsBlock>

      <SettingsBlock
        title="Autofill & forms"
        description="Field picker, context menu, and per-page form memory (popup Save / Fill)"
      >
        <label className="flex items-start gap-2 text-xs">
          <input
            type="checkbox"
            className="mt-0.5 shrink-0"
            checked={settings.fieldPickerEnabled}
            onChange={(e) => save({ fieldPickerEnabled: e.target.checked })}
          />
          <span>
            <span className="font-medium text-perfil-text">Field picker on focus</span>
            <span className="mt-0.5 block text-[11px] text-perfil-muted">
              Click an input to choose which profile value to fill
            </span>
          </span>
        </label>
        <p className="mt-2 text-[11px] text-perfil-muted">
          Context menu: toggle in the popup (off by default; skips search boxes).
        </p>
      </SettingsBlock>

      <SettingsBlock
        title="Password recovery"
        description="Answer in the popup if you forget your master password (hashed on device)"
      >
        {recoveryEnabled ? (
          <p className="mb-2 text-[11px] text-perfil-success">Recovery question is set</p>
        ) : (
          <p className="mb-2 text-[11px] text-perfil-muted">Not configured</p>
        )}
        <div className="grid gap-2">
          <Select
            compact
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
              compact
              label="Your question"
              value={recoveryCustomQ}
              onChange={(e) => setRecoveryCustomQ(e.target.value)}
            />
          )}
          <Input
            compact
            label="Answer"
            type="password"
            autoComplete="off"
            value={recoveryAnswer}
            onChange={(e) => setRecoveryAnswer(e.target.value)}
          />
          <Input
            compact
            label="Master password (to save)"
            type="password"
            autoComplete="current-password"
            value={recoveryMasterPw}
            onChange={(e) => setRecoveryMasterPw(e.target.value)}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Button
            className={BTN}
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
              className={BTN}
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
      </SettingsBlock>

      <SettingsBlock title="Backup" description="Export or import profiles as JSON">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <Button onClick={exportJson} className={BTN}>
              Export JSON
            </Button>
            <label className={`btn-secondary cursor-pointer ${BTN}`}>
              Import JSON
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void importJson(f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <Select
            compact
            label="Import mode"
            value={importMode}
            onChange={(e) => setImportMode(e.target.value as "merge" | "replace")}
            options={[
              { value: "merge", label: "Merge with existing" },
              { value: "replace", label: "Replace all profiles" },
            ]}
          />
        </div>
      </SettingsBlock>

      {message && (
        <Alert variant="success" className="py-2 text-xs">
          {message}
        </Alert>
      )}
      {formError && (
        <div className={shakeKey > 0 ? "perfil-shake" : undefined}>
          <Alert variant="error" className="py-2 text-xs">
            {formError}
          </Alert>
        </div>
      )}
    </div>
  );
}
