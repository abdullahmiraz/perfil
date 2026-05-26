# Security — Perfil

## Threat model (v0.1)

**In scope**

- Other extensions reading `chrome.storage.local`
- Malicious pages tricking autofill into wrong fields
- User leaving vault unlocked on shared machine

**Out of scope (v0.1)**

- Compromised OS / malware with full browser access
- Physical access while vault is unlocked
- Phishing (user can always paste data manually)

## Data flow

```
Popup/Options → chrome.runtime.sendMessage → Background (vault)
Background → chrome.tabs.sendMessage → Content script (fill only)
```

The master password is used only in the background to verify unlock. It is **not** sent to content scripts or web pages.

## v0.1 storage (interim)

Until Phase 2 ships:

- Profile JSON is base64-encoded in `chrome.storage.local`
- A password **verifier** prevents casual unlock attempts
- This is **not** full encryption — treat v0.1 as development preview for non-sensitive data

## Phase 2 (planned)

- PBKDF2 key derivation (≥310,000 iterations)
- AES-256-GCM authenticated encryption
- Random salt + IV per vault
- Auto-lock after configurable idle time
- Encrypted backup export (user-held file)

## Permissions

| Permission | Why |
|------------|-----|
| `storage` | Encrypted vault blob |
| `activeTab` | Operate on the tab the user is viewing |
| `scripting` | Inject fill logic when needed |
| `<all_urls>` | Form autofill works on any site the user visits |

No `tabs` history, no analytics, no remote servers for profile data.

## Recommendations

- Use a **strong, unique** master password
- Do **not** store payment cards, SSN, or government IDs until Phase 2
- **Lock** the vault when done on shared computers
- Keep Chrome and the extension updated
