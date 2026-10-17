// Web variant: no expo-file-system. The browser HTTP cache is the
// cache-first layer; the font is fetched straight from iapi.istima.app
// and registered on the shared Skia provider + document fonts.

import * as Font from 'expo-font';
import {Skia, type SkTypefaceFontProvider} from '@shopify/react-native-skia';

const REMOTE_BASE = 'https://iapi.istima.app/mushaf';

const REMOTE_FONTS: Record<string, {family: string; path: string}> = {
  indopak: {family: 'DigitalKhattIndoPak', path: 'indopak/DigitalKhattIndoPak.otf'},
};

class RemoteFontLoader {
  private registered = new Set<string>();
  private inFlight = new Map<string, Promise<void>>();

  isReady(key: string): boolean {
    return this.registered.has(key);
  }

  async ensure(key: string, fontMgr: SkTypefaceFontProvider): Promise<void> {
    const font = REMOTE_FONTS[key];
    if (!font) throw new Error(`Remote font: unknown key ${key}`);
    if (this.registered.has(key)) return;

    const inFlight = this.inFlight.get(key);
    if (inFlight) return inFlight;

    const task = (async () => {
      const uri = `${REMOTE_BASE}/${font.path}`;
      const data = await Skia.Data.fromURI(uri);
      const typeface = Skia.Typeface.MakeFreeTypeFaceFromData(data);
      if (!typeface) {
        throw new Error(`Remote font ${font.family}: typeface creation failed`);
      }
      fontMgr.registerFont(typeface, font.family);
      await Font.loadAsync(font.family, uri);
      this.registered.add(key);
    })().finally(() => {
      this.inFlight.delete(key);
    });
    this.inFlight.set(key, task);
    return task;
  }
}

export const remoteFontLoader = new RemoteFontLoader();
