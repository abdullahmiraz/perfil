import { useCallback, useEffect, useRef, useState } from "react";

export type ToastVariant = "success" | "error" | "info";

/** Default auto-dismiss duration for toasts. */
export const TOAST_DEFAULT_DURATION_MS = 3000;

const TOAST_EXIT_MS = 280;

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

const PROGRESS_CLASS: Record<ToastVariant, string> = {
  success: "bg-perfil-success",
  error: "bg-perfil-danger",
  info: "bg-perfil-accent",
};

type Phase = "hidden" | "enter" | "visible" | "exit";

export function Toast({
  message,
  variant = "success",
  show,
  onDismiss,
  durationMs = TOAST_DEFAULT_DURATION_MS,
  className = "",
}: ToastProps) {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [content, setContent] = useState(message);
  const [progressKey, setProgressKey] = useState(0);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActive = useRef(false);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = null;
  }, []);

  const runExit = useCallback(() => {
    clearDismissTimer();
    setPhase("exit");
    if (exitTimer.current) clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => {
      isActive.current = false;
      setPhase("hidden");
      onDismiss?.();
    }, TOAST_EXIT_MS);
  }, [clearDismissTimer, onDismiss]);

  const showToast = useCallback(() => {
    clearDismissTimer();
    setContent(message);
    setProgressKey((k) => k + 1);
    isActive.current = true;
    setPhase("enter");
    requestAnimationFrame(() => setPhase("visible"));

    if (onDismiss && durationMs > 0) {
      dismissTimer.current = setTimeout(runExit, durationMs);
    }
  }, [message, onDismiss, durationMs, clearDismissTimer, runExit]);

  useEffect(() => {
    if (!show || !message) {
      if (isActive.current) runExit();
      return clearDismissTimer;
    }
    showToast();
    return clearDismissTimer;
  }, [show, message, showToast, runExit, clearDismissTimer]);

  useEffect(
    () => () => {
      clearDismissTimer();
      if (exitTimer.current) clearTimeout(exitTimer.current);
    },
    [clearDismissTimer],
  );

  if (phase === "hidden") return null;

  const autoDismiss = Boolean(onDismiss) && durationMs > 0;
  const phaseClass =
    phase === "enter"
      ? "toast-phase-enter"
      : phase === "exit"
        ? "toast-phase-exit"
        : "toast-phase-visible";

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "toast-root relative overflow-hidden rounded-xl border shadow-lg shadow-black/20",
        VARIANT_CLASS[variant],
        phaseClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 pb-3 text-sm font-medium">
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/15 text-xs font-bold"
          aria-hidden
        >
          {ICON[variant]}
        </span>
        <span>{content}</span>
      </div>
      {autoDismiss && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-current/10" aria-hidden>
          <div
            key={progressKey}
            className={["toast-progress-bar h-full origin-left", PROGRESS_CLASS[variant]].join(" ")}
            style={{ animationDuration: `${durationMs}ms` }}
          />
        </div>
      )}
    </div>
  );
}
