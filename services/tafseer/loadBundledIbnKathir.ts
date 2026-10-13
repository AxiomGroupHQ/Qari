// @ai-generated
export interface BundledTafseerEntry {
  s: number;
  f: number;
  t: number;
  text: string;
}

export async function loadBundledIbnKathir(): Promise<BundledTafseerEntry[]> {
  return require('@/data/ibn-kathir-tafseer-compact.json');
}
