import { useEffect } from "react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  show: boolean;
  onDismiss?: () => void;
  durationMs?: number;
  className?: string;
}

const ICON: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  info: "·",
};

const VARIANT_CLASS: Record<ToastVariant, string> = {
  success: "border-perfil-success/40 bg-perfil-success/10 text-perfil-success",
  error: "border-perfil-danger/40 bg-perfil-danger/10 text-perfil-danger",
  info: "border-perfil-border bg-perfil-surface text-perfil-text",
};

export function Toast({
  message,
  variant = "success",
  show,
  onDismiss,
  durationMs = 2800,
  className = "",
}: ToastProps) {
  useEffect(() => {
    if (!show || !onDismiss || durationMs <= 0) return;
    const t = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(t);
  }, [show, message, onDismiss, durationMs]);

  if (!show || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium shadow-lg shadow-black/20",
        VARIANT_CLASS[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/15 text-xs font-bold"
        aria-hidden
      >
        {ICON[variant]}
      </span>
      <span>{message}</span>
    </div>
  );
}
