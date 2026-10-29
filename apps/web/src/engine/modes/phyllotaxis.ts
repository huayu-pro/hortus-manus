/**
 * PHYLLOTAXIS / 花冠 — the golden-angle crown.
 *
 * Petals are arranged by the golden angle (137.5°) in an instanced spiral; the
 * palm is the heart, wrist rotation turns the crown, palm openness scales it.
 * Petals occasionally detach and drift down across the paper.
 */

import * as THREE from 'three'
import type { ModeId, SpecimenSeed } from '@hortus/shared'
import { randomSeed, seedFromParts } from '@hortus/shared'
import type { Ink2D } from '../Ink2D'
import type { GardenMode, ModeEnv, ModeFrame } from './types'
import { NOISE_GLSL } from './glsl'
import {
  clamp,
  damp,
  fillPetalSeeds,
  makeInstancedPetal,
  makePaperBackground,
  resizePaperBackground,
  screenToWorld,
} from './shared'

const GOLDEN = 2.399963229728653

const VERT = /* glsl */ `
uniform float uOpen;
uniform float uTime;
uniform float uRotation;
uniform float uScale;
uniform vec2 uCenter;
attribute vec4 aSeed;
varying vec2 vUvP;
varying float vLayer;

void main(){
  float t = position.y + 0.5;
  float w = pow(sin(t * 3.14159265), 0.7);
  float layer = aSeed.y;                 // 0 centre … 1 rim
  float radius = 0.09 + 0.6 * layer * uScale * (0.55 + 0.45 * uOpen);
  float len = mix(0.12, 0.34, layer) * (0.55 + 0.45 * uOpen) * uScale;
  float angle = aSeed.x + uRotation;

  float lx = position.x * w * len * 0.55;
  float ly = t * len;
  vec2 dir = vec2(cos(angle), sin(angle));
  vec2 perp = vec2(-dir.y, dir.x);
  vec2 p = dir * (radius + ly) + perp * lx;
  p += dir * sin(uTime * 0.6 + aSeed.z * 6.2831) * 0.004;

  vUvP = vec2(position.x + 0.5, t);
  vLayer = layer;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(uCenter + p, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
uniform vec3 uDeep;
uniform vec3 uLight;
uniform vec3 uEdge;
uniform float uOpen;
varying vec2 vUvP;
varying float vLayer;

${NOISE_GLSL}

void main(){
  float across = vUvP.x;
  float along = vUvP.y;
  float mottle = snoise(vec3(across * 6.0, along * 7.0, vLayer * 4.0)) * 0.5 + 0.5;
  vec3 col = mix(uDeep, uLight, smoothstep(0.0, 0.9, along) * 0.8 + mottle * 0.2);
  col = mix(col, uEdge, smoothstep(0.7, 1.0, abs(across * 2.0 - 1.0)) * 0.4);
  col *= 0.88 + 0.12 * smoothstep(0.0, 0.4, along);
  float alpha = smoothstep(0.0, 0.1, along) * (0.68 + 0.27 * vLayer) * (0.55 + 0.45 * uOpen);
  gl_FragColor = vec4(col, alpha);
}
`

interface Falling {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  spin: number
  size: number
  life: number
  maxLife: number
}

export class PhyllotaxisMode implements GardenMode {
  readonly id: ModeId = 'phyllotaxis'
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  private env!: ModeEnv
  private bg: THREE.Mesh | null = null
  private mesh: THREE.Mesh | null = null
  private mat: THREE.ShaderMaterial | null = null
  private glow: THREE.Mesh | null = null
  private falling: Falling[] = []
  private center = { x: 0, y: 0 }
  private target = { x: 0, y: 0 }
  private rotation = 0
  private rotTarget = 0
  private open = 0.7
  private openTarget = 0.7
  private time = 0
  private aspect = 1
  private petalCount = 180
  private lastCollect = 0
  private lastSpawn = 0

  init(env: ModeEnv): void {
    this.env = env
    this.bg = makePaperBackground(env, { light: 0.95 })
    this.scene.add(this.bg)
    this.camera.position.z = 5
    this.build(env)
    this.resize(env)
  }

  private build(env: ModeEnv): void {
    const n = Math.round(this.petalCount * (0.55 + env.quality * 0.45))
    this.petalCount = n
    const { geometry, seeds } = makeInstancedPetal(n)
    // aSeed.x angle, aSeed.y radius layer (sqrt distribution), z phase, w tone
    for (let i = 0; i < n; i++) {
      const k = i / Math.max(1, n - 1)
      seeds[i * 4] = i * GOLDEN
      seeds[i * 4 + 1] = Math.sqrt(k)
      seeds[i * 4 + 2] = (i * 0.618) % 1
      seeds[i * 4 + 3] = (i * 0.27) % 1
    }
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uOpen: { value: 0.7 },
        uTime: { value: 0 },
        uRotation: { value: 0 },
        uScale: { value: 1 },
        uCenter: { value: new THREE.Vector2(0, 0) },
        uDeep: { value: new THREE.Color(env.palette.peony) },
        uLight: { value: new THREE.Color(env.palette.blush) },
        uEdge: { value: new THREE.Color(env.palette.seasonDeep) },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    this.mat = mat
    this.mesh = new THREE.Mesh(geometry, mat)
    this.mesh.frustumCulled = false
    this.scene.add(this.mesh)

    const glowGeo = new THREE.CircleGeometry(0.25, 48)
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uOpen;
        varying vec2 vUv;
        void main(){
          float r = length(vUv - 0.5) * 2.0;
          float a = smoothstep(1.0, 0.0, r) * 0.35 * (0.5 + uOpen * 0.6);
          gl_FragColor = vec4(uColor, a);
        }
      `,
      uniforms: { uColor: { value: new THREE.Color(env.palette.pollen) }, uOpen: { value: 0.7 } },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })
    this.glow = new THREE.Mesh(glowGeo, glowMat)
    this.glow.frustumCulled = false
    this.glow.renderOrder = -1
    this.scene.add(this.glow)
  }

  resize(env: ModeEnv): void {
    this.env = env
    this.aspect = env.width / Math.max(1, env.height)
    resizePaperBackground(this.bg, env)
  }

  update(frame: ModeFrame): void {
    const { hands, dt, time } = frame
    this.time = time
    const first = hands.hands[0]
    if (first) {
      const palm = first.landmarks[9]
      const [wx, wy] = screenToWorld(palm.x, palm.y, this.aspect)
      this.target.x = wx
      this.target.y = wy
      const wrist = first.landmarks[0]
      const mid = first.landmarks[9]
      const angle = Math.atan2(mid.y - wrist.y, mid.x - wrist.x) + Math.PI / 2
      this.rotTarget = angle * 0.8
      const ext = [8, 12, 16, 20].reduce((acc, i) => {
        const dTip = Math.hypot(first.landmarks[i].x - wrist.x, first.landmarks[i].y - wrist.y)
        const dPip = Math.hypot(first.landmarks[i - 2].x - wrist.x, first.landmarks[i - 2].y - wrist.y)
        return acc + clamp((dTip / Math.max(1e-4, dPip) - 1) / 0.4)
      }, 0) / 4
      this.openTarget = hands.gesture.gesture === 'fist' ? 0.12 : 0.35 + ext * 0.65
    } else {
      this.target.x = Math.sin(time * 0.22) * 0.06
      this.target.y = Math.sin(time * 0.18) * 0.04
      this.rotTarget = Math.sin(time * 0.11) * 0.5
      this.openTarget = 0.62 + Math.sin(time * 0.3) * 0.16
    }
    this.center.x = damp(this.center.x, this.target.x, 4, dt)
    this.center.y = damp(this.center.y, this.target.y, 4, dt)
    this.rotation = damp(this.rotation, this.rotTarget, 3, dt)
    this.open = damp(this.open, this.openTarget, 4, dt)

    if (this.mat) {
      this.mat.uniforms.uOpen.value = this.open
      this.mat.uniforms.uTime.value = time
      this.mat.uniforms.uRotation.value = this.rotation
      this.mat.uniforms.uScale.value = 0.86 + this.open * 0.24
      ;(this.mat.uniforms.uCenter.value as THREE.Vector2).set(this.center.x, this.center.y)
      this.mat.uniforms.uDeep.value.set(this.env.palette.peony)
      this.mat.uniforms.uLight.value.set(this.env.palette.blush)
      this.mat.uniforms.uEdge.value.set(this.env.palette.seasonDeep)
    }
    if (this.glow) {
      this.glow.position.set(this.center.x, this.center.y, 0)
      const gm = this.glow.material as THREE.ShaderMaterial
      gm.uniforms.uOpen.value = this.open
      gm.uniforms.uColor.value.set(this.env.palette.pollen)
    }

    // petals fall
    if (time - this.lastSpawn > 2.2 + Math.random() * 2.8) {
      this.lastSpawn = time
      const a = Math.random() * Math.PI * 2
      this.falling.push({
        x: this.center.x + Math.cos(a) * 0.5,
        y: this.center.y + Math.sin(a) * 0.35,
        vx: (Math.random() - 0.5) * 0.06,
        vy: -0.06 - Math.random() * 0.05,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.8,
        size: 4 + Math.random() * 5,
        life: 0,
        maxLife: 7 + Math.random() * 4,
      })
    }
    for (let i = this.falling.length - 1; i >= 0; i--) {
      const f = this.falling[i]
      f.life += dt
      f.x += (f.vx + Math.sin(f.life * 1.6 + f.rot) * 0.03) * dt
      f.y += f.vy * dt
      f.rot += f.spin * dt
      if (f.life > f.maxLife || f.y < -1.1) this.falling.splice(i, 1)
    }
  }

  render(renderer: THREE.WebGLRenderer): void {
    renderer.render(this.scene, this.camera)
  }

  drawOverlay(ink: Ink2D): void {
    const w = ink.width
    const h = ink.height
    const cx = (this.center.x / (2 * this.aspect) + 0.5) * w
    const cy = (0.5 - this.center.y / 2) * h
    // spiral guide (a single faint golden spiral)
    const pts: { x: number; y: number }[] = []
    for (let i = 0; i < 120; i++) {
      const k = i / 120
      const a = i * GOLDEN + this.rotation
      const r = Math.sqrt(k) * Math.min(w, h) * 0.28 * (0.5 + this.open * 0.5)
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
    }
    ink.path(pts, { color: 'rgba(28,33,26,0.10)', width: 0.7, alpha: 0.6 })

    for (const f of this.falling) {
      const x = (f.x / (2 * this.aspect) + 0.5) * w
      const y = (0.5 - f.y / 2) * h
      const ctx = ink.ctx
      ctx.save()
      ctx.globalAlpha *= 0.75 * ink.alpha * Math.min(1, (f.maxLife - f.life) / 2)
      ctx.translate(x, y)
      ctx.rotate(f.rot)
      const grad = ctx.createLinearGradient(0, -f.size, 0, f.size)
      grad.addColorStop(0, 'rgba(232,196,190,0.9)')
      grad.addColorStop(1, 'rgba(201,127,127,0.55)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.ellipse(0, 0, f.size * 0.55, f.size, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    ink.label('HELIANTHUS ANNUUS', 24, 34, { size: 10, letterSpacing: 1.6, color: 'rgba(28,33,26,0.42)' })
    ink.label('花冠 · PHYLLOTAXIS', 24, 52, { size: 11, family: 'display', color: 'rgba(28,33,26,0.68)', letterSpacing: 1 })
    ink.label('137.5° · golden angle', w - 24, h - 30, {
      size: 10,
      align: 'right',
      color: 'rgba(28,33,26,0.4)',
      letterSpacing: 1.2,
    })
    ink.frameMarks('rgba(28,33,26,0.26)', 22)
    ink.vignette(this.env.palette, 0.12)
  }

  collect(): SpecimenSeed {
    return { mode: 'phyllotaxis', season: this.env.season, seed: this.collectSeed() }
  }

  collectSeed(): number {
    const seed = seedFromParts(
      'phyllotaxis',
      this.env.season,
      Math.round(this.open * 1000),
      Math.round(this.rotation * 1000),
    )
    this.lastCollect = (seed ^ randomSeed()) >>> 0
    return this.lastCollect
  }

  a11ySummary(): string {
    return `花冠 PHYLLOTAXIS：按黄金角 137.5° 排列的 ${this.petalCount} 枚花瓣，随掌心开合约 ${Math.round(this.open * 100)}% 展开，转动的手腕带动整朵花冠旋转。`
  }

  clear(): void {
    this.falling.length = 0
  }

  dispose(): void {
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      mesh.geometry?.dispose()
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat?.dispose()
    })
  }
}
