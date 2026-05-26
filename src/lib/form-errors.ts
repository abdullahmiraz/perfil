/** Maps API / validation errors to the form field that caused them. */
export type PinSettingsField = "pin" | "masterPassword";

export interface FieldErrorMap {
  pin?: string;
  masterPassword?: string;
  _form?: string;
}

const MASTER_PASSWORD_PATTERNS = [
  /master password/i,
  /incorrect master/i,
  /vault locked/i,
];

const PIN_PATTERNS = [/pin must/i, /incorrect pin/i];

export function mapPinSettingsError(error: string): FieldErrorMap {
  const trimmed = error.trim();
  if (!trimmed) return {};

  if (MASTER_PASSWORD_PATTERNS.some((p) => p.test(trimmed))) {
    return { masterPassword: trimmed };
  }
  if (PIN_PATTERNS.some((p) => p.test(trimmed)) || trimmed.toLowerCase().includes("pin")) {
    if (trimmed.toLowerCase().includes("master")) {
      return { masterPassword: trimmed };
    }
    return { pin: trimmed };
  }
  return { _form: trimmed };
}

export function validatePinForm(pin: string, masterPassword: string): FieldErrorMap {
  const errors: FieldErrorMap = {};
  if (!/^\d{4,8}$/.test(pin)) {
    errors.pin = "PIN must be 4–8 digits";
  }
  if (!masterPassword.trim()) {
    errors.masterPassword = "Enter your master password to confirm";
  }
  return errors;
}
