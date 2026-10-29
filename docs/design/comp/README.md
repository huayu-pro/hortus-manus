# HORTUS MANUS — static visual comp (six acts + `/touch` HUD)

> **Status: art-direction target, not product code.** Plain HTML/CSS + one tiny hash-scroll script.
> Owner: atelier. Do not ship this folder into the app; stage/mechanics implement it as the visual target.

## What is here

| File | Purpose |
|---|---|
| `index.html` | `/` — six acts in one scroll: I 园门 / II 授粉 / III 温室 / interlude 田野笔记 / IV 标本馆 / coda 版权页 |
| `touch.html` | `/touch` — full-screen hand greenhouse: paper **botanical key** mode rail, care label, gesture hints, collect stamp, vertical marginalia |
| `comp.css` | All styles, self-contained (palette/type mirror `apps/web/src/styles/tokens.css`; not imported at runtime) |
| `shoot.mjs` | Screenshot driver (Playwright Chromium binary over CDP, one instance) |
| `shots/` | Final PNG evidence — desktop 1440×900, mobile 390×844, full-page + per-act |

## Serve locally

From the **hortus-manus root** (so `/apps/web/public/...` resolves):

```bash
cd /home/huayu/Agent工作区/DSHarness/1/hortus-manus
python3 -m http.server 8123 --bind 127.0.0.1
# open:
# http://127.0.0.1:8123/docs/design/comp/index.html
# http://127.0.0.1:8123/docs/design/comp/touch.html
```

## Regenerate screenshots

```bash
# server must be running on :8123
node docs/design/comp/shoot.mjs
```

Chromium: `/home/huayu/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`
(one instance at a time; the script kills it at exit).

## Shot map

| File | View |
|---|---|
| `shots/00-home-full-1440.png` | full six-act page, 1440×5400 |
| `shots/01-home-hero-1440.png` | 园门 hero, 1440×900 |
| `shots/02-pollination-1440.png` | 授粉 + botanical key, 1440×900 |
| `shots/03-greenhouse-1440.png` | 温室 + care label + Monet plate, 1440×900 |
| `shots/04-fieldnotes-1440.png` | 田野笔记 + pressed plate + handwriting, 1440×900 |
| `shots/05-herbarium-1440.png` | 标本馆 cards + filters, 1440×900 |
| `shots/06-colophon-1440.png` | 版权页 + `for Gerard & Claude`, 1440×900 |
| `shots/07-touch-1440.png` | `/touch` HUD full-screen, 1440×900 |
| `shots/08-home-hero-390.png` | mobile hero, 390×844 |
| `shots/09-home-full-390.png` | mobile full page, 390×7426 |
| `shots/10–14-*-390.png` | mobile per-act folds |
| `shots/15-touch-390.png` | mobile `/touch` HUD, 390×844 |

## Real assets used

- Fonts: `apps/web/public/fonts/` — Instrument Serif, Cormorant, Noto Serif SC, Noto Sans SC, IBM Plex Mono, Ma Shan Zheng (OFL, self-hosted; see `public/fonts/OFL.txt`).
- Plates: `apps/web/public/plates/` — 5 public-domain plates. Credits/licenses in `apps/web/public/plates/LICENSES.md`:
  - `peony-red.webp` — Masaki Ikeda, PD, Wikimedia
  - `peony-white.webp` — Masaki Ikeda, PD, Wikimedia
  - `peony-botmag.webp` — Curtis's Botanical Magazine 1809 (Syd. Edwards ad. / F. Sansom sculp.), PD
  - `peony-andrews.webp` — Henry Cranke Andrews, PD
  - `monet-waterlilies.webp` — Claude Monet, PD

## Art-direction contract

The comp follows `docs/design/art-direction.md` and `docs/design/wireframes.md`:

- cream `#F6F1E7` / ink `#1C211A` / peony `#C97F7F` / moss `#4A5A42` / pollen `#D8A84E`;
- 12-column asymmetric editorial grid, 96px margins at 1440, huge Instrument/Noto Serif display type;
- full-bleed plates, deckle/tape/pressed treatments, ±1.2° plate rotation only;
- vertical marginalia, folio/collection numbers, glasshouse telemetry, no SaaS cards, no cyber HUD;
- all copy from `packages/shared/src/copy.ts` (`copy.zh` primary, English counterpart).

## Deliberate simplifications (comp, not product)

- No React / router / Three.js / MediaPipe; interactions are visual states only.
- The only script is hash scroll (`#pollination` etc.) so per-act screenshots can target sections.
- Fonts are loaded from the real public folder via relative URLs; no font files are copied into this folder.
- `shots/` images are design evidence, not shipped assets.
