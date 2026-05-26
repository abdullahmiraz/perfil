import type { EncryptedVaultBlob } from "@/types/vault";

const VAULT_KEY = "perfil_vault";

export async function loadEncryptedVault(): Promise<EncryptedVaultBlob | null> {
  const result = await chrome.storage.local.get(VAULT_KEY);
  const blob = result[VAULT_KEY] as EncryptedVaultBlob | undefined;
  return blob ?? null;
}

export async function saveEncryptedVault(blob: EncryptedVaultBlob): Promise<void> {
  await chrome.storage.local.set({ [VAULT_KEY]: blob });
}

export async function clearVault(): Promise<void> {
  await chrome.storage.local.remove(VAULT_KEY);
}

export async function vaultExists(): Promise<boolean> {
  const blob = await loadEncryptedVault();
  return blob !== null;
}
