import { profileFromFixture } from "@/lib/fixtures";
import type { ProfileFixture } from "@/types/fixtures";
import personalDefault from "../../fixtures/profiles/personal-default.json";

/** First profile created on vault setup — seeded from fixtures/profiles/personal-default.json */
export function createDefaultPersonalProfile() {
  return profileFromFixture(personalDefault as ProfileFixture);
}
