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

| Phase   | Scope                                                    | Status        |
| ------- | -------------------------------------------------------- | ------------- |
| **1–2** | Profiles, custom fields, import/export, PIN, form memory | ✅ Done       |
| **3**   | AES-256-GCM vault + recovery                             | ✅ v0.3.0     |
| **3b**  | WXT build, options UI, Prettier                          | ✅ **v0.3.1** |
| **4**   | Checkbox/radio/date fill coverage                        | 🔜 Next       |
| **5**   | Chrome Web Store listing                                 | Planned       |

> **Security:** Vault data is encrypted with AES-256-GCM (PBKDF2). Still avoid payment cards and government IDs. Use a password manager for site logins. See [docs/SECURITY.md](docs/SECURITY.md).

> Checklist: **[ROADMAP.md](ROADMAP.md)** · Dev/troubleshooting: **[docs/DEV.md](docs/DEV.md)** · Market: **[docs/MARKET.md](docs/MARKET.md)**

---

## Download & install

| Method             | Who        | Steps                                                                                                                                                      |
| ------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GitHub Release** | End users  | [Releases](https://github.com/abdullahmiraz/perfil/releases) → download `perfil-x.y.z.zip` → extract → [load unpacked](docs/RELEASE.md#install-from-a-zip) |
| **From source**    | Developers | Clone repo → `npm install` → `npm run package` → load `.output/chrome-mv3` or use the zip in `releases/`                                                   |

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
npm run start
```

`npm run start` builds and prints the folder to load on `chrome://extensions` → **Load unpacked** → **`.output/chrome-mv3`**. This works **without** keeping a dev server running.

### Hot reload (optional)

```bash
npm run dev
```

Leave this terminal **open**. Load **`.output/chrome-mv3-dev`**. Popup scripts are served from `http://localhost:3000` — if you stop `npm run dev`, the popup will be blank and you will see WebSocket errors.

See **[docs/DEV.md](docs/DEV.md)** if the extension does not open.

### Service worker error (status code 3)?

1. Prefer **`npm run start`** and load **`.output/chrome-mv3`** (not `chrome-mv3-dev`).
2. If using **`npm run dev`**, keep the terminal running.
3. Check **Errors** on `chrome://extensions` for Perfil.

### First use

1. Click the Perfil toolbar icon → **Create vault** (master password, min 8 chars).
2. **Manage profiles** → fill in your details → **Save**.
3. Open a page with a form → **Scan page** → **Fill page**.

### Options page (profiles & settings)

Open via the popup **Edit** / gear icon, or `chrome-extension://…/options.html`.

| Area         | What you can do                                                 |
| ------------ | --------------------------------------------------------------- |
| **Profiles** | Multiple profiles, compact editor, **Duplicate**, custom fields |
| **Settings** | Theme, default profile, auto-lock & PIN, recovery, JSON backup  |

---

## For AI agents & contributors

See **[AGENTS.md](./AGENTS.md)** — build commands, module map, and conventions.

## Development

### Full verification (recommended)

```bash
npm run verify
```

Runs format check, typecheck, tests, build, and writes **`test-results/verification-report.html`**.

### Formatting

```bash
npm run format        # Prettier — write
npm run format:check  # Prettier — check only (included in verify)
```

### Native tests (no browser)

```bash
npm test
npm run test:watch
```

### Live UI harness (fill API only)

```bash
npm run dev:harness
```

Opens **http://localhost:5173/** (`tools/harness`) — Scan / Fill without the extension.

### Extension dev

```bash
npm run dev              # WXT + HMR
npm run build            # → .output/chrome-mv3
npm run build:firefox    # → .output/firefox-mv2
npm run package          # zip for releases/
```

### Project layout

```
src/
  entrypoints/   # WXT: popup, options, background, content
  background/    # Service worker logic
  content/       # Page scripts (no React)
  lib/           # Vault, fill engine, matchers
  components/    # Shared React UI
  popup/         # Popup app
  options/       # Options app
  hooks/ types/ shared/ styles/
fixtures/        # Sample profiles & HTML forms
public/          # Icons, synced test-form.html
tools/harness/   # Fill API dev UI (not in extension)
scripts/ docs/
```

### Tech stack

- **Manifest V3** extension
- **WXT + Vite + React** — [docs/DEV.md](docs/DEV.md)
- **TypeScript** (strict) · **Tailwind** · **Prettier** · **Web Crypto API**

---

## Security model

| Topic              | Approach                                     |
| ------------------ | -------------------------------------------- |
| **Storage**        | `chrome.storage.local` — encrypted blob only |
| **Passwords**      | Not stored in Perfil                         |
| **Network**        | No profile data sent to servers              |
| **Fill trigger**   | User clicks Fill                             |
| **Content script** | Profile only while vault is unlocked         |

See [docs/SECURITY.md](docs/SECURITY.md).

---

## How matching works

1. `autocomplete` attribute (highest confidence)
2. Field `name`, `id`, `placeholder`, associated `<label>`
3. Input `type` (`email`, `tel`)

Regex patterns map labels to profile fields. Low-confidence matches are skipped.

---

## Roadmap (summary)

- [x] AES-256-GCM vault (v0.3.0)
- [x] WXT build + Firefox target
- [ ] Checkbox / radio / date fill
- [ ] Chrome Web Store listing

See **[ROADMAP.md](ROADMAP.md)**.

---

## Contributing

Issues and PRs welcome at [github.com/abdullahmiraz/perfil](https://github.com/abdullahmiraz/perfil).

Run `npm run verify` before opening a PR.

---

## License

MIT — see [LICENSE](LICENSE) (to be added).

---

## Related projects

Perfil sits between password managers and AI form fillers — **local, auditable personal-data autofill** without sending your DOM to the cloud.
