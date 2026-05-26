import { useEffect, useState } from "react";
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

function IconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-perfil-muted transition-colors hover:bg-perfil-surface hover:text-perfil-text"
    >
      {children}
    </button>
  );
}

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

  const headerActions =
    vault.status === "unlocked" ? (
      <>
        <IconButton title="Manage profiles" onClick={() => chrome.runtime.openOptionsPage()}>
          ⚙
        </IconButton>
        <IconButton title="Lock vault" onClick={() => void handleLock()}>
          🔒
        </IconButton>
      </>
    ) : vault.status === "locked" ? (
      <IconButton title="Settings" onClick={() => chrome.runtime.openOptionsPage()}>
        ⚙
      </IconButton>
    ) : null;

  async function handleLock() {
    fill.clearMessages();
    await vault.lock();
    setSelectedId("");
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

  async function handleSetup(password: string) {
    const ok = await vault.setup(password);
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

  if (vault.status === "uninitialized") {
    return (
      <PageShell>
        {toast}
        <AppHeader compact hideSubtitle actions={headerActions} />
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
        <AppHeader compact hideSubtitle actions={headerActions} />
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
      </PageShell>
    );
  }

  return (
    <PageShell>
      {toast}
      <AppHeader compact hideSubtitle actions={headerActions} />

      <div className="mt-3 flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <ProfilePicker
            profiles={profiles.profiles}
            value={selectedId}
            onChange={setSelectedId}
            compact
          />
        </div>
        <Button
          variant="secondary"
          onClick={fill.scan}
          disabled={fill.busy}
          className="btn-compact shrink-0"
        >
          Scan
        </Button>
        <Button
          onClick={() => fill.fill(selectedId || undefined)}
          disabled={fill.busy}
          className="btn-compact shrink-0"
        >
          Fill
        </Button>
      </div>

      {(fill.info || fill.error) && (
        <p className={`mt-2 text-[11px] ${fill.error ? "text-perfil-danger" : "text-perfil-success"}`}>
          {fill.error ?? fill.info}
        </p>
      )}

      <SiteToolsPanel
        onFeedback={(msg, v) => (v === "error" ? feedback.showError(msg) : feedback.showSuccess(msg))}
      />
    </PageShell>
  );
}
