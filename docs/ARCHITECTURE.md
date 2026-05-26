# Architecture

See [AGENTS.md](../AGENTS.md) for agents. Commands and troubleshooting: [DEV.md](./DEV.md).

## Build

**[WXT](https://wxt.dev)** bundles `src/entrypoints/` (thin wrappers) plus `src/lib/`, `src/background/`, `src/content/`, React apps under `src/popup/` and `src/options/`.

## Data flow

```
Popup/Options (React) → sendMessage → Background (service worker) → Content script → DOM
                                          ↓
                                    src/lib/ (vault, fill)
```

## Module boundaries

- **UI** must not import `vault-service-core` directly
- **Content** must not import React or hooks
- **lib/** is shared; safe for content + background + tests
- **vault-crypto.ts** — AES-GCM; used only from `vault-service-core`

## Fixtures (test data)

| Location                   | Use                                                                   |
| -------------------------- | --------------------------------------------------------------------- |
| `fixtures/profiles/*.json` | Sample profiles — never paste large data into `.tsx`                  |
| `fixtures/forms/*.html`    | HTML forms; `npm run sync:fixtures` copies to `public/test-form.html` |
| `test/helpers/fixtures.ts` | Load fixtures in Vitest                                               |
| `tools/harness/`           | Interactive fill API UI (`npm run dev:harness`)                       |

Field labels live in `src/shared/profile-fields.ts` only.

## Types

| File                | Contents                        |
| ------------------- | ------------------------------- |
| `types/profile.ts`  | Profile, ProfileData            |
| `types/vault.ts`    | VaultStatus, EncryptedVaultBlob |
| `types/messages.ts` | Extension message map           |
| `types/fill.ts`     | FillResult, SerializableField   |
| `types/content.ts`  | Content script messages         |
