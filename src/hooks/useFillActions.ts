import { useCallback, useState } from "react";
import { toErrorMessage } from "@/shared/errors";
import { sendMessage } from "@/shared/messages";

export interface UseFillActionsResult {
  busy: boolean;
  error: string | null;
  info: string | null;
  scan: () => Promise<void>;
  fill: (profileId?: string) => Promise<void>;
  clearMessages: () => void;
}

export function useFillActions(): UseFillActionsResult {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const scan = useCallback(async () => {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await sendMessage({ type: "SCAN_ACTIVE_TAB" });
      if (res.error) {
        setError(res.error);
        return;
      }
      setInfo(`Found ${res.fields} fillable field(s) on this page`);
    } catch (e) {
      setError(toErrorMessage(e, "Scan failed"));
    } finally {
      setBusy(false);
    }
  }, []);

  const fill = useCallback(async (profileId?: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await sendMessage({
        type: "FILL_ACTIVE_TAB",
        profileId,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.result) {
        setInfo(`Filled ${res.result.filled} field(s), skipped ${res.result.skipped}`);
      }
    } catch (e) {
      setError(toErrorMessage(e, "Fill failed"));
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    busy,
    error,
    info,
    scan,
    fill,
    clearMessages: () => {
      setError(null);
      setInfo(null);
    },
  };
}
