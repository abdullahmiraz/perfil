import { describe, expect, it } from "vitest";
import type { SerializableField } from "@/types/fill";
import { matchField } from "@/lib/field-matcher";
import { emptyProfileData } from "@/lib/profile-defaults";

function field(partial: Partial<SerializableField>): SerializableField {
  return {
    index: 0,
    tag: "input",
    type: "text",
    autocomplete: "",
    name: "",
    id: "",
    placeholder: "",
    label: "",
    hints: "",
    ...partial,
  };
}

describe("matchField", () => {
  const data = {
    ...emptyProfileData("Test"),
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    phone: "+1 555 0100",
    city: "London",
  };

  it("matches autocomplete given-name", () => {
    const m = matchField(field({ autocomplete: "given-name", hints: "x" }), data);
    expect(m?.fieldKey).toBe("firstName");
    expect(m?.confidence).toBeGreaterThan(0.9);
  });

  it("matches email input type", () => {
    const m = matchField(field({ type: "email", hints: "user_email" }), data);
    expect(m?.fieldKey).toBe("email");
  });

  it("does not map first name field to fullName", () => {
    const m = matchField(
      field({
        name: "firstName",
        id: "firstName",
        label: "First name",
        hints: "first name firstname",
      }),
      data,
    );
    expect(m?.fieldKey).toBe("firstName");
  });

  it("matches postal code hints", () => {
    const m = matchField(
      field({ name: "zip", placeholder: "ZIP / Postal code", hints: "zip postal code" }),
      { ...data, postalCode: "SW1A 1AA" },
    );
    expect(m?.fieldKey).toBe("postalCode");
  });
});
