import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const prodDir = join(root, ".output", "chrome-mv3");
const devDir = join(root, ".output", "chrome-mv3-dev");

console.log(`
Perfil — load the extension in Chrome
=====================================

Recommended (works without a dev server):
  Folder: ${prodDir}
  1. chrome://extensions → Developer mode ON
  2. Load unpacked → select the folder above
  3. Pin Perfil from the puzzle icon

Hot reload (dev server must stay running in this terminal):
  Command: npm run dev
  Folder:  ${devDir}
  Dev UI:  http://localhost:3000/test-form.html (only while npm run dev runs)
  Test form (production): open Options → "Open test form" in the footer

If you see WebSocket / localhost:3000 errors:
  You loaded the *-dev* build while "npm run dev" is stopped.
  Either keep "npm run dev" running, or load the production folder above.
`);

if (!existsSync(join(prodDir, "manifest.json"))) {
  console.error("Build output missing. Run: npm run build\n");
  process.exit(1);
}
