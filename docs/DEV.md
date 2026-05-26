# Development & troubleshooting

Build tooling, commands, and common fixes. Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md). Release: [RELEASE.md](./RELEASE.md).

## Stack

- **WXT** + Vite + React 19 + Tailwind (popup/options only)
- **Plain TypeScript** in `src/lib/`, background, content (no React in content scripts)
- **Prettier** + EditorConfig for consistent formatting

Entrypoints: `src/entrypoints/`. App code: `src/popup/`, `src/options/`, `src/lib/`, etc. Fill harness (no extension): `tools/harness/`.

## Commands

| Task                              | Command                                                       |
| --------------------------------- | ------------------------------------------------------------- |
| **Test / sideload (recommended)** | `npm run start` → load `.output/chrome-mv3`                   |
| Hot reload                        | `npm run dev` (keep terminal open) → `.output/chrome-mv3-dev` |
| Verify CI locally                 | `npm run verify`                                              |
| Release zip                       | `npm run package` → `releases/perfil-<version>.zip`           |
| Firefox build                     | `npm run build:firefox`                                       |
| Format                            | `npm run format`                                              |

## Troubleshooting

### WebSocket `localhost:3000` / blank popup

The **dev** build loads UI from the WXT server. If `npm run dev` is stopped, use **`npm run start`** and load **`.output/chrome-mv3`**, or keep `npm run dev` running for **`-dev`**.

Remove duplicate Perfil entries on `chrome://extensions` when switching folders.

### Sample test form

| Build               | URL                                                                            |
| ------------------- | ------------------------------------------------------------------------------ |
| Production          | Options page → **Open test form**, or `chrome-extension://<id>/test-form.html` |
| Dev (`npm run dev`) | http://localhost:3000/test-form.html                                           |

### Profiles / settings page

Popup → **Profiles** or header **📋** / **⚙**, or right-click extension → **Options** (full tab).

### Service worker error (status code 3)

Use production build (`npm run start`) or keep `npm run dev` running. Reload on `chrome://extensions`.

### `npm run dev` fails on Chrome 137+

`wxt.config.ts` includes the required `chromiumArgs`. Close extra Chrome processes if WXT cannot launch a browser.
