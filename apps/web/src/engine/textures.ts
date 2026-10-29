/**
 * Procedural texture atelier.
 *
 * Every texture the engine uses is painted here with Canvas2D at boot (or lazily
 * on first use): paper grain, watercolour washes, moss, dew, dandelion fluff, and
 * the fallback pressed-fern plate for MIST. Public-domain plates are loaded from
 * /plates when available and simply replace the fallback.
 */

import * as THREE from 'three'
import type { Palette } from './palette'
import { hexToRgb } from './palette'

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('Canvas2D unavailable')
  return [c, ctx]
}

function texture(c: HTMLCanvasElement, repeat = false): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.NoColorSpace
  t.anisotropy = 4
  if (repeat) {
    t.wrapS = THREE.MirroredRepeatWrapping
    t.wrapT = THREE.MirroredRepeatWrapping
  }
  t.needsUpdate = true
  return t
}

/** Deterministic smooth value noise for CPU-painted textures. */
export function valueNoise2D(seed: number, cells: number): (x: number, y: number) => number {
  const rand = mulberry(seed)
  const grid: number[] = []
  const n = cells + 1
  for (let i = 0; i < n * n; i++) grid.push(rand())
  return (x: number, y: number) => {
    const fx = x * cells
    const fy = y * cells
    const ix = Math.floor(fx)
    const iy = Math.floor(fy)
    const tx = fx - ix
    const ty = fy - iy
    const sx = tx * tx * (3 - 2 * tx)
    const sy = ty * ty * (3 - 2 * ty)
    const g = (i: number, j: number) => grid[Math.min(n - 1, Math.max(0, j)) * n + Math.min(n - 1, Math.max(0, i))]
    const a = g(ix, iy)
    const b = g(ix + 1, iy)
    const c = g(ix, iy + 1)
    const d = g(ix + 1, iy + 1)
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy
  }
}

function mulberry(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Warm laid paper with fibres and a soft deckle shadow. */
export function makePaperTexture(palette: Palette, size = 768): THREE.CanvasTexture {
  const [c, ctx] = canvas(size, size)
  const rand = mulberry(7)
  ctx.fillStyle = palette.paper
  ctx.fillRect(0, 0, size, size)

  // broad tonal blotches
  for (let i = 0; i < 42; i++) {
    const x = rand() * size
    const y = rand() * size
    const r = size * (0.04 + rand() * 0.18)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const tone = rand() > 0.5 ? palette.paperDeep : palette.paper
    g.addColorStop(0, rgbaHex(tone, 0.1 + rand() * 0.12))
    g.addColorStop(1, rgbaHex(tone, 0))
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }

  // fibres: short, nearly invisible strokes
  ctx.strokeStyle = rgbaHex(palette.ink, 0.035)
  ctx.lineWidth = 0.7
  for (let i = 0; i < 900; i++) {
    const x = rand() * size
    const y = rand() * size
    const len = 2 + rand() * 14
    const a = rand() * Math.PI
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(
      x + Math.cos(a) * len * 0.5 + (rand() - 0.5) * 3,
      y + Math.sin(a) * len * 0.5 + (rand() - 0.5) * 3,
      x + Math.cos(a) * len,
      y + Math.sin(a) * len,
    )
    ctx.stroke()
  }

  // fine grain
  const img = ctx.getImageData(0, 0, size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * 12
    d[i] = clamp255(d[i] + n)
    d[i + 1] = clamp255(d[i + 1] + n)
    d[i + 2] = clamp255(d[i + 2] + n)
  }
  ctx.putImageData(img, 0, 0)

  // deckle edge vignette
  const vg = ctx.createRadialGradient(size / 2, size / 2, size * 0.32, size / 2, size / 2, size * 0.72)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, rgbaHex(palette.ink, 0.08))
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, size, size)

  return texture(c, true)
}

/** Soft watercolour wash with granulation — used behind FRAME / PHYLLOTAXIS. */
export function makeWatercolorTexture(palette: Palette, size = 512): THREE.CanvasTexture {
  const [c, ctx] = canvas(size, size)
  const rand = mulberry(31)
  ctx.fillStyle = palette.paper
  ctx.fillRect(0, 0, size, size)
  const colors = [palette.blush, palette.peony, palette.mist, palette.sage]
  for (let i = 0; i < 16; i++) {
    const x = rand() * size
    const y = rand() * size
    const r = size * (0.12 + rand() * 0.3)
    const col = colors[Math.floor(rand() * colors.length)]
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, rgbaHex(col, 0.16))
    g.addColorStop(0.55, rgbaHex(col, 0.08))
    g.addColorStop(1, rgbaHex(col, 0))
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  // granulation
  const img = ctx.getImageData(0, 0, size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * 9
    d[i] = clamp255(d[i] + n)
    d[i + 1] = clamp255(d[i + 1] + n)
    d[i + 2] = clamp255(d[i + 2] + n)
  }
  ctx.putImageData(img, 0, 0)
  return texture(c, true)
}

/** Moss / forest floor for MYCELIUM. */
export function makeMossTexture(palette: Palette, size = 512): THREE.CanvasTexture {
  const [c, ctx] = canvas(size, size)
  const rand = mulberry(53)
  const noise = valueNoise2D(53, 6)
  ctx.fillStyle = palette.paperDeep
  ctx.fillRect(0, 0, size, size)
  const img = ctx.getImageData(0, 0, size, size)
  const d = img.data
  const moss = hexToRgb(palette.moss)
  const sage = hexToRgb(palette.sage)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = noise(x / size, y / size)
      const k = 0.25 + n * 0.55
      const i = (y * size + x) * 4
      d[i] = clamp255(d[i] * (1 - k) + moss[0] * 255 * k * 0.55 + sage[0] * 255 * k * 0.2)
      d[i + 1] = clamp255(d[i + 1] * (1 - k) + moss[1] * 255 * k * 0.6 + sage[1] * 255 * k * 0.2)
      d[i + 2] = clamp255(d[i + 2] * (1 - k) + moss[2] * 255 * k * 0.5 + sage[2] * 255 * k * 0.18)
    }
  }
  ctx.putImageData(img, 0, 0)
  // tiny moss dots
  for (let i = 0; i < 1800; i++) {
    const x = rand() * size
    const y = rand() * size
    ctx.fillStyle = rgbaHex(rand() > 0.5 ? palette.leaf : palette.moss, 0.05 + rand() * 0.12)
    ctx.beginPath()
    ctx.arc(x, y, 0.4 + rand() * 1.6, 0, Math.PI * 2)
    ctx.fill()
  }
  return texture(c, true)
}

/** Radial dew / pollen sprite with a hard-ish core. */
export function makeDewTexture(palette: Palette, size = 64): THREE.CanvasTexture {
  const [c, ctx] = canvas(size, size)
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.18, rgbaHex(palette.mist, 0.95))
  g.addColorStop(0.5, rgbaHex(palette.mist, 0.35))
  g.addColorStop(1, rgbaHex(palette.mist, 0))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return texture(c)
}

/** Dandelion pappus sprite for SPORE (white fluff on transparent). */
export function makeFluffTexture(palette: Palette, size = 128): THREE.CanvasTexture {
  const [c, ctx] = canvas(size, size)
  const rand = mulberry(71)
  const cx = size / 2
  const cy = size / 2
  ctx.strokeStyle = rgbaHex(palette.moon, 0.9)
  ctx.lineWidth = 0.8
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + rand() * 0.2
    const r = size * (0.24 + rand() * 0.2)
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.quadraticCurveTo(cx + Math.cos(a - 0.2) * r * 0.7, cy + Math.sin(a - 0.2) * r * 0.7, cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * r * 0.72, cy + Math.sin(a) * r * 0.72)
    ctx.lineTo(cx + Math.cos(a + 0.22) * r * 0.94, cy + Math.sin(a + 0.22) * r * 0.94)
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.045, 0, Math.PI * 2)
  ctx.fill()
  return texture(c)
}

/** Painted Monet-ish pond fallback for RIPPLE when the plate is unavailable. */
export function paintPond(ctx: CanvasRenderingContext2D, w: number, h: number, palette: Palette): void {
  const rand = mulberry(91)
  ctx.fillStyle = palette.paperDeep
  ctx.fillRect(0, 0, w, h)
  const bands = [
    { c: palette.pond, a: 0.5 },
    { c: palette.mist, a: 0.35 },
    { c: palette.leaf, a: 0.3 },
    { c: palette.blush, a: 0.28 },
    { c: palette.pollen, a: 0.18 },
  ]
  // broad horizontal watercolour bands
  for (let i = 0; i < 90; i++) {
    const y = rand() * h
    const band = bands[Math.floor(rand() * bands.length)]
    const bh = 6 + rand() * 34
    const x = rand() * w
    const bw = w * (0.12 + rand() * 0.5)
    const g = ctx.createLinearGradient(x, y, x + bw, y + bh)
    g.addColorStop(0, rgbaHex(band.c, 0))
    g.addColorStop(0.5, rgbaHex(band.c, band.a * 0.22))
    g.addColorStop(1, rgbaHex(band.c, 0))
    ctx.fillStyle = g
    ctx.fillRect(x, y, bw, bh)
  }
  // lily pads
  for (let i = 0; i < 16; i++) {
    const x = rand() * w
    const y = rand() * h
    const r = 12 + rand() * 46
    const squash = 0.45 + rand() * 0.3
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(1, squash)
    ctx.fillStyle = rgbaHex(rand() > 0.4 ? palette.leaf : palette.moss, 0.32 + rand() * 0.2)
    ctx.beginPath()
    const notch = rand() * 0.7
    ctx.arc(0, 0, r, notch, Math.PI * 2 + notch * 0.5)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = rgbaHex(palette.moss, 0.25)
    ctx.lineWidth = 1
    for (let k = 0; k < 5; k++) {
      const a = notch + (k / 5) * Math.PI * 1.8
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92)
      ctx.stroke()
    }
    ctx.restore()
  }
  // petals
  for (let i = 0; i < 22; i++) {
    const x = rand() * w
    const y = rand() * h
    const r = 3 + rand() * 8
    ctx.fillStyle = rgbaHex(rand() > 0.5 ? palette.blush : palette.peony, 0.3)
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * 0.55, rand() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** Pressed-fern plate fallback for MIST (drawn at 1024×640). */
export function paintFernPlate(ctx: CanvasRenderingContext2D, w: number, h: number, palette: Palette): void {
  const rand = mulberry(137)
  ctx.fillStyle = palette.paper
  ctx.fillRect(0, 0, w, h)
  // plate wash
  const wash = ctx.createRadialGradient(w * 0.5, h * 0.48, 10, w * 0.5, h * 0.5, w * 0.55)
  wash.addColorStop(0, rgbaHex(palette.paperDeep, 0.55))
  wash.addColorStop(1, rgbaHex(palette.paper, 0))
  ctx.fillStyle = wash
  ctx.fillRect(0, 0, w, h)

  const ink = palette.moss
  // main stem + leaflets of a maidenhair fern
  const baseX = w * 0.3
  const baseY = h * 0.94
  ctx.save()
  ctx.translate(baseX, baseY)
  ctx.rotate(-0.1)
  ctx.strokeStyle = rgbaHex(ink, 0.8)
  ctx.lineWidth = 2.8
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(-26, -h * 0.36, 22, -h * 0.56, 24, -h * 0.82)
  ctx.stroke()
  // pinnae
  for (let i = 0; i < 17; i++) {
    const t = i / 17
    const y = -h * 0.08 - t * h * 0.72
    const x = -4 + Math.sin(t * 2.4) * 30 + t * 10
    const len = (1 - t * 0.5) * (52 + rand() * 24)
    for (const side of [-1, 1]) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(side * (0.95 + rand() * 0.12) + 0.12)
      ctx.strokeStyle = rgbaHex(ink, 0.5 + rand() * 0.16)
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.quadraticCurveTo(len * 0.45, -len * 0.16, len, -len * 0.04)
      ctx.stroke()
      ctx.restore()
      // leaflet dots
      for (let k = 1; k < 9; k++) {
        const tt = k / 9
        const lx = x + Math.cos(side * 1.2) * len * tt
        const ly = y - Math.sin(1.2) * len * tt * 0.6
        ctx.fillStyle = rgbaHex(palette.leaf, 0.24)
        ctx.beginPath()
        ctx.ellipse(lx, ly, 5.2 * (1 - tt * 0.35), 2.5 * (1 - tt * 0.25), side * 1.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  ctx.restore()
  // handwritten line
  ctx.save()
  ctx.fillStyle = rgbaHex(palette.ink, 0.72)
  ctx.font = 'italic 22px "Cormorant", "Instrument Serif", Georgia, serif'
  ctx.fillText('the fog remembers what the hand forgets', w * 0.22, h * 0.745)
  ctx.font = '14px "Cormorant", Georgia, serif'
  ctx.fillStyle = rgbaHex(palette.inkSoft, 0.8)
  ctx.fillText('Adiantum capillus-veneris · pl. XLI', w * 0.22, h * 0.785)
  ctx.restore()
  // herbarium stamp
  ctx.strokeStyle = rgbaHex(palette.peony, 0.4)
  ctx.lineWidth = 1.2
  ctx.strokeRect(w * 0.72, h * 0.07, w * 0.2, h * 0.11)
  ctx.fillStyle = rgbaHex(palette.inkSoft, 0.55)
  ctx.font = '11px "IBM Plex Mono", monospace'
  ctx.fillText('HORTUS MANUS', w * 0.735, h * 0.11)
  ctx.fillText('HERBARIUM · 041', w * 0.735, h * 0.14)
  // second, smaller frond to the right
  ctx.save()
  ctx.translate(w * 0.62, h * 0.86)
  ctx.rotate(0.16)
  ctx.strokeStyle = rgbaHex(ink, 0.55)
  ctx.lineWidth = 1.8
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(10, -h * 0.22, -18, -h * 0.34, -8, -h * 0.48)
  ctx.stroke()
  for (let i = 0; i < 10; i++) {
    const t = i / 10
    const y = -h * 0.05 - t * h * 0.4
    const x = Math.sin(t * 2.0) * 16
    const len = (1 - t * 0.5) * (30 + rand() * 16)
    for (const side of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.quadraticCurveTo(x + side * len * 0.5, y - 6, x + side * len, y - 2)
      ctx.strokeStyle = rgbaHex(palette.leaf, 0.4)
      ctx.lineWidth = 0.9
      ctx.stroke()
    }
  }
  ctx.restore()
}

/** Texture helper: plate image with graceful fallback. */
export async function loadPlateTexture(path: string): Promise<THREE.Texture | null> {
  try {
    const loader = new THREE.TextureLoader()
    const tex = await loader.loadAsync(path)
    tex.colorSpace = THREE.NoColorSpace
    tex.anisotropy = 4
    return tex
  } catch {
    return null
  }
}

/** Full-screen 2D canvas as a THREE texture (used for water/plate bases). */
export function canvasTexture(w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const [c, ctx] = canvas(w, h)
  paint(ctx)
  return texture(c)
}

function rgbaHex(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`
}

function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v
}
