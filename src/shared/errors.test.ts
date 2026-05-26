import { describe, expect, it } from "vitest";
import { sanitizeUserError } from "@/shared/errors";

describe("sanitizeUserError", () => {
  it("replaces service worker import errors", () => {
    const msg = "import() is disallowed on ServiceWorkerGlobalScope";
    expect(sanitizeUserError(msg)).not.toContain("import()");
  });
});
