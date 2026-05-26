/** Send a message to a tab, injecting the content script if it is not loaded yet. */
export async function sendTabMessage<T>(tabId: number, message: unknown): Promise<T> {
  try {
    return (await chrome.tabs.sendMessage(tabId, message)) as T;
  } catch {
    await injectContentScripts(tabId);
    return (await chrome.tabs.sendMessage(tabId, message)) as T;
  }
}

async function injectContentScripts(tabId: number): Promise<void> {
  const scripts = chrome.runtime.getManifest().content_scripts?.[0]?.js;
  if (!scripts?.length) {
    throw new Error("Content script not registered in manifest");
  }
  await chrome.scripting.executeScript({
    target: { tabId },
    files: scripts,
  });
}

export function isRestrictedUrl(url?: string): boolean {
  if (!url) return true;
  return (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("devtools://")
  );
}
