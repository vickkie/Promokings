# Contributing - Promokings (mobile)

## Branches

Feature branches only (`fix/...`, `feat/...`, `audit/...`). Never commit to
`main` directly; no merges, force-pushes, or deletions without explicit
owner approval.

## Commits

- Conventional prefixes: `feat:`, `fix:`, `perf:`, `style:`, `chore:`.
- Present-tense summary + a bullet describing the change:

```
fix: respect safe area on in app notification banner

- Banner top offset now uses useSafeAreaInsets.
```

- One focused change per commit.
- No em dashes or plus signs in messages, comments, docs, or UI text.
- Never commit `.env`, `docs_local/`, `dev-client.apk`, `node_modules`.

## Code style

- Match existing conventions: JSX screens under `screens/`, shared pieces
  under `components/`, hooks under `hook/`, contexts under `contexts/`.
- Route names: use `navigation/routes.js` constants, never string literals.
- Storage keys: use `constants/storageKeys.js`, never inline strings.
- Roles: use the `ROLES` enum; role checks via `hasRole`/`getRole` only.
- Diagnostics: `utils/logger.js` (`__DEV__` gated) - bare `console.*` is
  stripped in release builds anyway, use the logger for deliberate output.
- New API calls go through `utils/api.js` / `hook/useFetch`-style helpers,
  not bare `fetch` (they lose the bearer header).
- ESLint must stay at zero problems - intentional rule deviations use the
  established `// eslint-disable-next-line <rule> -- reason` pattern.

## Before pushing

- `npm test` and `npm run lint` green.
- `npx expo export` sanity-checks the production bundle compiles.
- New native deps or app.json changes require an EAS dev-client rebuild.
