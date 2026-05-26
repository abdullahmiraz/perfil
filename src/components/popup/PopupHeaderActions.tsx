import {
  HeaderToolbar,
  HeaderToolbarButton,
  ThemeToolbarButton,
} from "@/components/layout/HeaderToolbar";

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
          title="Settings"
          onClick={() => chrome.runtime.openOptionsPage()}
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
