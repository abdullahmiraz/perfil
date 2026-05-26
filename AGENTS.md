# AGENTS.md — Perfil

> Instructions for AI coding agents. Keep this file updated when architecture or commands change.

## Project

**Perfil** — Chrome MV3 extension for **local, secure personal-data form autofill** (not passwords).

| Layer       | Path                         | Role                                               |
| ----------- | ---------------------------- | -------------------------------------------------- |
| Entrypoints | `src/entrypoints/`           | WXT wrappers (popup, options, background, content) |
| Background  | `src/background/`            | Vault, messaging, tab bridge                       |
| Content     | `src/content/`               | Scan/fill DOM (vanilla TS, no React)               |
| UI          | `src/popup/`, `src/options/` | React apps (imported from entrypoints)             |
| Core logic  | `src/lib/`                   | Matcher, fill engine, `vault-crypto.ts`            |
| Shared UI   | `src/components/`            | Reusable React components                          |
| Hooks       | `src/hooks/`                 | `useVault`, `useProfiles`, `useFillActions`        |
| Types       | `src/types/`                 | Split by domain — import from `@/types`            |

## Commands (run before marking work done)

```bash
npm run verify       # format check + typecheck + test + build + report
npm run format       # Prettier — write (run before commit if editor has no format-on-save)
npm run format:check # Prettier — CI-style check only
npm test             # native tests — prefer this over manual browser checks
npm run typecheck
npm run build
npm run package      # build + releases/perfil-<version>.zip
npm run dev:harness  # fill API UI at tools/harness (http://localhost:5173)
```

Formatting: **Prettier** + **EditorConfig** (`.prettierrc` → `prettier.config.mjs`). Use LF line endings. Tailwind class order is sorted via `prettier-plugin-tailwindcss`.

Release / sideload / store upload: **`docs/RELEASE.md`**

Build output: **`.output/chrome-mv3`** (production, no dev server) or **`.output/chrome-mv3-dev`** (requires `npm run dev` running).

```bash
npm run start        # build + print load path (recommended for manual testing)
npm run dev          # HMR — must keep terminal open; load chrome-mv3-dev
npm run build:firefox  # .output/firefox-mv2
```

WebSocket `localhost:3000` errors = dev build loaded while `npm run dev` is stopped. See **docs/DEV.md**.

Dev / troubleshooting: **`docs/DEV.md`**

Manual form page (with `npm run dev`): WXT dev server — see terminal for URL + `/test-form.html`  
Fill harness (no extension): `npm run dev:harness` → `http://localhost:5173/`

## Conventions

### Do

- Put **sample / test data** in `fixtures/` — see `docs/ARCHITECTURE.md` (fixtures section)
- Load fixtures via `test/helpers/fixtures.ts` (tests) or `profileFromFixture()` (runtime)
- Add UI via `src/components/` — reuse `Button`, `Input`, `Panel`, etc.
- Put new types in `src/types/<domain>.ts`, re-export from `src/types/index.ts`
- Put profile field labels/groups in `src/shared/profile-fields.ts` only
- Keep content script **framework-free** (no React in `src/content/`)
- Use `sendMessage` from `@/shared/messages` in UI; never access `chrome.storage` from popup/options for secrets
- Run `npm test` after changes to `src/lib/`
- Run `npm run format` (or format-on-save) so CI `format:check` passes

### Do not

- Store passwords, payment cards, or government IDs in profiles
- Add network calls for profile data without explicit user opt-in
- Put business logic in `App.tsx` files — use hooks + `src/lib/`
- Duplicate field label maps or message types
- Embed profile or form **values** as large constants in `.ts` / `.tsx`
- Change vault crypto parameters without security review

## Message protocol

Background handler: `src/background/index.ts`  
Types: `src/types/messages.ts` (request/response map)  
Content types: `src/types/content.ts`

```typescript
// UI → background
await sendMessage({ type: "FILL_ACTIVE_TAB", profileId?: string });
```

## Testing strategy (token-efficient)

1. **Unit tests** (`src/lib/*.test.ts`, `happy-dom`) — field matcher, fill engine, vault
2. **Typecheck** — catches message/type drift
3. **Browser** — only for extension wiring/HMR verification

Fixtures: `fixtures/profiles/*.json`, `fixtures/forms/*.html` — run `npm run sync:fixtures` for `public/test-form.html`

Programmatic API (no extension): `src/lib/fill-api.ts` — `scanForm()`, `fillForm()`, `readFormValues()`

## Security notes

- Vault in background only; content script receives profile only while unlocked
- v3 vault is AES-GCM; legacy base64 migrates on unlock — see `docs/SECURITY.md`
- Permissions: `storage`, `activeTab`, `scripting`, `<all_urls>`

## File map (quick navigation)

```
src/types/profile.ts      Profile, ProfileData, ProfileFieldKey
src/types/messages.ts     MessageRequest, MessageResponses
src/lib/fill-engine.ts    fillPage(), scanPage()
src/lib/field-matcher.ts  matchField()
src/lib/vault-service-core.ts  VaultService class
src/hooks/useVault.ts     popup/options vault state
src/components/           reusable UI
```

## Roadmap context

See **ROADMAP.md**, **docs/MARKET.md**, **docs/DEV.md**. Next practical work: **P6 checkbox/radio fill**, then **P7 store listing**. Do not start AI/BYOK unless explicitly requested.
