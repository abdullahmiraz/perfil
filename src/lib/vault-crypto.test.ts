import { beforeEach, describe, expect, it, vi } from "vitest";

const store: Record<string, unknown> = {};

vi.stubGlobal("chrome", {
  storage: {
    local: {
      get: vi.fn(async (key: string) => ({ [key]: store[key] })),
      set: vi.fn(async (obj: Record<string, unknown>) => {
        Object.assign(store, obj);
      }),
      remove: vi.fn(async (key: string | string[]) => {
        const keys = Array.isArray(key) ? key : [key];
        keys.forEach((k) => delete store[k]);
      }),
    },
    session: {
      get: vi.fn(async () => ({})),
      set: vi.fn(async () => {}),
      remove: vi.fn(async () => {}),
    },
  },
});

describe("vault-crypto", () => {
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
  });

  it("seals and opens with password", async () => {
    const { sealVault, openVaultWithPassword, isLegacyBlob } = await import("@/lib/vault-crypto");
    const { defaultVaultPayload } = await import("@/lib/profile-defaults");

    const payload = defaultVaultPayload();
    const sealed = await sealVault(payload, "test-password-xyz");
    expect(sealed.blob.encoding).toBe("v3");
    expect(isLegacyBlob(sealed.blob)).toBe(false);

    const opened = await openVaultWithPassword(sealed.blob, "test-password-xyz");
    expect(opened.payload.profiles).toEqual(payload.profiles);
  });

  it("rejects wrong password", async () => {
    const { sealVault, openVaultWithPassword } = await import("@/lib/vault-crypto");
    const { defaultVaultPayload } = await import("@/lib/profile-defaults");

    const sealed = await sealVault(defaultVaultPayload(), "correct-password");
    await expect(openVaultWithPassword(sealed.blob, "wrong-password")).rejects.toThrow(
      /master password/i,
    );
  });
});
