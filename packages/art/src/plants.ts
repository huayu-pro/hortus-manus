import type { ArtPalette, Ctx } from './types'
import type { Rng } from './rand'
import { alpha, mixHex } from './palette'

export interface PlantArgs {
  ctx: Ctx
  /** horizontal centre of the plate */
  cx: number
  /** where the plant meets the paper (bottom anchor) */
  baseY: number
  /** highest point the plant may reach */
  topY: number
  /** height available (topY - baseY, positive) */
  scale: number
  rand: Rng
  P: ArtPalette
  ink: string
  accent: string
  season: string
}

/** Dispatch: every mode grows a visibly different plant. */
export function drawPlant(mode: string, args: PlantArgs): void {
  switch (mode) {
    case 'frame':
      peony(args)
      break
    case 'tendril':
      vine(args)
      break
    case 'ripple':
      waterlily(args)
      break
    case 'spore':
      dandelion(args)
      break
    case 'mycelium':
      mycelium(args)
      break
    case 'mist':
      fern(args)
      break
    case 'phyllotaxis':
      sunflower(args)
      break
    default:
      peony(args)
  }
}

// ---------------------------------------------------------------- helpers
function stroke(ctx: Ctx, ink: string, width = 1.4, a = 0.62): void {
  ctx.strokeStyle = alpha(ink, a)
  ctx.lineWidth = width
}

function fill(ctx: Ctx, color: string, a: number): void {
  ctx.fillStyle = alpha(color, a)
}

function stemCurve(
  ctx: Ctx,
  ink: string,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  bend: number,
  width = 2.2,
): void {
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.bezierCurveTo(x0 + bend, y0 - (y0 - y1) * 0.45, x1 - bend, y1 + (y0 - y1) * 0.4, x1, y1)
  stroke(ctx, ink, width, 0.8)
  ctx.stroke()
}

/**
 * Botanical leaf: a smooth bezier blade, a midrib and paired veins.
 * `aspect` controls width/length (0.2 narrow .. 0.5 broad); `tip` sharpens the apex.
 */
function leaf(
  ctx: Ctx,
  ink: string,
  x: number,
  y: number,
  angle: number,
  len: number,
  aspect = 0.3,
  veins = 3,
): void {
  const w = len * aspect
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(len * 0.22, -w * 0.92, len * 0.72, -w * 0.82, len, 0)
  ctx.bezierCurveTo(len * 0.72, w * 0.82, len * 0.22, w * 0.92, 0, 0)
  ctx.closePath()
  fill(ctx, ink, 0.045)
  ctx.fill()
  stroke(ctx, ink, 1.05, 0.46)
  ctx.stroke()
  // midrib
  ctx.beginPath()
  ctx.moveTo(len * 0.05, 0)
  ctx.quadraticCurveTo(len * 0.55, -w * 0.03, len * 0.95, 0)
  stroke(ctx, ink, 0.75, 0.28)
  ctx.stroke()
  // paired veins
  for (let i = 1; i <= veins; i++) {
    const t = i / (veins + 1)
    const spread = w * Math.sin(Math.PI * t) * 0.66
    for (const sign of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(len * t, 0)
      ctx.quadraticCurveTo(len * (t + 0.12), sign * spread * 0.8, len * (t + 0.2), sign * spread * 0.62)
      stroke(ctx, ink, 0.6, 0.2)
      ctx.stroke()
    }
  }
  ctx.restore()
}

/**
 * One ring of petals. Each petal is a soft teardrop pointing outward, filled with
 * pigment and outlined only on its rim, so overlapping petals read as a flower
 * rather than a pile of ellipses.
 */
function petalRing(
  ctx: Ctx,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  count: number,
  rot: number,
  ink: string,
  accent: string,
  fillA = 0.14,
  outlineA = 0.34,
): void {
  // draw back-to-front so the front petals overlap cleanly

  for (let i = 0; i < count; i++) {
    const a = rot + (i / count) * Math.PI * 2
    const wobble = 0.86 + 0.14 * Math.sin(i * 2.7 + rot * 4)
    const px = cx + Math.cos(a) * rx * 0.24
    const py = cy + Math.sin(a) * ry * 0.24
    const ex = cx + Math.cos(a) * rx * 1.02 * wobble
    const ey = cy + Math.sin(a) * ry * 1.02 * wobble
    // perpendicular half-width at the middle of the petal
    const nx = -Math.sin(a)
    const ny = Math.cos(a)
    const midX = (px + ex) / 2
    const midY = (py + ey) / 2
    const hw = Math.hypot(rx, ry) * 0.5 * wobble

    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.quadraticCurveTo(midX + nx * hw, midY + ny * hw, ex, ey)
    ctx.quadraticCurveTo(midX - nx * hw * 0.72, midY - ny * hw * 0.72, px, py)
    fill(ctx, accent, fillA)
    ctx.fill()
    stroke(ctx, ink, 0.85, outlineA)
    ctx.stroke()
  }
}

// ---------------------------------------------------------------- peony (frame)
function peony({ ctx, cx, baseY, topY, scale, rand, P, ink, accent }: PlantArgs): void {
  const headR = Math.min(scale * 0.3, 132)
  const headY = topY + headR * 1.05
  const bend = rand.range(-scale * 0.1, scale * 0.1)
  const stemTop = headY + headR * 0.42
  stemCurve(ctx, ink, cx + rand.range(-8, 8), baseY, cx + bend, stemTop, bend)

  // two compound leaves, drawn below the blossom
  const leafCount = rand.int(2, 3)
  for (let i = 0; i < leafCount; i++) {
    const f = 0.36 + i * 0.24
    const side = i % 2 === 0 ? 1 : -1
    const lx = cx + bend * (1 - f) * 0.6
    const ly = stemTop + (baseY - stemTop) * f
    const ang = side * rand.range(0.42, 0.72)
    leaf(ctx, ink, lx, ly, ang, scale * rand.range(0.19, 0.25), 0.24, 4)
    leaf(
      ctx,
      ink,
      lx + Math.cos(ang) * scale * 0.15,
      ly + Math.sin(ang) * scale * 0.15,
      ang + side * 0.46,
      scale * rand.range(0.12, 0.17),
      0.24,
      3,
    )
  }

  // blossom: four rings, outer largest, filled enough to read as pigment
  const bx = cx + bend
  const by = headY
  const R = headR
  // calyx: two small sepals at the base of the blossom
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(bx, by + R * 0.36)
    ctx.quadraticCurveTo(bx + side * R * 0.24, by + R * 0.44, bx + side * R * 0.3, by + R * 0.62)
    ctx.quadraticCurveTo(bx + side * R * 0.1, by + R * 0.5, bx, by + R * 0.36)
    fill(ctx, ink, 0.06)
    ctx.fill()
    stroke(ctx, ink, 0.8, 0.34)
    ctx.stroke()
  }
  petalRing(ctx, bx, by, R, R * 0.74, 8, rand.range(0, 0.4), ink, accent, 0.17, 0.3)
  petalRing(ctx, bx, by, R * 0.8, R * 0.6, 7, rand.range(0.25, 0.6), ink, mixHex(accent, '#FFFFFF', 0.18), 0.2, 0.26)
  petalRing(ctx, bx, by, R * 0.6, R * 0.46, 6, rand.range(0.45, 0.9), ink, mixHex(accent, '#FFFFFF', 0.36), 0.24, 0.2)
  petalRing(ctx, bx, by, R * 0.42, R * 0.33, 5, rand.range(0.7, 1.1), ink, mixHex(accent, '#FFFFFF', 0.52), 0.28, 0.12)
  // pollen heart
  fill(ctx, P.pollen, 0.42)
  for (let i = 0; i < 12; i++) {
    const a = rand.range(0, Math.PI * 2)
    const r = rand.range(0, R * 0.16)
    ctx.beginPath()
    ctx.arc(bx + Math.cos(a) * r, by + Math.sin(a) * r * 0.7, rand.range(1, 1.8), 0, Math.PI * 2)
    ctx.fill()
  }
}

// ---------------------------------------------------------------- vine (tendril)
function vine({ ctx, cx, baseY, topY, scale, rand, ink, accent }: PlantArgs): void {
  const leftX = cx - scale * 0.22
  const rightX = cx + scale * 0.2

  ctx.beginPath()
  ctx.moveTo(leftX, baseY)
  ctx.bezierCurveTo(leftX + scale * 0.34, baseY - scale * 0.34, rightX - scale * 0.34, topY + scale * 0.34, rightX, topY)
  stroke(ctx, ink, 2.2, 0.75)
  ctx.stroke()

  const shoots = rand.int(3, 4)
  for (let i = 0; i < shoots; i++) {
    const t = (i + 1) / (shoots + 1)
    const sx = leftX + (rightX - leftX) * t + scale * 0.14 * Math.sin(t * Math.PI)
    const sy = baseY + (topY - baseY) * t
    const dir = i % 2 === 0 ? 1 : -1
    const len = scale * rand.range(0.14, 0.2)
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo(sx + dir * len * 0.7, sy - len * 0.3, sx + dir * len, sy - len * 0.75)
    stroke(ctx, ink, 1.4, 0.55)
    ctx.stroke()
    // spiral tendril
    const tipX = sx + dir * len
    const tipY = sy - len * 0.75
    ctx.beginPath()
    for (let s = 0; s <= 36; s++) {
      const u = s / 36
      const ang = u * Math.PI * 2 * 2.3
      const rr = len * 0.3 * (1 - u * 0.7)
      const px = tipX + Math.cos(ang) * rr
      const py = tipY - rr + Math.sin(ang) * rr
      if (s === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    stroke(ctx, ink, 1.1, 0.5)
    ctx.stroke()
    // paired leaflets
    leaf(ctx, ink, sx, sy, dir * 0.55, scale * 0.09, 0.3, 2)
    leaf(ctx, ink, sx + dir * len * 0.45, sy - len * 0.24, -dir * 0.3, scale * 0.08, 0.3, 2)
  }

  const flowers = rand.int(2, 3)
  for (let i = 0; i < flowers; i++) {
    const t = rand.range(0.18, 0.82)
    const fx = leftX + (rightX - leftX) * t + scale * 0.15 * Math.sin(t * Math.PI)
    const fy = baseY + (topY - baseY) * t
    const r = scale * rand.range(0.03, 0.045)
    for (let p = 0; p < 4; p++) {
      const a = (p / 4) * Math.PI * 2 + rand.range(0, 0.3)
      ctx.beginPath()
      ctx.ellipse(fx + Math.cos(a) * r, fy + Math.sin(a) * r, r, r * 0.55, a, 0, Math.PI * 2)
      fill(ctx, accent, 0.18)
      ctx.fill()
      stroke(ctx, ink, 0.9, 0.42)
      ctx.stroke()
    }
  }
}

// ---------------------------------------------------------------- waterlily (ripple)
function waterlily({ ctx, cx, baseY, topY, scale, rand, P, ink, accent }: PlantArgs): void {
  const waterY = baseY - scale * 0.2
  const flowerY = topY + scale * 0.3

  // water line
  ctx.beginPath()
  ctx.moveTo(cx - scale * 0.72, waterY)
  ctx.lineTo(cx + scale * 0.72, waterY)
  stroke(ctx, ink, 1, 0.22)
  ctx.stroke()

  // ripples
  for (let i = 0; i < 3; i++) {
    const rx = scale * (0.26 + i * 0.16)
    const ry = rx * 0.22
    const ox = cx + rand.range(-scale * 0.12, scale * 0.12)
    for (let k = 0; k < 3; k++) {
      ctx.beginPath()
      ctx.ellipse(ox, waterY + 3, rx * (1 + k * 0.14), ry * (1 + k * 0.12), 0, 0.2, Math.PI - 0.2)
      stroke(ctx, P.pond, 1, 0.26 - k * 0.05)
      ctx.stroke()
    }
  }

  // lily pads
  const pads = rand.int(2, 3)
  for (let i = 0; i < pads; i++) {
    const px = cx + rand.range(-scale * 0.42, scale * 0.42)
    const rx = scale * rand.range(0.14, 0.2)
    const ry = rx * 0.34
    const notch = rand.range(0.18, 0.42)
    ctx.beginPath()
    ctx.ellipse(px, waterY + rand.range(-3, 4), rx, ry, 0, notch, Math.PI * 2 - notch * 0.3)
    ctx.closePath()
    fill(ctx, P.pond, 0.08)
    ctx.fill()
    stroke(ctx, ink, 1.2, 0.45)
    ctx.stroke()
    for (let v = 0; v < 6; v++) {
      const a = notch + (v / 5) * (Math.PI * 2 - notch * 1.3)
      ctx.beginPath()
      ctx.moveTo(px + Math.cos(a) * rx * 0.1, waterY + Math.sin(a) * ry * 0.1)
      ctx.lineTo(px + Math.cos(a) * rx * 0.9, waterY + Math.sin(a) * ry * 0.88)
      stroke(ctx, ink, 0.75, 0.22)
      ctx.stroke()
    }
  }

  // flower opening above the water
  const fx = cx + rand.range(-scale * 0.1, scale * 0.1)
  const R = Math.min(scale * 0.2, 96)
  petalRing(ctx, fx, flowerY, R, R * 0.52, 9, rand.range(0, 0.5), ink, accent, 0.15, 0.38)
  petalRing(ctx, fx, flowerY, R * 0.62, R * 0.34, 8, rand.range(0.3, 0.8), ink, mixHex(accent, '#FFFFFF', 0.35), 0.2, 0.32)
  fill(ctx, P.pollen, 0.45)
  ctx.beginPath()
  ctx.arc(fx, flowerY, R * 0.14, 0, Math.PI * 2)
  ctx.fill()

  // stem dipping into the water
  ctx.beginPath()
  ctx.moveTo(fx, flowerY + R * 0.36)
  ctx.quadraticCurveTo(fx + scale * 0.06, waterY + scale * 0.06, fx - scale * 0.03, waterY + scale * 0.12)
  stroke(ctx, ink, 1.3, 0.4)
  ctx.stroke()
}

// ---------------------------------------------------------------- dandelion (spore)
function dandelion({ ctx, cx, baseY, topY, scale, rand, P, ink }: PlantArgs): void {
  const R = Math.min(scale * 0.26, 118)
  const headX = cx + rand.range(-scale * 0.06, scale * 0.06)
  const headY = topY + R
  stemCurve(ctx, ink, cx + rand.range(-8, 8), baseY, headX, headY + R * 0.3, rand.range(-scale * 0.06, scale * 0.06), 1.9)

  // basal rosette
  const rosette = rand.int(4, 6)
  for (let i = 0; i < rosette; i++) {
    const a = Math.PI / 2 + (i - (rosette - 1) / 2) * 0.34 + rand.range(-0.08, 0.08)
    leaf(ctx, ink, cx + rand.range(-8, 8), baseY - rand.range(0, 10), a, scale * rand.range(0.2, 0.3), 0.2, 4)
  }

  // the clock
  const rays = 44
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + rand.range(-0.02, 0.02)
    const r = R * rand.range(0.86, 0.98)
    const x1 = headX + Math.cos(a) * r
    const y1 = headY + Math.sin(a) * r
    ctx.beginPath()
    ctx.moveTo(headX + Math.cos(a) * R * 0.22, headY + Math.sin(a) * R * 0.22)
    ctx.lineTo(x1, y1)
    stroke(ctx, ink, 0.7, 0.4)
    ctx.stroke()
    for (let k = -1; k <= 1; k++) {
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x1 + Math.cos(a + k * 0.3) * 4.5, y1 + Math.sin(a + k * 0.3) * 4.5)
      stroke(ctx, ink, 0.65, 0.34)
      ctx.stroke()
    }
    if (i % 8 === 0) {
      fill(ctx, P.pollen, 0.45)
      ctx.beginPath()
      ctx.arc(x1, y1, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // drifting seeds
  const drifting = rand.int(3, 4)
  for (let i = 0; i < drifting; i++) {
    const dx = headX + rand.range(scale * 0.2, scale * 0.46)
    const dy = headY + rand.range(-scale * 0.2, scale * 0.14)
    ctx.beginPath()
    ctx.moveTo(dx, dy)
    ctx.lineTo(dx + rand.range(4, 8), dy + rand.range(3, 9))
    stroke(ctx, ink, 0.7, 0.26)
    ctx.stroke()
    for (let k = -1; k <= 1; k++) {
      ctx.beginPath()
      ctx.moveTo(dx, dy)
      ctx.lineTo(dx + Math.cos(-0.9 + k * 0.4) * 5, dy + Math.sin(-0.9 + k * 0.4) * 5)
      stroke(ctx, ink, 0.6, 0.26)
      ctx.stroke()
    }
  }
}

// ---------------------------------------------------------------- mycelium
function mycelium({ ctx, cx, baseY, topY, scale, rand, ink, accent }: PlantArgs): void {
  const midY = topY + (baseY - topY) * 0.42
  stemCurve(ctx, ink, cx, baseY, cx, topY, rand.range(-scale * 0.06, scale * 0.06), 1.4)

  const branch = (x: number, y: number, ang: number, len: number, depth: number, width: number) => {
    if (depth <= 0 || len < 5) return
    const x2 = x + Math.cos(ang) * len
    const y2 = y + Math.sin(ang) * len
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + Math.cos(ang + 0.16) * len * 0.5, y + Math.sin(ang + 0.16) * len * 0.5, x2, y2)
    stroke(ctx, ink, width, 0.3 + depth * 0.05)
    ctx.stroke()
    if (depth <= 2) {
      fill(ctx, accent, 0.26)
      ctx.beginPath()
      ctx.arc(x2, y2, 1.4, 0, Math.PI * 2)
      ctx.fill()
    }
    const spread = rand.range(0.26, 0.46)
    branch(x2, y2, ang - spread, len * rand.range(0.55, 0.7), depth - 1, Math.max(0.6, width * 0.62))
    branch(x2, y2, ang + spread, len * rand.range(0.55, 0.7), depth - 1, Math.max(0.6, width * 0.62))
  }

  const trunks = rand.int(4, 5)
  for (let i = 0; i < trunks; i++) {
    const a = -Math.PI / 2 + (i - (trunks - 1) / 2) * 0.3
    branch(cx, midY + rand.range(-6, 6), a, scale * rand.range(0.15, 0.22), 4, 1.4)
  }
  // connective threads (constellation motif)
  for (let i = 0; i < 4; i++) {
    const y = midY + rand.range(-scale * 0.28, scale * 0.22)
    const x0 = cx - scale * rand.range(0.26, 0.34)
    const x1 = cx + scale * rand.range(0.26, 0.34)
    ctx.beginPath()
    ctx.moveTo(x0, y)
    ctx.bezierCurveTo(x0 + 30, y - rand.range(3, 12), x1 - 30, y + rand.range(3, 12), x1, y)
    stroke(ctx, ink, 0.8, 0.22)
    ctx.stroke()
  }
  // small mushroom caps
  const caps = rand.int(2, 3)
  for (let i = 0; i < caps; i++) {
    const mx = cx + rand.range(-scale * 0.3, scale * 0.3)
    const my = baseY + rand.range(-4, 6)
    const cr = scale * rand.range(0.04, 0.06)
    ctx.beginPath()
    ctx.moveTo(mx, my)
    ctx.lineTo(mx + 1, my - cr * 0.7)
    stroke(ctx, ink, 1, 0.45)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(mx, my - cr * 0.7, cr, cr * 0.5, 0, Math.PI, Math.PI * 2)
    fill(ctx, accent, 0.2)
    ctx.fill()
    stroke(ctx, ink, 1, 0.45)
    ctx.stroke()
  }
}

// ---------------------------------------------------------------- fern (mist)
function fern({ ctx, cx, baseY, topY, scale, rand, P, ink }: PlantArgs): void {
  const fronds = rand.int(3, 4)
  for (let f = 0; f < fronds; f++) {
    const dir = f % 2 === 0 ? 1 : -1
    const off = (f - (fronds - 1) / 2) * scale * 0.12
    const rootX = cx + off
    const len = scale * rand.range(0.78, 0.94)
    const lean = dir * rand.range(0.14, 0.3)
    const tipX = rootX + lean * len
    const tipY = topY
    ctx.beginPath()
    ctx.moveTo(rootX, baseY)
    ctx.bezierCurveTo(rootX + lean * len * 0.4, baseY - len * 0.5, tipX - lean * len * 0.2, tipY + len * 0.22, tipX, tipY)
    stroke(ctx, ink, 1.6, 0.6)
    ctx.stroke()

    const n = rand.int(10, 13)
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1)
      const px = cubic(rootX, rootX + lean * len * 0.4, tipX - lean * len * 0.2, tipX, t)
      const py = cubic(baseY, baseY - len * 0.5, tipY + len * 0.22, tipY, t)
      const side = i % 2 === 0 ? 1 : -1
      const pl = len * 0.17 * (1 - t * 0.6)
      const ang = -Math.PI / 2 + side * (1.0 + t * 0.22) + lean * 0.4
      leaf(ctx, ink, px, py, ang, pl, 0.3, 2)
    }
  }
  // dew / condensation
  fill(ctx, P.mist, 0.45)
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    ctx.arc(cx + rand.range(-scale * 0.34, scale * 0.34), baseY - rand.range(scale * 0.1, scale * 0.6), rand.range(1.2, 2.2), 0, Math.PI * 2)
    ctx.fill()
  }
}

function cubic(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3
}

// ---------------------------------------------------------------- sunflower (phyllotaxis)
function sunflower({ ctx, cx, baseY, topY, scale, rand, P, ink, accent }: PlantArgs): void {
  const R = Math.min(scale * 0.24, 108)
  const headX = cx + rand.range(-scale * 0.06, scale * 0.06)
  const headY = topY + R
  stemCurve(ctx, ink, cx + rand.range(-8, 8), baseY, headX, headY + R * 0.4, rand.range(-scale * 0.1, scale * 0.1), 2.4)

  for (let i = 0; i < 2; i++) {
    const f = 0.3 + i * 0.24
    const side = i % 2 === 0 ? 1 : -1
    leaf(ctx, ink, cx, baseY + (headY - baseY) * f, side * rand.range(0.5, 0.8), scale * rand.range(0.18, 0.24), 0.34, 4)
  }

  // petals
  const petals = 20
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 + rand.range(-0.03, 0.03)
    ctx.beginPath()
    ctx.ellipse(headX + Math.cos(a) * R * 0.74, headY + Math.sin(a) * R * 0.74, R * 0.34, R * 0.12, a, 0, Math.PI * 2)
    fill(ctx, i % 3 === 0 ? accent : mixHex(accent, '#FFFFFF', 0.35), 0.15)
    ctx.fill()
    stroke(ctx, ink, 1, 0.42)
    ctx.stroke()
  }
  // disc
  ctx.beginPath()
  ctx.arc(headX, headY, R * 0.6, 0, Math.PI * 2)
  fill(ctx, P.ink, 0.06)
  ctx.fill()
  stroke(ctx, ink, 1.2, 0.5)
  ctx.stroke()
  // golden-angle florets
  const golden = Math.PI * (3 - Math.sqrt(5))
  const dots = 170
  for (let i = 0; i < dots; i++) {
    const r = R * 0.58 * Math.sqrt(i / dots)
    const a = i * golden
    fill(ctx, P.pollen, 0.26 + 0.28 * (1 - i / dots))
    ctx.beginPath()
    ctx.arc(headX + Math.cos(a) * r, headY + Math.sin(a) * r, 1.05 + 0.8 * (i / dots), 0, Math.PI * 2)
    ctx.fill()
  }
}
