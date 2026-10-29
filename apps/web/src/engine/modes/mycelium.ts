/**
 * MYCELIUM / 菌络 — a constellation of hyphae grown from the 21 landmarks.
 *
 * Nodes sit on both hands; edges are the skeleton plus nearest-neighbour links,
 * with extra bridges between the palms. Growth is animated edge by edge, and a
 * slow heartbeat pulse travels through the network. Moss ground, no neon.
 */

import * as THREE from 'three'
import type { Hand, ModeId, SpecimenSeed } from '@hortus/shared'
import { randomSeed, seedFromParts } from '@hortus/shared'
import type { Ink2D } from '../Ink2D'
import type { GardenMode, ModeEnv, ModeFrame } from './types'
import { HAND_BONES } from '../../hands/landmarks'
import { openHand } from '../../hands/hand-model'
import { clamp, createQuad, fullscreenMaterial } from './shared'

interface Node {
  x: number
  y: number
  z: number
  key: string
}

interface Edge {
  a: number
  b: number
  born: number
  strength: number
  kind: 'bone' | 'near' | 'bridge'
}

const MOSS_FRAG = /* glsl */ `
uniform sampler2D uMoss;
uniform sampler2D uPaper;
uniform float uAspect;
uniform vec3 uTint;
varying vec2 vUv;
void main(){
  vec2 uv = vUv;
  vec3 moss = texture2D(uMoss, uv * vec2(uAspect, 1.0) * 0.85 + 0.07).rgb;
  vec3 paper = texture2D(uPaper, uv * vec2(uAspect, 1.0) * 0.45 + 0.3).rgb;
  vec3 col = mix(paper * 0.72, moss * 0.82, 0.86) * uTint;
  // deeper ground, lighter clearing around the hands
  col *= 0.66 + 0.34 * smoothstep(0.0, 1.15, uv.y);
  float d = length((uv - vec2(0.5, 0.55)) * vec2(uAspect, 1.0));
  col *= 1.0 - smoothstep(0.25, 1.0, d) * 0.36;
  col += vec3(0.10, 0.09, 0.045) * smoothstep(0.9, 0.0, d) * 0.35;
  col += vec3(0.03, 0.04, 0.02) * smoothstep(0.85, 0.0, d);
  gl_FragColor = vec4(col, 1.0);
}
`

export class MyceliumMode implements GardenMode {
  readonly id: ModeId = 'mycelium'
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  private env!: ModeEnv
  private mat: THREE.ShaderMaterial
  private nodes: Node[] = []
  private edges: Edge[] = []
  private edgeBorn = new Map<string, number>()
  private aspect = 1
  private time = 0
  private pulse = 0
  private lastCollect = 0
  private handCount = -1
  private totalEdges = 0

  constructor() {
    this.mat = fullscreenMaterial(MOSS_FRAG, {
      uMoss: { value: null },
      uPaper: { value: null },
      uAspect: { value: 1 },
      uTint: { value: new THREE.Color('#ffffff') },
    })
  }

  init(env: ModeEnv): void {
    this.env = env
    this.mat.uniforms.uMoss.value = env.assets.moss
    this.mat.uniforms.uPaper.value = env.assets.paper
    const quad = createQuad(this.mat)
    this.scene.add(quad)
    this.camera.position.z = 5
    this.resize(env)
    this.nodes = this.nodePositions([])
    this.rebuildEdges(this.nodes, true)
  }

  resize(env: ModeEnv): void {
    this.env = env
    this.aspect = env.width / Math.max(1, env.height)
    this.mat.uniforms.uAspect.value = this.aspect
  }

  /** Two hands of 21 nodes; missing hands are filled with resting open hands. */
  private nodePositions(hands: Hand[]): Node[] {
    let hs = hands.slice(0, 2)
    if (hs.length === 0) {
      hs = [openHand(0.33, 0.54, 0.115, -0.12, 'Left'), openHand(0.67, 0.54, 0.115, 0.12, 'Right')]
    } else if (hs.length === 1) {
      const h = hs[0]
      const mirror: Hand = {
        handedness: h.handedness === 'Left' ? 'Right' : 'Left',
        score: h.score,
        landmarks: h.landmarks.map((p) => ({ x: clamp(1 - p.x, 0.03, 0.97), y: p.y, z: p.z })),
      }
      hs = [h, mirror]
    }
    const nodes: Node[] = []
    for (let hi = 0; hi < 2; hi++) {
      for (let i = 0; i < 21; i++) {
        const p = hs[hi].landmarks[i]
        nodes.push({ x: 0.5 + (p.x - 0.5) * 0.96, y: 0.5 + (p.y - 0.5) * 0.96, z: p.z, key: `${hi}:${i}` })
      }
    }
    return nodes
  }

  private rebuildEdges(nodes: Node[], initial = false): void {
    const now = performance.now()
    const edges: Edge[] = []
    const push = (a: number, b: number, strength: number, kind: Edge['kind'], delay: number): void => {
      const key = `${a}-${b}`
      let born = this.edgeBorn.get(key)
      if (born === undefined) {
        born = initial ? now - 2200 : now + delay
        this.edgeBorn.set(key, born)
      }
      edges.push({ a, b, born, strength, kind })
    }
    for (let hi = 0; hi < 2; hi++) {
      for (const [a, b] of HAND_BONES) push(hi * 21 + a, hi * 21 + b, 1, 'bone', 0)
    }
    const maxDist = 0.23
    const candidates: { a: number; b: number; d: number }[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.floor(i / 21) === Math.floor(j / 21) && Math.abs(i - j) <= 4) continue
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
        if (d < maxDist) candidates.push({ a: i, b: j, d })
      }
    }
    candidates.sort((p, q) => p.d - q.d)
    for (const c of candidates.slice(0, 92)) push(c.a, c.b, 1 - c.d / maxDist, 'near', 200 + c.d * 1200)
    const bridgePairs: [number, number][] = [
      [0, 21],
      [4, 25],
      [8, 29],
      [12, 33],
      [16, 37],
      [20, 41],
      [5, 26],
      [9, 30],
      [13, 34],
      [17, 38],
    ]
    for (const [a, b] of bridgePairs) push(a, b, 0.85, 'bridge', 350)
    this.edges = edges
    this.totalEdges = edges.length
  }

  update(frame: ModeFrame): void {
    const { hands, time } = frame
    this.time = time
    const liveHands = hands.hands.length
    this.nodes = this.nodePositions(hands.hands)
    if (liveHands !== this.handCount) {
      this.handCount = liveHands
      this.rebuildEdges(this.nodes, this.handCount === 0)
    }
    // heartbeat: two quick beats then rest
    const beat = (phase: number) =>
      Math.exp(-Math.pow(((phase % 1) - 0.1) * 14, 2)) + 0.45 * Math.exp(-Math.pow(((phase % 1) - 0.32) * 16, 2))
    this.pulse = beat(time * 0.82)
    this.mat.uniforms.uTint.value.setRGB(1, 1, 1)
    this.handCount = liveHands
  }

  private toScreen(x: number, y: number, w: number, h: number): { x: number; y: number } {
    return { x: x * w, y: y * h }
  }

  drawOverlay(ink: Ink2D): void {
    const w = ink.width
    const h = ink.height
    const now = performance.now()
    const palette = this.env.palette

    // a breath of pale light behind the network
    const ctx = ink.ctx
    ctx.save()
    ctx.globalAlpha *= ink.alpha * 0.5
    const glow = ctx.createRadialGradient(w * 0.5, h * 0.54, 20, w * 0.5, h * 0.54, Math.min(w, h) * 0.44)
    glow.addColorStop(0, 'rgba(232,227,207,0.16)')
    glow.addColorStop(1, 'rgba(232,227,207,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, w, h)
    ctx.restore()

    // filaments
    for (const e of this.edges) {
      const a = this.nodes[e.a]
      const b = this.nodes[e.b]
      if (!a || !b) continue
      const age = clamp((now - e.born) / 900)
      if (age <= 0) continue
      const pa = this.toScreen(a.x, a.y, w, h)
      const pb = this.toScreen(b.x, b.y, w, h)
      const dx = pb.x - pa.x
      const dy = pb.y - pa.y
      const len = Math.hypot(dx, dy) || 1
      const nx = -dy / len
      const ny = dx / len
      const wob = Math.sin(e.a * 1.7 + e.b * 0.9 + this.time * 0.35) * (6 + 10 * e.strength)
      const mx = (pa.x + pb.x) * 0.5 + nx * wob
      const my = (pa.y + pb.y) * 0.5 + ny * wob
      const q1 = { x: pa.x + dx * 0.25 + nx * wob * 0.5, y: pa.y + dy * 0.25 + ny * wob * 0.5 }
      const q2 = { x: pa.x + dx * 0.75 + nx * wob * 0.8, y: pa.y + dy * 0.75 + ny * wob * 0.8 }
      const glowAmt = 0.35 + this.pulse * 0.55 * e.strength
      // a bead of moisture midway along each thread
      ink.dot((pa.x + pb.x) / 2 + nx * wob * 0.4, (pa.y + pb.y) / 2 + ny * wob * 0.4, 0.9, 'rgba(232,227,207,0.45)', 0.5)
      const alpha = age * (e.kind === 'bridge' ? 0.5 : 0.78) * (0.8 + this.pulse * 0.3)
      const pts = [pa, q1, { x: mx, y: my }, q2, pb]
      const threadColor = e.kind === 'bridge' ? palette.mist : mixRgb(palette.sage, palette.pollen, this.pulse * 0.5)
      // soft halo strand
      ink.path(pts, { color: 'rgba(232,227,207,0.5)', width: 3.8, alpha: alpha * 0.3 })
      ink.path(pts.slice(0, Math.max(2, Math.ceil(age * 5))), {
        color: threadColor,
        width: e.kind === 'bridge' ? 0.85 : 1.35 + e.strength * 1.1,
        alpha,
        dash: e.kind === 'bridge' ? [1.5, 4] : undefined,
      })
      if (age < 0.96) {
        const tt = age
        const tip = {
          x: (1 - tt) * (1 - tt) * pa.x + 2 * (1 - tt) * tt * mx + tt * tt * pb.x,
          y: (1 - tt) * (1 - tt) * pa.y + 2 * (1 - tt) * tt * my + tt * tt * pb.y,
        }
        ink.dot(tip.x, tip.y, 1.4, `rgba(201,127,127,${glowAmt})`, 0.9)
      }
    }

    // nodes with a natural amber glow
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i]
      const p = this.toScreen(n.x, n.y, w, h)
      const r = 1.9 + (i % 4) * 0.6 + this.pulse * 1.4
      const ctxN = ink.ctx
      ctxN.save()
      ctxN.globalAlpha *= ink.alpha * (0.4 + this.pulse * 0.4)
      const g = ctxN.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 7)
      g.addColorStop(0, 'rgba(216,168,78,0.55)')
      g.addColorStop(0.4, 'rgba(216,168,78,0.18)')
      g.addColorStop(1, 'rgba(216,168,78,0)')
      ctxN.fillStyle = g
      ctxN.fillRect(p.x - r * 7, p.y - r * 7, r * 14, r * 14)
      ctxN.restore()
      ink.dot(p.x, p.y, r, 'rgba(232,227,207,0.85)', 0.85)
      ink.dot(p.x, p.y, r * 0.5, 'rgba(216,168,78,0.8)', 0.7)
      ink.circle(p.x, p.y, r + 1.8, { color: 'rgba(28,33,26,0.28)', width: 0.7, alpha: 0.6 })
    }

    // drifting spores above the network
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39996 + this.time * 0.12
      const r = 0.16 + ((i * 0.37) % 0.52)
      const x = 0.5 + Math.cos(a) * r * (w / Math.max(1, h)) * 0.7
      const y = 0.52 + Math.sin(a * 1.3) * r * 0.9
      ink.dot(x * w, y * h, 0.7 + (i % 3) * 0.4, 'rgba(216,168,78,0.28)', 0.5)
    }

    // root tendrils falling from the palms into the moss
    for (let hi = 0; hi < 2; hi++) {
      const palm = this.nodes[hi * 21 + 9]
      if (!palm) continue
      const px = palm.x * w
      const py = palm.y * h
      for (let r = 0; r < 3; r++) {
        const pts: { x: number; y: number }[] = []
        for (let i = 0; i <= 8; i++) {
          const t = i / 8
          pts.push({
            x: px + Math.sin(t * 3 + r * 2 + this.time * 0.1) * (10 + r * 6) * t,
            y: py + t * (h - py - 20),
          })
        }
        ink.path(pts, { color: 'rgba(138,154,123,0.2)', width: 0.6, alpha: 0.6 })
      }
    }
    ink.label('ARMILLARIA MELLEA', 24, 34, { size: 10, letterSpacing: 1.6, color: 'rgba(246,241,231,0.55)' })
    ink.label('菌络 · MYCELIUM', 24, 52, { size: 11, family: 'display', color: 'rgba(246,241,231,0.8)', letterSpacing: 1 })
    ink.label(`${this.handCount} hands · ${this.nodes.length} nodes · ${this.totalEdges} threads`, w - 24, h - 30, {
      size: 10,
      align: 'right',
      color: 'rgba(246,241,231,0.42)',
      letterSpacing: 1.2,
    })
    ink.frameMarks('rgba(246,241,231,0.28)', 22)
  }

  render(renderer: THREE.WebGLRenderer): void {
    renderer.render(this.scene, this.camera)
  }

  collect(): SpecimenSeed {
    return { mode: 'mycelium', season: this.env.season, seed: this.collectSeed() }
  }

  collectSeed(): number {
    const seed = seedFromParts('mycelium', this.env.season, this.nodes.length, this.totalEdges)
    this.lastCollect = (seed ^ randomSeed()) >>> 0
    return this.lastCollect
  }

  a11ySummary(): string {
    return `菌络 MYCELIUM：21 点建成的 ${this.nodes.length} 个节点与 ${this.totalEdges} 条菌丝，正在随呼吸脉冲缓慢生长；双手靠近时会架起更多桥接。`
  }

  clear(): void {
    this.edgeBorn.clear()
    this.nodes = this.nodePositions([])
    this.rebuildEdges(this.nodes, true)
  }

  setSeason(): void {
    this.mat.uniforms.uTint.value.setRGB(1, 1, 1)
  }

  dispose(): void {
    this.mat.dispose()
  }
}

function mixRgb(a: string, b: string, k: number): string {
  const pa = hexToRgbLocal(a)
  const pb = hexToRgbLocal(b)
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * Math.max(0, Math.min(1, k))))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

function hexToRgbLocal(h: string): [number, number, number] {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
