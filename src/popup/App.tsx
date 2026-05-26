import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MasterPasswordForm } from "@/components/auth/MasterPasswordForm";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageShell } from "@/components/layout/PageShell";
import { ProfilePicker } from "@/components/profile/ProfilePicker";
import { useFillActions } from "@/hooks/useFillActions";
import { useProfiles } from "@/hooks/useProfiles";
import { useVault } from "@/hooks/useVault";
import { sendMessage } from "@/shared/messages";

export function App() {
  const vault = useVault();
  const profiles = useProfiles(vault.status === "unlocked");
  const fill = useFillActions();
  const [selectedId, setSelectedId] = useState("");
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pin, setPin] = useState("");
  const [usePin, setUsePin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

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
  }

  async function handlePinUnlock(e: React.FormEvent) {
    e.preventDefault();
    setPinError(null);
    const res = await sendMessage({ type: "UNLOCK_PIN", pin });
    if (res.ok) {
      setPin("");
      await vault.refresh();
    } else {
      setPinError(res.error ?? "Incorrect PIN");
    }
  }

  if (vault.status === "uninitialized") {
    return (
      <PageShell>
        <AppHeader compact />
        <p className="mt-3 text-sm leading-relaxed text-perfil-muted">
          Create a local encrypted vault. Your data stays on this device.
        </p>
        <MasterPasswordForm
          mode="setup"
          busy={vault.busy}
          error={vault.error}
          onSubmit={async (password) => {
            await vault.setup(password);
          }}
        />
      </PageShell>
    );
  }

  if (vault.status === "locked") {
    return (
      <PageShell>
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
              label="PIN"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
            {pinError && <Alert variant="error">{pinError}</Alert>}
            <Button type="submit" fullWidth disabled={vault.busy}>
              Unlock with PIN
            </Button>
          </form>
        ) : (
          <MasterPasswordForm
            mode="unlock"
            busy={vault.busy}
            error={vault.error}
            onSubmit={async (password) => {
              await vault.unlock(password);
            }}
          />
        )}
      </PageShell>
    );
  }

  return (
    <PageShell>
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

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" fullWidth onClick={fill.scan} disabled={fill.busy}>
          Scan page
        </Button>
        <Button fullWidth onClick={() => fill.fill(selectedId || undefined)} disabled={fill.busy}>
          Fill page
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
