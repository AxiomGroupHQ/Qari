// @ai-generated
import {Asset} from 'expo-asset';
import type {Reciter} from '@/data/reciterData';
import {reciterImages} from './reciterImages';

// React Native Web omits Image.resolveAssetSource. Expo Asset handles the
// browser's bundled modules as well as native-style numeric asset IDs.
export function getReciterArtwork(reciter: Reciter): string {
  const remote = reciter?.image_url;
  if (remote?.startsWith('https://')) return remote;
  if (remote?.startsWith('http://'))
    return remote.replace('http://', 'https://');

  const name = reciter?.name
    ?.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  const source = name ? reciterImages[name] : undefined;
  const singleSource = Array.isArray(source) ? source[0] : source;
  if (typeof singleSource === 'number')
    return Asset.fromModule(singleSource).uri;
  if (singleSource?.uri) return singleSource.uri;
  return Asset.fromModule(require('@/assets/images/icon.png')).uri;
}
