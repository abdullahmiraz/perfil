/** Built-in extension pages (bundled in public/ → extension root). */

export function getTestFormPageUrl(): string {
  return chrome.runtime.getURL("/test-form.html");
}

export function getOptionsPageUrl(): string {
  return chrome.runtime.getURL("/options.html");
}
