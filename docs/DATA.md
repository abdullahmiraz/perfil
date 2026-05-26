# Data vs code

## Rule

| Put here | Examples |
|----------|----------|
| **`fixtures/`** | Sample profiles (JSON), HTML forms, export examples |
| **`src/types/`** | Shapes only (`ProfileFixture`, `ProfileData`) |
| **`src/lib/`** | Logic (`profileFromFixture`, `fillForm`) |
| **`src/shared/`** | UI labels & field groups (`profile-fields.ts`) — not user values |

**Never** embed user-like sample data as big constants in `.ts` / `.tsx`.

## Profiles

```json
// fixtures/profiles/demo.json
{
  "label": "Demo",
  "data": { "firstName": "Ada", "email": "ada@example.com" },
  "customFields": [{ "label": "Eye power", "type": "text", "value": "-2.5" }]
}
```

Load in tests:

```typescript
import { loadProfileFixture, mountFormFixture } from "../../test/helpers/fixtures";

const profile = loadProfileFixture("demo");
const root = mountFormFixture("contact-form");
```

Load in dev harness: `src/lib/fixtures/harness.ts` imports the same JSON.

## Forms

HTML lives in `fixtures/forms/`. Sync to `public/` for static URLs:

```bash
npm run sync:fixtures
```

## Agents

When a user asks to “test with profile X”, add or edit a JSON file under `fixtures/profiles/` — do not paste data into components.
