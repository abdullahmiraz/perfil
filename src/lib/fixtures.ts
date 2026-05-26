import { createCustomField } from "@/lib/custom-field";
import { createProfile } from "@/lib/profile-defaults";
import type { Profile } from "@/types/profile";
import type { ProfileFixture } from "@/types/fixtures";

/** Build a runtime Profile from a JSON fixture (dev harness, seeds). */
export function profileFromFixture(fixture: ProfileFixture): Profile {
  const profile = createProfile(fixture.label, fixture.data);

  profile.customFields = (fixture.customFields ?? []).map((cf, index) => ({
    ...createCustomField(cf.label, cf.type),
    label: cf.label,
    type: cf.type,
    value: cf.value,
    options: cf.options,
    order: index,
  }));

  return profile;
}
