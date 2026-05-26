const TAB_KEY = "perfil_options_tab";

export type OptionsTab = "profiles" | "settings";

/** Open the options page on a specific tab (profiles default). */
export async function openOptions(tab: OptionsTab = "profiles"): Promise<void> {
  await chrome.storage.session.set({ [TAB_KEY]: tab });
  await chrome.runtime.openOptionsPage();
}

/** Read and clear pending tab from popup → options navigation. */
export async function consumeOptionsTab(): Promise<OptionsTab | null> {
  const data = await chrome.storage.session.get(TAB_KEY);
  const tab = data[TAB_KEY];
  await chrome.storage.session.remove(TAB_KEY);
  if (tab === "profiles" || tab === "settings") return tab;
  return null;
}
