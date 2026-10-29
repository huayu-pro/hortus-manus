#!/usr/bin/env node
/**
 * Fetch 12-20 public-domain / CC0 botanical images from Wikimedia Commons (API only),
 * write research/assets/raw/{slug}.jpg + research/assets/assets.json with URL/author/license/dimensions.
 * Only accepts PD / CC0 / CC-BY / CC-BY-SA licenses, records the exact license string.
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = '/home/huayu/Agent工作区/DSHarness/1/hortus-manus/research/assets';
fs.mkdirSync(OUT, { recursive: true });
const UA = 'HortusManusResearch/1.0 (https://example.local; botanical research; contact: local)';
const DL_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const QUERIES = [
  { slug: 'peony-bairei', q: 'Bairei kacho gafu peony', kind: 'peony' },
  { slug: 'peony-korean', q: 'Paeonia suffruticosa botanical plate', kind: 'peony' },
  { slug: 'dandelion-botanical', q: 'Taraxacum botanical illustration plate', kind: 'dandelion' },
  { slug: 'dandelion-seed', q: 'dandelion seed head macro', kind: 'dandelion' },
  { slug: 'waterlily-monet', q: 'water lily Nymphaea botanical plate', kind: 'waterlily' },
  { slug: 'waterlily-pond', q: 'Nymphaea lotus pond photograph', kind: 'waterlily' },
  { slug: 'fern-plate', q: 'fern Polypodium botanical illustration', kind: 'fern' },
  { slug: 'fern-frond', q: 'fern frond photograph macro', kind: 'fern' },
  { slug: 'moss-close', q: 'moss bryophyte close-up photograph', kind: 'moss' },
  { slug: 'moss-plate', q: 'moss Musci botanical illustration', kind: 'moss' },
  { slug: 'pressed-flower', q: 'pressed flower herbarium specimen sheet', kind: 'pressed' },
  { slug: 'herbarium-sheet', q: 'herbarium specimen digitized sheet plant', kind: 'pressed' },
  { slug: 'camellia-japonica', q: 'Camellia japonica botanical illustration', kind: 'camellia' },
  { slug: 'rose-redoute', q: 'Redoute rose botanical plate', kind: 'rose' },
  { slug: 'cherry-blossom', q: 'Prunus serrulata blossom photograph', kind: 'blossom' },
  { slug: 'poppy-plate', q: 'Papaver botanical illustration plate', kind: 'poppy' },
  { slug: 'orchid-plate', q: 'Orchidaceae botanical illustration', kind: 'orchid' },
  { slug: 'lotus-plate', q: 'Nelumbo nucifera botanical plate', kind: 'lotus' },
  { slug: 'ivy-plate', q: 'Hedera helix botanical illustration', kind: 'ivy' },
  { slug: 'seed-dispersal', q: 'seed dispersal dandelion wind photograph', kind: 'seed' },
];

const OK_LICENSE = /(public domain|cc0|cc by|cc-by|pd-|no restrictions)/i;

async function api(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams(params).toString();
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' } });
  if (!res.ok) throw new Error(`api ${res.status}`);
  return res.json();
}

function pickPage(pages) {
  for (const p of pages || []) {
    const ii = (p.imageinfo || [])[0];
    if (!ii) continue;
    const meta = ii.extmetadata || {};
    const lic = (meta.LicenseShortName?.value || '').trim();
    if (!OK_LICENSE.test(lic)) continue;
    if (!/\.(jpg|jpeg|png)$/i.test(p.title)) continue;
    return { page: p, ii, meta, lic };
  }
  return null;
}

import { execFileSync } from 'node:child_process';
function curlDownload(url, dest) {
  execFileSync('curl', ['-s', '--max-time', '90', '--proxy', 'http://127.0.0.1:7897',
    '-A', DL_UA, '-e', 'https://commons.wikimedia.org/', '-o', dest, url]);
  return fs.statSync(dest).size;
}

async function download(url, dest, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA, referer: 'https://commons.wikimedia.org/', accept: 'image/jpeg,image/png,*/*' } });
      if (!res.ok) throw new Error(`download ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 20000) throw new Error('too small ' + buf.length);
      fs.writeFileSync(dest, buf);
      return buf.length;
    } catch (e) { last = e; await new Promise((r) => setTimeout(r, 1200)); }
  }
  throw last;
}

const records = [];
for (const q of QUERIES) {
  process.stdout.write(`${q.slug} ... `);
  try {
    const j = await api({
      action: 'query', format: 'json', generator: 'search', gsrsearch: q.q, gsrnamespace: '6', gsrlimit: '8',
      prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: '1600',
    });
    const hit = pickPage(j?.query?.pages ? Object.values(j.query.pages).sort((a, b) => (a.index || 0) - (b.index || 0)) : null);
    if (!hit) { console.log('no pd hit'); continue; }
    const { page, ii, meta, lic } = hit;
    const author = (meta.Artist?.value || '').replace(/<[^>]*>/g, '').trim().slice(0, 120) || 'Unknown';
    const credit = (meta.Credit?.value || '').replace(/<[^>]*>/g, '').trim().slice(0, 160);
    const title = page.title.replace(/^File:/, '');
    const srcUrl = ii.url;  // original file via local proxy
    const file = path.join(OUT, 'raw', `${q.slug}.jpg`);
    fs.mkdirSync(path.join(OUT, 'raw'), { recursive: true });
    let bytes;
    try { bytes = curlDownload(srcUrl, file); } catch (e) { bytes = await download(ii.thumburl || srcUrl, file); }
    if (bytes < 20000) throw new Error('too small');
    records.push({
      slug: q.slug, kind: q.kind, title, file: `raw/${q.slug}.jpg`, bytes,
      width: ii.thumbwidth || ii.width, height: ii.thumbheight || ii.height,
      originalWidth: ii.width, originalHeight: ii.height,
      license: lic, licenseUrl: meta.LicenseUrl?.value || null,
      author, credit, sourcePage: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
      directUrl: srcUrl, descriptionUrl: ii.descriptionurl,
      usage: (meta.UsageTerms?.value || '').replace(/<[^>]*>/g, '').slice(0, 120),
      fetchedAt: new Date().toISOString(),
    });
    console.log(`ok ${lic} ${ii.thumbwidth}x${ii.thumbheight} ${(bytes / 1024).toFixed(0)}KB`);
  } catch (e) {
    console.log('FAIL ' + String(e.message || e).slice(0, 100));
  }
  await new Promise((r) => setTimeout(r, 2000));
}
fs.writeFileSync(path.join(OUT, 'assets.json'), JSON.stringify({ fetchedAt: new Date().toISOString(), count: records.length, source: 'Wikimedia Commons API', assets: records }, null, 2));
console.log(`\nTOTAL ${records.length}`);
for (const r of records) console.log(`${r.slug}\t${r.license}\t${r.width}x${r.height}\t${r.author.slice(0, 40)}`);
