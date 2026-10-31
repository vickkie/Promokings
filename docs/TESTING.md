# Testing - Promokings (mobile)

## Stack

jest-expo + React Native Testing Library style smoke tests; babel transform
coverage is the practical safety net (all `.js`/`.jsx` files compile).

## Commands

```bash
npm test          # jest (2 suites, 5 tests)
npm run lint      # eslint flat config (eslint-config-expo)
```

## Existing suites

| File | Covers |
|---|---|
| `__tests__/routes.test.js` | every `navigate()` literal resolves against the registered route table |
| `__tests__/login.test.js` | LoginPage render + auth-flow smoke |

`jest.setup.js` mocks native modules (OneSignal etc.); `__mocks__/` holds
shared stubs.

## CI

GitHub Actions workflow runs lint + tests on pushes to main (added during
the quality-debt pass - keep it green before merging).

## Writing tests

- Mock `@env` imports and native modules in `jest.setup.js` rather than
  per-file.
- Route-name changes: extend `routes.test.js` - it catches the
  dead-navigation bug class.
- Anything touching `AuthContext` needs a mocked SecureStore + AsyncStorage.
