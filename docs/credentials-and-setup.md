# Istima: credentials and setup checklist

What you need to provide, why, and how to get it. Official URLs only.

**Rule:** never paste a secret (token, key, password) into chat or a PR. Ask for a vault link and save it there. Public identifiers (client IDs, database IDs, App Store ID) are not secrets and can be sent in chat.

## Summary

| # | Item | Needed for | Secret? | Status |
| --- | --- | --- | --- | --- |
| 1 | Cloudflare D1 database | Accounts + sync | No (the ID is public) | Needed |
| 2 | Deploy access for the API Worker | Accounts + sync | **Yes** (API token) | Needed (or you deploy yourself) |
| 3 | Google OAuth client IDs (web, iOS, Android) | "Continue with Google" | No (IDs are public) | Needed |
| 4 | Apple + Google Play developer accounts | Native builds with sign-in | Accounts | Check |
| 5 | GitHub token with `workflow` scope | CI file edits (lint.yml) | **Yes** | Pending |
| 6 | Real App Store ID (and Play listing) | "Rate app" | No | Pending |
| 7 | Support page / contact address | Support + Feature request links | No | Pending |
| 8 | Email sender | Password reset only (no verification needed; no email is sent today) | **Yes** (API key) | Optional, later |
| 9 | PostHog key, Sentry DSN | Analytics, crash reports | PostHog key public, DSN semi-public | Optional |
| 10 | Cloudflare Pages `iapi.istima.app` | Timestamps | - | Done (working) |

---

## 1. Cloudflare D1 database

Holds users, sessions and synced data. Free plan: 5 GB storage, 5M rows read and 100k rows written per day (https://developers.cloudflare.com/d1/platform/pricing/).

**Option A: dashboard.** Cloudflare dashboard, Storage & Databases, D1, Create database, name it `istima-db`. Copy the **Database ID**. Docs: https://developers.cloudflare.com/d1/get-started/

**Option B: command line** (from the `istima-worker` folder): `npx wrangler login`, then `npx wrangler d1 create istima-db`. It prints the database ID. Reference: https://developers.cloudflare.com/workers/wrangler/commands/

**Send me:** the Database ID (not a secret). I put it in `wrangler.toml` and the migration `migrations/0001_init.sql` creates all tables (`npm run db:migrate:remote`).

## 2. Deploying the API Worker

The Worker serves `iapi.istima.app/v1/*`. Static timestamps keep working on the same hostname.

**Easiest: you deploy it** (about 5 minutes, no secret leaves your machine): `npm i`, `npx wrangler login`, `npm run db:migrate:remote`, `npm run deploy`. Make sure the zone is `istima.app` (the route is already in `wrangler.toml`). Docs on routes: https://developers.cloudflare.com/workers/configuration/routing/routes/

**If you want me to deploy:** create an API token at https://dash.cloudflare.com/profile/api-tokens (login required). Use the "Edit Cloudflare Workers" template, then add the permission "D1 Edit", and limit it to account and the `istima.app` zone. Guide: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/ . Save it through a vault link I send you. Also give me the **Account ID** (dashboard right sidebar, not secret).

**Free-plan note:** Workers free allows 100k requests per day and 10 ms CPU per request (https://developers.cloudflare.com/workers/platform/pricing/). Password hashing is the heavy part. I set PBKDF2 to 100,000 iterations to fit. If you see "exceeded CPU" errors, either lower the iterations or move to the Workers Paid plan (about 5 USD per month) and raise `PBKDF2_ITERATIONS` to 600000.

## 3. Google OAuth (sign in with Google)

Google client IDs are public identifiers. The "ID token" flow we use needs **no client secret**.

1. Create or pick a Google Cloud project: https://console.cloud.google.com/projectcreate
2. Configure the consent screen: https://console.cloud.google.com/auth/overview (app name Istima, support email, privacy policy https://istima.app/privacy, authorized domain `istima.app`). Publish it to Production so any user can sign in. Help: https://support.google.com/cloud/answer/6158849
3. Create three OAuth client IDs at https://console.cloud.google.com/apis/credentials (Create credentials, OAuth client ID):
   - **Web application.** Authorized JavaScript origins: `https://istima.app` and `http://localhost:8081` (dev). Authorized redirect URIs: `https://istima.app` and `http://localhost:8081`.
   - **iOS.** Bundle ID `com.istima.app`.
   - **Android.** Package name `com.istima.app` and the **SHA-1** of the signing key. Get the SHA-1 from Google Play Console, Test and release, App integrity (Play App Signing key) for store builds, and from `eas credentials` for EAS builds. Help: https://support.google.com/googleplay/android-developer/answer/9842756
4. Send me the three **Client IDs** (they end in `.apps.googleusercontent.com`).

I put the IDs into `config/branding.js` (`googleClientIds`) and the Worker variable `GOOGLE_CLIENT_IDS` (all three, comma-separated). Until the web ID is set, the Google button stays hidden and email sign-up works.

Native sign-in: iOS and Android now use `@react-native-google-signin/google-signin` (needs a development or production build, not Expo Go); web uses the browser flow. Besides the web and iOS client IDs, the iOS build needs the iOS client ID reversed as `com.googleusercontent.apps.<id>`, set as env var `GOOGLE_IOS_URL_SCHEME` at build time (public value). Guide: https://docs.expo.dev/guides/google-authentication/ . The API and Worker are unchanged.

## 4. Apple and Google Play developer accounts

Native sign-in and secure token storage ship with the next native build.
- Apple Developer Program (99 USD per year): https://developer.apple.com/programs/ . Needed for iOS builds and App Store Connect.
- Google Play Console (25 USD one time): https://play.google.com/console/signup
- Expo EAS builds: https://expo.dev (account login). I need to be told which Expo account and project builds the apps.
- New native modules in this feature: `expo-secure-store` (and, for Google on native, the library above). They need a **new native build**, an over-the-air update is not enough.

## 5. GitHub token with `workflow` scope (pending)

Needed only to push edits to `.github/workflows/*.yml` (the two lint.yml fixes). Create at https://github.com/settings/personal-access-tokens (fine-grained): resource owner AxiomGroupHQ, repository `Qari`, permissions Contents: Read and write, Pull requests: Read and write, and **Workflows: Read and write**. Docs: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens . Save it through the vault link ("GitHub Qari workflow token"). Set the shortest expiry that works for you.

## 6. Real App Store ID (pending)

Create the app in App Store Connect (https://appstoreconnect.apple.com), My Apps, your app, App Information, **Apple ID** (a number). Send me that number. The Play listing uses the package name `com.istima.app` once the app is published. Until then "Rate app" shows a friendly message.

## 7. Support page or contact (pending)

Any URL or address that users can reach you on (page on istima.app, a support email, or a GitHub Discussions link). Send me the URL. The two hidden Settings rows come back once it exists.

## 8. Email provider (optional, later, for password reset only)

Email accounts work without verification: the server only checks that the address is well formed and its domain can receive mail, and the app says a valid email is needed to store personal data. For password reset we would need a sender: Postmark https://account.postmarkapp.com (the repo already has a Postmark template alias), Resend https://resend.com , or Cloudflare Email Service. You will need: the provider account, a verified sender domain (DNS records on `istima.app`), and a **server API token** (secret, vault link).

## 9. Analytics and crash reports (optional)

- PostHog: project API key from https://posthog.com (Project settings). Set as `EXPO_PUBLIC_POSTHOG_API_KEY`. Without it analytics is simply off.
- Sentry: DSN from https://sentry.io (Project settings, Client Keys). Set as `EXPO_PUBLIC_SENTRY_DSN`.

## 10. Cloudflare Pages `iapi.istima.app` (done)

Serves the timestamp files (repo `AxiomGroupHQ/Qari-api`). Working at https://qari-api.pages.dev and `iapi.istima.app`. Docs: https://developers.cloudflare.com/pages/framework-guides/
