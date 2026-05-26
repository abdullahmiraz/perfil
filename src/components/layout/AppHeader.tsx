import type { ReactNode } from "react";

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
  /** Icons/actions aligned top-right (settings, lock, etc.) */
  actions?: ReactNode;
  hideSubtitle?: boolean;
}

export function AppHeader({
  title = "Perfil",
  subtitle = "Secure form autofill",
  compact = false,
  actions,
  hideSubtitle = false,
}: AppHeaderProps) {
  const iconSize = compact ? "h-8 w-8" : "h-10 w-10";
  const titleClass = compact ? "text-sm" : "text-2xl";

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={`flex ${iconSize} shrink-0 items-center justify-center rounded-lg bg-perfil-accent/15 text-xs font-semibold text-perfil-accent`}
        >
          P
        </div>
        <div className="min-w-0">
          <h1 className={`${titleClass} truncate font-semibold tracking-tight`}>{title}</h1>
          {!hideSubtitle && subtitle && !compact && (
            <p className="text-xs text-perfil-muted">{subtitle}</p>
          )}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-0.5">{actions}</div> : null}
    </div>
  );
}
