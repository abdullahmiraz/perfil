import type { InputHTMLAttributes } from "react";
import { Label } from "@/components/ui/Label";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, className = "", id, ...props }: InputProps) {
  const inputId = id ?? (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);

  return (
    <div>
      {label && (
        <Label htmlFor={inputId} className="mb-1.5">
          {label}
        </Label>
      )}
      <input id={inputId} className={["input-field", className].filter(Boolean).join(" ")} {...props} />
      {hint && <p className="mt-1 text-xs text-perfil-muted">{hint}</p>}
    </div>
  );
}
