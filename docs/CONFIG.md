# Configuration - Promokings (mobile)

Env vars live in `.env` (gitignored) and reach the bundle via
`module:react-native-dotenv` (`babel.config.js`, module name `@env`,
`safe: false`, `allowUndefined: true`). Anything imported from `@env` is
inlined into the shipped bundle - **never put server secrets here**.

For EAS builds, define the same keys as EAS environment variables; `.env`
is not uploaded.

| Var | Used by | Notes |
|---|---|---|
| `BACKEND_PORT` | all API calls | backend origin incl. scheme+port |
| `EAS_PROJECT_ID` | EAS services | matches app.json extra.eas.projectId |
| `FIREBASE_API_KEY` | Firebase client init | public-by-design client key |
| `FIREBASE_AUTH_DOMAIN` | Firebase client | |
| `FIREBASE_DATABASE_URL` | RTDB chat | `messages/{conversationId}` |
| `FIREBASE_PROJECT_ID` | Firebase client | |
| `FIREBASE_STORAGE_BUCKET` | Firebase client | |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase client | |
| `FIREBASE_APP_ID` | Firebase client | |
| `FIREBASE_MEASUREMENT_ID` | analytics (optional) | |
| `ONESIGNAL_APP_ID` | OneSignal SDK init | public app id only |
| `GOOGLE_CLIENT_ID` | web fallback Google sign-in | |
| `GOOGLE_CLIENT_ID_ANDROID` | Android OAuth client | |
| `GOOGLE_CLIENT_ID_IOS` | iOS OAuth client | |
| `VERSION_SHORT`, `VERSION_LONG` | About/profile screens | display only |

## Do NOT put here

`ONESIGNAL_REST_API_KEY`, `JWT_SEC`, `FIREBASE_SERVICE_ACCOUNT`,
`CRYPTSECRET`, `UZIPAY_*` - server-side only. `ONESIGNAL_REST_API_KEY` was
removed from the client env; restore it in backend/Vercel env if needed.
