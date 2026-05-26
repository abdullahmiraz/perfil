import type { SelectHTMLAttributes } from "react";
import { Label } from "@/components/ui/Label";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export function Select({ label, options, className = "", id, ...props }: SelectProps) {
  const selectId = id ?? (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);

  return (
    <div>
      {label && (
        <Label htmlFor={selectId} className="mb-1">
          {label}
        </Label>
      )}
      <select
        id={selectId}
        className={["input-field", className].filter(Boolean).join(" ")}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
