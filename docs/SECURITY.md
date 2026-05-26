# Security — Perfil

## Threat model

**In scope**

- Other extensions reading `chrome.storage.local`
- Malicious pages tricking autofill into wrong fields
- User leaving vault unlocked on a shared machine
- Offline guessing of master password (mitigated by PBKDF2 + strong password)

**Out of scope**

- Compromised OS / malware with full browser access
- Physical access while vault is unlocked
- Phishing (user can paste data manually)

## Data flow

```
Popup/Options → chrome.runtime.sendMessage → Background (vault)
Background → chrome.tabs.sendMessage → Content script (fill only)
```

The master password is used only in the background to derive keys and verify unlock. It is **not** sent to content scripts or web pages.

## Vault encryption (v0.3+)

| Piece          | Implementation                                               |
| -------------- | ------------------------------------------------------------ |
| Payload        | AES-256-GCM                                                  |
| Key derivation | PBKDF2-SHA256, 310,000 iterations, per-vault salt            |
| Envelope       | Random DEK; password-wrapped DEK in blob                     |
| PIN            | Optional PIN-wrapped DEK (quick unlock)                      |
| Recovery       | Optional recovery-answer-wrapped DEK (forgot-password reset) |
| Verifier       | Master password check before unwrap (legacy compat)          |

Legacy vaults (Phase 1 base64) **migrate to v3** on the next successful password unlock.

## Session behavior

- Unlock state in `chrome.storage.session` — cleared on lock
- **Encrypted vaults do not auto-decrypt** from session alone (re-unlock required after service worker restart)
- Optional “require master password on browser restart” for password unlock sessions

## Recovery

- Recovery **question + answer** (answer stored hashed; wrap stores recovery key material)
- Two-step UI: verify answer, then set new master password
- If recovery was never set up with a wrap, reset may only work for legacy vaults — update recovery in Settings while logged in

## What not to store

- Payment card numbers, CVV, government IDs until you accept residual risk
- Website **passwords** — use a password manager

## Permissions

| Permission     | Why                                    |
| -------------- | -------------------------------------- |
| `storage`      | Encrypted vault blob                   |
| `activeTab`    | Operate on the tab the user is viewing |
| `scripting`    | Inject fill logic when needed          |
| `contextMenus` | Optional page menu                     |
| `<all_urls>`   | Form autofill on sites the user visits |

No analytics, no remote profile servers.

## Recommendations

- Use a **strong, unique** master password
- Enable **recovery** at setup and export JSON backup periodically
- **Lock** when done on shared computers
- Keep Chrome and the extension updated
