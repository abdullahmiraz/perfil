const INTERNAL_PATTERNS = [/import\(\) is disallowed/i, /ServiceWorkerGlobalScope/i];

export function sanitizeUserError(message: string): string {
  if (INTERNAL_PATTERNS.some((p) => p.test(message))) {
    return "Unlock failed due to an extension error. Reload the extension at chrome://extensions and try again.";
  }
  return message;
}

export function toErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  const raw = error instanceof Error ? error.message : fallback;
  return sanitizeUserError(raw);
}
