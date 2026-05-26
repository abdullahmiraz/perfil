import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";
import { fillForm, readFormValues, scanForm } from "@/lib/fill-api";
import { createProfile } from "@/lib/profile-defaults";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "../../test/fixtures");

describe("fill-api", () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement("div");
    root.innerHTML = readFileSync(join(fixtureDir, "contact-form.html"), "utf8");
    document.body.innerHTML = "";
    document.body.appendChild(root);
  });

  it("scanForm returns match rows with confidence", () => {
    const profile = createProfile("Test", {
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
    });

    const report = scanForm(profile, root);
    expect(report.fieldCount).toBeGreaterThanOrEqual(7);
    expect(report.matchCount).toBeGreaterThanOrEqual(3);

    const emailRow = report.rows.find((r) => r.fieldKey === "email");
    expect(emailRow?.willFill).toBe(true);
    expect(emailRow?.confidence).toBeGreaterThan(0.9);
  });

  it("fillForm fills DOM and report marks all rows filled", () => {
    const profile = createProfile("Test", {
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "555-0100",
      city: "London",
    });

    const report = fillForm(profile, root);
    expect(report.filled).toBeGreaterThanOrEqual(5);
    expect(report.rows.every((r) => r.filled)).toBe(true);

    const values = readFormValues(root);
    expect(values.firstName).toBe("Ada");
    expect(values.email).toBe("ada@example.com");
  });
});
