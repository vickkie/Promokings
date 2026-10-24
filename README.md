## PromoKings App

![epromoking](https://github.com/user-attachments/assets/bf9b6685-4d2d-45c6-9daa-c22613c8c148)

### Overview

The **PromoKings App** is a React Native application designed to deliver a seamless experience in product purchasing.

### Getting Started for developers

To get started with the PromoKings App, follow these steps:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/vickkie/Promokings.git

   cd Promokings
   ```

2. Install Dependencies

Ensure you have Node.js installed. Then, run:

```bash
npm install

```

3. Run the App

To start the development server, you have several options:

Start on Android:

```bash
npm run android

```

or

```
npx expo start --android

```

Start on iOS:

```bash

npm run ios

```

Start on Web:

```bash

npm run web
```

Start on Default:

```bash

npm start


```

4. more Requirements

- requires a backend
- dm to get access to full code

5. building to apk or aab file

preview version apk

- create an eas account
- login in to eas in terminal

```
  eas build -p android --profile preview

```

or

custom profile

```
eas build -p android --profile <your profile>

```

### Auth & Google login

**Session storage.** Login issues a JWT (`TOKEN`) which is stored in
`expo-secure-store` (Keystore/Keychain-backed) under `auth.token`; only the
non-secret user profile stays in AsyncStorage (`user{_id}`). On first launch
after upgrading, a token found inside the old AsyncStorage blob is migrated
to SecureStore automatically. The token is validated on load (decode +
`exp` check) and a global axios response interceptor logs the session out on
any `401`. See `components/auth/AuthContext.js`.

**JWT contract.** Tokens are HS256 signed with the backend `JWT_SEC` and
carry `{id, userType, role, staffId?}` — role checks read the `role` claim.
Token lifetime is set server-side (7 days for customers/staff); there is no
refresh token — an expired session just requires re-login.

**Google sign-in (customers only).** `LoginPage` probes
`GET {BACKEND_PORT}/api/auth/capabilities` once on mount and renders
"Continue with Google" only when `google.enabled === true` **and** a client
id is configured for the platform **and** the customer (non-staff) form is
selected. On success the app exchanges `{idToken, audience: "customer"}` at
`POST /api/auth/google` and continues through the same `AuthContext.login()`
path as password login.

To enable it:

1. Create OAuth clients in Google Cloud Console — an **Android** client for
   package `com.uzitrake.promokings` + your signing SHA-1 with "Custom URI
   scheme" enabled (and an **iOS** client for the same bundle id if
   shipping iOS). Client ids are public — never put the OAuth client
   secret in the app.
2. Set `GOOGLE_CLIENT_ID_ANDROID` / `GOOGLE_CLIENT_ID_IOS` in `.env`
   (`GOOGLE_CLIENT_ID` is the shared fallback; see `.env.example`).
3. **Rebuild the dev client / produce a new EAS build.** `expo-secure-store`,
   `expo-auth-session`, `expo-crypto` and `expo-web-browser` are native
   modules and the `app.json` `scheme` change alters the manifest — an older
   `dev-client.apk` or an OTA update cannot run this flow.

Env values are inlined into the bundle at build time — everything in `.env`
is public. Server secrets (e.g. the OneSignal REST API key) must never be
added to it. Detailed audit/security docs live under `docs_local/audit/`
(local-only, gitignored — not shipped or committed).

### Contributing

If you'd like to contribute to this project, please follow the guidelines outlined in MIT license

### License

This project is licensed under the MIT License.

Feel free to adjust any sections as needed!
