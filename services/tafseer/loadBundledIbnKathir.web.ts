// @ai-generated
import type {BundledTafseerEntry} from './loadBundledIbnKathir';

export async function loadBundledIbnKathir(): Promise<BundledTafseerEntry[]> {
  return (await import('@/data/ibn-kathir-tafseer-compact.json')).default;
}
