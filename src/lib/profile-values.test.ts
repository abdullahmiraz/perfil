import { describe, expect, it } from "vitest";
import { createProfile } from "@/lib/profile-defaults";
import { getProfileValueById, listProfileValues } from "@/lib/profile-values";

describe("profile-values", () => {
  it("lists only non-empty standard and custom fields", () => {
    const profile = createProfile("Work", { email: "a@b.com", firstName: "" });
    profile.customFields = [
      {
        id: "cf1",
        label: "Badge",
        type: "text",
        value: "42",
        order: 0,
      },
    ];
    const items = listProfileValues(profile);
    expect(items.some((i) => i.id === "email")).toBe(true);
    expect(items.some((i) => i.id === "firstName")).toBe(false);
    expect(items.some((i) => i.id === "custom:cf1")).toBe(true);
  });

  it("resolves values by id", () => {
    const profile = createProfile("Home", { email: "x@y.z" });
    expect(getProfileValueById(profile, "email")).toBe("x@y.z");
  });
});
