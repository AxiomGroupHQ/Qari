// @ai-generated
import {
  getRemoteJson,
  initRemoteData,
} from '@/services/remoteData/RemoteDataService';

export interface BundledTafseerEntry {
  s: number;
  f: number;
  t: number;
  text: string;
}

export async function loadBundledIbnKathir(): Promise<BundledTafseerEntry[]> {
  await initRemoteData(['ibn-kathir-tafseer-compact.json']);
  return getRemoteJson('ibn-kathir-tafseer-compact.json', []);
}
