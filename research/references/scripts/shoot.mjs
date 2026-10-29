#!/usr/bin/env node
/**
 * Sequential site screenshotter + tech fingerprint for the OPL atlas.
 * One Chromium at a time, one page at a time, context closed after each site.
 * usage: node shoot.mjs [limit] [only-slug]
 * output: references/screens/{slug}/{desktop,mobile}.jpg, html/{slug}.html,
 *         headers/{slug}.json, fingerprint/{slug}.json, screenshots.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/home/huayu/browser-automation/node_modules/playwright-core');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCREENS = path.join(ROOT, 'screens');
const HTML = path.join(ROOT, 'html');
const HEADERS = path.join(ROOT, 'headers');
const FP = path.join(ROOT, 'fingerprint');
for (const d of [SCREENS, HTML, HEADERS, FP]) fs.mkdirSync(d, { recursive: true });

const EXE = process.env.CHROME_PATH || path.join(process.env.HOME, '.cache/ms-playwright/chromium-1243/chrome-linux64/chrome');
const PROXY = 'http://127.0.0.1:7897';
const ARGS = [
  '--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader',
  `--proxy-server=${PROXY}`, '--proxy-bypass-list=127.0.0.1;localhost',
  '--disable-background-networking', '--disable-renderer-backgrounding',
  '--disable-background-timer-throttling', '--mute-audio',
  '--window-size=1440,900', '--disable-features=Translate,OptimizationHints',
];

const list = JSON.parse(fs.readFileSync(path.join(ROOT, 'candidates.json'), 'utf8')).sites;
const aggFile = path.join(ROOT, 'screenshots.json');
const agg = fs.existsSync(aggFile) ? JSON.parse(fs.readFileSync(aggFile, 'utf8')) : { startedAt: new Date().toISOString(), sites: {} };
const done = (slug) => agg.sites[slug] && agg.sites[slug].desktop && agg.sites[slug].mobile;

const FP_FN = () => {
  const out = { scriptSrcs: [], stylesheets: [], generator: null, title: document.title, description: '', lang: document.documentElement.lang || '', globals: {}, canvas: [], videos: 0, images: 0, fontsLoaded: [], computedFonts: {}, cssVarColors: [], webgl: null, sections: 0, pageHeight: 0, meta: {}, dataAttrs: [], inlineScriptBytes: 0, libHints: [] };
  try {
    const m = (n) => document.querySelector(`meta[name="${n}"]`)?.content || null;
    out.generator = m('generator');
    out.description = m('description') || document.querySelector('meta[property="og:description"]')?.content || '';
    out.meta = { ogTitle: document.querySelector('meta[property="og:title"]')?.content || null, ogType: document.querySelector('meta[property="og:type"]')?.content || null, themeColor: m('theme-color'), viewport: m('viewport') };
    document.querySelectorAll('script[src]').forEach((s) => out.scriptSrcs.push(s.getAttribute('src')));
    document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => out.stylesheets.push(l.getAttribute('href')));
    document.querySelectorAll('script:not([src])').forEach((s) => { out.inlineScriptBytes += (s.textContent || '').length; });
    const g = window;
    for (const k of ['THREE', 'gsap', 'ScrollTrigger', 'SplitText', 'Lenis', 'lenis', 'barba', 'motion', 'Motion', 'Rive', 'rive', 'spline', 'p5', 'PIXI', 'Matter', 'd3', 'anime', 'locomotive', 'Vue', 'React', 'Alpine', '__NEXT_DATA__', 'Astro', 'Framer', '__framer', 'swup', 'highway', 'curtains', 'regl', 'twgl', 'OGL', 'zdog', 'Tumult', 'vivus', 'Typed', 'ride']){
      if (k in g) out.globals[k] = typeof g[k];
    }
    const gs = (g.gsap || {}).version; if (gs) out.globals.gsapVersion = gs;
    document.querySelectorAll('canvas').forEach((c) => {
      const r = c.getBoundingClientRect();
      out.canvas.push({ w: Math.round(r.width), h: Math.round(r.height), id: c.id || null, cls: (c.className || '').toString().slice(0, 60), dataEngine: c.getAttribute('data-engine') || null });
    });
    out.videos = document.querySelectorAll('video').length;
    out.images = document.querySelectorAll('img,picture').length;
    out.sections = document.querySelectorAll('section,header,footer,main > div').length;
    out.pageHeight = document.documentElement.scrollHeight;
    try {
      const fs = [];
      document.fonts.forEach((f) => { if (f.status === 'loaded') fs.push(f.family.replace(/["']/g, '')); });
      out.fontsLoaded = [...new Set(fs)].slice(0, 30);
    } catch (e) {}
    const fonts = {};
    for (const sel of ['body', 'h1', 'h2', 'h3', 'p', 'nav a', 'button', '.eyebrow']) {
      const el = document.querySelector(sel);
      if (el) { const cs = getComputedStyle(el); fonts[sel] = { family: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight, ls: cs.letterSpacing, color: cs.color }; }
    }
    out.computedFonts = fonts;
    const colors = new Set();
    document.querySelectorAll('body *').forEach((el) => {
      if (colors.size > 40) return;
      const cs = getComputedStyle(el);
      for (const v of [cs.color, cs.backgroundColor, cs.borderColor]) if (v && v !== 'rgba(0, 0, 0, 0)' && v !== 'transparent') colors.add(v);
    });
    out.cssVarColors = [...colors].slice(0, 40);
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (gl) { const dbg = gl.getExtension('WEBGL_debug_renderer_info'); out.webgl = { version: gl.getParameter(gl.VERSION), renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : null }; }
      else out.webgl = false;
    } catch (e) { out.webgl = 'err'; }
    document.querySelectorAll('[data-*]').forEach(() => {});
    const das = new Set();
    document.querySelectorAll('body *').forEach((el) => { for (const a of el.getAttributeNames()) if (a.startsWith('data-') && das.size < 40) das.add(a); });
    out.dataAttrs = [...das];
    const html = document.documentElement.innerHTML.toLowerCase();
    const hints = ['three', 'gsap', 'scrolltrigger', 'lenis', 'barba', 'shader', 'glsl', 'rive', 'spline', 'framer', 'webgl', 'canvas', 'lottie', 'scroll-snap', 'mix-blend-mode', 'clip-path', 'font-display', 'unpkg', 'jsdelivr', 'cdnjs', 'vercel', 'next', 'astro', 'nuxt', 'svelte', 'react', 'wp-content'];
    out.libHints = hints.filter((h) => html.includes(h));
  } catch (e) { out.error = String(e); }
  return out;
};

async function shoot(browser, site) {
  const slug = site.slug;
  const sdir = path.join(SCREENS, slug);
  fs.mkdirSync(sdir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
    ignoreHTTPSErrors: true, locale: 'en-US',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  const rec = { slug, name: site.name, url: site.siteUrl, oplUrl: site.oplUrl, headline: site.headline, subtext: site.subtext, queries: site.queries, at: new Date().toISOString() };
  let resp = null;
  try {
    resp = await page.goto(site.siteUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    rec.status = resp ? resp.status() : null;
    try { await page.waitForLoadState('networkidle', { timeout: 6000 }); } catch (e) {}
    await page.waitForTimeout(1800);
    rec.finalUrl = page.url();
    rec.title = await page.title().catch(() => '');
    try { await page.screenshot({ path: path.join(sdir, 'desktop.jpg'), type: 'jpeg', quality: 78, timeout: 18000, animations: 'disabled' }); }
    catch (e1) { await page.screenshot({ path: path.join(sdir, 'desktop.jpg'), type: 'jpeg', quality: 70, timeout: 22000, animations: 'disabled', caret: 'initial' }); }
    rec.desktop = true;
    rec.desktop = true;
    const fp = await page.evaluate(FP_FN).catch((e) => ({ error: String(e) }));
    rec.fp = fp;
    fs.writeFileSync(path.join(FP, slug + '.json'), JSON.stringify(fp, null, 2));
    const html = await page.content().catch(() => '');
    fs.writeFileSync(path.join(HTML, slug + '.html'), html.slice(0, 3_000_000));
    if (resp) {
      const hdrs = resp.headers();
      fs.writeFileSync(path.join(HEADERS, slug + '.json'), JSON.stringify({ status: resp.status(), headers: hdrs, finalUrl: page.url() }, null, 2));
      rec.server = (hdrs['server'] || '').slice(0, 40);
      rec.poweredBy = (hdrs['x-powered-by'] || '').slice(0, 40);
      rec.contentEncoding = hdrs['content-encoding'] || '';
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(sdir, 'mobile.jpg'), type: 'jpeg', quality: 78, timeout: 20000, animations: 'disabled' });
    rec.mobile = true;
  } catch (e) {
    rec.error = String(e.message || e).slice(0, 400);
    // partial: try desktop only if mobile failed
    try { if (!rec.desktop) { await page.screenshot({ path: path.join(sdir, 'desktop.jpg'), type: 'jpeg', quality: 70, timeout: 20000 }); rec.desktop = 'partial'; } } catch (e2) {}
  }
  await ctx.close().catch(() => {});
  return rec;
}

async function main() {
  const limit = parseInt(process.argv[2] || '999', 10);
  const only = process.argv[3];
  let todo = list.filter((s) => (only ? s.slug === only : true)).filter((s) => !done(s.slug));
  todo = todo.slice(0, limit);
  console.log(`todo ${todo.length} / ${list.length}`);
  let browser = null, n = 0;
  const launch = async () => chromium.launch({ executablePath: EXE, headless: true, args: ARGS, timeout: 90000 });
  browser = await launch();
  for (const site of todo) {
    n++;
    let rec = null;
    for (let attempt = 1; attempt <= 3 && !rec; attempt++) {
      const t0 = Date.now();
      try {
        rec = await shoot(browser, site);
        rec.attempt = attempt;
        rec.seconds = Math.round((Date.now() - t0) / 1000);
      } catch (e) {
        console.log(`  retry ${site.slug} a${attempt}: ${String(e.message || e).slice(0, 90)}`);
        rec = null;
        await browser.close().catch(() => {});
        browser = await launch().catch(() => null);
        if (!browser) { await new Promise((r) => setTimeout(r, 5000)); browser = await launch().catch(() => null); }
        await new Promise((r) => setTimeout(r, 2500));
      }
    }
    if (!rec) rec = { slug: site.slug, name: site.name, url: site.siteUrl, oplUrl: site.oplUrl, headline: site.headline, error: 'all attempts failed' };
    agg.sites[site.slug] = rec;
    fs.writeFileSync(aggFile, JSON.stringify(agg, null, 2));
    console.log(`[${n}/${todo.length}] ${site.slug} ${rec.status || 'ERR'} d=${rec.desktop ? 'y' : 'n'} m=${rec.mobile ? 'y' : 'n'} ${rec.seconds || '?'}s ${rec.error ? rec.error.slice(0, 80) : ''}`);
    if (n % 12 === 0) { await browser.close().catch(() => {}); browser = await launch().catch(() => null); }
    await new Promise((r) => setTimeout(r, 700));
  }
  await browser.close().catch(() => {});
  agg.finishedAt = new Date().toISOString();
  fs.writeFileSync(aggFile, JSON.stringify(agg, null, 2));
  const ok = Object.values(agg.sites).filter((s) => s.desktop && s.mobile).length;
  console.log(`DONE ok=${ok} total=${Object.keys(agg.sites).length}`);
}
main().catch((e) => { console.error('FATAL', e); process.exit(1); });