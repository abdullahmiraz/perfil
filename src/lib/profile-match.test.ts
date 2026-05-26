import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";
import { createCustomField } from "@/lib/custom-field";
import { matchProfileField } from "@/lib/profile-match";
import { detectFields } from "@/lib/field-detector";
import { createProfile } from "@/lib/profile-defaults";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "../../test/fixtures");

describe("matchProfileField custom fields", () => {
  beforeEach(() => {
    document.body.innerHTML = readFileSync(join(fixtureDir, "contact-form.html"), "utf8");
  });

  it("matches user-defined field label on page", () => {
    const extra = document.createElement("div");
    extra.innerHTML =
      '<label for="eyePower">Eye power</label><input id="eyePower" name="eye_power" />';
    document.body.appendChild(extra);

    const profile = createProfile("Test");
    profile.customFields = [
      { ...createCustomField("Eye power"), value: "-2.5", label: "Eye power" },
    ];

    const fields = detectFields();
    const eyeField = fields.find((f) => f.name === "eye_power");
    expect(eyeField).toBeDefined();
    const match = matchProfileField(eyeField!, profile);
    expect(match?.value).toBe("-2.5");
  });
});
