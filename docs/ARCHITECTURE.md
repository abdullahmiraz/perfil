# Architecture

See [AGENTS.md](../AGENTS.md) for agent-oriented overview. This doc is for humans.

## Data flow

```
Popup/Options (React)
    │ sendMessage
    ▼
Background (service worker) ── vault, lock state
    │ sendTabMessage (+ inject if needed)
    ▼
Content script ── detectFields → matchField → fillPage
    ▼
Page DOM
```

## Module boundaries

- **UI** must not import `vault-service-core` directly
- **Content** must not import React or hooks
- **lib/** is shared; safe for content + background + tests
- **vault-crypto.ts** — AES-GCM seal/open; used only from `vault-service-core`

## Type layout

| File | Contents |
|------|----------|
| `types/profile.ts` | Profile, ProfileData |
| `types/vault.ts` | VaultStatus, EncryptedVaultBlob |
| `types/messages.ts` | Extension message map |
| `types/fill.ts` | FillResult, SerializableField |
| `types/content.ts` | Content script messages |
