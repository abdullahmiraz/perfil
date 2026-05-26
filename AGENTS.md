# AGENTS.md — Perfil

> Instructions for AI coding agents. Keep this file updated when architecture or commands change.

## Project

**Perfil** — Chrome MV3 extension for **local, secure personal-data form autofill** (not passwords).

| Layer | Path | Role |
|-------|------|------|
| Background | `src/background/` | Vault, messaging, tab bridge |
| Content | `src/content/` | Scan/fill DOM (vanilla TS, no React) |
| UI | `src/popup/`, `src/options/` | React — thin shells only |
| Core logic | `src/lib/` | Matcher, fill engine, `vault-crypto.ts` |
| Shared UI | `src/components/` | Reusable React components |
| Hooks | `src/hooks/` | `useVault`, `useProfiles`, `useFillActions` |
| Types | `src/types/` | Split by domain — import from `@/types` |

## Commands (run before marking work done)

```bash
npm run verify    # typecheck + test + build + write test-results/report
npm test          # native tests — prefer this over manual browser checks
npm run typecheck
npm run build
npm run package   # build + releases/perfil-<version>.zip
npm run dev:harness  # live scan/fill UI at /dev-harness.html
```

Release / sideload / store upload: **`docs/RELEASE.md`**

Dev extension (load `dist/` **once**, then keep `npm run dev` running for HMR):

```bash
npm run dev
```

Manual form page: `http://localhost:5173/test-form.html`

## Conventions

### Do

- Put **sample / test data** in `fixtures/` (JSON profiles, HTML forms) — see `docs/DATA.md`
- Load fixtures via `test/helpers/fixtures.ts` (tests) or `profileFromFixture()` (runtime)
- Add UI via `src/components/` — reuse `Button`, `Input`, `Panel`, etc.
- Put new types in `src/types/<domain>.ts`, re-export from `src/types/index.ts`
- Put profile field labels/groups in `src/shared/profile-fields.ts` only
- Keep content script **framework-free** (no React in `src/content/`)
- Use `sendMessage` from `@/shared/messages` in UI; never access `chrome.storage` from popup/options for secrets
- Run `npm test` after changes to `src/lib/`

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

See **ROADMAP.md** and **docs/MARKET.md**. Next practical work: **P6 checkbox/radio fill**, then **P7 store listing**. Do not start AI/BYOK unless explicitly requested.
