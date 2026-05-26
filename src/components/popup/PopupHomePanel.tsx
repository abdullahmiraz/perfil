import { useEffect, useState } from "react";
import { HoverTip } from "@/components/ui/HoverTip";
import { sendMessage } from "@/shared/messages";
import type { VaultSettings } from "@/types/vault";

export interface PopupHomePanelProps {
  profileCount: number;
  onOpenSettings: () => void;
  onOpenProfiles: () => void;
  onLock: () => void;
}

function QuickLink({
  tip,
  onClick,
  children,
}: {
  tip: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <HoverTip text={tip} className="flex-1">
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-md border border-perfil-border bg-perfil-bg/50 px-2 py-1.5 text-[11px] font-medium text-perfil-text transition-colors hover:border-perfil-accent/50 hover:bg-perfil-surface"
      >
        {children}
      </button>
    </HoverTip>
  );
}

export function PopupHomePanel({
  profileCount,
  onOpenSettings,
  onOpenProfiles,
  onLock,
}: PopupHomePanelProps) {
  const [settings, setSettings] = useState<VaultSettings | null>(null);

  useEffect(() => {
    void sendMessage({ type: "GET_SETTINGS" }).then((r) => setSettings(r.settings));
  }, []);

  return (
    <div className="mt-2 space-y-2 border-t border-perfil-border pt-2">
      <div className="flex gap-1">
        <QuickLink tip="Edit names, email, address, and custom fields" onClick={onOpenProfiles}>
          Profiles
        </QuickLink>
        <QuickLink tip="PIN, auto-lock, backup export, recovery question" onClick={onOpenSettings}>
          Settings
        </QuickLink>
        <QuickLink tip="Lock the vault on this device" onClick={onLock}>
          Lock
        </QuickLink>
      </div>

      <div className="rounded-lg border border-perfil-border/80 bg-perfil-bg/40 px-2 py-1.5">
        <HoverTip
          text="Scan finds fillable fields on the tab. Fill applies the profile selected above. Use Save current below for long forms."
          className="w-full"
        >
          <p className="cursor-help text-[11px] font-medium text-perfil-text">Quick tips</p>
        </HoverTip>
        <ul className="mt-1 space-y-0.5 text-[10px] text-perfil-muted">
          <li>
            {profileCount} profile{profileCount === 1 ? "" : "s"} · field picker{" "}
            {settings?.fieldPickerEnabled ? "on" : "off"}
          </li>
          <li>Right-click menu: {settings?.contextMenuEnabled ? "on" : "off"} (toggle below)</li>
          <li>Export JSON backup in Settings before clearing browser data</li>
        </ul>
      </div>
    </div>
  );
}
