import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageShell } from "@/components/layout/PageShell";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { Toast } from "@/components/ui/Toast";
import { useFeedback } from "@/hooks/useFeedback";
import { useProfiles } from "@/hooks/useProfiles";
import { useVault } from "@/hooks/useVault";
import { consumeOptionsTab } from "@/lib/open-options";

type Tab = "profiles" | "settings";

export function App() {
  const vault = useVault();
  const profiles = useProfiles(vault.status === "unlocked");
  const settingsFeedback = useFeedback();
  const [tab, setTab] = useState<Tab>("profiles");

  useEffect(() => {
    void consumeOptionsTab().then((t) => {
      if (t) setTab(t);
    });
  }, []);

  useEffect(() => {
    if (!profiles.statusMessage) return;
    const t = window.setTimeout(() => profiles.clearStatus(), 2800);
    return () => window.clearTimeout(t);
  }, [profiles.statusMessage, profiles.clearStatus]);

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
        <div className="mx-auto max-w-lg">
          <AppHeader title="Perfil settings" subtitle="Unlock from the toolbar popup first" />
          <p className="mt-4 text-sm leading-relaxed text-perfil-muted">
            Open the Perfil extension, unlock your vault, then return here to edit profiles and
            security settings.
          </p>
          <div className="mt-8">
            <AppearanceSettings />
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell width="options">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <AppHeader title="Perfil" subtitle="Profiles & settings" />
        <nav className="flex gap-1 rounded-xl border border-perfil-border p-1" role="tablist">
          {(["profiles", "settings"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
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
        <SettingsPanel
          onFeedback={(message, variant) =>
            variant === "error" ? settingsFeedback.showError(message) : settingsFeedback.showSuccess(message)
          }
        />
      ) : (
        <div role="tabpanel">
          {profiles.error && (
            <Alert variant="error" className="mb-4 text-sm">
              {profiles.error}
            </Alert>
          )}

          <ProfileTabs
            profiles={profiles.profiles}
            activeId={profiles.activeId}
            onSelect={profiles.selectProfile}
            onAdd={profiles.addProfile}
            adding={profiles.adding}
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
              saving={profiles.saving}
              statusMessage={profiles.statusMessage}
              onStatusDismiss={profiles.clearStatus}
            />
          )}
        </div>
      )}

      {settingsFeedback.feedback && tab === "settings" && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm">
          <Toast
            message={settingsFeedback.feedback.message}
            variant={settingsFeedback.feedback.variant}
            show
            onDismiss={settingsFeedback.clear}
          />
        </div>
      )}
    </PageShell>
  );
}
