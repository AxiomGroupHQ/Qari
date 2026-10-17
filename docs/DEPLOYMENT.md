# Istima (Qari) - Deployment Guide & Open Setup Items

How istima.app ships, and every decision/credential still needed. **No secret
values in this file** - names, locations and instructions only.

## How deploys work today

- **Web (istima.app):** push to `main` on GitHub triggers a Cloudflare Workers
  Builds build of the `qari` worker and deploys it. The worker
  (`edge/previewWorker.ts`, config `wrangler.jsonc`) serves the static Expo web
  export from `dist/` (built during the CF build), injects link-preview tags on
  `/p/:id`, and pins `Cache-Control: no-store` on HTML shells. The JS bundle is
  content-hashed (`qari-entry-<hash>.js`) with a long-lived cache.
- **PR branches** get a "Workers Builds: qari" check. Note: PR-branch builds
  have been observed failing instantly (0 seconds) while merge builds succeed -
  that is a platform flake, not a code failure. Retry from the CF dashboard.
- **Native (iOS/Android):** EAS Build (`eas.json` profiles: development,
  preview, production; scripts `build:prod:ios`, `build:prod:android`).

---

## Open items - decisions and credentials needed

### 1. Android upload signing key + SHA-1/SHA-256 fingerprints
**Status:** undecided/incomplete. `withAndroidSigning.js` expects an upload
keystore via gradle.properties or env:
`ISTIMA_UPLOAD_STORE_FILE`, `ISTIMA_UPLOAD_STORE_PASSWORD`,
`ISTIMA_UPLOAD_KEY_ALIAS`, `ISTIMA_UPLOAD_KEY_PASSWORD`
(never commit the keystore or these values).
**Needed:**
1. Create/choose the upload keystore: `keytool -genkey -v -keystore upload.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000`
2. Get the fingerprints Google asks for:
   `keytool -list -v -keystore upload.keystore -alias upload` (SHA-1 and SHA-256 lines).
3. Register the SHA-1/SHA-256 in Google Play Console - https://play.google.com/console
   (App integrity / Play App Signing page) and in the Google Cloud OAuth Android
   client (see item 2).
4. Put the four `ISTIMA_UPLOAD_*` values in EAS Secrets -
   https://expo.dev (project > Secrets) so EAS builds sign releases.

### 2. Google sign-in OAuth client IDs (web / iOS / Android)
**Status:** placeholders. `config/branding.js` has
`googleClientIds: {web: '', ios: '', android: ''}`.
**Needed:**
1. Google Cloud Console > APIs & Services > Credentials -
   https://console.cloud.google.com/apis/credentials
2. Create three OAuth 2.0 client IDs:
   - **Web application**: authorized JavaScript origin `https://istima.app`
     (and `https://www.istima.app`); redirect URI `https://istima.app`.
   - **iOS**: bundle ID `com.istima.app`.
   - **Android**: package name + the upload-key SHA-1 from item 1.
3. Paste the three client IDs into `config/branding.js` (client IDs are public
   identifiers, not secrets).

### 3. Cloudflare worker deploy access
**Status:** working via GitHub-connected Workers Builds. No D1 binding exists
on the `qari` worker today; if one is added, create it in the dash
(Workers & Pages > qari > Settings > Bindings > D1) and declare it in
`wrangler.jsonc`, then run migrations with
`npx wrangler d1 migrations apply <db> --remote`.
**Needed (only for manual `wrangler deploy`):** a CF API token with
Workers Scripts:Edit on account `be60804420d2affb70c5ac16c2575cf9` -
https://dash.cloudflare.com/profile/api-tokens (Custom Token). Keep it in the
password manager; never in the repo.

### 4. Cloudflare cache rule check
**Status:** needs one dash look. After no-store shipped on the HTML shell,
the edge still reports `cf-cache-status: HIT` for `/`.
**Needed:** https://dash.cloudflare.com > istima.app > Caching > Cache Rules -
remove or scope any "cache everything" / Edge TTL rule so HTML is not
edge-cached. Hashed assets (`/_expo/**`) may keep a long TTL.

### 5. BAYAAN_* environment naming
**Status:** decision pending. `scripts/inventory-quran-audio.cjs` reads
`BAYAAN_CATALOGUE_URL`; `.github/workflows/inventory-quran-audio.yml` passes it
from a workflow-dispatch input.
**Needed:** decide the final variable name(s) for the Bayaan catalogue
integration; then rename in the script, the workflow input, and any local
`.env`. No secret value involved (a public catalogue endpoint).

### 6. GitHub token for automation (workflow scope)
**Status:** the PAT used by the automation helper can push code but gets 403
on check-run re-requests and branch-protection reads.
**Needed:** https://github.com/settings/tokens - regenerate/update the token
with the `repo` **and `workflow`** scopes (fine-grained token: Actions,
Checks, Contents, Pull requests read/write on AxiomGroupHQ/Qari). Replace the
stored token in the password manager.

### 7. Privacy contact email
**Status:** currently `app@istima.app` (in `data/legal/privacy.json`).
**Needed:** decide the permanent contact inbox (privacy@? support@?), create
it, and update `data/legal/privacy.json` (and `terms.json` if it references a
contact).

### 8. Legal pages: translate or English-only
**Status:** decision pending. `data/legal/privacy.json` and
`data/legal/terms.json` are English-only; the app ships 59 UI locales.
**Needed:** decide whether legal pages stay English (common for a first
release) or get translated. If translated, add per-locale JSON under
`data/legal/` and a loader keyed off the i18n locale.

---

*Last reviewed: 2026-10-17.*
