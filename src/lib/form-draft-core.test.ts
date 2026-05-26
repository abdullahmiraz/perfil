import { describe, expect, it } from "vitest";
import { draftStorageKey, fieldStorageKey } from "@/lib/form-draft-core";
import type { SerializableField } from "@/types/fill";

describe("form-draft-core", () => {
  it("keys by exact page URL without hash", () => {
    const url = "https://mygov.usa.gov/test/form/1?x=1#section";
    expect(draftStorageKey(url)).toBe("https://mygov.usa.gov/test/form/1?x=1");
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
