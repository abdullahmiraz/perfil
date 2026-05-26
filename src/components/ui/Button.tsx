import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "text-xs font-medium text-perfil-accent hover:underline bg-transparent border-0 p-0",
  danger: "text-xs text-perfil-muted hover:text-perfil-danger bg-transparent border-0 p-0",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[VARIANT_CLASS[variant], fullWidth ? "!w-full" : "", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
