import { beforeEach, describe, expect, it } from "vitest";
import { fillForm, readFormValues, scanForm } from "@/lib/fill-api";
import { loadProfileFixture, mountFormFixture } from "../../test/helpers/fixtures";

describe("fill-api", () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = mountFormFixture("contact-form");
  });

  it("scanForm returns match rows with confidence", () => {
    const profile = loadProfileFixture("contact-minimal");
    const report = scanForm(profile, root);
    expect(report.fieldCount).toBeGreaterThanOrEqual(7);
    expect(report.matchCount).toBeGreaterThanOrEqual(3);

    const emailRow = report.rows.find((r) => r.fieldKey === "email");
    expect(emailRow?.willFill).toBe(true);
    expect(emailRow?.confidence).toBeGreaterThan(0.9);
  });

  it("fillForm fills DOM and report marks all rows filled", () => {
    const profile = loadProfileFixture("contact-full");
    const report = fillForm(profile, root);
    expect(report.filled).toBeGreaterThanOrEqual(5);
    expect(report.rows.every((r) => r.filled)).toBe(true);

    const values = readFormValues(root);
    expect(values.firstName).toBe("Ada");
    expect(values.email).toBe("ada@example.com");
  });
});
