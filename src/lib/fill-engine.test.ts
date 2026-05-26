import { beforeEach, describe, expect, it } from "vitest";
import { fillPage } from "@/lib/fill-engine";
import { loadProfileFixture, mountFormFixture } from "../../test/helpers/fixtures";

describe("fillPage", () => {
  beforeEach(() => {
    mountFormFixture("contact-form");
  });

  it("fills standard contact form fields", () => {
    const profile = loadProfileFixture("contact-full");
    const result = fillPage(profile, 0.5);
    expect(result.filled).toBeGreaterThanOrEqual(5);

    expect((document.querySelector("#firstName") as HTMLInputElement).value).toBe("Ada");
    expect((document.querySelector("#lastName") as HTMLInputElement).value).toBe("Lovelace");
    expect((document.querySelector("#email") as HTMLInputElement).value).toBe("ada@example.com");
    expect((document.querySelector("#phone") as HTMLInputElement).value).toBe("555-0100");
    expect((document.querySelector("#city") as HTMLInputElement).value).toBe("London");
  });
});
