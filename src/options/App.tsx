import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";

import { AppHeader } from "@/components/layout/AppHeader";

import { OptionsPageFooter } from "@/components/layout/OptionsPageFooter";
import { OptionsTabBar } from "@/components/layout/OptionsTabBar";

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
        <div className="mx-auto max-w-md">
          <AppHeader
            title="Perfil settings"
            subtitle="Unlock from the toolbar popup first"
            compact
          />

          <p className="mt-2 text-xs leading-relaxed text-perfil-muted">
            Open the Perfil extension, unlock your vault, then return here to edit profiles and
            security settings.
          </p>

          <div className="mt-4">
            <AppearanceSettings />
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell width="options">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <AppHeader title="Perfil" subtitle="Profiles & settings" compact />

        <OptionsTabBar value={tab} onChange={setTab} />
      </header>

      {tab === "settings" ? (
        <SettingsPanel
          onFeedback={(message, variant) =>
            variant === "error"
              ? settingsFeedback.showError(message)
              : settingsFeedback.showSuccess(message)
          }
        />
      ) : (
        <div role="tabpanel">
          {profiles.error && (
            <Alert variant="error" className="mb-2 py-2 text-xs">
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
              onDuplicate={profiles.duplicateProfile}
              onDelete={profiles.removeProfile}
              canDelete={profiles.profiles.length > 1}
              duplicating={profiles.adding}
              saving={profiles.saving}
              statusMessage={profiles.statusMessage}
              onStatusDismiss={profiles.clearStatus}
            />
          )}
        </div>
      )}

      <OptionsPageFooter />

      {settingsFeedback.feedback && tab === "settings" && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
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
