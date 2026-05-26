# Product roadmap

Prioritized features for Perfil. **Do not delete items** — mark done with `[x]` as shipped.

Reference: [Bitwarden unlock & timeout](https://bitwarden.com/help/unlock-with-pin/) · [1Password session model](https://1password.com)

---

## Status summary

| Phase | Version | Status |
|-------|---------|--------|
| P0 Core extension | v0.1 | **Shipped** |
| P1 Custom fields | v0.2 | **Shipped** |
| P2 Field copy/move | v0.2 | **Shipped** |
| P3 Backup import/export | v0.2 | **Shipped** |
| P4 Unlock + on-page UX | v0.2 | **Shipped** |
| P4b Form memory + menu toggle | v0.2.1 | **Shipped** |
| P5 Security + advanced fill | — | **Not started** |

---

## P0 — Shipped (v0.1)

- [x] Chrome MV3 extension (popup, options, content script, service worker)
- [x] Fixed profile fields (name, email, address, work, etc.)
- [x] Rule-based form scan & fill
- [x] Local vault with master password
- [x] Vitest suite + dev harness (`npm run dev:harness`)
- [x] Agent docs (`AGENTS.md`, `docs/`, `.cursor/rules/`)

---

## P1 — Custom fields (v0.2)

- [x] User-defined fields with custom labels (e.g. “eye power”)
- [x] Field types: text, email, phone, textarea, date, time, color, url, select
- [x] Add / edit / remove / reorder fields per profile
- [x] Custom fields participate in form matching & fill

---

## P2 — Profile field tools (v0.2)

- [x] Select one or more custom fields
- [x] Copy selected fields to another profile
- [x] Move selected fields to another profile

---

## P3 — Backup (v0.2)

- [x] Export vault as JSON
- [x] Import JSON (merge or replace profiles)
- [x] Validation + user confirmation on import

---

## P4 — Unlock, settings & on-page UX (v0.2)

### Security & unlock

- [x] Settings page (security section)
- [x] Auto-lock after idle (5 / 15 / 30 / 60 min, or never while browser open)
- [x] Optional PIN to unlock without full master password
- [x] Toggle: require master password when browser restarts (default on)
- [x] Session unlock while browser is open (no re-prompt every popup open)

### Profiles UI

- [x] Profile **tabs** (horizontal) instead of left sidebar — more room for fields
- [x] Default **Personal** preset on new vault (`fixtures/profiles/personal-default.json`)
- [x] Custom fields save reliably (await vault persist; sync state after save)
- [x] Save feedback: toast with checkmark, “Saving…” on button

### On-page autofill

- [x] Right-click **context menu**: Fill page, Fill this field…, Scan page
- [x] **Field picker** on input focus (toggle in settings)
- [x] Styled scrollbar in field picker popup

### Form feedback & errors

- [x] Inline field errors + shake (PIN / master password in settings)
- [x] Unlock / setup / save **toasts** in popup and options
- [x] Friendly error text (no raw service-worker messages in UI)
- [x] Service worker: no dynamic `import()` (fixes first-unlock failure)

### Appearance

- [x] **Dark / Light / System** theme (Settings → Appearance; stored in `chrome.storage.local`)

---

## P4b — Form memory & menu control (v0.2.1)

Inspired by [Lightning Autofill](https://chromewebstore.google.com/detail/lightning-autofill/nlmmgnhgdeffjkdckmikfpnddkbbfkkk) form recovery — local only, no cloud.

- [x] **Form memory** per site: save field values by **domain** or **exact page URL**
- [x] **Manual save** / **restore** / **clear** (popup + right-click when menu enabled)
- [x] **Auto-save while typing** (optional per site, debounced)
- [x] **Auto-restore** on page load when memory is enabled for that site
- [x] **Right-click menu toggle** in popup (pill switch; **off by default**)
- [x] Context menu only on **page background** — not on search boxes / single inputs
- [x] Form memory works even when vault is locked (stored in `chrome.storage.local`)

---

## P5 — Later (not done)

- [ ] AES-256-GCM + PBKDF2 vault encryption (replace interim base64 encoding)
- [ ] Biometric unlock (platform APIs where available)
- [ ] Per-site field mapping overrides
- [ ] `select` / radio / checkbox matching on web forms
- [ ] Optional AI for ambiguous fields (BYOK)
- [ ] Light theme for content-script field picker (currently dark only)

---

## How we chose unlock UX (P4)

| Pattern | Source | Perfil choice |
|---------|--------|----------------|
| Stay unlocked while active | Bitwarden vault timeout | Idle timer + activity pings |
| PIN instead of master password each time | Bitwarden “Unlock with PIN” | Optional 4–8 digit PIN |
| Stricter on browser restart | Bitwarden “Require master password on restart” | Default **on**; user can disable |
| Log out vs lock | Bitwarden community | **Lock** keeps data local; no cloud logout |

**Security note:** Disabling “require master password on restart” keeps a session token in `chrome.storage.session` (cleared when the browser exits). Same tradeoff Bitwarden documents for PIN-without-restart.

---

## Verify shipped features locally

```bash
npm run verify          # typecheck + tests + build
npm run dev             # load dist/ in chrome://extensions (keep running)
```

| Feature | Where to check |
|---------|----------------|
| Unlock / PIN / toasts | Extension popup |
| Profile tabs + save | Options → Profiles |
| Dark / Light / System | Options → Settings → Appearance |
| Context menu toggle | Popup → Right-click menu (enable first) |
| Context menu | Right-click **page background** (not inputs) |
| Field picker | Focus an input (setting enabled) |
| Form memory | Popup on that tab → Remember forms → Save / Restore |
| Default Personal data | New vault setup only |
