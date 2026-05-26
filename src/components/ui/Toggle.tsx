export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

/** Pill switch (on/off dongle). */
export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-perfil-text">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-perfil-muted">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative h-7 w-12 shrink-0 rounded-full border transition-colors",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          checked
            ? "border-perfil-accent bg-perfil-accent"
            : "border-perfil-border bg-perfil-bg",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
