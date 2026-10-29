import { findMode, findSeason, type Specimen } from '@hortus/shared'
import { COLORS } from '@hortus/art'
import { shareUrlFor, ogUrlFor, cardUrlFor, qrUrlFor, CONFIG } from '../config'

const esc = (v: string): string =>
  v.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] ?? ch)

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** Standalone share page. No SPA dependency: every style is inline. */
export function renderShareHtml(spec: Specimen): string {
  const mode = findMode(spec.mode)
  const season = findSeason(spec.season)
  const share = shareUrlFor(spec.id)
  const og = ogUrlFor(spec.id)
  const card = cardUrlFor(spec.id)
  const qr = qrUrlFor(spec.id, 320)
  const date = fmtDate(spec.createdAt)
  const seedHex = (spec.seed >>> 0).toString(16).toUpperCase().padStart(8, '0')
  const title = `${mode.zh} · ${mode.en} — HORTUS MANUS 标本 No.${spec.id.slice(0, 6).toUpperCase()}`
  const desc = spec.caption
    ? `${spec.caption} — 一株由手势采集的标本，${date}。`
    : `${mode.blurbZh} 采集于 ${date}。一座只在你手中生长的数字标本馆。`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: `${mode.en} / ${mode.zh} specimen`,
    description: desc,
    artform: 'Botanical illustration',
    artMedium: 'procedural canvas',
    dateCreated: spec.createdAt,
    image: [card, og],
    url: share,
    identifier: spec.id,
    creator: { '@type': 'Organization', name: 'HORTUS MANUS · 指间花园' },
    isPartOf: { '@type': 'WebSite', name: 'HORTUS MANUS', url: CONFIG.publicOrigin },
  }

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${esc(share)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="HORTUS MANUS · 指间花园" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${esc(share)}" />
<meta property="og:image" content="${esc(og)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${esc(mode.zh + ' / ' + mode.en + ' 标本卡')}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${esc(og)}" />
<meta name="theme-color" content="${COLORS.paper}" />
<meta name="robots" content="noindex" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23F6F1E7'/%3E%3Ccircle cx='16' cy='16' r='9' fill='none' stroke='%231C211A'/%3E%3C/svg%3E" />
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
  :root {
    --paper:${COLORS.paper}; --paper-deep:${COLORS.paperDeep}; --paper-light:${COLORS.paperLight};
    --ink:${COLORS.ink}; --ink-soft:${COLORS.inkSoft}; --accent:${mode.accent}; --season:${season.accent};
    --moss:${COLORS.moss}; --line:rgba(28,33,26,.28);
    --serif: "Instrument Serif", "P052", "Noto Serif SC", Georgia, serif;
    --cjk: "Noto Serif SC", "Noto Serif CJK SC", "AR PL UMing CN", serif;
    --mono: "IBM Plex Mono", "Nimbus Mono PS", ui-monospace, monospace;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--paper); color: var(--ink); }
  body { font-family: var(--cjk); line-height: 1.65; -webkit-font-smoothing: antialiased; }
  body::before {
    content: ""; position: fixed; inset: 0; pointer-events: none; opacity: .5; z-index: 0;
    background-image: radial-gradient(rgba(28,33,26,.055) 1px, transparent 1px);
    background-size: 3px 3px;
  }
  a { color: inherit; }
  .wrap { position: relative; z-index: 1; max-width: 1120px; margin: 0 auto; padding: clamp(20px,4vw,56px); }
  .top { display: flex; flex-wrap: wrap; gap: 16px; align-items: baseline; justify-content: space-between; padding-bottom: 14px; border-bottom: 1px solid var(--line); }
  .brand { font-family: var(--serif); letter-spacing: .22em; font-size: 15px; text-transform: uppercase; text-decoration: none; }
  .brand small { font-family: var(--cjk); letter-spacing: .3em; font-size: 12px; color: var(--ink-soft); margin-left: 10px; }
  .meta { font-family: var(--mono); font-size: 11.5px; letter-spacing: .12em; color: var(--ink-soft); text-transform: uppercase; }
  .grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); gap: clamp(24px, 4vw, 56px); margin-top: clamp(28px, 5vw, 64px); align-items: start; }
  .kicker { font-family: var(--mono); font-size: 11.5px; letter-spacing: .24em; text-transform: uppercase; color: var(--accent); }
  h1 { font-family: var(--serif); font-weight: 400; font-size: clamp(40px, 6.4vw, 78px); line-height: .98; margin: .12em 0 .1em; letter-spacing: -.015em; }
  h1 .zh { display: block; font-family: var(--cjk); font-size: .42em; letter-spacing: .18em; color: var(--ink-soft); margin-top: .5em; }
  .latin { font-family: var(--serif); font-style: italic; font-size: clamp(19px, 2.2vw, 26px); color: var(--accent); margin: 0 0 4px; }
  .lede { font-size: clamp(16px, 1.7vw, 19px); color: var(--ink-soft); max-width: 42ch; margin: 18px 0 0; }
  .facts { margin: 30px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px 24px; border-top: 1px solid var(--line); padding-top: 20px; }
  .facts div { min-width: 0; }
  .facts dt { font-family: var(--mono); font-size: 10.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--ink-soft); margin: 0 0 3px; }
  .facts dd { margin: 0; font-size: 14.5px; overflow-wrap: anywhere; }
  .actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 32px 0 0; }
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 18px; border: 1px solid var(--ink); background: var(--ink); color: var(--paper); text-decoration: none; font-family: var(--mono); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; cursor: pointer; transition: transform .18s ease, background .18s ease, color .18s ease; }
  .btn:hover { transform: translateY(-1px); }
  .btn.ghost { background: transparent; color: var(--ink); }
  .btn.ghost:hover { background: rgba(28,33,26,.06); }
  .plate { position: relative; border: 1px solid var(--line); background: var(--paper-light); padding: 10px; box-shadow: 0 18px 40px -32px rgba(28,33,26,.6); }
  .plate img { width: 100%; height: auto; display: block; }
  .plate figcaption { display: flex; justify-content: space-between; gap: 12px; font-family: var(--mono); font-size: 10.5px; letter-spacing: .1em; color: var(--ink-soft); padding: 10px 2px 2px; text-transform: uppercase; }
  .qr { display: flex; gap: 16px; align-items: center; margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--line); }
  .qr img { width: 88px; height: 88px; background: var(--paper-light); border: 1px solid var(--line); padding: 4px; image-rendering: pixelated; }
  .qr p { margin: 0; font-family: var(--mono); font-size: 11px; letter-spacing: .1em; color: var(--ink-soft); text-transform: uppercase; line-height: 1.8; }
  .foot { margin-top: clamp(40px,7vw,88px); padding-top: 18px; border-top: 1px solid var(--line); display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; font-family: var(--mono); font-size: 11px; letter-spacing: .12em; color: var(--ink-soft); text-transform: uppercase; }
  .toast { position: fixed; left: 50%; bottom: 24px; transform: translate(-50%, 20px); background: var(--ink); color: var(--paper); padding: 10px 16px; font-family: var(--mono); font-size: 11.5px; letter-spacing: .1em; opacity: 0; pointer-events: none; transition: opacity .2s, transform .2s; z-index: 3; }
  .toast.show { opacity: 1; transform: translate(-50%, 0); }
  @media (max-width: 820px) {
    .grid { grid-template-columns: minmax(0, 1fr); }
    .plate { order: -1; }
    .facts { grid-template-columns: minmax(0,1fr); gap: 12px; }
    .qr img { width: 72px; height: 72px; }
  }
  @media (prefers-reduced-motion: reduce) { .btn, .toast { transition: none; } }
</style>
</head>
<body>
<main class="wrap">
  <header class="top">
    <a class="brand" href="/">HORTUS MANUS<small>指间花园</small></a>
    <span class="meta">Specimen No. ${esc(spec.id.toUpperCase())} · ${esc(date)}</span>
  </header>

  <section class="grid">
    <article>
      <div class="kicker">${esc(season.en)} · ${esc(season.zh)} · ${esc(mode.motif)}</div>
      <h1>${esc(mode.en)}<span class="zh">${esc(mode.zh)}</span></h1>
      <p class="latin">${esc(mode.latin)}</p>
      <p class="lede">${esc(spec.caption || mode.blurbZh)}</p>
      <dl class="facts">
        <div><dt>Family / 科</dt><dd>${esc(mode.family)}</dd></div>
        <div><dt>Season / 季</dt><dd>${esc(season.en)} · ${esc(season.zh)} · ${esc(season.latin)}</dd></div>
        <div><dt>Gesture / 手势</dt><dd>${esc(mode.gestureZh)}</dd></div>
        <div><dt>Seed</dt><dd>${esc(seedHex)}</dd></div>
        <div><dt>Collected / 采集</dt><dd>${esc(date)}</dd></div>
        <div><dt>Thanks / 致谢</dt><dd>${spec.thanks}</dd></div>
      </dl>

      <div class="actions">
        <button class="btn" id="thanks" type="button">说声谢谢 · Thanks</button>
        <button class="btn ghost" id="share" type="button">分享 · Share</button>
        <a class="btn ghost" href="/herbarium">返回温室 · Herbarium</a>
      </div>
      <p class="meta" id="thanks-note" style="margin-top:12px">${spec.thanks} 人按过这一朵。</p>
    </article>

    <figure class="plate">
      <img src="${esc(card)}" alt="${esc(mode.zh)} 标本卡 No.${esc(spec.id.slice(0, 6).toUpperCase())}" width="1200" height="1600" />
      <figcaption><span>Plate I · ${esc(mode.en)}</span><span>${esc(seedHex)}</span></figcaption>
    </figure>
  </section>

  <div class="qr">
    <img src="${esc(qr)}" alt="QR code linking to ${esc(share)}" width="88" height="88" />
    <p>Scan to reopen this specimen.<br />扫描二维码，回到这一株。</p>
  </div>

  <footer class="foot">
    <span>HORTUS MANUS · 指间花园</span>
    <span>以手为土，以息为风。</span>
    <a href="/">回到园门 · Garden gate</a>
  </footer>
</main>

<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script>
(function () {
  var id = ${JSON.stringify(spec.id)};
  var note = document.getElementById('thanks-note');
  var toast = document.getElementById('toast');
  function show(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(show.t); show.t = setTimeout(function(){ toast.classList.remove('show') }, 2200); }
  function thanks() {
    var btn = document.getElementById('thanks');
    btn.disabled = true;
    fetch('/api/specimens/' + id + '/thanks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, b: b } }) })
      .then(function (res) {
        if (!res.ok) { show(res.b && res.b.message ? res.b.message : '没能说上谢谢。'); return; }
        note.textContent = res.b.thanks + ' 人按过这一朵。';
        show(res.b.duplicate ? '今天已经谢过了。' : '谢谢收下了。');
      })
      .catch(function () { show('网络没有回应。'); })
      .finally(function () { btn.disabled = false; });
  }
  document.getElementById('thanks').addEventListener('click', thanks);
  document.getElementById('share').addEventListener('click', function () {
    var url = ${JSON.stringify(share)};
    if (navigator.share) { navigator.share({ title: document.title, url: url }).catch(function(){}); return; }
    if (navigator.clipboard) { navigator.clipboard.writeText(url).then(function(){ show('链接已复制。') }).catch(function(){ show(url) }); return; }
    show(url);
  });
})();
</script>
</body>
</html>`
}

/** 404 page in the same visual language, per contract §3. */
export function renderShareNotFoundHtml(id?: string): string {
  const safeId = id ? esc(id.slice(0, 16)) : ''
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>这株标本还没有被压进纸里 · HORTUS MANUS</title>
<meta name="robots" content="noindex" />
<meta name="theme-color" content="${COLORS.paper}" />
<style>
  html, body { margin: 0; height: 100%; background: ${COLORS.paper}; color: ${COLORS.ink}; }
  body { display: grid; place-items: center; font-family: "Noto Serif SC", "Noto Serif CJK SC", Georgia, serif; padding: 24px; }
  .box { max-width: 620px; text-align: center; }
  .mono { font-family: "IBM Plex Mono", "Nimbus Mono PS", ui-monospace, monospace; font-size: 11.5px; letter-spacing: .22em; text-transform: uppercase; color: ${COLORS.inkSoft}; }
  h1 { font-weight: 400; font-size: clamp(30px, 5vw, 46px); line-height: 1.24; margin: 22px 0 10px; }
  .en { font-style: italic; color: ${COLORS.inkSoft}; font-size: 17px; margin: 0 0 28px; }
  .rule { width: 96px; height: 1px; background: rgba(28,33,26,.35); margin: 28px auto; }
  a { display: inline-block; padding: 12px 20px; border: 1px solid ${COLORS.ink}; color: ${COLORS.ink}; text-decoration: none; font-family: "IBM Plex Mono", monospace; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
  a:hover { background: ${COLORS.ink}; color: ${COLORS.paper}; }
  .id { margin-top: 26px; color: ${COLORS.inkSoft}; font-family: monospace; font-size: 12px; }
</style>
</head>
<body>
<div class="box">
  <div class="mono">Herbarium · 404</div>
  <h1>这株标本还没有被压进纸里。</h1>
  <p class="en">This specimen has not been pressed yet.</p>
  <div class="rule"></div>
  <p style="color:${COLORS.inkSoft};font-size:15px;line-height:1.8;margin:0 0 30px">
    也许它还在你的指间长着，也许编号写错了。<br />
    Perhaps it is still growing between your fingers.
  </p>
  <a href="/">回到园门 · Back to the gate</a>
  ${safeId ? `<div class="id">No. ${safeId}</div>` : ''}
</div>
</body>
</html>`
}
