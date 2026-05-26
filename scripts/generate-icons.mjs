import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

/** 16×16 blue PNG */
const PNG_16 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHUlEQVR42mNk+M9QzzRgGIgBEAwMDAwMDAwMDAwMDAwAAGQAAf6n8k8AAAAASUVORK5CYII=",
  "base64",
);

for (const size of [16, 48, 128]) {
  writeFileSync(join(outDir, `icon${size}.png`), PNG_16);
}

console.log("Generated placeholder icons in public/icons/");
