import {
  HeaderToolbar,
  HeaderToolbarButton,
  ThemeToolbarButton,
} from "@/components/layout/HeaderToolbar";
import { openOptions } from "@/lib/open-options";

export interface PopupHeaderActionsProps {
  showLock?: boolean;
  onLock?: () => void;
  showSettings?: boolean;
}

export function PopupHeaderActions({
  showLock = false,
  onLock,
  showSettings = true,
}: PopupHeaderActionsProps) {
  return (
    <HeaderToolbar>
      <ThemeToolbarButton />
      {showSettings && (
        <HeaderToolbarButton
          title="Security, backup, and appearance"
          onClick={() => void openOptions("settings")}
        >
          🛠
        </HeaderToolbarButton>
      )}
      {showLock && onLock && (
        <HeaderToolbarButton title="Lock vault" onClick={onLock}>
          🔒
        </HeaderToolbarButton>
      )}
    </HeaderToolbar>
  );
}
