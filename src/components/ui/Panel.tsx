import type { HTMLAttributes, ReactNode } from "react";

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export function Panel({ children, padded = true, className = "", ...props }: PanelProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-perfil-border bg-perfil-surface",
        padded ? "p-6" : "",
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
