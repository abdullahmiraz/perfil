import type { Profile } from "@/types/profile";

export interface ProfileSidebarProps {
  profiles: Profile[];
  activeId: string;
  onSelect: (profile: Profile) => void;
}

export function ProfileSidebar({ profiles, activeId, onSelect }: ProfileSidebarProps) {
  return (
    <aside className="space-y-1">
      {profiles.map((profile) => (
        <button
          key={profile.id}
          type="button"
          onClick={() => onSelect(profile)}
          className={[
            "w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
            profile.id === activeId
              ? "bg-perfil-accent/15 text-perfil-accent"
              : "text-perfil-muted hover:bg-perfil-surface hover:text-perfil-text",
          ].join(" ")}
        >
          {profile.data.label || "Unnamed"}
        </button>
      ))}
    </aside>
  );
}
