# Product roadmap

Prioritized, practical work for Perfil. **Do not delete rows** — mark `[x]` when shipped.

Market context: [docs/MARKET.md](docs/MARKET.md)

---

## Status at a glance (v0.3.0)

| Phase | Version | Status |
|-------|---------|--------|
| P0 Core extension | v0.1 | ✅ Shipped |
| P1 Custom fields | v0.2 | ✅ Shipped |
| P2 Field copy/move | v0.2 | ✅ Shipped |
| P3 Backup import/export | v0.2 | ✅ Shipped |
| P4 Unlock + on-page UX | v0.2 | ✅ Shipped |
| P4b Form memory + menu toggle | v0.2.1 | ✅ Shipped |
| P4c Compact popup + URL saves | v0.2.2 | ✅ Shipped |
| P4d Onboarding, recovery, UX polish | v0.2.3 | ✅ Shipped |
| **P5 Real vault encryption** | **v0.3.0** | ✅ **Shipped** |
| P6 Better fill coverage | v0.3.x | 🔜 Next |
| P7 Distribution | v0.4 | Planned |
| P8 Advanced (optional) | — | Backlog |

---

## Feature checklist (honest)

| Feature | Status | Notes |
|---------|--------|--------|
| MV3 extension (popup, options, content, worker) | [x] | |
| Rule-based scan & fill (text, email, tel, textarea, **select**) | [x] | checkbox/radio not yet |
| Custom profile fields + types | [x] | |
| Copy/move custom fields between profiles | [x] | |
| JSON export/import | [x] | Plain JSON export while unlocked — not encrypted export file |
| Auto-lock, session unlock | [x] | v3 vault: no auto-unlock without password/PIN |
| PIN unlock | [x] | PIN wraps DEK (v3) |
| Field picker on focus | [x] | |
| Right-click menu (off by default) | [x] | Page context only |
| URL-scoped form save/restore (manual) | [x] | |
| Setup wizard + recovery Q&A | [x] | |
| Two-step forgot-password flow | [x] | Verify answer → new password |
| Hover tooltips (no clutter `(i)` buttons) | [x] | |
| Toast enter/exit + 3s progress bar | [x] | |
| Dark / light / system theme | [x] | |
| **AES-256-GCM vault (PBKDF2)** | [x] | v0.3.0 — migrates legacy on unlock |
| Recovery can reset encrypted vault | [x] | Needs `recoveryWrappedDek` (set at setup or in Settings) |
| Checkbox / radio fill | [ ] | **Next** — common on job forms |
| Encrypted backup export | [ ] | Optional `.perfil` file |
| Chrome Web Store listing | [ ] | Screenshots, privacy text |
| Per-site field overrides | [ ] | Only if users ask |
| Firefox build | [ ] | After Chrome stable |
| AI assist (BYOK) | [ ] | Backlog — not a priority |
| Biometric unlock | [ ] | Backlog |

---

## P4d — Onboarding & polish (v0.2.3) ✅

- [x] Multi-step vault setup (password, recovery, preferences)
- [x] Forgot password via recovery question (two steps)
- [x] `HoverTip` on labels/actions (replaces `(i)` buttons)
- [x] Popup: Edit profile, field picker toggle, no duplicate nav rows
- [x] Animated toasts with dismiss progress underline (3s default)
- [x] GitHub releases + `npm run package`

---

## P5 — Real vault encryption (v0.3.0) ✅

- [x] AES-256-GCM payload encryption
- [x] PBKDF2-SHA256 key derivation (310k iterations)
- [x] Envelope encryption (DEK + password wrap)
- [x] PIN wrap for quick unlock
- [x] Recovery wrap for forgot-password on encrypted vaults
- [x] Legacy base64 vault migrates to v3 on next password unlock
- [x] No session auto-unlock without credentials on encrypted vaults

---

## P6 — Better fill coverage (next, v0.3.1)

Practical wins on real job/checkout forms:

| # | Item | Why | Status |
|---|------|-----|--------|
| 1 | Checkbox groups (same name) | Surveys, terms, multi-select | [ ] |
| 2 | Radio groups | Gender, yes/no, plan choice | [ ] |
| 3 | `<select>` option match by label/value | Country, state fields | [ ] |
| 4 | `type=date` / `type=month` where profile has dates | Applications | [ ] |
| 5 | Fill harness + fixture forms for above | Prevent regressions | [ ] |

**Not in P6:** AI, macros, cloud sync.

---

## P7 — Distribution (v0.4)

| # | Item | Status |
|---|------|--------|
| 1 | Chrome Web Store developer account + listing | [ ] |
| 2 | Privacy policy page (local-only, no analytics) | [ ] |
| 3 | 3–5 screenshots (popup fill, profiles, settings) | [ ] |
| 4 | Edge Add-ons (same package) | [ ] |
| 5 | “What’s new” in release notes per tag | [ ] |

---

## P8 — Backlog (only if needed)

| Item | When to consider |
|------|------------------|
| Per-site field mapping overrides | Users report repeated wrong-field fills on specific sites |
| Encrypted `.perfil` backup file | After crypto stable |
| Firefox | After store listing |
| AI for low-confidence fields (BYOK) | Rules + overrides insufficient |
| Biometric unlock | Platform-specific; after P5 stable |

---

## P0–P4c (archived summaries)

<details>
<summary>Earlier shipped phases (click to expand)</summary>

### P0 — v0.1
- [x] Chrome MV3, profiles, rule fill, vault, tests, docs

### P1 — Custom fields
- [x] Types, reorder, matcher integration

### P2 — Copy/move fields

### P3 — JSON backup

### P4 — Unlock & UX
- [x] PIN, auto-lock, context menu, field picker, themes, toasts, profile tabs

### P4b — Form memory (superseded by URL-only manual saves)

### P4c — Compact popup
- [x] Header toolbar, URL saves, Save current / Restore / Delete

</details>

---

## Verify locally

```bash
npm run verify
npm run dev    # load dist/ once at chrome://extensions
```

| Feature | Where |
|---------|--------|
| Encrypted vault | New setup → lock → unlock; check storage blob has `encoding: "v3"` |
| Recovery reset | Lock → Forgot password → 2 steps |
| Fill | Popup → Scan / Fill on a form page |
| Profiles | Options (gear or Edit) |
