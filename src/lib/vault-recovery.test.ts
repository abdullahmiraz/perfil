import { describe, expect, it } from "vitest";
import {
  isRecoveryAnswerValid,
  normalizeRecoveryAnswer,
  recoveryAnswerVerifier,
} from "@/lib/vault-recovery";

describe("vault-recovery", () => {
  it("normalizes answers case-insensitively", () => {
    expect(normalizeRecoveryAnswer("  Springfield  ")).toBe("springfield");
    expect(recoveryAnswerVerifier("Springfield")).toBe(recoveryAnswerVerifier("springfield"));
  });

  it("requires minimum answer length", () => {
    expect(isRecoveryAnswerValid("ab")).toBe(false);
    expect(isRecoveryAnswerValid("abc")).toBe(true);
  });
});
