# Setup - Promokings (mobile)

## Requirements

- Node.js + npm
- Expo CLI (`npx expo`), EAS CLI for device builds
- Running backend (see Promokings-backend docs/SETUP.md)

## Install and run

```bash
git clone https://github.com/vickkie/Promokings.git
cd Promokings
npm install
cp .env.example .env        # fill keys per docs/CONFIG.md
npx expo start              # Metro bundler
```

Point `BACKEND_PORT` in `.env` at your backend origin.

## Dev client vs Expo Go

Some native modules (expo-secure-store, expo-auth-session, OneSignal) are
not in Expo Go - build a dev client:

```bash
eas build -p android --profile development
```

Install the APK, then `npx expo start --dev-client`. The checked-in
`dev-client.apk` predates current native deps; rebuild rather than reuse it.

## Checks

```bash
npm test        # jest-expo: __tests__/ (routes + login smoke)
npm run lint    # eslint flat config
```
