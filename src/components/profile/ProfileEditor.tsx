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

  onDuplicate?: () => Promise<void>;

  onDelete?: () => Promise<boolean>;

  canDelete?: boolean;

  duplicating?: boolean;

  saving?: boolean;

  statusMessage?: string;

  onStatusDismiss?: () => void;
}

const ACTION_BTN = "btn-compact !w-auto";

export function ProfileEditor({
  profileId,

  draft,

  customFields,

  allProfiles,

  onChange,

  onCustomFieldsChange,

  onTransferComplete,

  onSave,

  onDuplicate,

  onDelete,

  canDelete = false,

  duplicating = false,

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

  const showSaved =
    statusMessage === "Saved" ||
    statusMessage === "Profile created" ||
    statusMessage === "Profile duplicated";

  return (
    <Panel compact className="mt-2">
      <div className="bg-perfil-surface/95 sticky top-0 z-10 -mx-3 -mt-3 mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-perfil-border px-3 py-2 backdrop-blur-sm">
        <Toast
          message={statusMessage ?? ""}
          variant={showSaved ? "success" : "info"}
          show={Boolean(statusMessage)}
          onDismiss={onStatusDismiss}
          className="min-w-[140px] flex-1"
        />

        <div className="flex flex-wrap gap-1.5">
          <Button onClick={() => void onSave()} disabled={saving} className={ACTION_BTN}>
            {saving ? "Saving…" : "Save"}
          </Button>

          {onDuplicate && (
            <Button
              variant="secondary"
              onClick={() => void onDuplicate()}
              disabled={duplicating || saving}
              className={ACTION_BTN}
            >
              {duplicating ? "Copying…" : "Duplicate"}
            </Button>
          )}

          {onDelete && (
            <Button
              variant="danger"
              onClick={() => void onDelete()}
              disabled={!canDelete || saving}
              className={`${ACTION_BTN} !px-2`}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <Input
        compact
        label="Profile name"
        value={draft.label}
        onChange={(e) => updateField("label", e.target.value)}
      />

      {PROFILE_FIELD_GROUPS.map((group) => (
        <div key={group.title} className="mt-4">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-perfil-muted">
            {group.title}
          </h2>

          <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
            {group.keys.map((key) => (
              <Input
                key={key}
                compact
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
