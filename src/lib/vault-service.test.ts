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
  },
});

describe("VaultService", () => {
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    vi.resetModules();
  });

  it("setup, lock, unlock preserves profiles", async () => {
    const { VaultService } = await import("@/lib/vault-service-core");
    const vault = new VaultService();
    await vault.whenReady();

    expect((await vault.setup("test-password-123")).ok).toBe(true);
    expect(vault.getProfiles()).toHaveLength(1);

    await vault.lock();
    expect(vault.isUnlocked()).toBe(false);
    expect((await vault.unlock("wrong")).ok).toBe(false);

    const good = await vault.unlock("test-password-123");
    expect(good.ok).toBe(true);
    expect(vault.getProfiles()[0]?.data.label).toBe("Personal");
  });
});
