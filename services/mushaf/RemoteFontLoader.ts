// On-demand loader for optional mushaf style fonts served from
// iapi.istima.app/mushaf/. The core style (Madani 1421) stays bundled for
// offline-from-install; optional styles download their font once
// (cache-first) when the style is selected, then register it on the
// shared Skia TypefaceFontProvider and with expo-font for the legacy
// text path. Subsequent selects resolve synchronously.

import * as FileSystem from 'expo-file-system/legacy';
import * as Font from 'expo-font';
import {Skia, type SkTypefaceFontProvider} from '@shopify/react-native-skia';

const REMOTE_BASE = 'https://iapi.istima.app/mushaf';
const LOCAL_DIR = `${FileSystem.documentDirectory}mushaf-fonts/`;

interface RemoteFontDef {
  family: string;
  path: string;
}

const REMOTE_FONTS: Record<string, RemoteFontDef> = {
  indopak: {family: 'DigitalKhattIndoPak', path: 'indopak/DigitalKhattIndoPak.otf'},
};

class RemoteFontLoader {
  private registered = new Set<string>();
  private inFlight = new Map<string, Promise<void>>();
  private dirEnsured = false;

  isReady(key: string): boolean {
    return this.registered.has(key);
  }

  async ensure(key: string, fontMgr: SkTypefaceFontProvider): Promise<void> {
    const font = REMOTE_FONTS[key];
    if (!font) throw new Error(`Remote font: unknown key ${key}`);
    if (this.registered.has(key)) return;

    const inFlight = this.inFlight.get(key);
    if (inFlight) return inFlight;

    const task = this.loadAndRegister(key, font, fontMgr).finally(() => {
      this.inFlight.delete(key);
    });
    this.inFlight.set(key, task);
    return task;
  }

  private async loadAndRegister(
    key: string,
    font: RemoteFontDef,
    fontMgr: SkTypefaceFontProvider,
  ): Promise<void> {
    const localUri = await this.downloadIfNeeded(font);
    const data = await Skia.Data.fromURI(localUri);
    const typeface = Skia.Typeface.MakeFreeTypeFaceFromData(data);
    if (!typeface) {
      throw new Error(`Remote font ${font.family}: typeface creation failed`);
    }
    fontMgr.registerFont(typeface, font.family);
    // Legacy RN <Text> renderers read the same family name via expo-font.
    await Font.loadAsync(font.family, localUri);
    this.registered.add(key);
  }

  private async downloadIfNeeded(font: RemoteFontDef): Promise<string> {
    const localUri = `${LOCAL_DIR}${font.family}.otf`;

    const info = await FileSystem.getInfoAsync(localUri);
    if (info.exists && info.size && info.size > 0) return localUri;

    await this.ensureLocalDir();

    const result = await FileSystem.downloadAsync(
      `${REMOTE_BASE}/${font.path}`,
      localUri,
    );
    if (result.status !== 200) {
      try {
        await FileSystem.deleteAsync(localUri, {idempotent: true});
      } catch {
        // ignore cleanup errors
      }
      throw new Error(`Remote font ${font.family}: HTTP ${result.status}`);
    }
    return localUri;
  }

  private async ensureLocalDir(): Promise<void> {
    if (this.dirEnsured) return;
    const info = await FileSystem.getInfoAsync(LOCAL_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(LOCAL_DIR, {intermediates: true});
    }
    this.dirEnsured = true;
  }
}

export const remoteFontLoader = new RemoteFontLoader();
