import { describe, expect, it } from "vitest";
import { draftStorageKey, fieldStorageKey } from "@/lib/form-draft-core";
import type { SerializableField } from "@/types/fill";

describe("form-draft-core", () => {
  it("keys by domain or full url", () => {
    const url = "https://gov.example/apply/step-2?x=1#section";
    expect(draftStorageKey(url, "domain")).toBe("gov.example");
    expect(draftStorageKey(url, "url")).toBe("https://gov.example/apply/step-2?x=1");
  });

  it("builds stable field keys", () => {
    const field = {
      index: 3,
      name: "email",
      id: "",
    } as SerializableField;
    expect(fieldStorageKey(field)).toBe("name:email");
  });
});
