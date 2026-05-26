import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createCustomField } from "@/lib/custom-field";
import { sendMessage } from "@/shared/messages";
import type { CustomField, CustomFieldType, Profile } from "@/types/profile";
import { CUSTOM_FIELD_TYPES } from "@/types/profile";

export interface CustomFieldsEditorProps {
  profile: Profile;
  profiles: Profile[];
  onChange: (fields: CustomField[]) => void;
  onTransferComplete?: () => void;
}

export function CustomFieldsEditor({
  profile,
  profiles,
  onChange,
  onTransferComplete,
}: CustomFieldsEditorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [targetProfileId, setTargetProfileId] = useState("");
  const [message, setMessage] = useState("");

  const fields = [...profile.customFields].sort((a, b) => a.order - b.order);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addField() {
    const field = createCustomField("New field");
    onChange([...fields, field]);
  }

  function updateField(id: string, patch: Partial<CustomField>) {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function removeField(id: string) {
    onChange(fields.filter((f) => f.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function moveField(id: string, dir: -1 | 1) {
    const idx = fields.findIndex((f) => f.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= fields.length) return;
    const next = [...fields];
    const order = next[idx]!.order;
    next[idx]!.order = next[swap]!.order;
    next[swap]!.order = order;
    onChange(next.sort((a, b) => a.order - b.order));
  }

  async function transfer(mode: "copy" | "move") {
    if (!targetProfileId || selected.size === 0) return;
    const res = await sendMessage({
      type: "COPY_CUSTOM_FIELDS",
      sourceProfileId: profile.id,
      targetProfileId,
      fieldIds: [...selected],
      mode,
    });
    if (res.ok) {
      setMessage(mode === "copy" ? "Copied" : "Moved");
      if (mode === "move") {
        onChange(fields.filter((f) => !selected.has(f.id)));
      }
      setSelected(new Set());
      onTransferComplete?.();
    } else {
      setMessage(res.error ?? "Failed");
    }
  }

  const otherProfiles = profiles.filter((p) => p.id !== profile.id);

  return (
    <div className="mt-8 border-t border-perfil-border pt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-perfil-muted">
          Custom fields
        </h2>
        <Button onClick={addField} className="!w-auto px-3 py-1.5 text-xs">
          Add field
        </Button>
      </div>
      <p className="mt-1 text-xs text-perfil-muted">
        Name fields anything you need (e.g. eye power). They are matched on web forms by label.
      </p>

      <div className="mt-4 space-y-4">
        {fields.map((field) => (
          <div
            key={field.id}
            className="rounded-xl border border-perfil-border bg-perfil-bg/50 p-4"
          >
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={selected.has(field.id)}
                onChange={() => toggle(field.id)}
                className="mt-1"
                aria-label={`Select ${field.label}`}
              />
              <div className="flex-1 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Field name"
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                  />
                  <Select
                    label="Type"
                    value={field.type}
                    onChange={(e) =>
                      updateField(field.id, {
                        type: e.target.value as CustomFieldType,
                        options:
                          e.target.value === "select"
                            ? field.options ?? ["Option 1"]
                            : undefined,
                      })
                    }
                    options={CUSTOM_FIELD_TYPES.map((t) => ({
                      value: t.value,
                      label: t.label,
                    }))}
                  />
                </div>
                {field.type === "select" ? (
                  <>
                    <Input
                      label="Options (comma-separated)"
                      value={(field.options ?? []).join(", ")}
                      onChange={(e) =>
                        updateField(field.id, {
                          options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                    />
                    <Select
                      label="Value"
                      value={field.value}
                      onChange={(e) => updateField(field.id, { value: e.target.value })}
                      options={(field.options ?? []).map((o) => ({ value: o, label: o }))}
                    />
                  </>
                ) : (
                  <Input
                    label="Value"
                    type={
                      field.type === "date"
                        ? "date"
                        : field.type === "time"
                          ? "time"
                          : field.type === "color"
                            ? "color"
                            : field.type === "email"
                              ? "email"
                              : field.type === "tel"
                                ? "tel"
                                : "text"
                    }
                    value={field.value}
                    onChange={(e) => updateField(field.id, { value: e.target.value })}
                  />
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="ghost"
                onClick={() => moveField(field.id, -1)}
                className="text-xs"
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                onClick={() => moveField(field.id, 1)}
                className="text-xs"
              >
                ↓
              </Button>
              <Button variant="danger" onClick={() => removeField(field.id)} className="text-xs">
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {fields.length > 0 && otherProfiles.length > 0 && (
        <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-perfil-border p-3">
          <Select
            label="Target profile"
            value={targetProfileId}
            onChange={(e) => setTargetProfileId(e.target.value)}
            options={otherProfiles.map((p) => ({
              value: p.id,
              label: p.data.label || "Unnamed",
            }))}
            className="min-w-[160px]"
          />
          <Button
            variant="secondary"
            disabled={selected.size === 0 || !targetProfileId}
            onClick={() => transfer("copy")}
            className="!w-auto px-3"
          >
            Copy selected
          </Button>
          <Button
            variant="secondary"
            disabled={selected.size === 0 || !targetProfileId}
            onClick={() => transfer("move")}
            className="!w-auto px-3"
          >
            Move selected
          </Button>
          {message && <span className="text-xs text-perfil-success">{message}</span>}
        </div>
      )}
    </div>
  );
}
