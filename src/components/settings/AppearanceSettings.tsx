import { useTheme } from "@/hooks/useTheme";
import { SettingsBlock } from "@/components/ui/SettingsBlock";
import type { UiTheme } from "@/lib/theme";

const OPTIONS: { value: UiTheme; label: string; hint: string }[] = [
  { value: "dark", label: "Dark", hint: "Night" },
  { value: "light", label: "Light", hint: "Day" },
  { value: "system", label: "System", hint: "OS" },
];

export function AppearanceSettings() {
  const { theme, changeTheme, ready } = useTheme();

  if (!ready) return null;

  return (
    <SettingsBlock title="Appearance" description="Popup and options page theme">
      <div className="grid grid-cols-3 gap-1.5">
        {OPTIONS.map((opt) => {
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => void changeTheme(opt.value)}
              className={[
                "rounded-lg border px-2 py-2 text-left transition-colors",
                active
                  ? "border-perfil-accent bg-perfil-accent text-white shadow-sm"
                  : "border-perfil-border bg-perfil-bg text-perfil-text hover:border-perfil-muted",
              ].join(" ")}
              aria-pressed={active}
            >
              <span className="block text-xs font-semibold">{opt.label}</span>
              <span
                className={[
                  "mt-0.5 block text-[10px]",
                  active ? "text-white/80" : "text-perfil-muted",
                ].join(" ")}
              >
                {opt.hint}
              </span>
            </button>
          );
        })}
      </div>
    </SettingsBlock>
  );
}
