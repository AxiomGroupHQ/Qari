# R2 Audio Cutover & Shareable Links Overhaul

## Overview

Two interconnected efforts shipping in sequence:

1. **Phase 1 - R2 Cutover:** Point all 243 rewayat server URLs in the Railway DB to `cdn.example.com`, handle backwards compatibility for cached data and stale player queue.
2. **Phase 2 - Share Links:** Build shareable deep links on `istima.app` with auto-play, verse sharing, and share buttons throughout the app.
3. **Phase 3 - Rich OG Cards:** Dynamic server-side OG image generation for branded link previews.

Phase 1 must land first because it establishes the predictable R2 URL structure that share links mirror. The share links feature branch has not shipped to production, so there are no existing shared URLs to maintain backwards compatibility for - we build the URL structure clean from scratch.

**Repo locations:**
- App: `/Users/osmansaeday/theIstima/Istima`
- Backend: `/Users/osmansaeday/theIstima/istima-backend`

---

## Phase 1: R2 Audio Cutover

### Current State

- 27,869 of 27,874 audio files are already on R2 bucket `istima-audio` at `cdn.example.com`
- 5 missing files are data quality issues (not real gaps)
- DB rewayat `server` column still points to old sources: 228 → mp3quran, 15 → Supabase, 14 → cdn.example.com
- R2 POC branch (`feature/r2-audio-poc`) has `data/rewayat-slugs.json` and app-side `generateAudioUrl()` code, but is not merged
- No backwards compatibility for cached reciter data or stale player queue URLs

### R2 URL Structure

```
cdn.example.com/quran/recitations/{reciter-slug}/{rewayah-slug}/{style-slug}/default/{001-114}.mp3
```

The share link URL structure intentionally mirrors this:
```
istima.app/share/reciter/{reciter-slug}/{rewayah-slug}/{style-slug}/surah/{num}
```

Slugs are derived from:
- **Reciter slug** - `reciter.slug` column in DB (already populated)
- **Rewayah slug** - canonical mapping in `data/rewayat-slugs.json` (e.g., `"Hafs A'n Assem" → "hafs"`)
- **Style slug** - canonical mapping in same file (e.g., `"murattal" → "murattal"`, `"mojawwad" → "mojawwad"`, `"molim" → "moalim"`, `"hadr" → "hadr"`)

### Prerequisites

**`data/rewayat-slugs.json` must be created first.** This file exists on the `feature/r2-audio-poc` branch but not on the main codebase. It must be copied or recreated before the migration script or any share link URL builder can work. The file maps rewayat names and styles to URL-safe slugs:

```json
{
  "rewayat": {
    "Hafs A'n Assem": "hafs",
    "Warsh A'n Nafi'": "warsh",
    ...
  },
  "styles": {
    "murattal": "murattal",
    "mojawwad": "mojawwad",
    "molim": "moalim",
    "hadr": "hadr",
    ...
  }
}
```

The file must cover every rewayat name and style value present in the DB. The migration script should fail loudly on any unmapped name/style rather than generating a broken URL.

### DB Migration (via Backend Admin API)

The Railway PostgreSQL database is updated through the backend's admin API, not direct SQL.

**Authentication:**
- **Reads** - `GET /v1/reciters?page=N&limit=200` - requires API key in `Authorization: Bearer` header (from `api_keys` table)
- **Writes** - `PUT /admin/rewayat/:id` - requires admin JWT. Obtain via `POST /admin/auth/login` with email + password, extract `token` from response. JWT expires after 8 hours - script should handle 401 responses by re-authenticating.

**Update payload:** `{ server: "<r2 url>", source_type: "istima" }` - only these two fields, sent as a partial update. This avoids triggering the `style` enum validation (which doesn't include `hadr` or `molim`).

A script that updates every rewayat row's `server` column:

```
Before: https://server7.mp3quran.net/basit/
After:  https://cdn.example.com/quran/recitations/abdulbasit-abdulsamad/hafs/murattal/default
```

The script:
1. Authenticates: `POST /admin/auth/login` → gets JWT
2. Fetches all reciters + rewayat from `GET /v1/reciters` (paginated, using API key)
3. For each rewayat, builds the R2 URL using `reciter.slug` + `rewayat-slugs.json` mapping
4. Normalizes the URL (no trailing slash - `generateAudioUrl()` appends `/{surah}.mp3`)
5. Verifies `{r2_url}/001.mp3` returns HTTP 200 from `cdn.example.com` before writing
6. Skips soft-deleted rewayat (`is_active === false`) to avoid updating inactive rows
7. Calls `PUT /admin/rewayat/:id` with `{ server, source_type: 'istima' }` using admin JWT
8. Handles 401 by re-authenticating and retrying
9. Reports failures (missing slug mappings, 404s, API errors) without updating those rows
10. Outputs a summary: updated count, skipped count, failure details

### App-Side Changes

**`data/rewayat-slugs.json`:** Copy from R2 POC branch into the main codebase. Verify it covers all rewayat names and styles in the current DB.

**`utils/audioUtils.ts`:** The current production code already does `${rewayat.server}/${paddedSurah}.mp3` - once the DB server URLs point to R2, this works without code changes. The R2 POC branch's conditional routing code is not needed and should not be merged.

**`services/dataService.ts`:**
- Bump `DATA_VERSION` to `'4'` to bust the `istima_reciters` AsyncStorage cache so old mp3quran/Supabase URLs are replaced on next launch
- Add `getReciterBySlug(slug: string)` - simple array find on in-memory `RECITERS`

**Player queue migration (stale URLs):** The `DATA_VERSION` bump only busts the reciters cache. Stale audio URLs also live in the Zustand-persisted `player-store` AsyncStorage key (the `queue.tracks` array contains full URLs). On app startup, check if any track URL in the persisted queue contains `mp3quran.net` or `supabase.co` - if so, clear the queue. This prevents the player from trying to resume playback from dead URLs.

`@istima/last_track` in AsyncStorage is NOT the active persistence mechanism - the player restores from `useRecentlyPlayedStore` and `playerStore.queue`. Do not target `@istima/last_track`.

### Bad Data Fixes

5 known data quality issues from the R2 migration that must be fixed in the DB:
- **Ayyub Asif** - 2 `None` entries in `surah_list` - remove them from the array, update `surah_total` to match
- **3 missing source files** - Files that don't exist on the original mp3quran source (Al-Burimi, Al-Qazabri, Rasheed Ifrad per project memory). These surahs should be removed from `surah_list` and `surah_total` decremented accordingly.

The migration script should detect these (HTTP 404 on verification) and output them in the failure report. Fix them via `PUT /admin/rewayat/:id` with corrected `surah_list` and `surah_total`.

### R2 POC Branch - What to Keep

Only `data/rewayat-slugs.json` is needed from the `feature/r2-audio-poc` branch. Everything else is either unnecessary or superseded:
- `utils/audioUtils.ts` changes - not needed; current production code already works once DB URLs point to R2
- `services/dataService.ts` changes - superseded by the new DATA_VERSION bump approach
- `scripts/migrate-to-r2*.py` - not needed; new migration script goes through admin API
- `workers/r2-migrator/` - not needed; migration is complete, worker can be deleted from Cloudflare

### Verification

Before and after the DB migration:
- Script checks every rewayat's R2 URL returns HTTP 200
- Bad data entries flagged and fixed
- Smoke test: play audio from 3-5 different reciters across former source types (mp3quran, Supabase) to confirm playback works
- Verify the player queue migration clears stale URLs correctly

---

## Phase 2: Share Links

### Important: Requires Native Rebuild

Changing `associatedDomains` (iOS) and `intentFilters` (Android) requires `expo prebuild` + new App Store / Play Store builds. These changes are NOT OTA-able. Plan the release accordingly.

### Domain Setup

**From:** `iapi.istima.app/share/*`
**To:** `istima.app/share/*`

`istima.app` must serve:
- `/.well-known/apple-app-site-association` - HTTPS, `Content-Type: application/json`, no redirects (Apple crawls this at app submission and every 24h; any misconfiguration silently breaks Universal Links)
- `/.well-known/assetlinks.json` - for Android App Links verification
- `/share/*` - OG pages for bots, store redirects for humans

Can be done as a Cloudflare Worker proxying to the Railway backend, a CNAME + reverse proxy, or a separate Railway service. The key requirement is that `/.well-known/*` is served directly (no redirect chain).

**Files to update:**
- `app.config.js` - `associatedDomains` and `intentFilters[0].data.host` (NOT the generated `AndroidManifest.xml` or `Istima.entitlements` - those are outputs of `expo prebuild`)
- `utils/shareUtils.ts` - `BASE_URL`
- Backend `share/index.ts` - `BASE_URL` and `IOS_STORE_URL` (fix to `id6648769980`)
- Backend `ogTemplate.ts` - `IOS_STORE_URL` (already correct ID, fix URL format to match)

### URL Structure

The share URL structure intentionally mirrors the R2 CDN URL structure for consistency:

| Content | URL Pattern | App Behavior |
|---|---|---|
| Reciter profile | `istima.app/share/reciter/{slug}` | Opens reciter profile |
| Recitation | `istima.app/share/reciter/{slug}/{rewayat}/{style}/surah/{num}` | Auto-plays track |
| Recitation + timestamp | Same + `?t={seconds}` | Auto-plays from position |
| Mushaf page | `istima.app/share/mushaf/{page}` | Opens mushaf at page |
| Verse | `istima.app/share/verse/{surah}/{ayah}` | Opens mushaf at verse |
| Adhkar category | `istima.app/share/adhkar/{superId}` | Opens adhkar category list |
| Dhikr | `istima.app/share/dhikr/{superId}/{dhikrId}` | Opens dhikr reader |

### Expo Router File Structure

Delete the old receiver screens (not in production, no backwards compatibility needed). Create new ones:

```
app/share/
├── reciter/
│   ├── [slug].tsx                              ← Reciter profile
│   └── [slug]/
│       └── [rewayat]/
│           └── [style]/
│               └── surah/
│                   └── [num].tsx               ← Recitation with auto-play
├── mushaf/
│   └── [page].tsx                              ← Mushaf page
├── verse/
│   └── [surah]/
│       └── [ayah].tsx                          ← Verse
├── adhkar/
│   └── [superId].tsx                           ← Adhkar category
└── dhikr/
    └── [superId]/
        └── [dhikrId].tsx                       ← Dhikr reader
```

No routing conflicts: `[slug].tsx` (leaf file) and `[slug]/` (directory) coexist cleanly in Expo Router - the file matches `/share/reciter/something` and the directory matches deeper paths.

### Bug Fixes

1. **App Store ID mismatch:** Backend `share/index.ts` line 8 uses `id6743673724` (wrong). Fix to `id6648769980`. Also fix URL format to include `/us/` to match `ogTemplate.ts`.

2. **Android SHA-256 fingerprint:** Set `ANDROID_SHA256_CERT` env var on Railway with the real signing cert fingerprint:
   ```
   keytool -list -v -keystore ~/Documents/app-credentials/istima/keystore/istima-upload-key.keystore
   ```

3. **Dead code:** Remove `storeRedirectUrl()` from `share/index.ts` (references nonexistent `/share/redirect` route).

4. **Remove playlist share route and generator:** `app/share/playlist/[id].tsx` is a no-op stub. Remove it along with `playlistShareUrl()` from `shareUtils.ts`. Can be re-added when playlist sharing is actually implemented.

5. **`theme.colors.primary` in all 5 receiver screens:** Replace `theme.colors.primary` with `theme.colors.text` for ActivityIndicator in `[slug].tsx`, `[num].tsx`, `[page].tsx`, `[superId].tsx`, and `playlist/[id].tsx` (before deletion).

6. **`og-default.png` is not served:** Backend `ogTemplate.ts` references `https://iapi.istima.app/og-default.png` but the backend has no static file route for it. Either add a static file route or host the image on R2/CDN and update the URL.

### Slug Resolution (Client-Side)

**Reciter resolution:**
```typescript
// dataService.ts
export function getReciterBySlug(slug: string): Reciter | undefined {
  return RECITERS.find(r => r.slug === slug);
}
```

`Reciter.slug` is typed as `slug?: string | null`. If a reciter has no slug populated, `getReciterBySlug()` won't find it. The share URL builder should only generate share links for reciters that have slugs - fall back to not showing the share button rather than generating a broken link with a UUID.

**Rewayat resolution (for recitation share links):**
```typescript
import rewayatSlugs from '@/data/rewayat-slugs.json';

function resolveRewayat(reciter: Reciter, rewayatSlug: string, styleSlug: string): Rewayat | undefined {
  return reciter.rewayat.find(rw => {
    const nameSlug = rewayatSlugs.rewayat[rw.name as keyof typeof rewayatSlugs.rewayat];
    const stSlug = rewayatSlugs.styles[rw.style as keyof typeof rewayatSlugs.styles] ?? 'murattal';
    return nameSlug === rewayatSlug && stSlug === styleSlug;
  });
}
```

### Cold-Start Deep Link Handling

When the app is cold-started via a share link, receiver screens render before `AppInitializer` finishes loading reciter data. The in-memory `RECITERS` array starts empty, so `getReciterBySlug()` returns `undefined`.

**Fix:** Add an `isInitialized` flag to a Zustand store (or `reciterStore`) that is set to `true` after `AppInitializer` completes reciter loading. Receiver screens poll or subscribe to this flag before attempting slug resolution. Pattern:

```typescript
// In receiver screen
const isReady = useReciterStore(s => s.isInitialized);
useEffect( => {
  if (!isReady) return;
  const reciter = getReciterBySlug(slug);
  // navigate...
}, [isReady, slug]);
```

This ensures deep links work on both warm starts (instant) and cold starts (waits for data).

### Auto-Play Flow

When a recitation share link is opened (`/share/reciter/{slug}/{rewayat}/{style}/surah/{num}`):

1. Receiver screen waits for `isInitialized` flag
2. Resolves slug → reciter via `getReciterBySlug()`
3. Resolves rewayat/style slugs → rewayat via `resolveRewayat()`
4. Calls player service to load and play track: `{ reciterId, rewayatId, surahId }`
5. Navigates to reciter profile with rewayat + surah pre-selected
6. If `?t=` param present, seeks to that position after playback starts
7. Uses existing `usePlayerActions` for zero-re-render playback control

The reciter profile screen (`ReciterProfile.tsx`) needs to accept and act on `surah` and `rewayatId` params - currently it only reads `{id}`. Thread these through the screen file (`app/(tabs)/(a.home)/reciter/[id].tsx`) into `ReciterProfile` props.

### Verse Sharing

**Share message format (user-configurable toggles):**
```
Ash-Shu'ara - Verse 50

قَالُوا لَا ضَيْرَ إِنَّا إِلَىٰ رَبِّنَا مُنقَلِبُونَ

Dr. Mustafa Khattab, The Clear Quran:
They responded, "˹That would be˺ no harm! Surely to our Lord we will ˹all˺ return.

Transliteration:
Qaloo la dayra inna ila rabbina munqaliboona

istima.app/share/verse/26/50
```

**Toggleable options in share sheet:**
- Arabic text (on by default)
- Translation (on if translation is currently active)
- Transliteration (off by default)

**OG image:** Falls back to app icon in Phase 2. Custom verse OG image generation comes in Phase 3. The existing verse image generation (`VerseShareSheet.tsx`, `captureShareCard.ts`) is a client-side Skia renderer - it cannot be used server-side.

**App behavior:** Opens mushaf at the page containing the verse, with the verse highlighted/scrolled to.

### Share Buttons - New Entry Points

| Location | What's shared | Link type |
|---|---|---|
| Reciter profile header | Reciter (only if `reciter.slug` exists) | reciter |
| Surah row in reciter profile | Specific recitation | recitation |
| Player sheet | Currently playing track | recitation + timestamp |
| Mushaf toolbar | Current page | mushaf |
| Verse actions sheet | Selected verse | verse |
| Adhkar category screen | Adhkar category | adhkar |
| Dhikr reader | Current dhikr | dhikr |

### Backend Share Route Updates

Replace the current share route handlers in `istima-backend/src/routes/share/index.ts`:

- **`GET /share/reciter/:slug`** - keep existing handler, fix App Store ID
- **`GET /share/reciter/:slug/:rewayat/:style/surah/:num`** - new handler, replaces old `/reciter/:slug/surah/:num`. Fetches reciter by slug, builds OG card with reciter photo + surah name + rewayat info
- **`GET /share/mushaf/:page`** - keep existing handler
- **`GET /share/verse/:surah/:ayah`** - new handler. OG card with surah name + ayah number, falls back to app icon for image
- **`GET /share/adhkar/:superId`** - keep existing handler
- **`GET /share/dhikr/:superId/:dhikrId`** - new handler. OG card with dhikr title
- Delete old `/share/reciter/:slug/surah/:num` route (not in production)
- Delete `/share/playlist/:id` route (not implemented)
- Delete `storeRedirectUrl()` dead code

### `shareUtils.ts` Updates

Replace all URL generators to match new structure:

```typescript
const BASE_URL = 'https://istima.app';

export function reciterShareUrl(slug: string): string {
  return `${BASE_URL}/share/reciter/${slug}`;
}

export function recitationShareUrl(
  reciterSlug: string, rewayatSlug: string, styleSlug: string, surahNum: number, timestampSec?: number
): string {
  const base = `${BASE_URL}/share/reciter/${reciterSlug}/${rewayatSlug}/${styleSlug}/surah/${surahNum}`;
  return timestampSec ? `${base}?t=${timestampSec}` : base;
}

export function mushafShareUrl(page: number): string {
  return `${BASE_URL}/share/mushaf/${page}`;
}

export function verseShareUrl(surah: number, ayah: number): string {
  return `${BASE_URL}/share/verse/${surah}/${ayah}`;
}

export function adhkarShareUrl(superId: string): string {
  return `${BASE_URL}/share/adhkar/${superId}`;
}

export function dhikrShareUrl(superId: string, dhikrId: string): string {
  return `${BASE_URL}/share/dhikr/${superId}/${dhikrId}`;
}
```

Remove `surahShareUrl()` and `playlistShareUrl()` (replaced/deleted).

---

## Phase 3: Rich OG Cards

### Dynamic OG Image Generation

Use raw `satori` + `@resvg/resvg-js` for server-side image generation (NOT `@vercel/og`, which is packaged for Vercel Edge Runtime and may not work cleanly with Hono/Bun).

**Card designs by link type:**

| Link type | OG card content |
|---|---|
| Reciter | Reciter photo + name + "Listen on Istima" |
| Recitation | Reciter photo + surah name + reciter name (Spotify track card style) |
| Verse | Arabic text on clean card with surah/ayah reference |
| Mushaf | "Page X" + surah approximation + Istima branding |
| Adhkar | Category name + description + Istima branding |
| Dhikr | Arabic text of the dhikr + Istima branding |

**Caching:** Generated images cached to R2 bucket or in-memory with a TTL. Key = hash of the share URL. Avoids regenerating on every bot crawl.

**Verse text source:** Bundle the Quran JSON data (`data/quran.json`, ~3-5MB) into the backend for server-side verse text rendering. Calling an external API on every bot crawl adds latency and a failure point.

**Backend changes:**
- Add image generation service using `satori` + `@resvg/resvg-js`
- Update `buildOgHtml()` to accept a generated image URL
- Reciter/recitation cards use the reciter's `image_url` as background
- Verse cards render Arabic text using a bundled font

---

## Sequencing

1. **Phase 1 (R2 Cutover):**
   a. Copy `rewayat-slugs.json` from R2 POC branch
   b. Write and run DB migration script
   c. App-side: DATA_VERSION bump + player queue migration
   d. Verify playback across former source types

2. **Phase 2 (Share Links):**
   a. Set up `istima.app` domain infrastructure
   b. Backend: fix bugs (App Store ID, SHA-256, dead code, og-default.png), add new share routes
   c. App: new receiver screens with cold-start handling
   d. App: slug resolution + auto-play flow
   e. App: share buttons throughout the app + verse sharing
   f. Native rebuild + release

3. **Phase 3 (OG Cards):**
   a. POC: `satori` + `@resvg/resvg-js` on Hono/Bun
   b. Image generation for each link type
   c. Caching to R2
   d. Deploy

Phases 2 and 3 can overlap - share buttons and receivers don't depend on OG image generation.

---

## Files Affected

### Phase 1
- `data/rewayat-slugs.json` - copy from R2 POC branch, verify coverage
- `services/dataService.ts` - DATA_VERSION bump, add `getReciterBySlug()`
- Player store initialization - stale URL migration (check `player-store` AsyncStorage key)
- New: DB migration script (Python or TypeScript, runs locally against backend API)

### Phase 2 - App
- `utils/shareUtils.ts` - new BASE_URL, new URL generators, remove old ones
- `app.config.js` - `associatedDomains` + `intentFilters` host change
- `app/share/reciter/[slug].tsx` - fix slug resolution, use `isInitialized` gate
- `app/share/reciter/[slug]/[rewayat]/[style]/surah/[num].tsx` - new, auto-play
- `app/share/reciter/[slug]/surah/[num].tsx` - delete (replaced by above)
- `app/share/verse/[surah]/[ayah].tsx` - new
- `app/share/dhikr/[superId]/[dhikrId].tsx` - new
- `app/share/playlist/[id].tsx` - delete
- `app/(tabs)/(a.home)/reciter/[id].tsx` - accept surah + rewayatId params
- `components/reciter-profile/ReciterProfile.tsx` - accept and act on surah/rewayatId props
- `store/reciterStore.ts` - add `isInitialized` flag
- Player sheet, mushaf toolbar, verse actions sheet, adhkar screen, dhikr reader - add share buttons

### Phase 2 - Backend (`istima-backend/`)
- `src/routes/share/index.ts` - new routes, fix App Store ID, remove dead code
- `src/lib/ogTemplate.ts` - fix URL format, update `APP_ICON_URL`
- `src/routes/well-known/index.ts` - set `ANDROID_SHA256_CERT` env var on Railway
- Add static file route or CDN hosting for `og-default.png`

### Phase 3
- Backend: `satori` + `@resvg/resvg-js` image generation service
- Backend: R2 image caching
- Backend: bundled Quran JSON for verse text
- Backend: updated share route handlers with richer metadata
