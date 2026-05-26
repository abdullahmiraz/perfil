import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";
import { fillPage } from "@/lib/fill-engine";
import { createProfile } from "@/lib/profile-defaults";

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), "../../test/fixtures");

describe("fillPage", () => {
  beforeEach(() => {
    document.body.innerHTML = readFileSync(join(fixtureDir, "contact-form.html"), "utf8");
  });

  it("fills standard contact form fields", () => {
    const profile = createProfile("Personal", {
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "555-0100",
      company: "Analytical Engines",
      city: "London",
      country: "UK",
    });

    const result = fillPage(profile, 0.5);
    expect(result.filled).toBeGreaterThanOrEqual(5);

    expect((document.querySelector("#firstName") as HTMLInputElement).value).toBe("Ada");
    expect((document.querySelector("#lastName") as HTMLInputElement).value).toBe("Lovelace");
    expect((document.querySelector("#email") as HTMLInputElement).value).toBe("ada@example.com");
    expect((document.querySelector("#phone") as HTMLInputElement).value).toBe("555-0100");
    expect((document.querySelector("#city") as HTMLInputElement).value).toBe("London");
  });
});
