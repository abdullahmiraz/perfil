import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { fillForm, readFormValues, scanForm } from "@/lib/fill-api";
import { loadProfileFixture, mountFormFixture } from "../../test/helpers/fixtures";

/** Writes human-readable API demo output for verification reports. */
describe("fill-api demo output", () => {
  it("writes test-results/fill-demo.json", () => {
    const root = mountFormFixture("contact-form");
    const profile = loadProfileFixture("demo");

    const scan = scanForm(profile, root);
    const fill = fillForm(profile, root);
    const values = readFormValues(root);

    mkdirSync(join(process.cwd(), "test-results"), { recursive: true });
    writeFileSync(
      join(process.cwd(), "test-results/fill-demo.json"),
      JSON.stringify({ profile: profile.data, scan, fill, valuesAfterFill: values }, null, 2),
    );
  });
});
