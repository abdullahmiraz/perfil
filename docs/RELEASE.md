# Release & distribution

How to **download**, **build**, **install**, and **publish** Perfil on Chromium browsers.

---

## Download (end users)

### GitHub Releases (recommended)

1. Open [Releases](https://github.com/abdullahmiraz/perfil/releases).
2. Download **`perfil-<version>.zip`** for the latest tag (e.g. `perfil-0.2.2.zip`).
3. Extract the zip to a folder (e.g. `perfil-0.2.2/`).
4. Install — see [Install from a zip](#install-from-a-zip) below.

> The zip contains a ready-built extension (`manifest.json` at the root). You do **not** need Node.js to install from a release.

### Clone and build yourself

```bash
git clone https://github.com/abdullahmiraz/perfil.git
cd perfil
npm install
npm run package
```

Zip appears at `releases/perfil-<version>.zip`.

---

## Project setup (developers)

| Requirement | Notes                                      |
| ----------- | ------------------------------------------ |
| **Node.js** | 20+ ([nodejs.org](https://nodejs.org/))    |
| **npm**     | Comes with Node                            |
| **Browser** | Chrome, Edge, Brave, or other Chromium MV3 |

```bash
git clone https://github.com/abdullahmiraz/perfil.git
cd perfil
npm install          # generates icons + syncs fixtures
npm run verify       # typecheck, tests, production build
```

### Commands

| Script                  | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `npm run dev`           | WXT dev + HMR (opens browser with extension) |
| `npm run build`         | Production → `.output/chrome-mv3`            |
| `npm run build:firefox` | Firefox → `.output/firefox-mv3`              |
| `npm run package`       | `build` + `releases/perfil-<version>.zip`    |
| `npm run verify`        | Full CI-style check + HTML report            |

---

## Install from a zip

After extracting **`perfil-x.y.z.zip`**:

### Google Chrome

1. `chrome://extensions`
2. Enable **Developer mode** (top right)
3. **Load unpacked** → select the **extracted folder** (must contain `manifest.json`)
4. Pin **Perfil** from the puzzle icon if needed

### Microsoft Edge

1. `edge://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → same extracted folder

### Brave / Opera / Vivaldi

Same flow as Chrome (`brave://extensions`, `opera://extensions`, etc.) — **Load unpacked** with the folder.

### First run

1. Toolbar icon → **Create vault** (master password)
2. **Manage profiles** → save your data
3. On a form page → **Scan** / **Fill**, or use **Saved forms** in the popup

---

## Install for development

```bash
npm run dev
```

1. Run `npm run dev` — WXT loads the extension in Chrome automatically.
2. Edit code → extension reloads; **refresh the web page** under test.

For a build **without** the dev server (stable service worker):

```bash
npm run build
# Load unpacked from .output/chrome-mv3 — do not run npm run dev at the same time
```

---

## Publish to stores (maintainers)

Perfil is **not** on the Chrome Web Store or Edge Add-ons yet. When you are ready:

### 1. Version bump

Keep these in sync:

- `package.json` → `"version"` (synced to `wxt.config.ts` manifest via build)

Update `ROADMAP.md` / `README.md` status if needed.

### 2. Build release artifact

```bash
npm run verify
npm run package
```

Produces `releases/perfil-<version>.zip`.

### 3. Git tag + GitHub Release

```bash
git add -A
git commit -m "chore: release v0.2.2"
git push origin main
git tag v0.2.2
git push origin v0.2.2
```

Create the release (upload zip):

```bash
gh release create v0.2.2 releases/perfil-0.2.2.zip \
  --title "v0.2.2" \
  --notes "Compact popup, URL-scoped form saves, header toolbar."
```

Or push a tag `v*` — the [release workflow](../.github/workflows/release.yml) builds and attaches the zip automatically.

### 4. Chrome Web Store

1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. **New item** → upload **`perfil-<version>.zip`** (or zip `.output/chrome-mv3/` — manifest at root)
3. Fill listing, privacy (single purpose: form fill; local storage only)
4. Submit for review

Docs: [Publish in Chrome Web Store](https://developer.chrome.com/docs/webstore/publish)

### 5. Microsoft Edge Add-ons

1. [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge)
2. Submit the **same MV3 zip** (Edge accepts Chrome extensions)
3. Or sideload via `edge://extensions` for testing

Docs: [Publish Edge extension](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/publish-extension)

### 6. Firefox

```bash
npm run build:firefox
```

Load unpacked from **`.output/firefox-mv3`**. Package with `wxt zip -b firefox` if needed.

---

## Automated releases (CI)

On push of tag `v*` (e.g. `v0.2.2`), GitHub Actions:

1. Runs `npm run verify`
2. Runs `npm run package`
3. Uploads `releases/perfil-*.zip` to the GitHub Release

---

## Troubleshooting

| Issue                            | Fix                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| Service worker failed (status 3) | Dev: run `npm run dev`. Prod: `npm run build`, load `.output/chrome-mv3`, reload extension |
| Extension won’t load             | Folder must contain `manifest.json` at top level — extract zip, don’t load the `.zip` file |
| Changes not showing              | Reload extension on `chrome://extensions`; refresh the tab                                 |
| `npm run package` fails on Linux | Install `zip`: `sudo apt install zip`                                                      |

---

## Security note

Release zips are **unsigned** community builds until listed on a store. Only download from the official [GitHub releases](https://github.com/abdullahmiraz/perfil/releases) page.
