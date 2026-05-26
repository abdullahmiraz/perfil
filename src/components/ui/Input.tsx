import type { InputHTMLAttributes } from "react";
import { Label } from "@/components/ui/Label";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string | null;
  /** Brief shake when `error` is set (e.g. after failed submit). */
  shake?: boolean;
}

export function Input({
  label,
  hint,
  error,
  shake = false,
  className = "",
  id,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) {
  const inputId = id ?? (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);
  const hasError = Boolean(error);

  return (
    <div className={shake && hasError ? "perfil-shake" : undefined}>
      {label && (
        <Label htmlFor={inputId} className="mb-1.5">
          {label}
        </Label>
      )}
      <input
        id={inputId}
        className={[
          "input-field",
          hasError && "input-field--error",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={ariaInvalid ?? hasError}
        aria-describedby={hasError && inputId ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={inputId ? `${inputId}-error` : undefined} className="mt-1.5 text-xs text-perfil-danger" role="alert">
          {error}
        </p>
      )}
      {!error && hint && <p className="mt-1 text-xs text-perfil-muted">{hint}</p>}
    </div>
  );
}
