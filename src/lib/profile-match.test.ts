import { describe, expect, it } from "vitest";
import { matchProfileField } from "@/lib/profile-match";
import { detectFields } from "@/lib/field-detector";
import { loadProfileFixture, mountFormFixture } from "../../test/helpers/fixtures";

describe("matchProfileField custom fields", () => {
  it("matches user-defined field label on page", () => {
    mountFormFixture("contact-with-eye-power");
    const profile = loadProfileFixture("custom-eye-power");

    const fields = detectFields();
    const eyeField = fields.find((f) => f.name === "eye_power");
    expect(eyeField).toBeDefined();
    const match = matchProfileField(eyeField!, profile);
    expect(match?.value).toBe("-2.5");
  });
});
