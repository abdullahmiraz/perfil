import { useTheme } from "@/hooks/useTheme";
import { Panel } from "@/components/ui/Panel";
import type { UiTheme } from "@/lib/theme";

const OPTIONS: { value: UiTheme; label: string; hint: string }[] = [
  { value: "dark", label: "Dark", hint: "Night mode" },
  { value: "light", label: "Light", hint: "Day mode" },
  { value: "system", label: "System", hint: "Match OS setting" },
];

export function AppearanceSettings() {
  const { theme, changeTheme, ready } = useTheme();

  if (!ready) return null;

  return (
    <Panel>
      <h2 className="font-semibold tracking-tight">Appearance</h2>
      <p className="mt-1 text-xs text-perfil-muted">Popup and settings page theme</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => void changeTheme(opt.value)}
              className={[
                "rounded-xl border px-3 py-3 text-left transition-colors",
                active
                  ? "border-perfil-accent bg-perfil-accent/15 text-perfil-accent"
                  : "border-perfil-border bg-perfil-bg text-perfil-text hover:border-perfil-muted",
              ].join(" ")}
              aria-pressed={active}
            >
              <span className="block text-sm font-semibold">{opt.label}</span>
              <span className="mt-0.5 block text-[11px] text-perfil-muted">{opt.hint}</span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
