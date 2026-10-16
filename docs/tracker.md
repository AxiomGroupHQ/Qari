# Tracker

Deferred items and the self-hosting inventory. Update the status when something changes.

## Deferred items

| Item | Status | What is needed |
| --- | --- | --- |
| Support / Feature request links (Settings) | Hidden | A real support page or contact address. The two Settings rows were removed, `branding.supportUrl` is gone. Add them back once a URL exists. |
| Rate app (Settings) | Message only | The real App Store ID (and Play listing). The old upstream ID was removed, `utils/reviewUtils.ts` is deleted. Rate now shows a friendly "not available yet" toast. |
| Legal pages (privacy, terms) | English only | Decide whether to translate `data/legal/*.json`. Both now say "Last Updated: October 2026". |
| Manifest link in the web page | Open | `public/manifest.json` exists but the HTML does not link to it yet (needs a custom web HTML template). |
| Cloudflare Pages project for iapi.istima.app | Needs setup | Connect `AxiomGroupHQ/Qari-api` to a Pages project and add the custom domain `iapi.istima.app`. Timestamps return 404 until this is done. Pages allows 20,000 files per deploy (now ~12.9k). |

## Accounts and sync (in progress, not committed)

| Item | Status | What is needed |
| --- | --- | --- |
| API Worker + D1 schema (`istima-worker`, routes `iapi.istima.app/v1/*`) | Built and tested locally | Create D1 database, deploy. See `docs/credentials-and-setup.md` sections 1 and 2. |
| Email sign-up / sign-in | Built | Nothing for basic use. Email verification and password reset need an email provider (section 8). |
| Google sign-in | Built for web, hidden until configured | Three Google OAuth client IDs (section 3). Native needs a library swap and a new native build. |
| Sync: settings, favorites, play counts | Built | Test with a deployed API. |
| Sync: playlists, verse annotations, adhkar saved, listening position | Not built | Server already accepts these documents. App adapters still to write. |
| Account deletion | Built (App Store requirement) | - |
| Translations for the account screens | English only | Translate into 59 locales after review. |
| Native build with `expo-secure-store` | Needed | New iOS and Android builds. |
| Credentials list | Written | `docs/credentials-and-setup.md` |

## Self-hosting inventory

Status values: **bundled** = pulled and served from our own site, **not contacted** = the live app does not call it, **still external** = still depends on someone else.

| Asset / host | Used for | Status |
| --- | --- | --- |
| old upstream CDN `timestamps/{rewayatId}/{NNN}.json` (12,875 files, 113 rewayat, ~69 MB) | Verse follow-along timing | **Pulled and pushed** to the `AxiomGroupHQ/Qari-api` repo (`timestamps/`). The app reads `https://iapi.istima.app/timestamps/...` on web, iOS and Android. **Still pending:** Cloudflare Pages + domain (see above). |
| Old upstream reciter catalog API | Reciter data | **Not contacted**. No API URL is set in production, the app uses the bundled `data/reciters-fallback.json`. Env var names `EXPO_PUBLIC_ISTIMA_API_URL/KEY` still work as legacy aliases only. |
| Reciter catalog and rewayat data | Reciter lists | **Bundled** (`data/reciters-fallback.json`, `data/rewayat*.ts`). |
| `EXPO_PUBLIC_KILLSWITCH_URL` | Remote kill switch | **Not contacted** unless the variable is set. It is not set. |
| Old upstream link domain (iOS associated domain) | iOS universal links | **Fixed.** `ios/Istima/Istima.entitlements` and `app.config.js` both use `istima.app` now. AASA file is in `public/.well-known/`. |
| Audio files (`server*.mp3quran.net`) | Recitation playback | **Still external**, but this is mp3quran.net, not the old upstream. Self-hosting is ~GBs of audio and needs Cloudflare R2 access. |
| Runtime identifiers (storage keys such as `@istima/last_track`, Postmark template alias, `istima_*` keys) | Local storage, email template | Kept on purpose, so existing users keep their data. Not network contacts. |

## Feature backlog (checked October 2026)

Item numbers are the original request-list issue numbers. Feature write-up: `docs/features.md`.

| Issue | Item | Status | What is needed |
| --- | --- | --- | --- |
| #204 | Downloads vanish offline when reciter list is empty | **Fixed** (PR #34) | Device check offline. |
| #117 | Shareable links | **Partly done** | Share buttons already make `https://istima.app/...` links. App-link domain and iOS `apple-app-site-association` added (PR #34). Android: SHA-256 of the signing key to add `assetlinks.json`. Playlist share links built behind the `sharedPlaylists` flag (share action, `/p/<id>` screen, preview worker `edge/previewWorker.ts`). Not live until the D1 migration and API worker are deployed (owner's Cloudflare access). New strings are English only, 59 translations pending. |
| #133 | Android performance | **Nothing safe to change blind** | Real Android device for list tuning and R8 testing. Console logs in hot paths are already `__DEV__` guarded. |
| #74 | Merge mini + full player into one sheet | **Skipped by owner** | Device or simulator to test the animation. Risk of breaking the player if built blind. |
| #126 | Home screen widgets | **Android: first widget built** | Android Quick Surah widget (Al-Fatiha, Ya-Sin, Al-Mulk, Al-Kahf, Mushaf; opens the app by deep link, no audio code). Not compiled or run on a device yet. iOS widgets pending (needs Apple Developer access: App Group, new target). Watch and TV apps pending. Other Android widgets (now playing, ayah of the day) not started. |
| #118 | Watch apps | Not built | New native targets, Apple provisioning, devices. |
| #116 | TV apps | Not built | New native targets, store setup, devices. |
| #115 | CarPlay / Android Auto | Not built | Apple CarPlay audio entitlement request, Google Play review. Plan: `docs/features/carplay-android-auto.md`. |
| #119 | Analytics and listening insights | **Skipped by owner** | Decision on dashboard content and on PostHog (new third-party service, privacy policy). |
| #8 | Discover feed (random ayah snippets) | **Built, flag off** | Swipe feed of random ayat from existing recitations that have per-ayah timings (`/discover`, flag `discoverFeed`, entry tile on Search). Own audio player, steps aside when the main player starts. English strings only. Not tested on a device. Audio rights unchanged from normal playback; licence terms of the sources not verified. |
| #9 | Feature requirements doc | **Done** | `docs/features.md`. |
| #192 | i18n | **Done** (60 languages) | - |
| #120 | Cloud sync | **Done** (own accounts and Worker) | Remaining sync documents listed above. |
| #127 | Web app | **Done** (istima.app) | - |
| #242 | Dev-client crash on OAuth deep links | Not applicable | Dev builds only. |
| #323 | Quran Foundation note sync | Not applicable | Istima has no Quran Foundation sync. |
| #62 | MP3 to Opus | Not applicable | Istima does not host audio. |
