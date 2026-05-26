import type { Profile } from "@/types/profile";

export interface ProfileTabsProps {
  profiles: Profile[];
  activeId: string;
  onSelect: (profile: Profile) => void;
  onAdd: () => void;
  adding?: boolean;
}

export function ProfileTabs({ profiles, activeId, onSelect, onAdd, adding }: ProfileTabsProps) {
  return (
    <div className="flex flex-wrap items-end gap-1 border-b border-perfil-border">
      {profiles.map((profile) => {
        const active = profile.id === activeId;
        const name = profile.data.label?.trim() || "Unnamed";
        return (
          <button
            key={profile.id}
            type="button"
            onClick={() => onSelect(profile)}
            className={[
              "relative -mb-px rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border border-b-perfil-bg border-perfil-border bg-perfil-bg text-perfil-accent"
                : "border border-transparent text-perfil-muted hover:bg-perfil-surface/80 hover:text-perfil-text",
            ].join(" ")}
            aria-selected={active}
            role="tab"
          >
            {name}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onAdd}
        disabled={adding}
        className="mb-1 ml-1 rounded-lg px-3 py-2 text-sm font-medium text-perfil-accent hover:bg-perfil-accent/10 disabled:opacity-50"
      >
        {adding ? "Adding…" : "+ New profile"}
      </button>
    </div>
  );
}
