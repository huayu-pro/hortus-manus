#!/usr/bin/env node
/**
 * OPL MCP harvester — One Page Love (api.onepagelove.com/mcp)
 * Stateless MCP (no mcp-session-id required): initialize then tools/call search_inspiration.
 * SSE response: `event: message` + `data: {json}`. Content array = image(base64) + text pairs.
 * Output: research/references/candidates.json + hero/{slug}.jpg + raw/{n}-{q}.sse.txt
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT_HERO = path.join(ROOT, 'hero');
const OUT_RAW = path.join(ROOT, 'raw');
fs.mkdirSync(OUT_HERO, { recursive: true });
fs.mkdirSync(OUT_RAW, { recursive: true });

const QUERIES = [
  { id: 'botanical-nature', args: { query: 'botanical nature', limit: 10 } },
  { id: 'editorial', args: { query: 'editorial', limit: 10 } },
  { id: 'experimental', args: { query: 'experimental', limit: 10 } },
  { id: '3d', args: { query: '3D', limit: 10 } },
  { id: 'typographic', args: { query: 'typographic', limit: 10 } },
  { id: 'scroll-effects', args: { query: 'scroll effects', limit: 10 } },
  { id: 'minimal', args: { query: 'minimal', limit: 10 } },
  { id: 'portfolio', args: { query: 'portfolio', limit: 10 } },
  { id: 'art', args: { query: 'art', limit: 10 } },
  { id: 'interactive', args: { query: 'interactive', limit: 10 } },
  { id: 'garden', args: { query: 'garden', limit: 8 } },
  { id: 'tech-three', args: { tech: 'three.js', limit: 8 } },
  { id: 'tech-gsap', args: { tech: 'gsap', limit: 8 } },
  { id: 'photography', args: { query: 'photography', limit: 8 } },
];

const ENDPOINT = 'https://api.onepagelove.com/mcp';

function parseSSE(text) {
  const out = [];
  for (const block of text.split(/\n\n/)) {
    const dataLines = block.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim());
    if (!dataLines.length) continue;
    const raw = dataLines.join('\n');
    try { out.push(JSON.parse(raw)); } catch { /* ignore */ }
  }
  return out;
}

async function rpc(method, params) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Math.floor(Math.random() * 1e6), method, params }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  const msgs = parseSSE(text);
  if (!msgs.length) {
    try { return JSON.parse(text); } catch { throw new Error('unparsable: ' + text.slice(0, 300)); }
  }
  const last = msgs[msgs.length - 1];
  if (last.error) throw new Error(JSON.stringify(last.error));
  return last;
}

function normUrl(u) {
  return (u || '').replace(/\/+$/, '').toLowerCase();
}

function parseTextBlock(t) {
  // "**Name** · https://site/ · https://onepagelove.com/slug/\nHeadline: ...\nSubtext: ..."
  const m = t.match(/^\*\*(.+?)\*\*\s*·\s*(\S+)\s*·\s*(\S+)/);
  const headline = (t.match(/Headline:\s*(.+)/) || [])[1] || '';
  const subtext = (t.match(/Subtext:\s*(.+)/) || [])[1] || '';
  const eyebrow = (t.match(/\(eyebrow:\s*"([^"]+)"\)/) || [])[1] || '';
  let name = m ? m[1] : '';
  let siteUrl = m ? m[2] : '';
  let oplUrl = m ? m[3] : '';
  if (!siteUrl) {
    const urls = [...t.matchAll(/https?:\/\/[^\s·)]+/g)].map((x) => x[0]);
    oplUrl = urls.find((u) => u.includes('onepagelove.com')) || '';
    siteUrl = urls.find((u) => !u.includes('onepagelove.com')) || '';
  }
  let slug = oplUrl.split('onepagelove.com/')[1] || '';
  slug = slug.replace(/\/+$/, '');
  return { name, siteUrl, oplUrl, slug, headline, subtext, eyebrow };
}

async function main() {
  await rpc('initialize', {
    protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'hortus-manus-scout', version: '1.0' },
  });
  const candidates = new Map();
  const log = [];
  for (const [i, q] of QUERIES.entries()) {
    process.stdout.write(`[${i + 1}/${QUERIES.length}] ${q.id} ... `);
    try {
      const res = await rpc('tools/call', { name: 'search_inspiration', arguments: q.args });
      const content = res.result?.content || [];
      fs.writeFileSync(path.join(OUT_RAW, `${String(i + 1).padStart(2, '0')}-${q.id}.json`), JSON.stringify({ query: q, content }, null, 0));
      let images = 0, texts = 0, added = 0;
      let pendingImage = null;
      for (const item of content) {
        if (item.type === 'image') {
          pendingImage = item;
          images++;
        } else if (item.type === 'text') {
          texts++;
          const meta = parseTextBlock(item.text || '');
          if (!meta.siteUrl) { pendingImage = null; continue; }
          const key = normUrl(meta.siteUrl) || normUrl(meta.oplUrl);
          if (!candidates.has(key)) {
            added++;
            candidates.set(key, {
              ...meta,
              queries: [q.id],
              image: pendingImage ? { savedAs: (meta.slug || `site-${candidates.size}`) + '.jpg', mime: pendingImage.mimeType } : null,
            });
            if (pendingImage?.data) {
              const fn = path.join(OUT_HERO, ((meta.slug || `site-${candidates.size}`) + '.jpg').replace(/[^a-zA-Z0-9._-]/g, '_'));
              fs.writeFileSync(fn, Buffer.from(pendingImage.data, 'base64'));
            }
          } else {
            const c = candidates.get(key);
            if (!c.queries.includes(q.id)) c.queries.push(q.id);
            if (!c.headline && meta.headline) c.headline = meta.headline;
            if (!c.subtext && meta.subtext) c.subtext = meta.subtext;
            if (!c.image && pendingImage) c.image = { savedAs: (c.slug || key) + '.jpg', mime: pendingImage.mimeType };
          }
          pendingImage = null;
        }
      }
      log.push({ query: q.id, images, texts, added, total: candidates.size });
      console.log(`ok images=${images} texts=${texts} new=${added} total=${candidates.size}`);
    } catch (e) {
      log.push({ query: q.id, error: String(e.message || e) });
      console.log('FAIL ' + String(e.message || e).slice(0, 160));
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  const list = [...candidates.values()].map((c) => ({
    ...c,
    siteUrl: c.siteUrl.replace(/[.,]$/, ''),
    oplUrl: c.oplUrl.replace(/[.,]$/, ''),
    slug: (c.slug || '').replace(/[^a-z0-9-]/gi, '') || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  }));
  fs.writeFileSync(path.join(ROOT, 'candidates.json'), JSON.stringify({ generatedAt: new Date().toISOString(), count: list.length, queries: QUERIES, log, sites: list }, null, 2));
  console.log(`\nTOTAL UNIQUE = ${list.length}`);
  for (const c of list) console.log(`${c.slug}\t${c.name}\t${c.siteUrl}\t${c.oplUrl}\t${c.headline.slice(0, 70)}`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });