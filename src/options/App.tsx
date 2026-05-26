import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageShell } from "@/components/layout/PageShell";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { useProfiles } from "@/hooks/useProfiles";
import { useVault } from "@/hooks/useVault";

export function App() {
  const vault = useVault();
  const profiles = useProfiles(vault.status === "unlocked");

  if (vault.loading || profiles.loading) {
    return (
      <PageShell width="options">
        <p className="text-sm text-perfil-muted">Loading…</p>
      </PageShell>
    );
  }

  if (vault.status !== "unlocked") {
    return (
      <PageShell width="options">
        <div className="mx-auto max-w-lg text-center">
          <AppHeader title="Perfil settings" subtitle="Unlock from the toolbar popup first" />
          <p className="mt-6 text-sm leading-relaxed text-perfil-muted">
            Open the Perfil extension, unlock your vault, then return here to edit profiles.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell width="options">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <AppHeader title="Profiles" subtitle="Stored locally in your encrypted vault" />
        <Button onClick={profiles.addProfile}>New profile</Button>
      </header>

      {profiles.error && <Alert variant="error" className="mb-4 text-sm">{profiles.error}</Alert>}

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <ProfileSidebar
          profiles={profiles.profiles}
          activeId={profiles.activeId}
          onSelect={profiles.selectProfile}
        />
        {profiles.draft && (
          <ProfileEditor
            draft={profiles.draft}
            onChange={profiles.updateDraft}
            onSave={profiles.save}
            onDelete={profiles.removeProfile}
            canDelete={profiles.profiles.length > 1}
            statusMessage={profiles.statusMessage}
          />
        )}
      </div>
    </PageShell>
  );
}
