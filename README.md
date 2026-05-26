# Perfil

**Personal automated input fillers** — a browser extension that fills web forms with your saved profiles. Encrypted, local-only, no account required.

[![GitHub](https://img.shields.io/github/stars/abdullahmiraz/perfil?style=social)](https://github.com/abdullahmiraz/perfil)

---

## What it does

Perfil is **not** a password manager. It focuses on what password managers do poorly: **structured personal data** — name, email, phone, address, work info, links — on job applications, checkout flows, contact forms, and surveys.

1. You save one or more **profiles** in an encrypted local vault.
2. On any page with a form, click **Scan** or **Fill**.
3. Perfil reads field labels, `name`, `id`, `placeholder`, and `autocomplete` attributes, matches them to your profile, and fills values — including React/Vue forms.

**Core principles:** local-first · AES-256-GCM vault · heuristic matching before AI · explicit user actions only.

---

## Status

| Phase | Scope | Status |
|-------|--------|--------|
| **1–2** | Profiles, custom fields, import/export, PIN, form memory | ✅ Done |
| **3** | AES-256-GCM vault + recovery | ✅ **v0.3.0** |
| **4** | Checkbox/radio/date fill coverage | 🔜 Next |
| **5** | Chrome Web Store listing | Planned |

> **Security:** Vault data is encrypted with AES-256-GCM (PBKDF2). Still avoid payment cards and government IDs. Use a password manager for site logins. See [docs/SECURITY.md](docs/SECURITY.md).

> Full checklist: **[ROADMAP.md](ROADMAP.md)** · Market position: **[docs/MARKET.md](docs/MARKET.md)**

---

## Download & install

| Method | Who | Steps |
|--------|-----|--------|
| **GitHub Release** | End users | [Releases](https://github.com/abdullahmiraz/perfil/releases) → download `perfil-x.y.z.zip` → extract → [load unpacked](docs/RELEASE.md#install-from-a-zip) |
| **From source** | Developers | Clone repo → `npm install` → `npm run package` → load `dist/` or use the zip in `releases/` |

Full guide (Chrome, Edge, Brave, store publishing): **[docs/RELEASE.md](docs/RELEASE.md)**

---

## Quick start (development)

### Requirements

- [Node.js](https://nodejs.org/) 20+
- Google Chrome or Edge (Chromium 120+)

### Install & run

```bash
git clone https://github.com/abdullahmiraz/perfil.git
cd perfil
npm install
npm run dev
```

### Load in Chrome

**Option A — Development (hot reload)**  
Keep `npm run dev` running in a terminal, then:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the `dist` folder
4. After code changes, click **Reload** on the extension card (or save a file — Vite rebuilds)

**Option B — Standalone build (no dev server)**  
Stop `npm run dev`, then:

```bash
npm run build
```

Load the same `dist` folder. The service worker uses bundled files (not localhost).

### Service worker error (status code 3)?

Usually means Chrome could not load the background script:

1. **Dev mode:** `npm run dev` must be running on port **5173** before you load/reload the extension.
2. **Stale `dist/`:** Run `npm run build` (with dev stopped) OR restart `npm run dev` and reload the extension.
3. On `chrome://extensions`, click **Errors** under Perfil for the exact line.

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
npm run package    # build + releases/perfil-<version>.zip
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

## Roadmap (summary)

- [x] AES-256-GCM vault (v0.3.0)
- [ ] Checkbox / radio / date fill (v0.3.1)
- [ ] Chrome Web Store listing
- [ ] Per-site overrides (if needed)
- [ ] Firefox (later)

See **[ROADMAP.md](ROADMAP.md)** for the full table.

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
