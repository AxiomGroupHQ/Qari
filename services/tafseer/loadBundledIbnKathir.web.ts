// @ai-generated
import type {BundledTafseerEntry} from './loadBundledIbnKathir';
import {
  getRemoteJson,
  initRemoteData,
} from '@/services/remoteData/RemoteDataService';

export async function loadBundledIbnKathir(): Promise<BundledTafseerEntry[]> {
  await initRemoteData(['ibn-kathir-tafseer-compact.json']);
  return getRemoteJson('ibn-kathir-tafseer-compact.json', []);
}
