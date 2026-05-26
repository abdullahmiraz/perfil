export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function AppHeader({
  title = "Perfil",
  subtitle = "Secure form autofill",
  compact = false,
}: AppHeaderProps) {
  const iconSize = compact ? "h-9 w-9" : "h-10 w-10";
  const titleClass = compact ? "text-base" : "text-2xl";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex ${iconSize} items-center justify-center rounded-xl bg-perfil-accent/15 text-sm font-semibold text-perfil-accent`}
      >
        P
      </div>
      <div>
        <h1 className={`${titleClass} font-semibold tracking-tight`}>{title}</h1>
        {subtitle && <p className="text-xs text-perfil-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
