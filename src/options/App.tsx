import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageShell } from "@/components/layout/PageShell";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { useProfiles } from "@/hooks/useProfiles";
import { useVault } from "@/hooks/useVault";

type Tab = "profiles" | "settings";

export function App() {
  const vault = useVault();
  const profiles = useProfiles(vault.status === "unlocked");
  const [tab, setTab] = useState<Tab>("profiles");

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
            Open the Perfil extension, unlock your vault, then return here to edit profiles and
            settings.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell width="options">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <AppHeader title="Perfil" subtitle="Profiles & settings" />
        <nav className="flex gap-1 rounded-xl border border-perfil-border p-1">
          {(["profiles", "settings"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-perfil-accent/15 text-perfil-accent"
                  : "text-perfil-muted hover:text-perfil-text"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      {tab === "settings" ? (
        <SettingsPanel />
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <Button onClick={profiles.addProfile}>New profile</Button>
          </div>
          {profiles.error && (
            <Alert variant="error" className="mb-4 text-sm">
              {profiles.error}
            </Alert>
          )}
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <ProfileSidebar
              profiles={profiles.profiles}
              activeId={profiles.activeId}
              onSelect={profiles.selectProfile}
            />
            {profiles.draft && (
              <ProfileEditor
                profileId={profiles.activeId}
                draft={profiles.draft}
                customFields={profiles.customFields}
                allProfiles={profiles.profiles}
                onChange={profiles.updateDraft}
                onCustomFieldsChange={profiles.updateCustomFields}
                onTransferComplete={() => void profiles.reload()}
                onSave={profiles.save}
                onDelete={profiles.removeProfile}
                canDelete={profiles.profiles.length > 1}
                statusMessage={profiles.statusMessage}
              />
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}
