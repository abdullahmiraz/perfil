import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { MasterPasswordForm } from "@/components/auth/MasterPasswordForm";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageShell } from "@/components/layout/PageShell";
import { ProfilePicker } from "@/components/profile/ProfilePicker";
import { useFillActions } from "@/hooks/useFillActions";
import { useProfiles } from "@/hooks/useProfiles";
import { useVault } from "@/hooks/useVault";

export function App() {
  const vault = useVault();
  const profiles = useProfiles(vault.status === "unlocked");
  const fill = useFillActions();
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (profiles.activeId) setSelectedId(profiles.activeId);
  }, [profiles.activeId]);

  async function handleLock() {
    fill.clearMessages();
    await vault.lock();
    setSelectedId("");
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
        <MasterPasswordForm
          mode="unlock"
          busy={vault.busy}
          error={vault.error}
          onSubmit={async (password) => {
            await vault.unlock(password);
          }}
        />
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

      {fill.info && <Alert variant="success" className="mt-3">{fill.info}</Alert>}
      {fill.error && <Alert variant="error" className="mt-2">{fill.error}</Alert>}

      <div className="mt-4 flex items-center justify-between border-t border-perfil-border pt-3">
        <Button variant="ghost" onClick={() => chrome.runtime.openOptionsPage()}>
          Manage profiles
        </Button>
        <Button variant="danger" onClick={handleLock}>
          Lock vault
        </Button>
      </div>
    </PageShell>
  );
}
