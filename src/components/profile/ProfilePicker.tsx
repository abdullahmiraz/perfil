import { Select } from "@/components/ui/Select";
import type { Profile } from "@/types/profile";

export interface ProfilePickerProps {
  profiles: Profile[];
  value: string;
  onChange: (profileId: string) => void;
  compact?: boolean;
}

export function ProfilePicker({ profiles, value, onChange, compact }: ProfilePickerProps) {
  return (
    <Select
      label={compact ? undefined : "Profile"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={compact ? "min-w-0 max-w-full !py-1.5 text-xs" : undefined}
      options={profiles.map((p) => ({
        value: p.id,
        label: p.data.label || "Unnamed",
      }))}
    />
  );
}
