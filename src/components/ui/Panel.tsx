import type { HTMLAttributes, ReactNode } from "react";

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
  /** Tighter padding for options / settings pages */
  compact?: boolean;
}

export function Panel({
  children,
  padded = true,
  compact = false,
  className = "",
  ...props
}: PanelProps) {
  const padClass = !padded ? "" : compact ? "p-3" : "p-6";
  return (
    <div
      className={[
        compact ? "rounded-xl" : "rounded-2xl",
        "border border-perfil-border bg-perfil-surface",
        padClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
