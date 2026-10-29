/**
 * Ink2D — the Canvas2D overlay layer used for ink lines, fibres, dew, handwriting
 * and the small editorial marks that make the WebGL scene feel printed.
 *
 * Everything is drawn in CSS pixels; the context is scaled once per resize so
 * retina output stays crisp without any mode doing its own DPR maths.
 */

export interface StrokeOptions {
  color?: string
  width?: number
  alpha?: number
  /** dash pattern in css px */
  dash?: number[]
  cap?: CanvasLineCap
}

export interface TextOptions {
  color?: string
  size?: number
  family?: 'mono' | 'display' | 'hand' | 'body'
  align?: CanvasTextAlign
  baseline?: CanvasTextBaseline
  alpha?: number
  letterSpacing?: number
  weight?: number
}

const FAMILIES: Record<string, string> = {
  mono: '"IBM Plex Mono", "Noto Sans Mono", ui-monospace, monospace',
  display: '"Instrument Serif", "Cormorant", "Noto Serif SC", serif',
  hand: '"Ma Shan Zheng", "Kaiti SC", "STKaiti", cursive',
  body: '"Noto Sans SC", "PingFang SC", system-ui, sans-serif',
}

export class Ink2D {
  ctx: CanvasRenderingContext2D
  width = 1
  height = 1
  dpr = 1
  /** global multiplier — the engine lowers it during a crossfade */
  alpha = 1
  /** product Stage keeps text out of the canvas; lab.html turns labels on */
  labels = false

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) throw new Error('Canvas2D overlay unavailable')
    this.ctx = ctx
  }

  resize(width: number, height: number, dpr: number): void {
    this.width = Math.max(1, width)
    this.height = Math.max(1, height)
    this.dpr = dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  clear(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
  }

  save(): void {
    this.ctx.save()
    this.ctx.globalAlpha *= this.alpha
  }

  restore(): void {
    this.ctx.restore()
  }

  /** Smooth polyline through points using quadratic midpoints. */
  path(points: readonly { x: number; y: number }[], opts: StrokeOptions = {}): void {
    if (points.length < 2) return
    const ctx = this.ctx
    ctx.save()
    ctx.globalAlpha *= (opts.alpha ?? 1) * this.alpha
    ctx.strokeStyle = opts.color ?? 'rgba(28,33,26,0.5)'
    ctx.lineWidth = opts.width ?? 1
    ctx.lineCap = opts.cap ?? 'round'
    ctx.lineJoin = 'round'
    if (opts.dash) ctx.setLineDash(opts.dash)
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length - 1; i++) {
      const mx = (points[i].x + points[i + 1].x) / 2
      const my = (points[i].y + points[i + 1].y) / 2
      ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my)
    }
    const last = points[points.length - 1]
    ctx.lineTo(last.x, last.y)
    ctx.stroke()
    ctx.restore()
  }

  /**
   * A natural-fibre stroke: several offset strands with a soft core.
   * Used by FRAME's window edge and TENDRIL's strings.
   */
  fibre(points: readonly { x: number; y: number }[], opts: StrokeOptions = {}): void {
    if (points.length < 2) return
    const seed = Math.floor(points[0].x * 7 + points[0].y * 13)
    for (let strand = 0; strand < 3; strand++) {
      const off = (hash(seed + strand * 17) - 0.5) * (opts.width ?? 1) * 1.6
      const jittered = points.map((p, i) => ({
        x: p.x + Math.sin(i * 1.7 + strand * 2.1 + seed) * off * 0.5,
        y: p.y + Math.cos(i * 1.3 + strand * 1.7 + seed) * off * 0.5,
      }))
      this.path(jittered, {
        ...opts,
        width: (opts.width ?? 1) * (strand === 1 ? 1 : 0.55),
        alpha: (opts.alpha ?? 1) * (strand === 1 ? 1 : 0.55),
      })
    }
  }

  /** Filled polygon (used for the window's paper shadow). */
  fillPolygon(points: readonly { x: number; y: number }[], color: string, alpha = 1): void {
    if (points.length < 3) return
    const ctx = this.ctx
    ctx.save()
    ctx.globalAlpha *= alpha * this.alpha
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  /** Sharp-cornered polygon (paper cut, not a rounded UI card). */
  polygon(points: readonly { x: number; y: number }[], opts: StrokeOptions = {}): void {
    if (points.length < 2) return
    const ctx = this.ctx
    ctx.save()
    ctx.globalAlpha *= (opts.alpha ?? 1) * this.alpha
    ctx.strokeStyle = opts.color ?? 'rgba(28,33,26,0.5)'
    ctx.lineWidth = opts.width ?? 1
    ctx.lineCap = opts.cap ?? 'round'
    ctx.lineJoin = 'miter'
    if (opts.dash) ctx.setLineDash(opts.dash)
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }

  line(x1: number, y1: number, x2: number, y2: number, opts: StrokeOptions = {}): void {
    this.path(
      [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      ],
      opts,
    )
  }

  dot(x: number, y: number, r: number, color = 'rgba(28,33,26,0.5)', alpha = 1): void {
    const ctx = this.ctx
    ctx.save()
    ctx.globalAlpha *= alpha * this.alpha
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  /** A dew bead: darker rim, cool core, tiny specular. */
  dew(x: number, y: number, r: number, tint = '#c9d8d0', alpha = 1): void {
    const ctx = this.ctx
    ctx.save()
    ctx.globalAlpha *= alpha * this.alpha
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r)
    g.addColorStop(0, 'rgba(255,255,255,0.92)')
    g.addColorStop(0.45, hexA(tint, 0.55))
    g.addColorStop(1, 'rgba(28,33,26,0.05)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(28,33,26,0.16)'
    ctx.lineWidth = Math.max(0.6, r * 0.12)
    ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.beginPath()
    ctx.arc(x - r * 0.3, y - r * 0.35, Math.max(0.5, r * 0.16), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  /** Editorial labels — only drawn when the host enables them (lab, not Stage). */
  label(text: string, x: number, y: number, opts: TextOptions = {}): void {
    if (!this.labels) return
    this.text(text, x, y, opts)
  }

  text(text: string, x: number, y: number, opts: TextOptions = {}): void {
    const ctx = this.ctx
    ctx.save()
    ctx.globalAlpha *= (opts.alpha ?? 1) * this.alpha
    ctx.fillStyle = opts.color ?? 'rgba(28,33,26,0.62)'
    ctx.font = `${opts.weight ?? 400} ${opts.size ?? 11}px ${FAMILIES[opts.family ?? 'mono']}`
    ctx.textAlign = opts.align ?? 'left'
    ctx.textBaseline = opts.baseline ?? 'alphabetic'
    if (opts.letterSpacing !== undefined && 'letterSpacing' in ctx) {
      ;(ctx as unknown as { letterSpacing: string }).letterSpacing = `${opts.letterSpacing}px`
    }
    ctx.fillText(text, x, y)
    ctx.restore()
  }

  rect(x: number, y: number, w: number, h: number, color: string, alpha = 1): void {
    const ctx = this.ctx
    ctx.save()
    ctx.globalAlpha *= alpha * this.alpha
    ctx.fillStyle = color
    ctx.fillRect(x, y, w, h)
    ctx.restore()
  }

  circle(x: number, y: number, r: number, opts: StrokeOptions = {}): void {
    const ctx = this.ctx
    ctx.save()
    ctx.globalAlpha *= (opts.alpha ?? 1) * this.alpha
    ctx.strokeStyle = opts.color ?? 'rgba(28,33,26,0.5)'
    ctx.lineWidth = opts.width ?? 1
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  /** Edge vignette + paper grain wash — keeps the WebGL scene on the same paper. */
  vignette(palette: { ink: string; paper: string }, strength = 0.16): void {
    const ctx = this.ctx
    const w = this.width
    const h = this.height
    ctx.save()
    ctx.globalAlpha *= this.alpha
    const g = ctx.createRadialGradient(w * 0.5, h * 0.48, Math.min(w, h) * 0.35, w * 0.5, h * 0.5, Math.max(w, h) * 0.78)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, hexA(palette.ink, strength))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
  }

  /** Small editorial corner ticks, shared by all modes. */
  frameMarks(color = 'rgba(28,33,26,0.35)', inset = 22): void {
    const w = this.width
    const h = this.height
    const len = 9
    const pts: [number, number, number, number][] = [
      [inset, inset, inset + len, inset],
      [inset, inset, inset, inset + len],
      [w - inset, inset, w - inset - len, inset],
      [w - inset, inset, w - inset, inset + len],
      [inset, h - inset, inset + len, h - inset],
      [inset, h - inset, inset, h - inset - len],
      [w - inset, h - inset, w - inset - len, h - inset],
      [w - inset, h - inset, w - inset, h - inset - len],
    ]
    for (const [x1, y1, x2, y2] of pts) this.line(x1, y1, x2, y2, { color, width: 1 })
  }
}

function hash(n: number): number {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '')
  const n = parseInt(h, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
