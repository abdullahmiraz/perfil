import { readFileSync } from "node:fs";
import { defineConfig } from "wxt";

const { version, description } = JSON.parse(readFileSync("./package.json", "utf8")) as {
  version: string;
  description: string;
};

// https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  // Chrome 137+ may block --load-extension unless this flag is set (WXT #1713).
  webExt: {
    chromiumArgs: ["--disable-features=DisableLoadExtensionCommandLineSwitch"],
  },
  dev: {
    server: {
      port: 3000,
      host: "localhost",
    },
  },
  hooks: {
    "build:manifestGenerated": (_wxt, manifest) => {
      if (manifest.options_ui && typeof manifest.options_ui === "object") {
        manifest.options_ui.open_in_tab = true;
        // MV3 rejects chrome_style on options_ui (MV2 only).
        delete manifest.options_ui.chrome_style;
      }
    },
  },
  manifest: {
    name: "Perfil",
    version,
    description,
    permissions: ["storage", "activeTab", "scripting", "contextMenus"],
    host_permissions: ["<all_urls>"],
    icons: {
      16: "/icons/icon16.png",
      48: "/icons/icon48.png",
      128: "/icons/icon128.png",
    },
    action: {
      default_title: "Perfil",
    },
  },
  alias: {
    "@": "./src",
  },
});
