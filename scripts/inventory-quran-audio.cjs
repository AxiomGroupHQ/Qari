#!/usr/bin/env node
// Read-only HTTP audio inventory. Node 20+; no MP3 body downloads.
const fs = require('node:fs');
const path = require('node:path');
const OUT = 'docs';
const quote = v => '"' + String(v ?? '').replaceAll('"', '""') + '"';
const csv = (name, rows) =>
  fs.writeFileSync(
    path.join(OUT, name),
    [
      'provider,reciter,recitation,surah,audio_url,size_bytes,status',
      ...rows.map(r => r.map(quote).join(',')),
    ].join('\n') + '\n',
  );
const timeout = ms => AbortSignal.timeout(ms);
async function json(url) {
  const r = await fetch(url, {signal: timeout(25000)});
  if (!r.ok) throw Error('catalogue HTTP ' + r.status + ' ' + url);
  return r.json();
}
async function size(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const h = method === 'GET' ? {Range: 'bytes=0-0'} : {};
      const r = await fetch(url, {method, headers: h, signal: timeout(12000)});
      if (!r.ok) continue;
      let n = null;
      if (method === 'GET') {
        const match = r.headers.get('content-range')?.match(/\/(\d+)$/);
        if (match) n = Number(match[1]);
      } else {
        const len = r.headers.get('content-length');
        if (len) n = Number(len);
      }
      if (method === 'GET') {
        await r.body?.cancel();
      }
      if (Number.isSafeInteger(n) && n > 0) return [n, 'measured'];
    } catch (e) {
      /* continue */
    }
  }
  return ['', 'unavailable'];
}
function listSurahs(s) {
  return String(s || '')
    .split(',')
    .map(x => Number(x.trim()))
    .filter(x => Number.isInteger(x) && x >= 1 && x <= 114);
}
function audioUrl(server, n) {
  return server.replace(/\/+$/, '') + '/' + String(n).padStart(3, '0') + '.mp3';
}
async function inventory(provider, items) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({length: 8}, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      const item = items[i];
      const [bytes, status] = await size(item.url);
      results[i] = [
        provider,
        item.reciter,
        item.recitation,
        item.surah,
        item.url,
        bytes,
        status,
      ];
      if (i % 100 === 0) console.log(provider, i + '/' + items.length);
    }
  });
  await Promise.all(workers);
  csv('audio-inventory-' + provider + '.csv', results);
  const valid = results.filter(r => r[6] === 'measured');
  console.log(
    provider,
    JSON.stringify({
      urls: results.length,
      measured: valid.length,
      unavailable: results.length - valid.length,
      measured_bytes: valid.reduce((a, r) => a + Number(r[5]), 0),
    }),
  );
}
async function main() {
  const d = await json('https://mp3quran.net/api/v3/reciters?language=eng');
  const mp = [];
  for (const r of d.reciters || []) {
    for (const m of r.moshaf || []) {
      if (!m.server) continue;
      for (const n of listSurahs(m.surah_list)) {
        mp.push({
          reciter: r.name || r.id,
          recitation: m.name || m.id,
          surah: n,
          url: audioUrl(m.server, n),
        });
      }
    }
  }
  await inventory('mp3quran', mp);
  const url = process.env.BAYAAN_CATALOGUE_URL;
  if (!url) {
    console.log(
      'Bayaan: BAYAAN_CATALOGUE_URL not supplied; existing Bayaan CSV unchanged',
    );
    return;
  }
  const b = await json(url);
  const records = Array.isArray(b) ? b : b.reciters || b.data?.reciters || [];
  const items = [];
  for (const r of records) {
    for (const m of r.rewayat || r.moshaf || []) {
      const server = m.server || m.audio_server;
      if (!server) continue;
      for (const n of listSurahs(m.surah_list)) {
        items.push({
          reciter: r.name || r.id,
          recitation: m.name || m.id,
          surah: n,
          url: audioUrl(server, n),
        });
      }
    }
  }
  if (!items.length)
    throw Error(
      'Bayaan API response schema not recognized or contains no audio URLs',
    );
  await inventory('bayaan', items);
}
main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
