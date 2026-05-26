import { describe, expect, it } from "vitest";
import { mapPinSettingsError, validatePinForm } from "@/lib/form-errors";

describe("mapPinSettingsError", () => {
  it("maps master password errors to masterPassword field", () => {
    expect(mapPinSettingsError("Master password required to set PIN")).toEqual({
      masterPassword: "Master password required to set PIN",
    });
  });

  it("maps PIN format errors to pin field", () => {
    expect(mapPinSettingsError("PIN must be 4–8 digits")).toEqual({
      pin: "PIN must be 4–8 digits",
    });
  });
});

describe("validatePinForm", () => {
  it("requires both pin and master password", () => {
    expect(validatePinForm("", "")).toMatchObject({
      pin: expect.any(String),
      masterPassword: expect.any(String),
    });
  });
});
