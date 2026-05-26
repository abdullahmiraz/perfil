export type AlertVariant = "error" | "success" | "info";

export interface AlertProps {
  variant?: AlertVariant;
  children: string;
  className?: string;
}

const VARIANT_CLASS: Record<AlertVariant, string> = {
  error: "text-perfil-danger",
  success: "text-perfil-success",
  info: "text-perfil-muted",
};

export function Alert({ variant = "info", children, className = "" }: AlertProps) {
  return <p className={["text-xs", VARIANT_CLASS[variant], className].filter(Boolean).join(" ")}>{children}</p>;
}
