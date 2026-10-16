# Intro / outro clip

"You are listening in Istima app by Halalweb." (British voice A), played on its own short player
before every surah and after a surah longer than 3 minutes. Never between ayat, never inside the
recitation file, so word highlighting is unaffected. No Settings toggle. Same code on web, iOS, Android.

## Env (build time, see .env.example)
- `EXPO_PUBLIC_INTRO_CLIP_START` / `EXPO_PUBLIC_INTRO_CLIP_END`: `false` disables that clip. Default on.
- `EXPO_PUBLIC_INTRO_CLIP_END_MIN_SECONDS`: default 180.
- `EXPO_PUBLIC_INTRO_CLIP_BASE_URL`: default `https://iapi.istima.app/clips`.

No credentials are involved; nothing secret is needed for this feature.

## Languages
`<base>/<lang>.mp3` for the codes in `config/introClip.ts` (`INTRO_CLIP_LANGS`). Any other language,
and any load error or 4 s load timeout, plays the bundled `assets/audio/intro/en.mp3`.
Weak-voice languages (wo, bm, ff, mnk, ti, om, ug, ckb, kmr, as) stay on English until a native
recording exists. To add a language: upload `<lang>.mp3` and add the code to the list.
