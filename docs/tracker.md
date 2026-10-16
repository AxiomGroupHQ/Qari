# Tracker

Deferred items and the self-hosting inventory. Update the status when something changes. Last reviewed October 16, 2026 (end of the localization, accounts and share-links round).

## Deferred items

| Item | Status | What is needed |
| --- | --- | --- |
| Support / Feature request links (Settings) | Hidden | A real support page or contact address. The two Settings rows were removed, `branding.supportUrl` is gone. Add them back once a URL exists. |
| Rate app (Settings) | Message only | The real App Store ID (and Play listing). The old upstream ID was removed, `utils/reviewUtils.ts` is deleted. Rate now shows a friendly "not available yet" toast. |
| Legal pages (privacy, terms) | English only | Decide whether to translate `data/legal/*.json`. Both now say "Last Updated: October 2026". |
| Manifest link in the web page | Open | `public/manifest.json` exists but the HTML does not link to it yet (needs a custom web HTML template). |
| Cloudflare Pages project for iapi.istima.app | **Done** | Pages project `qari-api` (repo `AxiomGroupHQ/Qari-api`) serves clips and timestamps on `iapi.istima.app`. The Worker `istima-api` takes `iapi.istima.app/v1/*` on the same hostname. Pages allows 20,000 files per deploy (now ~12.9k). |

## Accounts and sync (deployed October 16, 2026)

Backend is live: Worker `istima-api` (routes `iapi.istima.app/v1/*`) and D1 database `istima-db`, both created in the owner's Cloudflare account. Migrations `0001` (accounts, sync) and `0002_shared_playlists` are applied. No seed rows are needed. The share endpoints were smoke-tested after deploy (create 201, read 200, unknown id 404, bad input 400, test rows deleted). Registration is login only: there is no email verification and no email is sent. The old Postmark code was unused leftover and is removed (PR #48).

| Item | Status | What is needed |
| --- | --- | --- |
| API Worker + D1 schema | **Live** | - |
| Email sign-up / sign-in | **Live** | Nothing. No email provider is needed. Password reset would need one (section 8 of `docs/credentials-and-setup.md`). |
| Google sign-in | Built, **off in production** | `GOOGLE_CLIENT_IDS` on the Worker is empty. Needs three Google OAuth client IDs (section 3). Native needs a library swap and a new native build. |
| Sync: settings, favorites, play counts | Built | Test end to end on devices. |
| Sync: playlists, verse annotations, adhkar saved, listening position | Not built | Server already accepts these documents. App adapters still to write. |
| Account deletion | Built (App Store requirement) | - |
| Translations for the account screens | English only | Translate into 59 locales after review. |
| Native build with `expo-secure-store` | Needed | New iOS and Android builds. |
| Credentials list | Written | `docs/credentials-and-setup.md` |

## What shipped in this round

Everything below is merged to `main` unless a PR number is marked open. "Verified" means unit tests, lint and a scoped typecheck, not a run on a device.

| PR | Change | Notes |
| --- | --- | --- |
| #34 | Offline downloads fix, app-link domain, iOS AASA, many Istima rebrand fixes | Merged early, before the later work. |
| #36 | Intro clip: skipping or changing surah during the intro cancels it | Clip rules: intro before every surah, outro only after surahs over 3 minutes, never between ayat, no Settings toggle. Env flags `EXPO_PUBLIC_INTRO_CLIP_START` and `EXPO_PUBLIC_INTRO_CLIP_END`. |
| #37 | Explore tiles filled with a soft tint on web and Android | Light mode was hollow. |
| #38 | Playlist share links (`sharedPlaylists` flag) | Share action, `/p/<id>` screen, preview worker `edge/previewWorker.ts`. |
| #39 | CarPlay / Android Auto groundwork (flag `carDisplay`, off) | No car screen yet. |
| #40 | Android Quick Surah home screen widget | Not compiled on a device. |
| #41 | Discover feed (flag `discoverFeed`, on) | Not tested on a device. |
| #42 | Dark theme by default | Brought `feat/default-dark` into `main`. |
| #43 | Footer test for playlist shares, tracker date | Also re-triggered the site build. |
| #44 | Continue Listening cards fall back to the bundled headshot when a saved image URL fails | The reciter API returns 404 in production, so saved entries have no image URL. |
| Qari-api #2, #3 | Accounts/sync Worker, then share endpoints `POST/GET /v1/share/playlist` | Deployed. |

Open PRs, not merged (the owner merges):

| PR | Change |
| --- | --- |
| #46 | Turn on `sharedPlaylists` (backend is live) |
| #47 | Fix the failing Lint & Typecheck job (TypeScript step ran out of memory on CI). Not verified locally. CI on the PR is the test. |
| #48 | Remove the unused Postmark email verification code |
| #49 | Translate share links, Discover and Android widget strings into the other 59 languages, plus Android `values-xx` resources |
| (this PR) | Tracker update |

## Feature flags

| Flag | State | Notes |
| --- | --- | --- |
| `sharedPlaylists` | Off on `main`, on in #46 | Backend deployed. Android `/p/` links also need `assetlinks.json`. |
| `discoverFeed` | On | Turned on by the owner. Still needs a device test, and the audio source terms have not been checked. |
| `carDisplay` | Off | Idle until a native bridge exists. |

## Parked or pending

| Item | Why |
| --- | --- |
| Android `assetlinks.json` | Needs the SHA-256 of the Android signing key. Until then `/.well-known/assetlinks.json` returns the web app page and Android app links do not verify. |
| Google client IDs | Three OAuth client IDs, then set `GOOGLE_CLIENT_IDS` on the Worker. |
| CarPlay / Android Auto screens | Apple CarPlay audio entitlement, a native package, simulator and head unit testing. |
| iOS widgets, Watch app, TV apps | Apple provisioning, new native targets, devices. |
| Analytics | Skipped by the owner. |
| Merged mini + full player | Skipped by the owner. |
| Legal pages translation | `data/legal/*.json` is English only. |
| Audio on R2 | Recitation audio is still `mp3quran.net`. Self-hosting needs R2 and storage plan. |
| Rate app, Support links | Need the store IDs and a support page. |
| Workflow files | Em dashes in `.github/workflows` and the name of `inventory-quran-audio.yml` need a token with workflow scope. |
| `BAYAAN_*` env and secret names | Owner's own CI and Cloudflare settings, rename to `ISTIMA_*` when convenient. |

## Unverified

- No device run yet of the Android widget, the `values-xx` resources, Discover, the share sheet, or the `/p/<id>` screen on iOS and Android.
- The 59-language translations were written by an AI assistant and have not had a native-speaker review. Languages most in need of a check: Bambara, Mandinka, Fula, Wolof, Oromo, Tigrinya, Yoruba.
- Plural counts (`N recitations`) use one wording for every plural form.
- The Lint & Typecheck fix (#47) has not been run to completion locally.
- The live site was checked only from outside (HTTP status and served HTML). The Cloudflare Workers Builds check had not finished on the newest `main` commit at the time of writing.

## Self-hosting inventory

Status values: **bundled** = pulled and served from our own site, **not contacted** = the live app does not call it, **still external** = still depends on someone else.

| Asset / host | Used for | Status |
| --- | --- | --- |
| old upstream CDN `timestamps/{rewayatId}/{NNN}.json` (12,875 files, 113 rewayat, ~69 MB) | Verse follow-along timing | **Pulled and pushed** to the `AxiomGroupHQ/Qari-api` repo (`timestamps/`). The app reads `https://iapi.istima.app/timestamps/...` on web, iOS and Android. Served by the Pages project `qari-api` on `iapi.istima.app`. |
| Old upstream reciter catalog API | Reciter data | **Not contacted**. No API URL is set in production, the app uses the bundled `data/reciters-fallback.json`. Env var names `EXPO_PUBLIC_ISTIMA_API_URL/KEY` still work as legacy aliases only. |
| Reciter catalog and rewayat data | Reciter lists | **Bundled** (`data/reciters-fallback.json`, `data/rewayat*.ts`). |
| `EXPO_PUBLIC_KILLSWITCH_URL` | Remote kill switch | **Not contacted** unless the variable is set. It is not set. |
| Old upstream link domain (iOS associated domain) | iOS universal links | **Fixed.** `ios/Istima/Istima.entitlements` and `app.config.js` both use `istima.app` now. AASA file is in `public/.well-known/`. |
| Audio files (`server*.mp3quran.net`) | Recitation playback | **Still external**, but this is mp3quran.net, not the old upstream. Self-hosting is ~GBs of audio and needs Cloudflare R2 access. |
| Runtime identifiers (storage keys such as `@istima/last_track`, `istima_*` keys) | Local storage | Kept on purpose, so existing users keep their data. Not network contacts. |

## Feature backlog (checked October 2026)

Item numbers are the original request-list issue numbers. Feature write-up: `docs/features.md`.

| Issue | Item | Status | What is needed |
| --- | --- | --- | --- |
| #204 | Downloads vanish offline when reciter list is empty | **Fixed** (PR #34) | Device check offline. |
| #117 | Shareable links | **Partly done** | Share buttons already make `https://istima.app/...` links. App-link domain and iOS `apple-app-site-association` added (PR #34). Android: SHA-256 of the signing key to add `assetlinks.json`. Playlist share links: backend is live (D1 + Worker), the flag is turned on in PR #46, and the strings are translated in PR #49. Android app links still need the SHA-256 for `assetlinks.json`. |
| #133 | Android performance | **Nothing safe to change blind** | Real Android device for list tuning and R8 testing. Console logs in hot paths are already `__DEV__` guarded. |
| #74 | Merge mini + full player into one sheet | **Skipped by owner** | Device or simulator to test the animation. Risk of breaking the player if built blind. |
| #126 | Home screen widgets | **Android: first widget built** | Android Quick Surah widget (Al-Fatiha, Ya-Sin, Al-Mulk, Al-Kahf, Mushaf; opens the app by deep link, no audio code). Widget description and Mushaf label are localized in PR #49 (surah names stay as in the app). Not compiled or run on a device yet. iOS widgets pending (needs Apple Developer access: App Group, new target). Watch and TV apps pending. Other Android widgets (now playing, ayah of the day) not started. |
| #118 | Watch apps | Not built | New native targets, Apple provisioning, devices. |
| #116 | TV apps | Not built | New native targets, store setup, devices. |
| #115 | CarPlay / Android Auto | **Groundwork only** | Car browse list and a "not available yet" fallback are in (`services/car`, flag `carDisplay`). No car screen appears yet. Still needs Apple's CarPlay audio entitlement, a native package (compatibility with RN 0.83 unverified), the Android Auto descriptor, and simulator/DHU testing. |
| #119 | Analytics and listening insights | **Skipped by owner** | Decision on dashboard content and on PostHog (new third-party service, privacy policy). |
| #8 | Discover feed (random ayah snippets) | **Built, flag on** | Swipe feed of random ayat from existing recitations that have per-ayah timings (`/discover`, flag `discoverFeed`, entry tile on Search). Own audio player, steps aside when the main player starts. Strings translated in PR #49. Not tested on a device. Audio rights unchanged from normal playback; licence terms of the sources not verified. |
| #9 | Feature requirements doc | **Done** | `docs/features.md`. |
| #192 | i18n | **Done** (60 languages) | - |
| #120 | Cloud sync | **Done** (own accounts and Worker) | Remaining sync documents listed above. |
| #127 | Web app | **Done** (istima.app) | - |
| #242 | Dev-client crash on OAuth deep links | Not applicable | Dev builds only. |
| #323 | Quran Foundation note sync | Not applicable | Istima has no Quran Foundation sync. |
| #62 | MP3 to Opus | Not applicable | Istima does not host audio. |
