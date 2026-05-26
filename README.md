# Perfil

**Personal automated input fillers** — a browser extension that fills web forms with your saved profiles. Encrypted, local-only, no account required.

[![GitHub](https://img.shields.io/github/stars/abdullahmiraz/perfil?style=social)](https://github.com/abdullahmiraz/perfil)

---

## What it does

Perfil is **not** a password manager. It focuses on what password managers do poorly: **structured personal data** — name, email, phone, address, work info, links — on job applications, checkout flows, contact forms, and surveys.

1. You save one or more **profiles** in an encrypted local vault.
2. On any page with a form, click **Scan** or **Fill**.
3. Perfil reads field labels, `name`, `id`, `placeholder`, and `autocomplete` attributes, matches them to your profile, and fills values — including React/Vue forms.

**Core principles:** local-first · zero-knowledge vault (Phase 2: AES-256-GCM) · heuristic matching before AI · explicit user actions only.

---

## Status

| Phase | Scope | Status |
|-------|--------|--------|
| **1** | Extension scaffold, profiles UI, rule-based fill | ✅ Done |
| **2** | Custom fields, import/export, PIN, session unlock | ✅ Current |
| **3** | AES-GCM vault, PBKDF2 (real encryption) | Planned |
| **4** | Radio/checkbox/select/date, per-site overrides | Planned |
| **5** | Optional AI for low-confidence fields (BYOK) | Planned |

> **v0.1.0 note:** The vault uses local storage with a password verifier. **Phase 2** replaces this with full AES-256-GCM encryption via the Web Crypto API. Do not store highly sensitive data (government IDs, payment cards) until Phase 2 ships.

---

## Quick start

### Requirements

- [Node.js](https://nodejs.org/) 20+
- Google Chrome (Chromium 120+)

### Install & run

```bash
git clone https://github.com/abdullahmiraz/perfil.git
cd perfil
npm install
npm run dev
```

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist` folder created by `npm run dev`

### First use

1. Click the Perfil toolbar icon → **Create vault** (master password, min 8 chars).
2. **Manage profiles** → fill in your details → **Save**.
3. Open a page with a form → **Scan page** → **Fill page**.

---

## For AI agents & contributors

See **[AGENTS.md](./AGENTS.md)** — build commands, module map, and conventions (kept short to save context tokens).

## Development

### Full verification (recommended)

```bash
npm run verify
```

Runs typecheck, tests, build, and writes **`test-results/verification-report.html`** plus **`test-results/fill-demo.json`** with live API scan/fill results.

### Native tests (no browser)

```bash
npm test           # run once
npm run test:watch # watch mode
```

Programmatic API (same engine as extension):

```typescript
import { scanForm, fillForm, readFormValues } from "@/lib/fill-api";
```

### Live UI harness (real-time scan/fill)

```bash
npm run dev:harness
```

Opens **http://localhost:5173/dev-harness.html** — interactive form with Scan / Fill buttons and results tables (no extension required).

### Extension dev (load once, auto-reload)

```bash
npm run dev
```

1. Load **unpacked** extension from `dist/` **once** (`chrome://extensions` → Load unpacked).
2. Keep `npm run dev` running — CRXJS rebuilds and reloads the extension on file changes.
3. Refresh the **web page** you are testing (content scripts attach per navigation).

Optional manual form page (while `npm run dev` is running): open `http://localhost:5173/test-form.html`

```bash
npm run build      # Production build → dist/
npm run typecheck  # TypeScript check
```

### Project structure

```
src/
  background/     # Service worker — vault, messaging
  content/        # Injected on pages — scan & fill
  popup/          # Toolbar popup UI (React)
  options/        # Profile editor (React)
  lib/            # Field detector, matcher, fill engine, vault
  shared/         # Message types
  types/          # TypeScript models
```

### Tech stack

- **Manifest V3** browser extension
- **Vite + CRXJS** — build tooling
- **TypeScript** (strict)
- **React** — popup & options only
- **Tailwind CSS** — minimal dark UI
- **Web Crypto API** — encryption (Phase 2)

---

## Security model

| Topic | Approach |
|-------|----------|
| **Storage** | `chrome.storage.local` — encrypted blob only |
| **Passwords** | Not stored in Perfil (use a password manager) |
| **Network** | No profile data sent to servers in v0.1 |
| **Fill trigger** | User clicks Fill — no autonomous scraping |
| **Content script** | Receives profile only while vault is unlocked |

See [docs/SECURITY.md](docs/SECURITY.md) for details and threat model.

---

## How matching works

Perfil uses **deterministic rules**, not AI, in v0.1:

1. `autocomplete` attribute (highest confidence)
2. Field `name`, `id`, `placeholder`, associated `<label>`
3. Input `type` (`email`, `tel`)

Each profile field has regex patterns (e.g. `first-name`, `given-name` → `firstName`). Matches below the confidence threshold are skipped.

---

## Roadmap

- [ ] Phase 2: AES-256-GCM + PBKDF2 vault encryption
- [ ] Phase 2: Auto-lock, encrypted export/import
- [ ] Phase 3: `select`, radio, checkbox, date inputs
- [ ] Phase 3: Per-site field mapping overrides
- [ ] Phase 4: Optional AI assist (BYOK) for ambiguous fields only
- [ ] Firefox build (WXT or dual manifest)

---

## Contributing

Issues and PRs welcome at [github.com/abdullahmiraz/perfil](https://github.com/abdullahmiraz/perfil).

1. Fork the repo
2. Create a branch (`git checkout -b feature/my-change`)
3. Commit with a clear message
4. Open a PR

---

## License

MIT — see [LICENSE](LICENSE) (to be added).

---

## Related projects

Perfil sits between password managers and AI form fillers:

- Password managers ([1Password](https://1password.com), [Bitwarden](https://bitwarden.com)) — credentials, limited address profiles
- AI fillers ([Superfill.ai](https://github.com/superfill-ai/superfill.ai/), [Smart Fill](https://github.com/Al-Waleed-IT/smart-fill)) — flexible but API-dependent

**Perfil's niche:** secure, auditable, local personal-data autofill without sending your DOM to the cloud.
