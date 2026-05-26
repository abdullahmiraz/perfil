import { CustomFieldsEditor } from "@/components/profile/CustomFieldsEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Panel } from "@/components/ui/Panel";
import { Toast } from "@/components/ui/Toast";
import { PROFILE_FIELD_GROUPS, PROFILE_FIELD_LABELS } from "@/shared/profile-fields";
import type { CustomField, Profile, ProfileData, ProfileFieldKey } from "@/types/profile";

export interface ProfileEditorProps {
  profileId: string;
  draft: ProfileData;
  customFields: CustomField[];
  allProfiles: Profile[];
  onChange: (draft: ProfileData) => void;
  onCustomFieldsChange: (fields: CustomField[]) => void;
  onTransferComplete?: () => void;
  onSave: () => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
  canDelete?: boolean;
  saving?: boolean;
  statusMessage?: string;
  onStatusDismiss?: () => void;
}

export function ProfileEditor({
  profileId,
  draft,
  customFields,
  allProfiles,
  onChange,
  onCustomFieldsChange,
  onTransferComplete,
  onSave,
  onDelete,
  canDelete = false,
  saving = false,
  statusMessage,
  onStatusDismiss,
}: ProfileEditorProps) {
  const profileForCustom: Profile = {
    id: profileId,
    data: draft,
    customFields,
    createdAt: 0,
    updatedAt: 0,
  };

  function updateField(key: ProfileFieldKey | "label", value: string) {
    onChange({ ...draft, [key]: value });
  }

  const showSaved = statusMessage === "Saved" || statusMessage === "Profile created";

  return (
    <Panel className="mt-4">
      <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-perfil-border bg-perfil-surface/95 px-5 py-3 backdrop-blur-sm">
        <Toast
          message={statusMessage ?? ""}
          variant={showSaved ? "success" : "info"}
          show={Boolean(statusMessage)}
          onDismiss={onStatusDismiss}
          className="flex-1 min-w-[200px]"
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void onSave()} disabled={saving} className="!w-auto px-5">
            {saving ? "Saving…" : "Save profile"}
          </Button>
          {onDelete && (
            <Button
              variant="danger"
              onClick={() => void onDelete()}
              disabled={!canDelete || saving}
              className="text-sm"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <Input
        label="Profile name"
        value={draft.label}
        onChange={(e) => updateField("label", e.target.value)}
      />

      {PROFILE_FIELD_GROUPS.map((group) => (
        <div key={group.title} className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-perfil-muted">
            {group.title}
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {group.keys.map((key) => (
              <Input
                key={key}
                label={PROFILE_FIELD_LABELS[key]}
                value={draft[key]}
                onChange={(e) => updateField(key, e.target.value)}
              />
            ))}
          </div>
        </div>
      ))}

      <CustomFieldsEditor
        profile={profileForCustom}
        profiles={allProfiles}
        onChange={onCustomFieldsChange}
        onTransferComplete={onTransferComplete}
      />
    </Panel>
  );
}
