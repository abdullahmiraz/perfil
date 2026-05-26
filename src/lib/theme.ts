export type UiTheme = "dark" | "light" | "system";

const STORAGE_KEY = "perfil_ui_theme";

const LIGHT_VARS: Record<string, string> = {
  "--perfil-bg": "#f3f5f9",
  "--perfil-surface": "#ffffff",
  "--perfil-border": "#d8dee9",
  "--perfil-text": "#111827",
  "--perfil-muted": "#5b6577",
  "--perfil-accent": "#2563eb",
  "--perfil-accent-hover": "#1d4ed8",
  "--perfil-success": "#059669",
  "--perfil-danger": "#dc2626",
};

const DARK_VARS: Record<string, string> = {
  "--perfil-bg": "#0c1017",
  "--perfil-surface": "#151c28",
  "--perfil-border": "#263044",
  "--perfil-text": "#eef2f7",
  "--perfil-muted": "#8b9cb3",
  "--perfil-accent": "#4a9ff5",
  "--perfil-accent-hover": "#6bb3ff",
  "--perfil-success": "#34d399",
  "--perfil-danger": "#f87171",
};

function applyVars(vars: Record<string, string>): void {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

function resolvedPalette(theme: UiTheme): Record<string, string> {
  if (theme === "light") return LIGHT_VARS;
  if (theme === "dark") return DARK_VARS;
  const dark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return dark ? DARK_VARS : LIGHT_VARS;
}

export function applyTheme(theme: UiTheme): void {
  document.documentElement.dataset.theme = theme;
  applyVars(resolvedPalette(theme));
}

export async function getStoredTheme(): Promise<UiTheme> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const value = result[STORAGE_KEY];
  if (value === "light" || value === "dark" || value === "system") return value;
  return "dark";
}

export async function setStoredTheme(theme: UiTheme): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: theme });
  applyTheme(theme);
}

export async function initTheme(): Promise<UiTheme> {
  const theme = await getStoredTheme();
  applyTheme(theme);
  return theme;
}

let systemListener: (() => void) | null = null;

export function watchSystemTheme(current: UiTheme): void {
  if (systemListener) {
    window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", systemListener);
    systemListener = null;
  }
  if (current !== "system") return;
  systemListener = () => applyTheme("system");
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", systemListener);
}
