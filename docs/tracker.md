# Tracker

Deferred items and the self-hosting inventory. Update the status when something changes. Last reviewed October 18, 2026.

## Deferred items

| Item | Status | What is needed |
| --- | --- | --- |
| Support / Feature request links (Settings) | Hidden | A real support page or contact address. The two Settings rows were removed, `branding.supportUrl` is gone. Add them back once a URL exists. |
| Rate app (Settings) | Message only | The real App Store ID (and Play listing). The old upstream ID was removed, `utils/reviewUtils.ts` is deleted. Rate now shows a friendly "not available yet" toast. |
| Legal pages (privacy, terms) | English only, **reviewed** | Reviewed and accepted by the owner (October 18, 2026); stays English only for now. Both say "Last Updated: October 2026". |
| Manifest link in the web page | Open | `public/manifest.json` exists but the HTML does not link to it yet (needs a custom web HTML template). |
| Cloudflare Pages project for iapi.istima.app | **Done** | Pages project `qari-api` (repo `AxiomGroupHQ/qari-api`) serves clips and timestamps on `iapi.istima.app`. The Worker `qari-api` takes `iapi.istima.app/v1/*` on the same hostname. Pages allows 20,000 files per deploy (now ~12.9k). |

## Accounts and sync (deployed October 16, 2026)

Backend is live: Worker `qari-api` (routes `iapi.istima.app/v1/*`; renamed from `istima-api` on 2026-10-17, same D1) and D1 database `istima-db`, both created in the owner's Cloudflare account. Migrations `0001` (accounts, sync) and `0002_shared_playlists` are applied. No seed rows are needed. The share endpoints were smoke-tested after deploy (create 201, read 200, unknown id 404, bad input 400, test rows deleted). Registration is login only: there is no email verification and no email is sent. The old Postmark code was unused leftover and is removed (PR #48).

| Item | Status | What is needed |
| --- | --- | --- |
| API Worker + D1 schema | **Live** | - |
| Email sign-up / sign-in | **Live** | Nothing. No email provider is needed. Password reset would need one (section 8 of `docs/credentials-and-setup.md`). |
| Google sign-in | Built, **off in production** | `GOOGLE_CLIENT_IDS` on the Worker is empty. Needs three Google OAuth client IDs (section 3). Native needs a library swap and a new native build. |
| Sync: settings, favorites, play counts | Built | Test end to end on devices. |
| Sync: playlists, verse annotations, adhkar saved, listening position | Built | App adapters and server documents live since the accounts launch (October 16, 2026, `services/sync/SyncService.ts`). Test end to end on devices. |
| Account deletion | Built (App Store requirement) | - |
| Translations for the account screens | English only, **reviewed** | Reviewed and accepted by the owner (October 18, 2026). Translate into 59 locales when wanted. |
| Native build with `expo-secure-store` | Needed | New iOS and Android builds. |
| Credentials list | Written | `docs/credentials-and-setup.md` |

## What shipped in this round

Everything below is merged to `main`. "Verified" means unit tests, lint and a scoped typecheck, not a run on a device.

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
| #46 | `sharedPlaylists` flag turned on | Backend was already live. |
| #47 | CI lint job fix | ESLint passes with 0 errors. The TypeScript step still ran out of memory, fixed by the heap edit below. |
| #48 | Removed the unused Postmark email verification code | Login stays the only account flow. |
| #49 | Share, Discover and Android widget strings translated into 59 languages, plus Android `values-xx` resources | Reviewed and accepted by the owner (October 18, 2026); no native-speaker review. |
| #50 | Tracker update | - |
| #51 | Share for the Loved collection and the built-in system playlists | Uses `services/share/shareTrackList.ts`. |
| #52 | History screen (Collection > History): recently played, share, clear | 7 new strings in 60 languages. |
| #53 | Reading mode no longer changes the whole app theme | New `readingMode` setting (default: follow the app). One new string in 60 languages. |
| #54 | `discoverFeed` flag on, docs updated | - |
| #55 | Typecheck fix for `edge/previewWorker.ts` (`HTMLRewriter` types) | Last 3 real type errors CI reported. |
| #56 | Continue Listening uses the bundled headshot first, stronger light-mode fills on Home cards | Light mode look not checked on a device. |
| #57 | Adhkar category names sit on the tile over the art | Not checked on a device. |
| #58 | Settings icon moved to the top header, Adhkar tab added to the bottom bar | Adhkar screens now live under `app/(tabs)/(e.adhkar)`. URLs unchanged. Native gear position not checked on a device. |
| qari-api #2, #3 | Accounts/sync Worker, then share endpoints `POST/GET /v1/share/playlist` | Deployed. |

No PRs are open from this round except the tracker update itself.

CI: the owner raised the TypeScript step heap to 6144 MB in `.github/workflows/lint.yml`, which lets the full typecheck finish.
| #101 | Link audit fixes: taps that pushed to the removed `/player` route now play the track and open the player sheet (Search, Collection search), mp3quran timestamps use the `www` host (301 removed), dead Play-listing support link removed, unused CategoryScreen with a dead `/surah` push removed | Web build still needs the owner's deploy. |

## Feature flags

| Flag | State | Notes |
| --- | --- | --- |
| `sharedPlaylists` | On | Backend deployed. Android `/p/` links also need `assetlinks.json`. |
| `discoverFeed` | On | Turned on in #54. Still needs a device test, and the audio source terms have not been checked. |
| `carDisplay` | Off | Idle until a native bridge exists. |

## Next phase (parked items)

| Item | Why |
| --- | --- |
| Android `assetlinks.json` | Needs the SHA-256 of the Android signing key. Until then `/.well-known/assetlinks.json` returns the web app page and Android app links do not verify. |
| Google client IDs | Empty placeholder values are already in place, clearly marked, so nothing breaks and sign-in stays off: `googleClientIds` in `config/branding.js`, the `GOOGLE_IOS_URL_SCHEME` fallback in `app.config.js`, and `GOOGLE_CLIENT_IDS = ""` in the Worker `wrangler.toml`. To turn Google sign-in on, the owner adds the three real OAuth client IDs in the environment (Worker var + app config), section 3 of `docs/credentials-and-setup.md`. |
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
- The 59-language translations were written by an AI assistant. The owner reviewed and accepted them on October 18, 2026; no native-speaker review was done. If a native check ever happens, the languages most in need of one: Bambara, Mandinka, Fula, Wolof, Oromo, Tigrinya, Yoruba.
- Plural counts (`N recitations`) use one wording for every plural form.
- The new header gear, the Adhkar tab, the Adhkar tile labels and the light-mode Home fills (#56 to #58) were checked with lint, tests and a scoped typecheck only.
- The live site was checked only from outside (HTTP status and served HTML). 

## Self-hosting inventory

Status values: **bundled** = pulled and served from our own site, **not contacted** = the live app does not call it, **still external** = still depends on someone else.

| Asset / host | Used for | Status |
| --- | --- | --- |
| old upstream CDN `timestamps/{rewayatId}/{NNN}.json` (12,875 files, 113 rewayat, ~69 MB) | Verse follow-along timing | **Pulled and pushed** to the `AxiomGroupHQ/qari-api` repo (`timestamps/`). The app reads `https://iapi.istima.app/timestamps/...` on web, iOS and Android. Served by the Pages project `qari-api` on `iapi.istima.app`. |
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
| #117 | Shareable links | **Partly done** | Share buttons already make `https://istima.app/...` links. App-link domain and iOS `apple-app-site-association` added (PR #34). Android: SHA-256 of the signing key to add `assetlinks.json`. Playlist share links: backend is live (D1 + Worker), the flag is on (#46) and the strings are translated (#49). Android app links still need the SHA-256 for `assetlinks.json`. |
| #133 | Android performance | **Nothing safe to change blind** | Real Android device for list tuning and R8 testing. Console logs in hot paths are already `__DEV__` guarded. |
| #74 | Merge mini + full player into one sheet | **Skipped by owner** | Device or simulator to test the animation. Risk of breaking the player if built blind. |
| #126 | Home screen widgets | **Android: first widget built** | Android Quick Surah widget (Al-Fatiha, Ya-Sin, Al-Mulk, Al-Kahf, Mushaf; opens the app by deep link, no audio code). Widget description and Mushaf label are localized (#49) (surah names stay as in the app). Not compiled or run on a device yet. iOS widgets pending (needs Apple Developer access: App Group, new target). Watch and TV apps pending. Other Android widgets (now playing, ayah of the day) not started. |
| #118 | Watch apps | Not built | New native targets, Apple provisioning, devices. |
| #116 | TV apps | Not built | New native targets, store setup, devices. |
| #115 | CarPlay / Android Auto | **Groundwork only** | Car browse list and a "not available yet" fallback are in (`services/car`, flag `carDisplay`). No car screen appears yet. Still needs Apple's CarPlay audio entitlement, a native package (compatibility with RN 0.83 unverified), the Android Auto descriptor, and simulator/DHU testing. |
| #119 | Analytics and listening insights | **Skipped by owner** | Decision on dashboard content and on PostHog (new third-party service, privacy policy). |
| #8 | Discover feed (random ayah snippets) | **Built, flag on** | Swipe feed of random ayat from existing recitations that have per-ayah timings (`/discover`, flag `discoverFeed`, entry tile on Search). Own audio player, steps aside when the main player starts. Strings translated (#49). Not tested on a device. Audio rights unchanged from normal playback; licence terms of the sources not verified. |
| #9 | Feature requirements doc | **Done** | `docs/features.md`. |
| #192 | i18n | **Done** (60 languages) | - |
| #120 | Cloud sync | **Done** (own accounts and Worker) | Remaining sync documents listed above. |
| #127 | Web app | **Done** (istima.app) | - |
| #242 | Dev-client crash on OAuth deep links | Not applicable | Dev builds only. |
| #323 | Quran Foundation note sync | Not applicable | Istima has no Quran Foundation sync. |
| #62 | MP3 to Opus | Not applicable | Istima does not host audio. |
