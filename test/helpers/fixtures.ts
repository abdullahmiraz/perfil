import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { profileFromFixture } from "@/lib/fixtures";
import type { Profile } from "@/types/profile";
import type { ProfileFixture } from "@/types/fixtures";

const FIXTURES_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../fixtures");

function readJson<T>(relativePath: string): T {
  const text = readFileSync(join(FIXTURES_ROOT, relativePath), "utf8");
  return JSON.parse(text) as T;
}

/** Load `fixtures/profiles/{name}.json` as a Profile. */
export function loadProfileFixture(name: string): Profile {
  return profileFromFixture(readJson<ProfileFixture>(`profiles/${name}.json`));
}

/** Load `fixtures/forms/{name}.html` into a container element. */
export function mountFormFixture(name: string, container?: HTMLElement): HTMLElement {
  const html = readFileSync(join(FIXTURES_ROOT, `forms/${name}.html`), "utf8");
  const root = container ?? document.createElement("div");
  root.innerHTML = html;
  if (!container) {
    document.body.innerHTML = "";
    document.body.appendChild(root);
  }
  return root;
}
