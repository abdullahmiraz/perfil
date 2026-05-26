import type { LabelHTMLAttributes } from "react";

export function Label({ className = "", ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={["block text-xs font-medium text-perfil-muted", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
