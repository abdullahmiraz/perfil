import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { MasterPasswordForm } from "@/components/auth/MasterPasswordForm";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageShell } from "@/components/layout/PageShell";
import { SiteToolsPanel } from "@/components/popup/SiteToolsPanel";
import { ProfilePicker } from "@/components/profile/ProfilePicker";
import { useFillActions } from "@/hooks/useFillActions";
import { useFeedback } from "@/hooks/useFeedback";
import { useProfiles } from "@/hooks/useProfiles";
import { useVault } from "@/hooks/useVault";
import { sendMessage } from "@/shared/messages";

export function App() {
  const vault = useVault();
  const profiles = useProfiles(vault.status === "unlocked");
  const fill = useFillActions();
  const feedback = useFeedback();
  const [selectedId, setSelectedId] = useState("");
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pin, setPin] = useState("");
  const [usePin, setUsePin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinShakeKey, setPinShakeKey] = useState(0);

  useEffect(() => {
    if (profiles.activeId) setSelectedId(profiles.activeId);
  }, [profiles.activeId]);

  useEffect(() => {
    if (vault.status === "locked") {
      void sendMessage({ type: "GET_SETTINGS" })
        .then((r) => setPinEnabled(r.settings.pinEnabled))
        .catch(() => setPinEnabled(false));
    }
  }, [vault.status]);

  async function handleLock() {
    fill.clearMessages();
    await vault.lock();
    setSelectedId("");
    feedback.showSuccess("Vault locked");
  }

  async function handlePinUnlock(e: React.FormEvent) {
    e.preventDefault();
    setPinError(null);
    const res = await sendMessage({ type: "UNLOCK_PIN", pin });
    if (res.ok) {
      setPin("");
      await vault.refresh();
      feedback.showSuccess("Unlocked with PIN");
    } else {
      setPinError(
        res.error?.includes("import()")
          ? "Unlock failed. Reload the extension and try again."
          : (res.error ?? "Incorrect PIN"),
      );
      setPinShakeKey((k) => k + 1);
    }
  }

  async function handlePasswordUnlock(password: string) {
    const ok = await vault.unlock(password);
    if (ok) feedback.showSuccess("Vault unlocked");
  }

  async function handleSetup(password: string) {
    const ok = await vault.setup(password);
    if (ok) feedback.showSuccess("Vault created — Personal profile ready");
  }

  const toast = feedback.feedback ? (
    <Toast
      message={feedback.feedback.message}
      variant={feedback.feedback.variant}
      show
      onDismiss={feedback.clear}
      className="mb-3"
    />
  ) : null;

  if (vault.status === "uninitialized") {
    return (
      <PageShell>
        {toast}
        <AppHeader compact />
        <p className="mt-3 text-sm leading-relaxed text-perfil-muted">
          Create a local encrypted vault. Your data stays on this device.
        </p>
        <MasterPasswordForm
          mode="setup"
          busy={vault.busy}
          error={vault.error}
          onSubmit={handleSetup}
        />
      </PageShell>
    );
  }

  if (vault.status === "locked") {
    return (
      <PageShell>
        {toast}
        <AppHeader compact />
        {pinEnabled && (
          <div className="mb-3 flex gap-2 text-xs">
            <button
              type="button"
              className={!usePin ? "font-semibold text-perfil-accent" : "text-perfil-muted"}
              onClick={() => setUsePin(false)}
            >
              Master password
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
          <form onSubmit={handlePinUnlock} className="space-y-3">
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
            <Button type="submit" fullWidth disabled={vault.busy}>
              {vault.busy ? "Unlocking…" : "Unlock with PIN"}
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
      </PageShell>
    );
  }

  return (
    <PageShell>
      {toast}
      <AppHeader compact />
      <p className="mt-1 text-xs text-perfil-muted">
        {vault.profileCount} profile{vault.profileCount === 1 ? "" : "s"} · unlocked
      </p>

      <div className="mt-4">
        <ProfilePicker
          profiles={profiles.profiles}
          value={selectedId}
          onChange={setSelectedId}
        />
      </div>

      <SiteToolsPanel onFeedback={(msg, v) => (v === "error" ? feedback.showError(msg) : feedback.showSuccess(msg))} />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" fullWidth onClick={fill.scan} disabled={fill.busy}>
          {fill.busy ? "Scanning…" : "Scan page"}
        </Button>
        <Button fullWidth onClick={() => fill.fill(selectedId || undefined)} disabled={fill.busy}>
          {fill.busy ? "Filling…" : "Fill page"}
        </Button>
      </div>

      {fill.info && (
        <Alert variant="success" className="mt-3">
          {fill.info}
        </Alert>
      )}
      {fill.error && (
        <Alert variant="error" className="mt-2">
          {fill.error}
        </Alert>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-perfil-border pt-3">
        <button
          type="button"
          onClick={() => chrome.runtime.openOptionsPage()}
          className="text-xs font-medium text-perfil-accent hover:underline"
        >
          Manage profiles
        </button>
        <Button variant="danger" onClick={handleLock}>
          Lock vault
        </Button>
      </div>
    </PageShell>
  );
}
