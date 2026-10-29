/**
 * TENDRIL / 翻绳 — Verlet strings threaded between the 21 landmarks of two hands.
 *
 * Five traditional figures (星阵 / 满天星 / 古老翻绳 / 金井 / 花局) are anchor
 * presets. Threads are simulated with Verlet integration + distance constraints
 * and drawn as natural fibres with dew beads; tension tints them toward peony.
 */

import * as THREE from 'three'
import type { Hand, HandFrame, ModeId, SpecimenSeed } from '@hortus/shared'
import { randomSeed, seedFromParts } from '@hortus/shared'
import { HAND_BONES } from '../../hands/landmarks'
import { openHand } from '../../hands/hand-model'
import type { Ink2D } from '../Ink2D'
import type { GardenMode, ModeEnv, ModeFrame } from './types'
import { clamp, makePaperBackground, resizePaperBackground } from './shared'

interface V2 {
  x: number
  y: number
}

interface Node extends V2 {
  px: number
  py: number
}

interface Strand {
  a: number
  b: number
  nodes: Node[]
  rest: number
  tension: number
  dew: number[]
}

interface Pattern {
  zh: string
  en: string
  pairs: [number, number][]
}

const PATTERNS: Pattern[] = [
  {
    zh: '星阵',
    en: 'STAR ARRAY',
    pairs: [
      [4, 4],
      [8, 8],
      [12, 12],
      [16, 16],
      [20, 20],
      [8, 20],
      [20, 8],
      [4, 12],
      [12, 4],
      [6, 14],
      [14, 6],
    ],
  },
  {
    zh: '满天星',
    en: 'FULL SKY',
    pairs: [
      [4, 20],
      [20, 4],
      [8, 16],
      [16, 8],
      [12, 12],
      [6, 18],
      [18, 6],
      [10, 14],
      [14, 10],
      [4, 8],
      [8, 4],
      [16, 20],
      [20, 16],
    ],
  },
  {
    zh: '古老翻绳',
    en: "CAT'S CRADLE",
    pairs: [
      [4, 4],
      [8, 8],
      [12, 12],
      [16, 16],
      [20, 20],
      [4, 20],
      [20, 4],
      [8, 16],
      [16, 8],
      [9, 11],
      [11, 9],
    ],
  },
  {
    zh: '金井',
    en: 'GOLDEN WELL',
    pairs: [
      [4, 4],
      [5, 5],
      [9, 9],
      [13, 13],
      [17, 17],
      [4, 12],
      [12, 4],
      [6, 18],
      [18, 6],
      [10, 14],
      [14, 10],
      [0, 9],
      [9, 0],
    ],
  },
  {
    zh: '花局',
    en: 'FLOWER FIGURE',
    pairs: [
      [4, 16],
      [16, 4],
      [8, 12],
      [12, 8],
      [20, 8],
      [8, 20],
      [5, 17],
      [17, 5],
      [9, 13],
      [13, 9],
      [4, 8],
      [8, 4],
      [16, 20],
      [20, 16],
    ],
  },
]

const NODES_PER_STRAND = 7
const GRAVITY = -1600

export class TendrilMode implements GardenMode {
  readonly id: ModeId = 'tendril'
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  private env!: ModeEnv
  private bg: THREE.Mesh | null = null
  private strands: Strand[] = []
  private pattern = 0
  private patternSince = 0
  private anchors: V2[] = []
  private lastWeave = 0
  private aspect = 1
  private tension = 0
  private phase = 0
  private lastCollect = 0
  private laidOut = false

  init(env: ModeEnv): void {
    this.env = env
    this.bg = makePaperBackground(env, { light: 0.8, tint: '#ffffff' })
    this.scene.add(this.bg)
    this.camera.position.z = 5
    this.resize(env)
    this.patternSince = performance.now()
  }

  resize(env: ModeEnv): void {
    this.env = env
    this.aspect = env.width / Math.max(1, env.height)
    resizePaperBackground(this.bg, env)
    if (!this.laidOut && env.width > 10 && env.height > 10) {
      this.laidOut = true
      this.anchors = this.anchorsFor({ hands: [], t: 0, source: 'ghost', fps: 0, latencyMs: 0, gesture: { gesture: 'none', confidence: 0, hands: 0 }, present: false })
      this.rebuild(this.pattern)
    }
  }

  private anchorsFor(frame: HandFrame): V2[] {
    let hands = frame.hands.slice(0, 2)
    if (hands.length === 0) {
      hands = [openHand(0.34, 0.5, 0.11, -0.08, 'Left'), openHand(0.66, 0.5, 0.11, 0.08, 'Right')]
    } else if (hands.length === 1) {
      const h = hands[0]
      hands = [
        h,
        {
          handedness: h.handedness === 'Left' ? 'Right' : 'Left',
          score: h.score,
          landmarks: h.landmarks.map((p) => ({ x: clamp(1 - p.x, 0.03, 0.97), y: p.y, z: p.z })),
        },
      ]
    }
    const w = this.env?.width ?? 1440
    const hgt = this.env?.height ?? 900
    const minDim = Math.min(w, hgt)
    // Work in pixels so the figure keeps its proportions on 390×844 and 1440×900.
    const palmOf = (h: Hand): V2 => {
      let x = 0
      let y = 0
      for (const i of [0, 5, 9, 13, 17]) {
        x += h.landmarks[i].x
        y += h.landmarks[i].y
      }
      return { x: (x / 5) * w, y: (y / 5) * hgt }
    }
    if (palmOf(hands[0]).x > palmOf(hands[1]).x) hands = [hands[1], hands[0]]
    const p0 = palmOf(hands[0])
    const p1 = palmOf(hands[1])
    const gapPx = clamp(Math.hypot(p1.x - p0.x, p1.y - p0.y) * 0.72, minDim * 0.17, minDim * 0.32)
    const cyPx = clamp((p0.y + p1.y) * 0.5, hgt * 0.33, hgt * 0.67)
    const targetPalm = minDim * 0.19
    const out: V2[] = []
    for (let hi = 0; hi < 2; hi++) {
      const hand = hands[hi]
      const palm = palmOf(hand)
      const wrist = hand.landmarks[0]
      const mid = hand.landmarks[9]
      const dxw = (mid.x - wrist.x) * w
      const dyw = (mid.y - wrist.y) * hgt
      const handScalePx = Math.max(4, Math.hypot(dxw, dyw))
      const angle = Math.atan2(dyw, dxw) + Math.PI / 2
      const ca = Math.cos(-angle)
      const sa = Math.sin(-angle)
      const factor = targetPalm / handScalePx
      const centerX = w * 0.5 + (hi === 0 ? -gapPx : gapPx)
      for (let i = 0; i < 21; i++) {
        const p = hand.landmarks[i]
        const dx = p.x * w - palm.x
        const dy = p.y * hgt - palm.y
        let lx = (dx * ca - dy * sa) * factor
        const ly = (dx * sa + dy * ca) * factor
        if (hi === 0) lx = -lx
        out.push({ x: clamp(centerX + lx, 20, w - 20), y: clamp(cyPx + ly, 20, hgt - 20) })
      }
    }
    return out
  }

  private rebuild(patternIndex: number): void {
    this.pattern = ((patternIndex % PATTERNS.length) + PATTERNS.length) % PATTERNS.length
    const pattern = PATTERNS[this.pattern]
    const strands: Strand[] = []
    const anchors = this.anchors.length
      ? this.anchors
      : this.anchorsFor({
          hands: [],
          t: 0,
          source: 'ghost',
          fps: 0,
          latencyMs: 0,
          gesture: { gesture: 'none', confidence: 0, hands: 0 },
          present: false,
        })

    // skeleton strings inside each hand
    for (let h = 0; h < 2; h++) {
      for (const [a, b] of HAND_BONES) {
        strands.push(this.makeStrand(h * 21 + a, h * 21 + b, anchors))
      }
    }
    // figure strings across the hands
    for (const [a, b] of pattern.pairs) {
      const i = 21 + a
      const j = b
      if (i === j) continue
      strands.push(this.makeStrand(i, j, anchors))
    }
    this.strands = strands
    this.patternSince = performance.now()
  }

  private makeStrand(a: number, b: number, anchors: V2[]): Strand {
    const pa = anchors[a] ?? { x: 0, y: 0 }
    const pb = anchors[b] ?? { x: 0, y: 0 }
    const nodes: Node[] = []
    for (let i = 1; i <= NODES_PER_STRAND; i++) {
      const t = i / (NODES_PER_STRAND + 1)
      const x = pa.x + (pb.x - pa.x) * t
      const y = pa.y + (pb.y - pa.y) * t + Math.sin(t * Math.PI) * 18
      nodes.push({ x, y, px: x, py: y })
    }
    const rest = (Math.hypot(pb.x - pa.x, pb.y - pa.y) / (NODES_PER_STRAND + 1)) * 1.12
    const dew: number[] = []
    for (let i = 0; i < NODES_PER_STRAND; i++) if ((i * 7 + a) % 5 === 0) dew.push(i)
    return { a, b, nodes, rest, tension: 0, dew }
  }

  update(frame: ModeFrame): void {
    const { dt } = frame
    this.anchors = this.anchorsFor(frame.hands)
    this.phase += dt

    // weave gesture advances the figure
    if (frame.hands.gesture.gesture === 'weave') {
      if (performance.now() - this.lastWeave > 2600) {
        this.lastWeave = performance.now()
        this.rebuild(this.pattern + 1)
      }
    } else {
      this.lastWeave = performance.now() - 2600
    }
    // gentle auto-advance so a static stage still performs all five
    if (performance.now() - this.patternSince > 16000) this.rebuild(this.pattern + 1)

    // rebuild anchor distances if the pattern changed
    const steps = Math.max(1, Math.round(dt / (1 / 120)))
    const sub = dt / steps
    let totalTension = 0
    for (const strand of this.strands) {
      const pa = this.anchors[strand.a]
      const pb = this.anchors[strand.b]
      if (!pa || !pb) continue
      for (let s = 0; s < steps; s++) {
        // integrate
        for (const n of strand.nodes) {
          const vx = (n.x - n.px) * 0.988
          const vy = (n.y - n.py) * 0.988
          n.px = n.x
          n.py = n.y
          n.x += vx + Math.sin(this.phase * 0.6 + n.y * 1.4) * 0.0002
          n.y += vy + GRAVITY * sub * sub
        }
        // constraints
        for (let it = 0; it < 3; it++) {
          let ax = pa.x
          let ay = pa.y
          for (let i = 0; i < strand.nodes.length; i++) {
            const n = strand.nodes[i]
            const dx = n.x - ax
            const dy = n.y - ay
            const d = Math.hypot(dx, dy) || 1e-6
            const diff = (d - strand.rest) / d
            n.x -= dx * diff * 0.5
            n.y -= dy * diff * 0.5
            ax = n.x
            ay = n.y
          }
          const bx = pb.x
          const by = pb.y
          const last = strand.nodes[strand.nodes.length - 1]
          last.x = bx
          last.y = by
          // pull back to the moving end anchor
          for (let i = strand.nodes.length - 2; i >= 0; i--) {
            const n = strand.nodes[i]
            const next = strand.nodes[i + 1]
            const dx = n.x - next.x
            const dy = n.y - next.y
            const d = Math.hypot(dx, dy) || 1e-6
            const diff = (d - strand.rest) / d
            n.x -= dx * diff * 0.5
            n.y -= dy * diff * 0.5
          }
          const first = strand.nodes[0]
          first.x += (pa.x - first.x) * 0.5
          first.y += (pa.y - first.y) * 0.5
        }
      }
      // tension = stretch of the middle segment
      const n0 = strand.nodes[0]
      const nm = strand.nodes[Math.floor(strand.nodes.length / 2)]
      if (n0 && nm) {
        const d = Math.hypot(nm.x - n0.x, nm.y - n0.y)
        const chord = strand.rest * (strand.nodes.length / 2)
        strand.tension = clamp((d / Math.max(0.001, chord) - 1.02) * 1.4)
        totalTension += strand.tension
      }
    }
    this.tension = this.strands.length ? totalTension / this.strands.length : 0
  }

  render(renderer: THREE.WebGLRenderer): void {
    renderer.render(this.scene, this.camera)
  }

  private toScreen(p: V2, _w: number, _h: number): V2 {
    return { x: p.x, y: p.y }
  }

  drawOverlay(ink: Ink2D): void {
    const w = ink.width
    const h = ink.height
    const palette = this.env.palette
    // a breath of moss wash under the figure
    const ctx = ink.ctx
    ctx.save()
    ctx.globalAlpha *= ink.alpha * 0.45
    const wash = ctx.createRadialGradient(w * 0.5, h * 0.52, 10, w * 0.5, h * 0.52, Math.min(w, h) * 0.5)
    wash.addColorStop(0, 'rgba(138,154,123,0.10)')
    wash.addColorStop(0.6, 'rgba(138,154,123,0.04)')
    wash.addColorStop(1, 'rgba(138,154,123,0)')
    ctx.fillStyle = wash
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
    // herbarium mount: a faint ring that holds the figure
    const mountR = Math.min(w, h) * 0.38
    const mx0 = w * 0.5
    const my0 = h * 0.52
    const mount = ctx.createRadialGradient(mx0, my0, mountR * 0.2, mx0, my0, mountR)
    mount.addColorStop(0, 'rgba(237,229,214,0.32)')
    mount.addColorStop(1, 'rgba(237,229,214,0)')
    ctx.save()
    ctx.globalAlpha *= ink.alpha
    ctx.fillStyle = mount
    ctx.beginPath()
    ctx.arc(mx0, my0, mountR, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(28,33,26,0.10)'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.arc(mx0, my0, mountR, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
    // climbing vines in the margins
    for (let v = 0; v < 4; v++) {
      const baseX = (0.14 + v * 0.24) * w
      const sway = 24 + v * 8
      const pts: { x: number; y: number }[] = []
      for (let i = 0; i <= 14; i++) {
        const t = i / 14
        pts.push({
          x: baseX + Math.sin(t * 3.1 + v * 1.7 + this.phase * 0.12) * sway * t,
          y: h - 40 - t * (h * 0.46 + v * 14),
        })
      }
      ink.path(pts, { color: 'rgba(74,90,66,0.38)', width: 1.3, alpha: 0.8 })
      for (let i = 3; i < pts.length; i += 3) {
        const p = pts[i]
        const dir = i % 2 === 0 ? 1 : -1
        ink.path(
          [
            { x: p.x, y: p.y },
            { x: p.x + dir * 12, y: p.y - 8 },
            { x: p.x + dir * 20, y: p.y - 16 },
          ],
          { color: 'rgba(111,135,95,0.34)', width: 0.85, alpha: 0.7 },
        )
        ink.dew(p.x + dir * 12, p.y - 8, 1.2, palette.mist, 0.5)
      }
    }
    const tensionColor = mixRgba(palette.leaf, palette.peony, clamp(this.tension * 0.85))
    for (let si = 0; si < this.strands.length; si++) {
      const strand = this.strands[si]
      const pts = strand.nodes.map((n) => this.toScreen(n, w, h))
      const a = this.toScreen(this.anchors[strand.a] ?? { x: 0, y: 0 }, w, h)
      const b = this.toScreen(this.anchors[strand.b] ?? { x: 0, y: 0 }, w, h)
      const all = [a, ...pts, b]
      // hand outline vs cross-figure: the cat's cradle must dominate
      const cross = (strand.a < 21) !== (strand.b < 21)
      const depth = 0.78 + (si % 4) * 0.06
      const alpha = cross ? (0.72 + strand.tension * 0.22) * depth : 0.22
      if (cross) {
        ink.fibre(all, { color: 'rgba(232,227,207,0.5)', width: 5 + strand.tension * 1.6, alpha: alpha * 0.24 })
        ink.fibre(all, { color: tensionColor, width: 2.2 + strand.tension * 1.2, alpha })
        ink.fibre(all, { color: 'rgba(220,232,200,0.6)', width: 0.8, alpha: alpha * 0.55 })
      } else {
        ink.fibre(all, { color: 'rgba(74,90,66,0.35)', width: 1.1, alpha: 0.5 })
      }
      // dew beads hang on the threads
      if (cross) {
        for (const di of strand.dew) {
          const p = pts[di]
          if (!p) continue
          ink.dew(p.x, p.y - 1, 2.3 + (di % 3) * 0.8, palette.mist, 0.9)
        }
      }
      // leaf sprouts from the middle of the main figure strands
      if (cross && si % 3 === 0) {
        const p = pts[3] ?? pts[2]
        if (p) {
          const ctx2 = ink.ctx
          ctx2.save()
          ctx2.globalAlpha *= ink.alpha * 0.7
          ctx2.translate(p.x, p.y)
          ctx2.rotate(-0.5 + (si % 4) * 0.35)
          const g = ctx2.createLinearGradient(0, -8, 0, 8)
          g.addColorStop(0, 'rgba(138,154,123,0.55)')
          g.addColorStop(1, 'rgba(74,90,66,0.35)')
          ctx2.fillStyle = g
          ctx2.beginPath()
          ctx2.ellipse(10, 0, 9, 3.4, 0, 0, Math.PI * 2)
          ctx2.fill()
          ctx2.restore()
        }
      }
    }
    // knuckle anchors
    for (let hi = 0; hi < 2; hi++) {
      for (const idx of [0, 4, 8, 12, 16, 20]) {
        const a = this.anchors[hi * 21 + idx]
        if (!a) continue
        const p = this.toScreen(a, w, h)
        ink.circle(p.x, p.y, 2.2, { color: 'rgba(28,33,26,0.32)', width: 0.8, alpha: 0.8 })
      }
    }
    // tiny sprouts at a few fingertips
    for (const i of [8, 12, 20]) {
      const a = this.anchors[i]
      if (!a) continue
      const p = this.toScreen(a, w, h)
      ink.path(
        [
          { x: p.x, y: p.y - 2 },
          { x: p.x + 3, y: p.y - 8 },
          { x: p.x - 1, y: p.y - 13 },
        ],
        { color: 'rgba(111,135,95,0.55)', width: 1, alpha: 0.7 },
      )
      ink.dot(p.x - 1, p.y - 13, 1.5, 'rgba(111,135,95,0.6)', 0.8)
    }
    const pattern = PATTERNS[this.pattern]
    ink.label('FIG. ' + String(this.pattern + 1).padStart(2, '0') + ' · ' + pattern.en, 24, h - 56, {
      size: 10,
      color: 'rgba(28,33,26,0.42)',
      letterSpacing: 1.6,
    })
    ink.label(`${pattern.zh} · ${pattern.en}`, 24, 34, {
      size: 11,
      family: 'display',
      color: 'rgba(28,33,26,0.7)',
      letterSpacing: 1.2,
    })
    ink.label(`翻绳 · TENDRIL   ${String(this.pattern + 1).padStart(2, '0')} / 05`, 24, 52, {
      size: 10,
      color: 'rgba(28,33,26,0.45)',
      letterSpacing: 1.5,
    })
    ink.label('weave to turn the figure', w - 24, h - 30, {
      size: 10,
      align: 'right',
      color: 'rgba(28,33,26,0.4)',
      letterSpacing: 1.2,
    })
    ink.frameMarks('rgba(28,33,26,0.26)', 22)
    ink.vignette(this.env.palette, 0.13)
  }

  collect(): SpecimenSeed {
    return { mode: 'tendril', season: this.env.season, seed: this.collectSeed() }
  }

  collectSeed(): number {
    const seed = seedFromParts('tendril', this.env.season, this.pattern, Math.round(this.tension * 1000))
    this.lastCollect = (seed ^ randomSeed()) >>> 0
    return this.lastCollect
  }

  a11ySummary(): string {
    return `翻绳 TENDRIL：21 个手部节点之间拉出 Verlet 丝线，当前图案为${PATTERNS[this.pattern].zh}，张力 ${Math.round(this.tension * 100)}%。`
  }

  clear(): void {
    this.rebuild(this.pattern)
  }

  dispose(): void {
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      mesh.geometry?.dispose()
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat?.dispose()
    })
    this.strands.length = 0
  }
}

function mixRgba(a: string, b: string, k: number): string {
  const pa = hex(a)
  const pb = hex(b)
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * k))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

function hex(h: string): [number, number, number] {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
