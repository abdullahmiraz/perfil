# Market position — Perfil

How Perfil fits next to common tools (2025–2026). Use this to prioritize roadmap items that users actually need.

## Categories

| Category              | Examples                                                                                 | Strength                             | Weakness for profile autofill                              |
| --------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------- |
| **Password managers** | Bitwarden, 1Password, Dashlane                                                           | Encrypted vault, trust               | Weak on custom fields, job forms, repeat data entry        |
| **Rule autofill**     | [Lightning Autofill](https://addons.mozilla.org/en-US/firefox/addon/lightning-autofill/) | Macros, all field types, power users | **Not encrypted** — vendor says don’t store sensitive data |
| **AI autofill**       | Thunderbit, Superfill                                                                    | Ambiguous fields, scraping           | Cloud/API, privacy review, cost                            |
| **Browser built-in**  | Chrome autofill                                                                          | Zero install                         | Addresses/passwords only, not custom profiles              |

## Perfil niche

**Local personal-data profiles** for forms (job apps, checkout, contact, surveys):

- No account, no cloud sync by default
- User clicks **Fill** — no silent DOM scraping
- Rule-based matching first (auditable)
- Goal: **encrypted vault** (not just encoded JSON) — main trust gap vs password managers

## What users complain about elsewhere

| Pain                                          | Perfil response                             |
| --------------------------------------------- | ------------------------------------------- |
| “Autofill put data in the wrong field”        | Confidence threshold + manual Scan/Fill     |
| “I don’t trust extensions with my address”    | Local-only + real encryption (roadmap P5.1) |
| “Password manager doesn’t fill custom fields” | Custom fields per profile                   |
| “Lightning isn’t safe for real data”          | Verifier + AES-GCM vault, recovery Q&A      |
| “I re-type the same long form”                | URL-scoped **Save current / Restore**       |

## What we should **not** chase early

- AI for every field (cost, privacy, maintenance) — only after rules + overrides stall
- Cloud sync / accounts — conflicts with local-first promise unless opt-in later
- Macro/scripting engine — Lightning’s lane; not our core
- Biometrics before vault crypto is solid

## Practical competitors to watch

- **RoboForm** / **Dashlane** — profile autofill in paid tiers (encrypted, cloud)
- **Autofill** (Tohodo) — simple local profiles, older UX
- **Lightning Autofill** — automation depth; we borrow _form memory_ idea only

## Distribution

Most users discover extensions via **Chrome Web Store** search (“autofill”, “form filler”, “job application”). Listing + screenshots matter as much as features for growth.
