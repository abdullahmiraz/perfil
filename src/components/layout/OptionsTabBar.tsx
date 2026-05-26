export type OptionsTab = "profiles" | "settings";

export interface OptionsTabBarProps {
  value: OptionsTab;
  onChange: (tab: OptionsTab) => void;
}

const TABS: { id: OptionsTab; label: string }[] = [
  { id: "profiles", label: "Profiles" },
  { id: "settings", label: "Settings" },
];

export function OptionsTabBar({ value, onChange }: OptionsTabBarProps) {
  return (
    <nav
      className="bg-perfil-bg/60 inline-flex rounded-lg border border-perfil-border p-0.5"
      role="tablist"
      aria-label="Options sections"
    >
      {TABS.map((tab) => {
        const selected = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={[
              "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
              selected
                ? "bg-perfil-accent text-white shadow-sm"
                : "text-perfil-muted hover:text-perfil-text",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
