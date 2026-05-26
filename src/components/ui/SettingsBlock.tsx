import type { ReactNode } from "react";
import { Panel } from "@/components/ui/Panel";

export interface SettingsBlockProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/** Compact settings section panel. */
export function SettingsBlock({
  title,
  description,
  children,
  className = "",
}: SettingsBlockProps) {
  return (
    <Panel compact className={className}>
      <h2 className="text-sm font-semibold text-perfil-text">{title}</h2>
      {description && (
        <p className="mt-0.5 text-[11px] leading-snug text-perfil-muted">{description}</p>
      )}
      <div className="mt-2">{children}</div>
    </Panel>
  );
}
