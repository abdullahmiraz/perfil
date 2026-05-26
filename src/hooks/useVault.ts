import { useCallback, useEffect, useState } from "react";
import { toErrorMessage } from "@/shared/errors";
import { getVaultStatus, sendMessage } from "@/shared/messages";
import type { VaultStatus } from "@/types/vault";

export interface UseVaultResult {
  status: VaultStatus;
  profileCount: number;
  loading: boolean;
  error: string | null;
  busy: boolean;
  refresh: () => Promise<void>;
  setup: (password: string) => Promise<boolean>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => Promise<void>;
  clearError: () => void;
}

export function useVault(): UseVaultResult {
  const [status, setStatus] = useState<VaultStatus>("uninitialized");
  const [profileCount, setProfileCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await getVaultStatus();
      setStatus(result.status);
      setProfileCount(result.profileCount);
    } catch (e) {
      setError(toErrorMessage(e, "Failed to load vault status"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setup = useCallback(
    async (password: string) => {
      setBusy(true);
      setError(null);
      try {
        const res = await sendMessage({ type: "SETUP", password });
        if (!res.ok) {
          setError(res.error ?? "Setup failed");
          return false;
        }
        await refresh();
        return true;
      } catch (e) {
        setError(toErrorMessage(e, "Setup failed"));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const unlock = useCallback(
    async (password: string) => {
      setBusy(true);
      setError(null);
      try {
        const res = await sendMessage({ type: "UNLOCK", password });
        if (!res.ok) {
          setError(res.error ?? "Unlock failed");
          return false;
        }
        await refresh();
        return true;
      } catch (e) {
        setError(toErrorMessage(e, "Unlock failed"));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const lock = useCallback(async () => {
    await sendMessage({ type: "LOCK" });
    await refresh();
  }, [refresh]);

  return {
    status,
    profileCount,
    loading,
    error,
    busy,
    refresh,
    setup,
    unlock,
    lock,
    clearError: () => setError(null),
  };
}
