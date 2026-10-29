import { createCanvas } from '@napi-rs/canvas'
import QRCode from 'qrcode'
import { findMode, findSeason, seedFromParts, type Specimen } from '@hortus/shared'
import { COLORS, alpha, mixHex, paletteFor } from './palette'
import { artRng, digest, roman, seedHex, stamp } from './rand'
import { centerText, drawText, fitFont, rightText, setFont, textWidth, wrapText } from './text'
import { configureFonts, fontStatus, getFonts } from './fonts'
import { drawPlant } from './plants'
import type { ArtPalette, ArtSpec, Ctx } from './types'

export { configureFonts, fontStatus, getFonts }
export { COLORS, alpha, mixHex } from './palette'
export { artRng, digest, roman, seedHex, stamp } from './rand'
export type { ArtSpec, ArtPalette, FontSet } from './types'

const HANDS: Record<string, string> = {
  frame: '以手为土，以息为风。',
  tendril: '一根绳，长成一整个春天。',
  ripple: '指尖落下去，池子就醒了。',
  spore: '握拳起风，开掌接住。',
  mycelium: '两掌之间，长出一片夜。',
  mist: '擦开雾，玻璃后面是旧的夏天。',
  phyllotaxis: '花按黄金角，一圈圈开。',
}

export const CARD_WIDTH = 1200
export const CARD_HEIGHT = 1600
export const OG_WIDTH = 1200
export const OG_HEIGHT = 630

function toArtSpec(spec: Specimen | ArtSpec): ArtSpec {
  return {
    id: spec.id,
    mode: spec.mode,
    season: spec.season,
    seed: spec.seed,
    caption: spec.caption ?? '',
    lang: spec.lang ?? 'zh',
    createdAt: spec.createdAt ?? new Date(0).toISOString(),
    thanks: spec.thanks ?? 0,
  }
}

/**
 * Deterministic specimen card, 1200x1600 PNG.
 * Same spec => byte-identical PNG (no Date.now, no Math.random, fonts fixed).
 */
export function renderCardPng(spec: Specimen | ArtSpec, shareUrl: string): Buffer {
  const s = toArtSpec(spec)
  const fonts = getFonts()
  const mode = findMode(s.mode)
  const season = findSeason(s.season)
  const rand = artRng(s)
  const t = stamp(s.createdAt)
  const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT)
  const ctx = canvas.getContext('2d')
  const P = paletteFor(s)

  // ---- paper
  ctx.fillStyle = P.paper
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)
  // grain
  for (let i = 0; i < 2400; i++) {
    const x = rand.range(0, CARD_WIDTH)
    const y = rand.range(0, CARD_HEIGHT)
    ctx.fillStyle = alpha(rand.chance(0.5) ? P.ink : P.paperDeep, rand.range(0.02, 0.07))
    ctx.fillRect(x, y, rand.range(1.2, 2.8), rand.range(1.2, 2.8))
  }
  // soft edge vignette
  const vg = ctx.createRadialGradient(CARD_WIDTH / 2, CARD_HEIGHT / 2, CARD_HEIGHT * 0.28, CARD_WIDTH / 2, CARD_HEIGHT / 2, CARD_HEIGHT * 0.78)
  vg.addColorStop(0, alpha(P.paper, 0))
  vg.addColorStop(1, alpha(mixHex(P.paperDeep, P.ink, 0.35), 0.1))
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  // ---- double frame
  const M = 56
  ctx.strokeStyle = alpha(P.ink, 0.72)
  ctx.lineWidth = 1.6
  ctx.strokeRect(M, M, CARD_WIDTH - M * 2, CARD_HEIGHT - M * 2)
  ctx.strokeStyle = alpha(P.ink, 0.34)
  ctx.lineWidth = 1
  ctx.strokeRect(M + 9, M + 9, CARD_WIDTH - (M + 9) * 2, CARD_HEIGHT - (M + 9) * 2)

  const L = 104
  const R = CARD_WIDTH - L

  // ---- header
  drawText(ctx, 'HORTUS MANUS', L, 158, `30px ${fonts.display}`, P.ink, 10)
  rightText(ctx, `${seedHex(s.seed)}`, R, 158, `22px ${fonts.mono}`, P.inkSoft, 3)
  ctx.strokeStyle = alpha(P.ink, 0.4)
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(L, 182)
  ctx.lineTo(R, 182)
  ctx.stroke()
  drawText(ctx, `EX HERBARIO MANUS · 手之标本馆`, L, 216, `17px ${fonts.monoCjk}`, P.inkSoft, 4)
  rightText(ctx, `FOL. ${roman(rand.int(1, 40))}`, R, 216, `17px ${fonts.mono}`, P.inkSoft, 4)

  // ---- specimen number
  drawText(ctx, `No. ${digest(s.id, 6)}`, L, 292, `54px ${fonts.display}`, P.ink, 2)
  const latinSize = fitFont(ctx, mode.latin, fonts.displayItalic, 44, R - L - 250)
  rightText(ctx, mode.latin, R, 288, `italic ${latinSize}px ${fonts.displayItalic}`, P.accentDeep)

  // ---- plant plate: watercolour wash + line drawing
  const plate = { x: L, y: 330, w: R - L, h: 660 }
  drawPlate(ctx, plate, s, rand, P, fonts, mode.glyph)

  // ---- taxonomy block
  const tx = L
  let ty = 1036
  const row = (label: string, value: string, accent = false) => {
    drawText(ctx, label, tx, ty, `15px ${fonts.monoCjk}`, alpha(P.inkSoft, 0.9), 3)
    drawText(ctx, value, tx + 150, ty, `22px ${fonts.serifSC}`, accent ? P.accentDeep : P.ink, 0)
    ty += 34
  }
  drawText(ctx, mode.en, tx, ty, `30px ${fonts.display}`, P.ink, 6)
  rightText(ctx, mode.zh, R, ty, `30px ${fonts.serifSC}`, P.ink)
  ty += 40
  row('FAMILY / 科', mode.family)
  row('MOTIF / 母题', mode.motif)
  row('SEASON / 季', `${season.en} · ${season.zh}  ·  ${season.latin}`)
  row('GESTURE / 势', mode.gestureZh, true)

  // ---- caption (user's words, max two lines)
  if (s.caption) {
    const lines = wrapText(ctx, s.caption, R - L - 40, `25px ${fonts.serifSC}`, 2)
    lines.forEach((line, i) => drawText(ctx, line, tx, ty + 4 + i * 34, `25px ${fonts.serifSC}`, P.inkSoft, 0))
    ty += 4 + lines.length * 34
  }

  // handwritten curator's note, always below the caption
  const handY = Math.max(1318, ty + 42)
  const hand = s.caption && s.caption.length <= 30 ? HANDS[s.mode] : HANDS[s.mode]
  const handSize = fitFont(ctx, hand, fonts.hand, 33, R - L - 60, 20)
  ctx.save()
  ctx.translate(L + 6, handY)
  ctx.rotate(-0.024)
  drawText(ctx, hand, 0, 0, `${handSize}px ${fonts.hand}`, alpha(P.accentDeep, 0.88), 0)
  ctx.restore()
  setFont(ctx, `${handSize}px ${fonts.hand}`, 0)
  const handW = Math.min(R - L - 60, textWidth(ctx, hand) + 12)
  ctx.strokeStyle = alpha(P.accentDeep, 0.32)
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(L + 4, handY + 14)
  ctx.lineTo(L + 4 + handW, handY + 10)
  ctx.stroke()

  // ---- footer: coordinates, collected at, barcode + QR
  ctx.strokeStyle = alpha(P.ink, 0.35)
  ctx.beginPath()
  ctx.moveTo(L, 1352)
  ctx.lineTo(R, 1352)
  ctx.stroke()

  drawText(ctx, 'COLLECTED', L, 1390, `14px ${fonts.mono}`, alpha(P.inkSoft, 0.85), 3)
  drawText(ctx, `${t.date}  ${t.time}`, L, 1420, `19px ${fonts.mono}`, P.ink, 0)

  const cx = L + 330
  drawText(ctx, 'COORD.', cx, 1390, `14px ${fonts.mono}`, alpha(P.inkSoft, 0.85), 3)
  drawText(ctx, coordLabel(s), cx, 1420, `19px ${fonts.mono}`, P.ink, 0)

  drawBarcode(ctx, { x: L, y: 1438, w: 330, h: 54 }, s.id, P)
  
  // QR (drawn from the matrix, deterministic, no async)
  const qrBox = 104
  drawQrModules(ctx, shareUrl, R - qrBox, 1362, qrBox, P)
  rightText(ctx, 'SCAN · 扫描', R, 1494, `13px ${fonts.monoCjk}`, P.inkSoft, 3)

  drawText(ctx, 'HORTUS MANUS · 指间花园', L, 1526, `18px ${fonts.monoCjk}`, P.inkSoft, 5)
  rightText(ctx, `NO. ${digest(s.id, 8)}`, R, 1526, `18px ${fonts.mono}`, P.inkSoft, 2)

  return canvas.toBuffer('image/png')
}

/** Plant plate: soft wash blobs + a botanical ink line drawing + specimen label. */
function drawPlate(
  ctx: Ctx,
  box: { x: number; y: number; w: number; h: number },
  s: ArtSpec,
  rand: ReturnType<typeof artRng>,
  P: ArtPalette,
  fonts: ReturnType<typeof getFonts>,
  glyph: string,
  compact = false,
): void {
  const cx = box.x + box.w / 2
  const cy = box.y + box.h / 2 + 16
  const scale = Math.min(box.w * 0.5, box.h * 0.58)

  // portrait plate rule (herbarium sheet), centred on the plant
  const pw = Math.min(box.w * 0.56, box.h * 0.82)
  const ph = box.h * 0.9
  const px = cx - pw / 2
  const py = box.y + (box.h - ph) / 2
  ctx.strokeStyle = alpha(P.inkSoft, 0.2)
  ctx.lineWidth = 1
  ctx.strokeRect(px, py, pw, ph)
  ctx.strokeStyle = alpha(P.inkSoft, 0.12)
  ctx.strokeRect(px + 5, py + 5, pw - 10, ph - 10)

  // registration marks at the plate corners
  ctx.strokeStyle = alpha(P.inkSoft, 0.32)
  const mark = (x: number, y: number) => {
    ctx.beginPath()
    ctx.moveTo(x - 6, y)
    ctx.lineTo(x + 6, y)
    ctx.moveTo(x, y - 6)
    ctx.lineTo(x, y + 6)
    ctx.stroke()
  }
  mark(px, py)
  mark(px + pw, py)
  mark(px, py + ph)
  mark(px + pw, py + ph)

  // watercolour washes (multiply so they read like pigment on paper)
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  const washes = rand.int(2, 3)
  for (let i = 0; i < washes; i++) {
    const wx = cx + rand.range(-scale * 0.8, scale * 0.8)
    const wy = cy + rand.range(-scale * 0.7, scale * 0.7)
    const wr = rand.range(scale * 0.5, scale * 1.1)
    const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, wr)
    const tone = i % 2 === 0 ? P.accent : P.seasonAccent
    g.addColorStop(0, alpha(tone, rand.range(0.2, 0.34)))
    g.addColorStop(0.55, alpha(tone, 0.1))
    g.addColorStop(1, alpha(tone, 0))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(wx, wy, wr, wr * rand.range(0.7, 1.15), rand.range(0, Math.PI), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  // per-mode botanical line drawing (deterministic from the art seed)
  drawPlant(s.mode, {
    ctx,
    cx,
    baseY: py + ph * 0.92,
    topY: py + ph * 0.12,
    scale: ph * 0.78,
    rand,
    P,
    ink: P.ink,
    accent: P.accent,
    season: s.season,
  })

  // glyph + plate label (omitted on the compact OG thumbnail)
  if (!compact) {
    drawText(ctx, glyphLabel(glyph), box.x + 4, py + ph + 20, `13px ${fonts.mono}`, alpha(P.inkSoft, 0.9), 3)
    rightText(ctx, `PL. ${roman(rand.int(1, 60))}`, box.x + box.w - 4, py + ph + 20, `13px ${fonts.mono}`, alpha(P.inkSoft, 0.9), 3)
  }
}

function glyphLabel(glyph: string): string {
  return `GLYPH · ${glyph.toUpperCase()}`
}

function coordLabel(s: ArtSpec): string {
  // deterministic pseudo-coordinates derived from the seed; clearly labelled as garden-local
  const a = seedFromParts(s.id, s.seed)
  const lat = 30 + (a % 100000) / 100000
  const lon = 100 + ((a >>> 8) % 100000) / 100000
  return `N ${lat.toFixed(4)}°  E ${lon.toFixed(4)}°`
}

/** Simple deterministic barcode from the id. */
function drawBarcode(
  ctx: Ctx,
  box: { x: number; y: number; w: number; h: number },
  id: string,
  P: ArtPalette,
): void {
  const src = digest(id, 16) + digest(`${id}:b`, 8)
  const modules = src.length * 4
  const unit = box.w / (modules + 2)
  let x = box.x + unit
  ctx.fillStyle = alpha(P.ink, 0.88)
  for (const ch of src) {
    const v = parseInt(ch, 32)
    for (let k = 0; k < 4; k++) {
      const bit = (v >> k) & 1
      if (bit) ctx.fillRect(x, box.y, unit, box.h)
      x += unit
    }
  }
  // guard bars
  ctx.fillRect(box.x, box.y, unit * 0.7, box.h)
  ctx.fillRect(box.x + box.w - unit * 0.7, box.y, unit * 0.7, box.h)
}

/** QR modules drawn manually (sync, crisp, deterministic). */
export function drawQrModules(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  size: number,
  P: Pick<ArtPalette, 'paper' | 'ink'>,
): void {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' })
  const n = qr.modules.size
  const cell = size / n
  ctx.fillStyle = P.paper
  ctx.fillRect(x - 6, y - 6, size + 12, size + 12)
  ctx.fillStyle = alpha(P.ink, 0.92)
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (qr.modules.get(row, col)) {
        ctx.fillRect(x + col * cell, y + row * cell, Math.ceil(cell), Math.ceil(cell))
      }
    }
  }
}

/** Deterministic QR PNG for the stage modal. */
export function renderQrPng(text: string, size = 320): Buffer {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = COLORS.paper
  ctx.fillRect(0, 0, size, size)
  drawQrModules(ctx, text, size * 0.06, size * 0.06, size * 0.88, COLORS)
  return canvas.toBuffer('image/png')
}

/** Deterministic OG image, 1200x630. */
export function renderOgPng(spec: Specimen | ArtSpec, shareUrl: string): Buffer {
  const s = toArtSpec(spec)
  const fonts = getFonts()
  const mode = findMode(s.mode)
  const season = findSeason(s.season)
  const rand = artRng(s)
  const t = stamp(s.createdAt)
  const canvas = createCanvas(OG_WIDTH, OG_HEIGHT)
  const ctx = canvas.getContext('2d')
  const P = paletteFor(s)

  ctx.fillStyle = P.paper
  ctx.fillRect(0, 0, OG_WIDTH, OG_HEIGHT)
  // wash
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  for (let i = 0; i < 3; i++) {
    const wx = rand.range(700, 1080)
    const wy = rand.range(80, 560)
    const wr = rand.range(180, 340)
    const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, wr)
    g.addColorStop(0, alpha(i % 2 ? P.seasonAccent : P.accent, 0.22))
    g.addColorStop(1, alpha(P.accent, 0))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(wx, wy, wr, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
  // grain
  for (let i = 0; i < 1800; i++) {
    ctx.fillStyle = alpha(P.ink, rand.range(0.02, 0.06))
    ctx.fillRect(rand.range(0, OG_WIDTH), rand.range(0, OG_HEIGHT), 1.5, 1.5)
  }

  // frame
  ctx.strokeStyle = alpha(P.ink, 0.5)
  ctx.lineWidth = 1.4
  ctx.strokeRect(40, 40, OG_WIDTH - 80, OG_HEIGHT - 80)

  const L = 84
  drawText(ctx, 'HORTUS MANUS · 指间花园', L, 118, `20px ${fonts.monoCjk}`, P.inkSoft, 6)
  drawText(ctx, mode.en, L, 236, `96px ${fonts.display}`, P.ink, 6)
  drawText(ctx, mode.zh, L, 300, `40px ${fonts.serifSC}`, P.accentDeep)
  const size = fitFont(ctx, mode.latin, fonts.displayItalic, 40, 620)
  drawText(ctx, mode.latin, L, 360, `italic ${size}px ${fonts.displayItalic}`, P.inkSoft)
  drawText(ctx, `${season.en} · ${season.zh}`, L, 410, `22px ${fonts.monoCjk}`, P.inkSoft, 4)
  drawText(ctx, `SEED ${seedHex(s.seed)} · No. ${digest(s.id, 6)} · ${t.date}`, L, 446, `20px ${fonts.mono}`, P.inkSoft, 2)

  // mini card composition on the right
  const mx = 800
  const my = 96
  const mw = 320
  const mh = 438
  ctx.fillStyle = P.paperLight
  ctx.fillRect(mx, my, mw, mh)
  ctx.strokeStyle = alpha(P.ink, 0.45)
  ctx.lineWidth = 1
  ctx.strokeRect(mx, my, mw, mh)
  const c = createCanvas(mw, mh)
  const cctx = c.getContext('2d')
  cctx.fillStyle = P.paperLight
  cctx.fillRect(0, 0, mw, mh)
  // reuse the same drawing primitives for a compact plate
  const miniRand = artRng({ ...s, seed: seedFromParts(s.id, 'mini') })
  const plateBox = { x: 24, y: 58, w: mw - 48, h: 236 }
  drawPlate(cctx, plateBox, s, miniRand, P, fonts, mode.glyph, true)
  drawText(cctx, 'No. ' + digest(s.id, 6), 24, 40, `22px ${fonts.display}`, P.ink, 1)
  rightText(cctx, seedHex(s.seed), mw - 24, 40, `13px ${fonts.mono}`, P.inkSoft, 1)
  const qrSize = 64
  const capWidth = mw - 48 - qrSize - 16
  const capLines = wrapText(cctx, s.caption || mode.blurbZh, capWidth, `14px ${fonts.serifSC}`, 3)
  capLines.forEach((line, i) => drawText(cctx, line, 24, 322 + i * 21, `14px ${fonts.serifSC}`, P.inkSoft))
  drawQrModules(cctx, shareUrl, mw - 24 - qrSize, mh - 24 - qrSize, qrSize, P)
  rightText(cctx, 'HORTUS MANUS', mw - 24, mh - 96, `11px ${fonts.mono}`, alpha(P.inkSoft, 0.8), 2)
  ctx.drawImage(c, mx, my)

  // CTA
  drawText(ctx, '以手为土，以息为风。', L, 520, `26px ${fonts.serifSC}`, P.ink)
  drawText(ctx, 'Your hands are the weather.', L, 556, `italic 24px ${fonts.displayItalic}`, P.inkSoft)
  rightText(ctx, 'HORTUS MANUS · 指间花园', OG_WIDTH - 84, 566, `17px ${fonts.monoCjk}`, P.inkSoft, 4)

  return canvas.toBuffer('image/png')
}

/** Legacy SVG export kept for the browser-side canvas-less fallback. */
export function cardSvg(spec: Pick<Specimen, 'mode' | 'season' | 'seed' | 'createdAt' | 'id'> & { caption?: string }): string {
  const mode = findMode(spec.mode)
  const season = findSeason(spec.season)
  const t = stamp(spec.createdAt)
  const esc = (v: string) => v.replace(/[<>&"]/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[ch] ?? ch)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}"><rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${COLORS.paper}"/><rect x="56" y="56" width="${CARD_WIDTH - 112}" height="${CARD_HEIGHT - 112}" fill="none" stroke="${COLORS.ink}" stroke-opacity="0.7"/><text x="104" y="160" font-family="serif" font-size="30" letter-spacing="10" fill="${COLORS.ink}">HORTUS MANUS</text><text x="104" y="300" font-family="serif" font-size="54" fill="${COLORS.ink}">No. ${esc(digest(spec.id, 6))}</text><text x="104" y="420" font-family="serif" font-size="44" font-style="italic" fill="${mode.accent}">${esc(mode.latin)}</text><text x="104" y="1080" font-family="monospace" font-size="22" fill="${COLORS.inkSoft}">${esc(mode.en)} / ${esc(season.en)} · SEED ${seedHex(spec.seed)}</text><text x="104" y="1140" font-family="serif" font-size="26" fill="${COLORS.inkSoft}">${esc(spec.caption ?? '')}</text><text x="104" y="1548" font-family="monospace" font-size="18" letter-spacing="5" fill="${COLORS.inkSoft}">HORTUS MANUS · 指间花园</text><text x="1096" y="1548" text-anchor="end" font-family="monospace" font-size="18" fill="${COLORS.inkSoft}">${esc(t.date)}</text></svg>`
}

export { textWidth, centerText, setFont }
