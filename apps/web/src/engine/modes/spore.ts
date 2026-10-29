/**
 * SPORE / 孢子 — a dandelion clock that lives in the palm.
 *
 * Fist → wind: the head bursts into drifting seeds. Open palm → catch: seeds
 * curve back toward the palm. Seeds that reach the ground sprout into tiny
 * seedlings on the paper. Curl-noise drift + a hard particle cap.
 */

import * as THREE from 'three'
import type { ModeId, SpecimenSeed } from '@hortus/shared'
import { randomSeed, seedFromParts } from '@hortus/shared'
import type { Ink2D } from '../Ink2D'
import type { GardenMode, ModeEnv, ModeFrame } from './types'
import { clamp, makePaperBackground, resizePaperBackground, screenToWorld } from './shared'

interface Seed {
  x: number
  y: number
  vx: number
  vy: number
  state: 0 | 1 | 2 // attached / flying / caught
  life: number
  phase: number
  size: number
  z: number
}

interface Sprout {
  x: number
  y: number
  growth: number
  lean: number
}

const MAX_SEEDS = 420
const MAX_SPROUTS = 48

const SEED_VERT = /* glsl */ `
uniform float uDpr;
attribute float aSize;
attribute float aAlpha;
varying float vAlpha;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uDpr * (260.0 / max(1.0, -mv.z + 260.0));
  vAlpha = aAlpha;
  gl_Position = projectionMatrix * mv;
}
`

const SEED_FRAG = /* glsl */ `
uniform sampler2D uSprite;
uniform vec3 uColor;
varying float vAlpha;
void main(){
  vec4 s = texture2D(uSprite, gl_PointCoord);
  gl_FragColor = vec4(uColor, s.a * vAlpha);
}
`

export class SporeMode implements GardenMode {
  readonly id: ModeId = 'spore'
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  private env!: ModeEnv
  private bg: THREE.Mesh | null = null
  private points: THREE.Points | null = null
  private mat: THREE.ShaderMaterial | null = null
  private seeds: Seed[] = []
  private sprouts: Sprout[] = []
  private head = { x: 0, y: -0.05 }
  private scale = 1
  private wasFist = false
  private wasOpen = false
  private aspect = 1
  private time = 0
  private lastCollect = 0
  private positions: Float32Array | null = null
  private alphas: Float32Array | null = null

  init(env: ModeEnv): void {
    this.env = env
    this.bg = makePaperBackground(env, { light: 1.15, tint: '#fffdf6' })
    this.scene.add(this.bg)
    this.camera.position.z = 5
    this.resize(env)
    this.buildSeeds(env)
  }

  private buildSeeds(env: ModeEnv): void {
    const n = Math.round(MAX_SEEDS * (0.55 + env.quality * 0.45))
    const geo = new THREE.BufferGeometry()
    this.positions = new Float32Array(n * 3)
    this.alphas = new Float32Array(n)
    const sizes = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.pow(Math.random(), 0.6) * 0.19
      this.seeds.push({
        x: Math.cos(a) * r,
        y: Math.sin(a) * r * 1.12,
        vx: 0,
        vy: 0,
        state: 0,
        life: Math.random() * 100,
        phase: Math.random(),
        size: 3.2 + Math.random() * 5.2,
        z: Math.random() * 0.4,
      })
      if (i % 29 === 0) {
        const s = this.seeds[this.seeds.length - 1]
        s.state = 1
        s.vx = 0.03 + Math.random() * 0.05
        s.vy = 0.02 + Math.random() * 0.04
        s.life = Math.random() * 2
      }
      sizes[i] = this.seeds[i].size
      this.alphas[i] = 0.9
    }
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alphas, 1))
    this.mat = new THREE.ShaderMaterial({
      vertexShader: SEED_VERT,
      fragmentShader: SEED_FRAG,
      uniforms: {
        uSprite: { value: env.assets.fluff },
        uColor: { value: new THREE.Color(env.palette.inkSoft) },
        uDpr: { value: env.dpr },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })
    this.points = new THREE.Points(geo, this.mat)
    this.points.frustumCulled = false
    this.points.renderOrder = 2
    this.scene.add(this.points)
  }

  resize(env: ModeEnv): void {
    this.env = env
    this.aspect = env.width / Math.max(1, env.height)
    resizePaperBackground(this.bg, env)
  }

  update(frame: ModeFrame): void {
    const { hands, dt } = frame
    this.time += dt
    const gesture = hands.gesture.gesture
    if (hands.hands.length > 0) {
      let px = 0
      let py = 0
      for (const h of hands.hands) {
        px += h.landmarks[9].x
        py += h.landmarks[9].y
      }
      px /= hands.hands.length
      py /= hands.hands.length
      const [wx, wy] = screenToWorld(px, py, this.aspect)
      this.head.x += (wx - this.head.x) * Math.min(1, dt * 3)
      this.head.y += (wy + 0.02 - this.head.y) * Math.min(1, dt * 3)
      this.scale = 1
    } else {
      this.head.x += (Math.sin(this.time * 0.3) * 0.06 - this.head.x) * Math.min(1, dt * 1.5)
      this.head.y += (-0.05 + Math.sin(this.time * 0.22) * 0.03 - this.head.y) * Math.min(1, dt * 1.5)
    }

    const fist = gesture === 'fist'
    const open = gesture === 'open' || gesture === 'weave'
    if (fist && !this.wasFist) this.blow()
    if (fist && Math.random() < dt * 8) this.blow(2)
    if (open) this.catchSeeds(dt)
    this.wasFist = fist
    this.wasOpen = open

    this.stepSeeds(dt)
    this.updateGeometry()
  }

  private blow(count = 26): void {
    let blown = 0
    for (const s of this.seeds) {
      if (s.state !== 0) continue
      const a = Math.atan2(s.y - this.head.y, s.x - this.head.x) + (Math.random() - 0.5) * 0.8
      const speed = 0.35 + Math.random() * 0.75
      s.vx = Math.cos(a) * speed + 0.2
      s.vy = Math.sin(a) * speed + 0.35
      s.state = 1
      s.life = 0
      if (++blown >= count) break
    }
  }

  private catchSeeds(dt: number): void {
    for (const s of this.seeds) {
      if (s.state !== 1) continue
      const dx = this.head.x - s.x
      const dy = this.head.y - s.y
      const d = Math.hypot(dx, dy)
      if (d < 0.75) {
        s.vx += (dx / (d + 0.01)) * dt * 1.8
        s.vy += (dy / (d + 0.01)) * dt * 1.8
        s.vx *= 0.985
        s.vy *= 0.985
      }
    }
  }

  private stepSeeds(dt: number): void {
    for (const s of this.seeds) {
      s.life += dt
      if (s.state === 0) {
        // attached: breathe around the head
        const a = this.time * 0.2 + s.phase * 6.28
        s.x = this.head.x + Math.cos(a) * 0.17 * this.scale * (0.35 + s.z)
        s.y = this.head.y + Math.sin(a) * 0.19 * this.scale * (0.35 + s.z)
        continue
      }
      // curl-ish drift
      const curlX = Math.sin(s.y * 3.1 + this.time * 0.6 + s.phase * 5) * 0.16
      const curlY = Math.cos(s.x * 2.7 - this.time * 0.4 + s.phase * 3) * 0.1
      s.vx += curlX * dt
      s.vy += curlY * dt - 0.05 * dt
      s.vx *= 0.995
      s.vy *= 0.995
      s.x += s.vx * dt
      s.y += s.vy * dt
      if (s.y < -0.98) {
        s.state = 2
        s.vx = 0
        s.vy = 0
        if (this.sprouts.length < MAX_SPROUTS) {
          this.sprouts.push({ x: s.x, y: -0.96, growth: 0, lean: (Math.random() - 0.5) * 0.5 })
        }
      }
      if (s.state === 1 && this.wasOpen && Math.hypot(s.x - this.head.x, s.y - this.head.y) < 0.12 && s.life > 1.2) {
        s.state = 2
      }
    }
    for (const sp of this.sprouts) sp.growth = Math.min(1, sp.growth + dt * 0.5)
  }

  private updateGeometry(): void {
    if (!this.positions || !this.alphas || !this.points) return
    const n = this.seeds.length
    for (let i = 0; i < n; i++) {
      const s = this.seeds[i]
      this.positions[i * 3] = s.x
      this.positions[i * 3 + 1] = s.y
      this.positions[i * 3 + 2] = -s.z
      this.alphas[i] = s.state === 0 ? 0 : s.state === 1 ? clamp(1 - s.life / 9) : 0.5
    }
    this.points.geometry.getAttribute('position').needsUpdate = true
    this.points.geometry.getAttribute('aAlpha').needsUpdate = true
  }

  render(renderer: THREE.WebGLRenderer): void {
    renderer.render(this.scene, this.camera)
  }

  drawOverlay(ink: Ink2D): void {
    const w = ink.width
    const h = ink.height
    const cx = (this.head.x / (2 * this.aspect) + 0.5) * w
    const cy = (0.5 - this.head.y / 2) * h
    const ground = h - 56
    // stem
    ink.path(
      [
        { x: cx, y: cy + 14 },
        { x: cx - 4, y: (cy + ground) * 0.5 },
        { x: cx + 2, y: ground },
      ],
      { color: 'rgba(56,62,50,0.6)', width: 2, alpha: 0.9 },
    )
    // dandelion clock: radiating pappus filaments with tiny dew tips
    const clockR = Math.min(w, h) * 0.175
    // warm light behind the clock
    const ctx2 = ink.ctx
    ctx2.save()
    ctx2.globalAlpha *= ink.alpha * 0.8
    const halo = ctx2.createRadialGradient(cx, cy, 4, cx, cy, clockR * 1.9)
    halo.addColorStop(0, 'rgba(216,168,78,0.30)')
    halo.addColorStop(0.42, 'rgba(216,168,78,0.10)')
    halo.addColorStop(1, 'rgba(246,241,231,0)')
    ctx2.fillStyle = halo
    ctx2.fillRect(cx - clockR * 2, cy - clockR * 2, clockR * 4, clockR * 4)
    ctx2.restore()
    for (let i = 0; i < 92; i++) {
      const a = i * 2.39996 + this.time * 0.04
      const r = clockR * (0.7 + 0.3 * Math.sin(i * 1.7))
      const x2 = cx + Math.cos(a) * r
      const y2 = cy + Math.sin(a) * r * 0.94
      // graphite filament
      ink.line(cx + Math.cos(a) * clockR * 0.16, cy + Math.sin(a) * clockR * 0.14, x2, y2, {
        color: 'rgba(56,62,50,0.55)',
        width: 0.95,
        alpha: 0.85,
      })
      // pappus fork + pollen tip
      for (const da of [-0.28, 0, 0.28]) {
        ink.line(x2, y2, x2 + Math.cos(a + da) * 7, y2 + Math.sin(a + da) * 6.2, {
          color: 'rgba(74,90,66,0.42)',
          width: 0.6,
          alpha: 0.8,
        })
      }
      ink.dot(x2, y2, 0.9, 'rgba(216,168,78,0.85)', 0.9)
    }
    ink.circle(cx, cy, clockR, { color: 'rgba(28,33,26,0.22)', width: 0.9, alpha: 0.6 })
    ink.dot(cx, cy, 5, 'rgba(216,168,78,0.65)', 0.8)
    ink.dot(cx, cy, 2, 'rgba(246,241,231,0.9)', 0.9)
    // sprouts
    for (const sp of this.sprouts) {
      const sx = (sp.x / (2 * this.aspect) + 0.5) * w
      const sy = (0.5 - sp.y / 2) * h
      const g = sp.growth
      const tipX = sx + sp.lean * 16 * g
      const tipY = sy - 22 * g
      ink.path(
        [
          { x: sx, y: sy },
          { x: sx + sp.lean * 8 * g, y: sy - 12 * g },
          { x: tipX, y: tipY },
        ],
        { color: 'rgba(111,135,95,0.5)', width: 1, alpha: 0.75 },
      )
      ink.dot(tipX - 2, tipY + 2, 1.8 * g, 'rgba(111,135,95,0.55)', 0.7)
      ink.dot(tipX + 2, tipY, 1.5 * g, 'rgba(138,154,123,0.5)', 0.65)
    }
    // drifting pappus in the margin (guarantees visible life even before a fist)
    for (let i = 0; i < 13; i++) {
      const t = this.time * 0.12 + i * 1.7
      const fx = (0.12 + ((i * 0.23) % 0.76)) * w + Math.sin(t) * 18
      const fy = (0.18 + ((i * 0.31) % 0.56)) * h + Math.cos(t * 0.8) * 12
      const sz = 7 + (i % 4) * 3
      ink.line(fx, fy, fx + sz, fy - sz * 0.45, { color: 'rgba(56,62,50,0.38)', width: 0.7, alpha: 0.8 })
      ink.line(fx, fy, fx - sz * 0.65, fy - sz * 0.8, { color: 'rgba(56,62,50,0.32)', width: 0.6, alpha: 0.7 })
      ink.line(fx, fy, fx + sz * 0.3, fy - sz, { color: 'rgba(56,62,50,0.34)', width: 0.6, alpha: 0.7 })
      ink.dot(fx, fy, 1.4, 'rgba(216,168,78,0.75)', 0.85)
      ink.dot(fx, fy, 0.7, 'rgba(246,241,231,0.9)', 0.8)
    }
    // two leaves at the stem base
    for (const side of [-1, 1]) {
      const bx = cx + side * 4
      const by = ground - 4
      ink.path(
        [
          { x: bx, y: by },
          { x: bx + side * 26, y: by - 26 },
          { x: bx + side * 52, y: by - 20 },
        ],
        { color: 'rgba(111,135,95,0.4)', width: 1.1, alpha: 0.75 },
      )
      ink.path(
        [
          { x: bx + side * 26, y: by - 26 },
          { x: bx + side * 34, y: by - 18 },
          { x: bx + side * 40, y: by - 10 },
        ],
        { color: 'rgba(111,135,95,0.3)', width: 0.8, alpha: 0.6 },
      )
    }
    // ground line + a little grass
    ink.line(28, ground, w - 28, ground, { color: 'rgba(28,33,26,0.14)', width: 0.8 })
    for (let i = 0; i < 26; i++) {
      const gx = 40 + ((i * 173) % (w - 80))
      const sway = Math.sin(this.time * 0.4 + i) * 4
      ink.path(
        [
          { x: gx, y: ground },
          { x: gx + sway * 0.4, y: ground - 8 - (i % 4) * 3 },
          { x: gx + sway, y: ground - 16 - (i % 5) * 4 },
        ],
        { color: 'rgba(111,135,95,0.28)', width: 0.7, alpha: 0.7 },
      )
    }
    ink.label('TARAXACUM OFFICINALE', 24, 34, { size: 10, letterSpacing: 1.6, color: 'rgba(28,33,26,0.45)' })
    ink.label('孢子 · SPORE', 24, 52, { size: 11, family: 'display', color: 'rgba(28,33,26,0.7)', letterSpacing: 1 })
    ink.label('fist to blow · palm to catch', w - 24, h - 30, {
      size: 10,
      align: 'right',
      color: 'rgba(28,33,26,0.4)',
      letterSpacing: 1.2,
    })
    ink.frameMarks('rgba(28,33,26,0.26)', 22)
    ink.vignette(this.env.palette, 0.13)
  }

  collect(): SpecimenSeed {
    return { mode: 'spore', season: this.env.season, seed: this.collectSeed() }
  }

  collectSeed(): number {
    const seed = seedFromParts(
      'spore',
      this.env.season,
      this.seeds.filter((s) => s.state === 1).length,
      this.sprouts.length,
    )
    this.lastCollect = (seed ^ randomSeed()) >>> 0
    return this.lastCollect
  }

  a11ySummary(): string {
    return `孢子 SPORE：掌心的蒲公英钟；握拳吹散 ${this.seeds.filter((s) => s.state === 1).length} 粒种子，开掌可接住，落地已长出 ${this.sprouts.length} 株小芽。`
  }

  clear(): void {
    this.sprouts.length = 0
    for (const s of this.seeds) s.state = 0
  }

  dispose(): void {
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      mesh.geometry?.dispose()
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat?.dispose()
    })
    this.seeds.length = 0
    this.sprouts.length = 0
  }
}
