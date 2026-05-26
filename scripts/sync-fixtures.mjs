import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "fixtures/forms/contact-form.html");
const dest = join(root, "public/test-form.html");

mkdirSync(join(root, "public"), { recursive: true });
copyFileSync(src, dest);
console.log("Synced fixtures/forms/contact-form.html → public/test-form.html");
