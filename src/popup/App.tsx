import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { HoverTip } from "@/components/ui/HoverTip";
import { MasterPasswordForm } from "@/components/auth/MasterPasswordForm";
import { RecoveryResetForm } from "@/components/auth/RecoveryResetForm";
import { VaultSetupWizard } from "@/components/auth/VaultSetupWizard";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageShell } from "@/components/layout/PageShell";
import { PopupHeaderActions } from "@/components/popup/PopupHeaderActions";
import { SiteToolsPanel } from "@/components/popup/SiteToolsPanel";
import { ProfilePicker } from "@/components/profile/ProfilePicker";
import { useFillActions } from "@/hooks/useFillActions";
import { useFeedback } from "@/hooks/useFeedback";
import { useProfiles } from "@/hooks/useProfiles";
import { useVault } from "@/hooks/useVault";
import { openOptions } from "@/lib/open-options";
import { sendMessage } from "@/shared/messages";
import type { VaultSetupOptions } from "@/types/vault";

export function App() {
  const vault = useVault();
  const profiles = useProfiles(vault.status === "unlocked");
  const fill = useFillActions();
  const feedback = useFeedback();
  const [selectedId, setSelectedId] = useState("");
  const [pinEnabled, setPinEnabled] = useState(false);
  const [recoveryEnabled, setRecoveryEnabled] = useState(false);
  const [recoveryQuestion, setRecoveryQuestion] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [usePin, setUsePin] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinShakeKey, setPinShakeKey] = useState(0);

  useEffect(() => {
    if (profiles.activeId) setSelectedId(profiles.activeId);
  }, [profiles.activeId]);

  useEffect(() => {
    if (vault.status === "locked") {
      void Promise.all([
        sendMessage({ type: "GET_SETTINGS" }),
        sendMessage({ type: "GET_RECOVERY_INFO" }),
      ]).then(([settingsRes, recoveryRes]) => {
        setPinEnabled(settingsRes.settings.pinEnabled);
        setRecoveryEnabled(recoveryRes.enabled);
        setRecoveryQuestion(recoveryRes.question);
      });
    }
  }, [vault.status]);

  const headerActions = (
    <PopupHeaderActions
      showSettings
      showLock={vault.status === "unlocked"}
      onLock={vault.status === "unlocked" ? () => void handleLock() : undefined}
    />
  );

  async function handleLock() {
    fill.clearMessages();
    await vault.lock();
    setSelectedId("");
    setShowRecovery(false);
    feedback.showSuccess("Locked");
  }

  async function handlePinUnlock(e: React.FormEvent) {
    e.preventDefault();
    setPinError(null);
    const res = await sendMessage({ type: "UNLOCK_PIN", pin });
    if (res.ok) {
      setPin("");
      await vault.refresh();
      feedback.showSuccess("Unlocked");
    } else {
      setPinError(
        res.error?.includes("import()")
          ? "Reload extension and try again"
          : (res.error ?? "Incorrect PIN"),
      );
      setPinShakeKey((k) => k + 1);
    }
  }

  async function handlePasswordUnlock(password: string) {
    const ok = await vault.unlock(password);
    if (ok) feedback.showSuccess("Unlocked");
  }

  async function handleSetup(password: string, options: VaultSetupOptions) {
    const ok = await vault.setup(password, options);
    if (ok) feedback.showSuccess("Vault ready");
  }

  const toast = feedback.feedback ? (
    <Toast
      message={feedback.feedback.message}
      variant={feedback.feedback.variant}
      show
      onDismiss={feedback.clear}
      className="mb-2"
    />
  ) : null;

  if (vault.loading) {
    return (
      <PageShell>
        <AppHeader compact hideSubtitle actions={headerActions} />
        <p className="mt-4 text-center text-[11px] text-perfil-muted">Loading…</p>
      </PageShell>
    );
  }

  if (vault.status === "uninitialized") {
    return (
      <PageShell>
        {toast}
        <AppHeader compact hideSubtitle actions={headerActions} />
        <VaultSetupWizard busy={vault.busy} error={vault.error} onSubmit={handleSetup} />
      </PageShell>
    );
  }

  if (vault.status === "locked") {
    return (
      <PageShell>
        {toast}
        <AppHeader compact hideSubtitle actions={headerActions} />
        {showRecovery && recoveryQuestion ? (
          <RecoveryResetForm
            question={recoveryQuestion}
            onSuccess={async () => {
              setShowRecovery(false);
              await vault.refresh();
              feedback.showSuccess("Password reset — vault unlocked");
            }}
            onCancel={() => setShowRecovery(false)}
          />
        ) : (
          <>
            {pinEnabled && (
              <div className="mb-2 flex gap-2 text-[11px]">
                <button
                  type="button"
                  className={!usePin ? "font-semibold text-perfil-accent" : "text-perfil-muted"}
                  onClick={() => setUsePin(false)}
                >
                  Password
                </button>
                <span className="text-perfil-muted">·</span>
                <button
                  type="button"
                  className={usePin ? "font-semibold text-perfil-accent" : "text-perfil-muted"}
                  onClick={() => setUsePin(true)}
                >
                  PIN
                </button>
              </div>
            )}
            {usePin && pinEnabled ? (
              <form onSubmit={handlePinUnlock} className="space-y-2">
                <Input
                  key={`pin-${pinShakeKey}`}
                  label="PIN"
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (pinError) setPinError(null);
                  }}
                  error={pinError}
                  shake={Boolean(pinError)}
                  required
                />
                <Button type="submit" fullWidth disabled={vault.busy} className="btn-compact">
                  {vault.busy ? "…" : "Unlock"}
                </Button>
              </form>
            ) : (
              <MasterPasswordForm
                mode="unlock"
                busy={vault.busy}
                error={vault.error}
                onSubmit={handlePasswordUnlock}
              />
            )}
            {recoveryEnabled && (
              <button
                type="button"
                className="mt-2 w-full text-center text-[11px] text-perfil-muted hover:text-perfil-accent"
                onClick={() => {
                  vault.clearError();
                  setShowRecovery(true);
                }}
              >
                Forgot master password?
              </button>
            )}
          </>
        )}
      </PageShell>
    );
  }

  const activeProfile = profiles.profiles.find((p) => p.id === selectedId);
  const profileLabel = activeProfile?.data.label || "Profile";

  return (
    <PageShell>
      {toast}
      <AppHeader compact hideSubtitle actions={headerActions} />

      <div className="mt-3 flex items-end gap-1.5">
        <div className="min-w-0 flex-1">
          <ProfilePicker
            profiles={profiles.profiles}
            value={selectedId}
            onChange={setSelectedId}
            compact
          />
        </div>
        <HoverTip text={`Edit ${profileLabel} — name, email, address, custom fields`}>
          <button
            type="button"
            onClick={() => void openOptions("profiles")}
            className="btn-compact shrink-0 rounded-lg border border-perfil-border bg-perfil-surface px-2 py-1.5 text-[11px] font-medium text-perfil-text hover:border-perfil-accent/50"
          >
            Edit
          </button>
        </HoverTip>
        <HoverTip text="Find inputs on this tab that match your profile">
          <Button
            variant="secondary"
            onClick={fill.scan}
            disabled={fill.busy}
            className="btn-compact shrink-0"
          >
            Scan
          </Button>
        </HoverTip>
        <HoverTip text="Apply the selected profile to matching fields">
          <Button
            onClick={() => fill.fill(selectedId || undefined)}
            disabled={fill.busy}
            className="btn-compact shrink-0"
          >
            Fill
          </Button>
        </HoverTip>
      </div>

      {(fill.info || fill.error) && (
        <p
          className={`mt-1.5 text-[11px] leading-snug ${fill.error ? "text-perfil-danger" : "text-perfil-muted"}`}
          role="status"
        >
          {fill.error ?? fill.info}
        </p>
      )}

      <SiteToolsPanel
        onFeedback={(msg, v) => (v === "error" ? feedback.showError(msg) : feedback.showSuccess(msg))}
      />
    </PageShell>
  );
}
