# Fixtures (test & dev data)

**Code loads data from here — do not embed sample profiles or forms in `.ts` / `.tsx` files.**

| Path | Purpose |
|------|---------|
| `profiles/*.json` | Sample profiles (`personal-default` seeds new vaults, `demo`, `contact-full`, …) |
| `forms/*.html` | HTML forms for scan/fill tests and dev harness |

## Add a profile fixture

1. Create `profiles/my-case.json` matching `ProfileFixture` in `src/types/fixtures.ts`
2. Load in tests: `loadProfileFixture("my-case")` from `test/helpers/fixtures.ts`
3. Load in app/dev: import JSON or use `@/lib/fixtures`

## Sync

`npm run sync:fixtures` copies `forms/contact-form.html` → `public/test-form.html` for static dev URLs.
