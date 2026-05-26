import { draftStorageKey } from "@/lib/form-draft-core";
import type { SavedFormSnapshot } from "@/types/form-draft";

const SAVED_KEY = "perfil_saved_forms_v2";
const MAX_SAVES_PER_URL = 10;

function readAll(): Promise<SavedFormSnapshot[]> {
  return chrome.storage.local
    .get(SAVED_KEY)
    .then((r) => (r[SAVED_KEY] as SavedFormSnapshot[]) ?? []);
}

function writeAll(list: SavedFormSnapshot[]): Promise<void> {
  return chrome.storage.local.set({ [SAVED_KEY]: list });
}

export function pageUrlKey(url: string): string {
  return draftStorageKey(url);
}

export function formatSnapshotLabel(savedAt: number, fieldCount: number): string {
  const when = new Date(savedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${when} · ${fieldCount} field${fieldCount === 1 ? "" : "s"}`;
}

export async function listSavedForPage(pageUrl: string): Promise<SavedFormSnapshot[]> {
  const key = pageUrlKey(pageUrl);
  const all = await readAll();
  return all.filter((s) => pageUrlKey(s.pageUrl) === key).sort((a, b) => b.savedAt - a.savedAt);
}

export async function getSavedSnapshot(id: string): Promise<SavedFormSnapshot | null> {
  const all = await readAll();
  return all.find((s) => s.id === id) ?? null;
}

export async function addSavedSnapshot(
  pageUrl: string,
  fields: Record<string, string>,
): Promise<SavedFormSnapshot> {
  const fieldCount = Object.keys(fields).length;
  const snapshot: SavedFormSnapshot = {
    id: crypto.randomUUID(),
    pageUrl: pageUrl.split("#")[0] ?? pageUrl,
    label: formatSnapshotLabel(Date.now(), fieldCount),
    savedAt: Date.now(),
    fields,
  };

  const key = pageUrlKey(pageUrl);
  const all = await readAll();
  const samePage = all.filter((s) => pageUrlKey(s.pageUrl) === key);
  const other = all.filter((s) => pageUrlKey(s.pageUrl) !== key);
  const next = [snapshot, ...samePage].slice(0, MAX_SAVES_PER_URL);
  await writeAll([...other, ...next]);
  return snapshot;
}

export async function deleteSavedSnapshot(id: string): Promise<void> {
  const all = await readAll();
  await writeAll(all.filter((s) => s.id !== id));
}

export async function deleteAllForPage(pageUrl: string): Promise<void> {
  const key = pageUrlKey(pageUrl);
  const all = await readAll();
  await writeAll(all.filter((s) => pageUrlKey(s.pageUrl) !== key));
}
