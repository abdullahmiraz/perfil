import { mkdirSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { fillForm, readFormValues, scanForm } from "@/lib/fill-api";
import { createProfile } from "@/lib/profile-defaults";

/** Writes human-readable API demo output for verification reports. */
describe("fill-api demo output", () => {
  it("writes test-results/fill-demo.json", () => {
    const root = document.createElement("div");
    root.innerHTML = readFileSync(
      join(process.cwd(), "test/fixtures/contact-form.html"),
      "utf8",
    );
    document.body.innerHTML = "";
    document.body.appendChild(root);

    const profile = createProfile("Demo", {
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "+1 555 0100",
      company: "Analytical Engines",
      city: "London",
      country: "United Kingdom",
    });

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
