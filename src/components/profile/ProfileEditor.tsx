import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Panel } from "@/components/ui/Panel";
import { PROFILE_FIELD_GROUPS, PROFILE_FIELD_LABELS } from "@/shared/profile-fields";
import type { ProfileData, ProfileFieldKey } from "@/types/profile";

export interface ProfileEditorProps {
  draft: ProfileData;
  onChange: (draft: ProfileData) => void;
  onSave: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  statusMessage?: string;
}

export function ProfileEditor({
  draft,
  onChange,
  onSave,
  onDelete,
  canDelete = false,
  statusMessage,
}: ProfileEditorProps) {
  function updateField(key: ProfileFieldKey | "label", value: string) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <Panel>
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

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button onClick={onSave}>Save changes</Button>
        {onDelete && (
          <Button variant="danger" onClick={onDelete} disabled={!canDelete} className="text-sm">
            Delete profile
          </Button>
        )}
        {statusMessage && <span className="text-xs font-medium text-perfil-success">{statusMessage}</span>}
      </div>
    </Panel>
  );
}
