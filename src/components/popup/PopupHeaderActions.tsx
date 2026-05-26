import {
  HeaderToolbar,
  HeaderToolbarButton,
  ThemeToolbarButton,
} from "@/components/layout/HeaderToolbar";
import { openOptions } from "@/lib/open-options";

export interface PopupHeaderActionsProps {
  showLock?: boolean;
  onLock?: () => void;
  showProfilesPage?: boolean;
  showSettings?: boolean;
}

export function PopupHeaderActions({
  showLock = false,
  onLock,
  showProfilesPage = true,
  showSettings = true,
}: PopupHeaderActionsProps) {
  return (
    <HeaderToolbar>
      <ThemeToolbarButton />
      {showProfilesPage && (
        <HeaderToolbarButton
          title="Open profiles page (full tab)"
          onClick={() => void openOptions("profiles")}
        >
          📋
        </HeaderToolbarButton>
      )}
      {showSettings && (
        <HeaderToolbarButton
          title="Open settings page (full tab)"
          onClick={() => void openOptions("settings")}
        >
          ⚙
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
