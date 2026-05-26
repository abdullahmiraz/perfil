import { HoverTip } from "@/components/ui/HoverTip";

export interface CompactToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  info?: string;
  disabled?: boolean;
}

export function CompactToggle({ checked, onChange, label, info, disabled }: CompactToggleProps) {
  const labelEl = <span className="truncate">{label}</span>;

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-perfil-text">
        {info ? (
          <HoverTip text={info} className="min-w-0 cursor-help">
            {labelEl}
          </HoverTip>
        ) : (
          labelEl
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative h-6 w-10 shrink-0 rounded-full border transition-colors",
          disabled ? "opacity-50" : "",
          checked ? "border-perfil-accent bg-perfil-accent" : "border-perfil-border bg-perfil-bg",
        ].join(" ")}
      >
        <span
          className={[
            "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
