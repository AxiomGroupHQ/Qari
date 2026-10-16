# Tracker

Deferred items and the Bayaan self-hosting inventory. Update the status when something changes.

## Deferred items

| Item | Status | What is needed |
| --- | --- | --- |
| Support / Feature request links (Settings) | Hidden | A real support page or contact address. The two Settings rows were removed, `branding.supportUrl` is gone. Add them back once a URL exists. |
| Rate app (Settings) | Message only | The real App Store ID (and Play listing). Bayaan's ID was removed, `utils/reviewUtils.ts` is deleted. Rate now shows a friendly "not available yet" toast. |
| Legal pages (privacy, terms) | English only | Decide whether to translate `data/legal/*.json`. Both now say "Last Updated: October 2026". |
| Manifest link in the web page | Open | `public/manifest.json` exists but the HTML does not link to it yet (needs a custom web HTML template). |
| Cloudflare Pages file limit | Watch | `public/timestamps` adds ~12.9k files. Pages allows 20,000 files per deploy. Merge them into one file per rewayat if the app grows. |

## Bayaan self-hosting inventory

Status values: **bundled** = pulled and served from our own site, **not contacted** = the live app does not call it, **still external** = still depends on someone else.

| Asset / host | Used for | Status |
| --- | --- | --- |
| `cdn.thebayaan.com/timestamps/{rewayatId}/{NNN}.json` (12,875 files, 113 rewayat, ~69 MB) | Verse follow-along timing | **Bundled**. Pulled into `public/timestamps/`, served from `istima.app/timestamps/...`. Code reads `/timestamps` on web and `https://istima.app/timestamps` on iOS/Android. Live after the next deploy. |
| `api.thebayaan.com` (reciter catalog API) | Reciter data | **Not contacted**. No API URL is set in production, the app uses the bundled `data/reciters-fallback.json`. Env var names `EXPO_PUBLIC_BAYAAN_API_URL/KEY` still work as legacy aliases only. |
| Reciter catalog and rewayat data | Reciter lists | **Bundled** (`data/reciters-fallback.json`, `data/rewayat*.ts`). |
| `EXPO_PUBLIC_KILLSWITCH_URL` | Remote kill switch | **Not contacted** unless the variable is set. It is not set. |
| `app.thebayaan.com` (iOS associated domain in `ios/Bayaan/Bayaan.entitlements`) | iOS universal links | **Still external**. Only in the committed iOS project file. `app.config.js` uses `EXPO_PUBLIC_ASSOCIATED_DOMAIN` instead. Needs a decision before the next iOS build. |
| Audio files (`server*.mp3quran.net`) | Recitation playback | **Still external**, but this is mp3quran.net, not Bayaan. Self-hosting is ~GBs of audio and needs Cloudflare R2 access. |
| Runtime identifiers (storage keys such as `@bayaan/last_track`, Postmark template alias, `bayaan_*` keys) | Local storage, email template | Kept on purpose, so existing users keep their data. Not network contacts. |
