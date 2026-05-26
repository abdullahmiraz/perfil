import { Select } from "@/components/ui/Select";
import type { Profile } from "@/types/profile";

export interface ProfilePickerProps {
  profiles: Profile[];
  value: string;
  onChange: (profileId: string) => void;
}

export function ProfilePicker({ profiles, value, onChange }: ProfilePickerProps) {
  return (
    <Select
      label="Profile"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={profiles.map((p) => ({
        value: p.id,
        label: p.data.label || "Unnamed",
      }))}
    />
  );
}
