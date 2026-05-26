import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Perfil",
  version: "0.1.0",
  description:
    "Fill web forms with your personal profiles — encrypted, local-only, no account required.",
  icons: {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png",
  },
  action: {
    default_popup: "src/popup/index.html",
    default_title: "Perfil",
  },
  options_page: "src/options/index.html",
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  permissions: ["storage", "activeTab", "scripting", "contextMenus"],
  host_permissions: [
    "<all_urls>",
    // Required for CRXJS dev service worker (Vite on :5173). Safe no-op when not using `npm run dev`.
    "http://127.0.0.1:5173/*",
    "http://localhost:5173/*",
  ],
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.ts"],
      run_at: "document_idle",
    },
  ],
});
