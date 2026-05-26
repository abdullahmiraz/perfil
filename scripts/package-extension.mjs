/**
 * Production build + zip for sideloading or store upload.
 * Output: releases/perfil-<version>.zip (contents of dist/ at zip root)
 */
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
const outDir = join(root, "releases");
const zipPath = join(outDir, `perfil-${version}.zip`);

console.log(`Building Perfil v${version}…`);
execSync("npm run build", { cwd: root, stdio: "inherit" });

mkdirSync(outDir, { recursive: true });
try {
  rmSync(zipPath, { force: true });
} catch {
  /* ignore */
}

const dist = join(root, "dist");
if (process.platform === "win32") {
  const ps = [
    `Compress-Archive -Path "${dist}\\*"`,
    `-DestinationPath "${zipPath}"`,
    "-Force",
  ].join(" ");
  execSync(`powershell -NoProfile -Command "${ps}"`, { stdio: "inherit" });
} else {
  execSync(`cd "${dist}" && zip -r "${zipPath}" .`, { stdio: "inherit", shell: true });
}

console.log(`\n✓ Package ready: ${zipPath}`);
console.log("  Load unpacked: extract zip, then chrome://extensions → Load unpacked → folder");
console.log("  Or upload the zip to Chrome Web Store / Edge Add-ons (see docs/RELEASE.md)");
