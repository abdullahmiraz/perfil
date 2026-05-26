# Product roadmap

Prioritized features for Perfil. **Do not delete items** — mark done with `[x]` as shipped.

Reference: [Bitwarden unlock & timeout](https://bitwarden.com/help/unlock-with-pin/) · [1Password session model](https://1password.com)

---

## P0 — Shipped (v0.1)

- [x] Chrome MV3 extension (popup, options, content script)
- [x] Fixed profile fields (name, email, address, work, etc.)
- [x] Rule-based form scan & fill
- [x] Local vault with master password
- [x] Vitest suite + dev harness (`npm run dev:harness`)
- [x] Agent docs (`AGENTS.md`)

---

## P1 — Custom fields (v0.2)

- [x] User-defined fields with custom labels (e.g. “eye power”)
- [x] Field types: text, email, phone, textarea, date, time, color, url, select
- [x] Add / edit / remove / reorder fields per profile
- [x] Custom fields participate in form matching & fill

---

## P2 — Profile field tools (v0.2)

- [x] Select one or more fields
- [x] Copy selected fields to another profile
- [x] Move selected fields to another profile

---

## P3 — Backup (v0.2)

- [x] Export vault or single profile as JSON
- [x] Import JSON (merge or replace profiles)
- [x] Validation + user confirmation on import

---

## P4 — Unlock & settings (v0.2)

Inspired by Bitwarden: **vault timeout**, **PIN unlock**, **require master password on browser restart**.

- [x] Settings page (security section)
- [x] Auto-lock after idle (5 / 15 / 30 / 60 min, or never while browser open)
- [x] Optional PIN to unlock without typing full master password
- [x] Toggle: require master password when browser restarts (default on)
- [x] Session unlock while browser is open (no re-prompt on every popup open)

---

## P5 — Later

- [ ] AES-256-GCM + PBKDF2 vault encryption (replace interim encoding)
- [ ] Biometric unlock (platform APIs where available)
- [ ] Per-site field mapping overrides
- [ ] `select` / radio / checkbox on web forms
- [ ] Optional AI for ambiguous fields (BYOK)

---

## How we chose unlock UX (P4)

| Pattern | Source | Perfil choice |
|---------|--------|----------------|
| Stay unlocked while active | Bitwarden vault timeout | Idle timer + activity pings |
| PIN instead of master password each time | Bitwarden “Unlock with PIN” | Optional 4–8 digit PIN |
| Stricter on browser restart | Bitwarden “Require master password on restart” | Default **on**; user can disable for convenience |
| Log out vs lock | Bitwarden community | **Lock** keeps data local; no cloud logout |

**Security note:** Disabling “require master password on restart” keeps a session token in `chrome.storage.session` (cleared when the browser exits). Same tradeoff Bitwarden documents for PIN-without-restart.
