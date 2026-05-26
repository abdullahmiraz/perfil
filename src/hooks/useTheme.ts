import { useCallback, useEffect, useState } from "react";
import {
  applyTheme,
  getStoredTheme,
  setStoredTheme,
  watchSystemTheme,
  type UiTheme,
} from "@/lib/theme";

export function useTheme() {
  const [theme, setTheme] = useState<UiTheme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void getStoredTheme().then((t) => {
      applyTheme(t);
      setTheme(t);
      watchSystemTheme(t);
      setReady(true);
    });
  }, []);

  const changeTheme = useCallback(async (next: UiTheme) => {
    await setStoredTheme(next);
    setTheme(next);
    watchSystemTheme(next);
  }, []);

  return { theme, changeTheme, ready };
}
