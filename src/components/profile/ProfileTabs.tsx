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
    <div
      className="flex flex-wrap items-end gap-0.5 border-b border-perfil-border"
      role="tablist"
      aria-label="Profiles"
    >
      {profiles.map((profile) => {
        const active = profile.id === activeId;
        const name = profile.data.label?.trim() || "Unnamed";
        return (
          <button
            key={profile.id}
            type="button"
            onClick={() => onSelect(profile)}
            className={[
              "relative -mb-px rounded-t-md px-3 py-1.5 text-xs font-medium transition-all",
              active
                ? "border border-perfil-border border-b-perfil-bg bg-perfil-accent text-white shadow-sm"
                : "hover:bg-perfil-surface/80 border border-transparent text-perfil-muted hover:text-perfil-text",
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
        className="hover:bg-perfil-accent/10 mb-0.5 ml-0.5 rounded-md px-2 py-1 text-xs font-medium text-perfil-accent disabled:opacity-50"
      >
        {adding ? "Adding…" : "+ New"}
      </button>
    </div>
  );
}
