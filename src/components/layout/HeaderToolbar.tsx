import type { ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";
import type { UiTheme } from "@/lib/theme";

export function HeaderToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-perfil-border bg-perfil-bg/40 shadow-sm">
      {children}
    </div>
  );
}

export interface HeaderToolbarButtonProps {
  title: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
}

export function HeaderToolbarButton({
  title,
  onClick,
  children,
  active = false,
}: HeaderToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={[
        "flex h-8 w-8 items-center justify-center border-l border-perfil-border text-sm transition-colors first:border-l-0",
        "hover:bg-perfil-surface hover:text-perfil-text",
        active ? "bg-perfil-accent/15 text-perfil-accent" : "text-perfil-muted",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

const THEME_CYCLE: UiTheme[] = ["dark", "light", "system"];

const THEME_META: Record<UiTheme, { icon: string; label: string }> = {
  dark: { icon: "☾", label: "Dark" },
  light: { icon: "☀", label: "Light" },
  system: { icon: "◐", label: "System" },
};

export function ThemeToolbarButton() {
  const { theme, changeTheme, ready } = useTheme();

  if (!ready) {
    return (
      <span className="flex h-8 w-8 items-center justify-center border-l border-perfil-border text-perfil-muted first:border-l-0">
        …
      </span>
    );
  }

  const meta = THEME_META[theme];

  function cycleTheme() {
    const i = THEME_CYCLE.indexOf(theme);
    const next = THEME_CYCLE[(i + 1) % THEME_CYCLE.length] ?? "dark";
    void changeTheme(next);
  }

  return (
    <HeaderToolbarButton
      title={`Theme: ${meta.label} — click to switch`}
      onClick={cycleTheme}
      active={theme !== "system"}
    >
      {meta.icon}
    </HeaderToolbarButton>
  );
}
