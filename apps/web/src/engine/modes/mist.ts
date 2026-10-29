/**
 * MIST / 晨雾 — condensation on a glass pane, wiped by a palm.
 *
 * A low-resolution mask is painted with the palm/finger SDF every frame and
 * decays slowly, so the fog returns. Behind the glass sits a pressed plate
 * (public-domain peony photograph composed with a handwritten line; a painted
 * fern plate is the fallback). Seasonal light tints the glass.
 */

import * as THREE from 'three'
import type { ModeId, SpecimenSeed } from '@hortus/shared'
import { randomSeed, seedFromParts } from '@hortus/shared'
import type { Ink2D } from '../Ink2D'
import type { GardenMode, ModeEnv, ModeFrame } from './types'
import { NOISE_GLSL } from './glsl'
import { createQuad, fullscreenMaterial } from './shared'

const MW = 192
const MH = 120

const MIST_FRAG = /* glsl */ `
uniform sampler2D uPlate;
uniform sampler2D uMask;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uFog;
uniform vec3 uTint;
varying vec2 vUv;

${NOISE_GLSL}

void main(){
  vec2 uv = vUv;
  float clearAmt = texture2D(uMask, uv).r;

  // condensation: broad breath + micro droplets
  float breath = fbm(vec3(uv * vec2(5.0, 3.4), uTime * 0.025)) * 0.5 + 0.5;
  float micro = snoise(vec3(uv * vec2(52.0, 34.0), uTime * 0.03)) * 0.5 + 0.5;
  float droplets = smoothstep(0.58, 0.94, micro);
  float streaks = fbm(vec3(uv * vec2(2.2, 26.0), uTime * 0.02)) * 0.5 + 0.5;
  vec3 glass = mix(uFog * 0.86, uFog * 1.08, breath);
  glass *= 0.9 + 0.14 * streaks;
  glass += droplets * 0.022;
  glass += vec3(0.03, 0.028, 0.018) * smoothstep(0.75, 0.0, length(uv - vec2(0.22, 0.85)));

  vec3 plate = texture2D(uPlate, uv).rgb * uTint;
  plate = mix(plate, plate * vec3(1.06, 1.02, 0.94), 0.35);
  float clear = smoothstep(0.03, 0.42, clearAmt);
  // frosted rim around a wiped patch catches the light
  float rim = smoothstep(0.0, 0.22, clearAmt) * (1.0 - smoothstep(0.22, 0.8, clearAmt));
  vec3 col = mix(glass, plate, clear);
  col += rim * 0.06 * vec3(0.94, 0.96, 0.92);
  col += droplets * (1.0 - clear) * 0.02;
  // cold glass edge where the pane meets its frame
  float edge = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  col = mix(col, vec3(0.06, 0.08, 0.06), smoothstep(0.035, 0.0, edge) * 0.28);

  // glass grain + tiny scratches
  col += (texture2D(uMask, uv * 3.0).r - 0.5) * 0.008;
  gl_FragColor = vec4(col, 1.0);
}
`

export class MistMode implements GardenMode {
  readonly id: ModeId = 'mist'
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  private env!: ModeEnv
  private mat: THREE.ShaderMaterial
  private mask = new Uint8Array(MW * MH)
  private maskTex: THREE.DataTexture
  private plateTex: THREE.CanvasTexture | null = null
  private aspect = 1
  private time = 0
  private autoAngle = 0
  private lastCollect = 0
  private plateReady = false

  constructor() {
    this.maskTex = new THREE.DataTexture(this.mask, MW, MH, THREE.RedFormat, THREE.UnsignedByteType)
    this.maskTex.magFilter = THREE.LinearFilter
    this.maskTex.minFilter = THREE.LinearFilter
    this.maskTex.needsUpdate = true
    this.mat = fullscreenMaterial(MIST_FRAG, {
      uPlate: { value: null },
      uMask: { value: this.maskTex },
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uFog: { value: new THREE.Color('#dfe7e1') },
      uTint: { value: new THREE.Color('#ffffff') },
    })
  }

  init(env: ModeEnv): void {
    this.env = env
    const quad = createQuad(this.mat)
    this.scene.add(quad)
    this.camera.position.z = 5
    this.resize(env)
    this.buildPlate()
    // a first, painterly wipe so the static composition already reveals the plate
    this.stampEllipse(0.5, 0.46, 0.4, 0.4, 245)
    this.stampEllipse(0.34, 0.6, 0.16, 0.18, 210)
    this.stampEllipse(0.66, 0.32, 0.14, 0.14, 190)
    this.stampEllipse(0.5, 0.76, 0.3, 0.13, 175)
    this.flushMask()
  }

  private buildPlate(): void {
    if (!this.env) return
    const w = 1024
    const h = 640
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')
    if (!ctx) return
    const plate = null as THREE.Texture | null
    if (plate?.image) {
      const img = plate.image as CanvasImageSource
      const iw = (img as HTMLImageElement).width || w
      const ih = (img as HTMLImageElement).height || h
      const scale = Math.max(w / iw, h / ih)
      const dw = iw * scale
      const dh = ih * scale
      ctx.fillStyle = this.env.palette.paper
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
      // wash it into the paper so it reads as a pressed plate, not a photo
      ctx.fillStyle = 'rgba(246,241,231,0.42)'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(246,241,231,0.1)'
      ctx.fillRect(0, 0, w, h)
      // handwritten dedication
      ctx.fillStyle = 'rgba(28,33,26,0.66)'
      ctx.font = 'italic 36px "Cormorant", "Instrument Serif", Georgia, serif'
      ctx.fillText('the fog remembers what the hand forgets', w * 0.08, h * 0.86)
      ctx.font = '11px "IBM Plex Mono", monospace'
      ctx.fillStyle = 'rgba(93,102,88,0.7)'
      ctx.fillText('PAEONIA SUFFRUTICOSA · HERBARIUM 041', w * 0.08, h * 0.895)
      // herbarium stamp
      ctx.strokeStyle = 'rgba(201,127,127,0.55)'
      ctx.lineWidth = 1.2
      ctx.strokeRect(w * 0.76, h * 0.08, w * 0.15, h * 0.1)
      ctx.fillStyle = 'rgba(28,33,26,0.6)'
      ctx.font = '11px "IBM Plex Mono", monospace'
      ctx.fillText('HORTUS', w * 0.775, h * 0.115)
      ctx.fillText('MANUS', w * 0.775, h * 0.14)
    } else {
      const fallback = this.env.assets.fernPlate.image as HTMLCanvasElement | undefined
      if (fallback) ctx.drawImage(fallback, 0, 0, w, h)
      else {
        ctx.fillStyle = this.env.palette.paper
        ctx.fillRect(0, 0, w, h)
      }
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.NoColorSpace
    tex.needsUpdate = true
    this.plateTex?.dispose()
    this.plateTex = tex
    this.mat.uniforms.uPlate.value = tex
    this.plateReady = true
  }

  refreshAssets(): void {
    if (!this.plateReady || this.env.assets.platePeony) {
      this.buildPlate()
      this.plateReady = true
    }
  }

  resize(env: ModeEnv): void {
    this.env = env
    this.aspect = env.width / Math.max(1, env.height)
    this.mat.uniforms.uRes.value.set(env.width, env.height)
  }

  private stampEllipse(cx: number, cy: number, rx: number, ry: number, amount: number): void {
    const ix = Math.round(cx * MW)
    const iy = Math.round((1 - cy) * MH)
    const irx = Math.max(1, rx * MW)
    const iry = Math.max(1, ry * MH)
    for (let y = Math.max(0, iy - Math.ceil(iry)); y < Math.min(MH, iy + Math.ceil(iry)); y++) {
      for (let x = Math.max(0, ix - Math.ceil(irx)); x < Math.min(MW, ix + Math.ceil(irx)); x++) {
        const dx = (x - ix) / irx
        const dy = (y - iy) / iry
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d > 1) continue
        const fall = Math.pow(1 - d * d, 0.6)
        const idx = y * MW + x
        this.mask[idx] = Math.max(this.mask[idx], Math.round(amount * fall))
      }
    }
  }

  private stampHandPoints(hand: { landmarks: { x: number; y: number }[] }): void {
    // palm as a broad ellipse
    const palm = hand.landmarks[9]
    this.stampEllipse(palm.x, palm.y, 0.075, 0.09, 255)
    for (const i of [4, 8, 12, 16, 20]) {
      const p = hand.landmarks[i]
      this.stampEllipse(p.x, p.y, 0.032, 0.032, 245)
    }
    for (const i of [5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19]) {
      const p = hand.landmarks[i]
      this.stampEllipse(p.x, p.y, 0.024, 0.028, 235)
    }
  }

  private flushMask(): void {
    this.maskTex.needsUpdate = true
  }

  update(frame: ModeFrame): void {
    const { hands, dt, time } = frame
    this.time = time
    this.mat.uniforms.uTime.value = time
    this.mat.uniforms.uFog.value.set(this.env.palette.mist)
    this.mat.uniforms.uTint.value.set('#ffffff')

    // wipe with every hand
    for (const hand of hands.hands) this.stampHandPoints(hand)

    // autopilot: a slow invisible hand wipes a meandering path when nobody is there
    if (hands.hands.length === 0) {
      this.autoAngle += dt * 0.24
      const cx = 0.5 + Math.cos(this.autoAngle) * 0.22
      const cy = 0.46 + Math.sin(this.autoAngle * 0.8) * 0.16
      this.stampEllipse(cx, cy, 0.12, 0.15, 185)
    }

    // fog returns everywhere, slowly
    const decay = Math.max(0.6, dt * 30)
    for (let i = 0; i < this.mask.length; i++) {
      const v = this.mask[i] - decay
      this.mask[i] = v > 0 ? v : 0
    }
    this.flushMask()
  }

  render(renderer: THREE.WebGLRenderer): void {
    renderer.render(this.scene, this.camera)
  }

  drawOverlay(ink: Ink2D): void {
    const w = ink.width
    const h = ink.height
    // glass pane frame: double hairline + corner brackets
    const inset = 18
    ink.polygon(
      [
        { x: inset, y: inset },
        { x: w - inset, y: inset },
        { x: w - inset, y: h - inset },
        { x: inset, y: h - inset },
      ],
      { color: 'rgba(28,33,26,0.32)', width: 1.1, alpha: 0.9 },
    )
    ink.polygon(
      [
        { x: inset + 5, y: inset + 5 },
        { x: w - inset - 5, y: inset + 5 },
        { x: w - inset - 5, y: h - inset - 5 },
        { x: inset + 5, y: h - inset - 5 },
      ],
      { color: 'rgba(246,241,231,0.35)', width: 0.7, alpha: 0.8 },
    )
    for (const [cornerX, cornerY, dx, dy] of [
      [inset, inset, 1, 1],
      [w - inset, inset, -1, 1],
      [inset, h - inset, 1, -1],
      [w - inset, h - inset, -1, -1],
    ] as const) {
      ink.line(cornerX, cornerY, cornerX + dx * 18, cornerY, { color: 'rgba(28,33,26,0.42)', width: 1.2, alpha: 0.9 })
      ink.line(cornerX, cornerY, cornerX, cornerY + dy * 18, { color: 'rgba(28,33,26,0.42)', width: 1.2, alpha: 0.9 })
    }
    ink.line(24, 76, 24, h - 24, { color: 'rgba(28,33,26,0.14)', width: 0.8 })
    ink.label('ADIANTUM CAPILLUS-VENERIS', 24, 34, {
      size: 10,
      letterSpacing: 1.6,
      color: 'rgba(28,33,26,0.45)',
    })
    ink.label('晨雾 · MIST', 24, 52, { size: 11, family: 'display', color: 'rgba(28,33,26,0.7)', letterSpacing: 1 })
    ink.label(this.env.season === 'winter' ? 'winter window' : 'season window', w - 24, h - 30, {
      size: 10,
      align: 'right',
      color: 'rgba(28,33,26,0.4)',
      letterSpacing: 1.2,
    })
    ink.label('wipe the glass', 24, h - 30, { size: 10, color: 'rgba(28,33,26,0.4)', letterSpacing: 1.2 })
    ink.frameMarks('rgba(28,33,26,0.26)', 22)
    ink.vignette(this.env.palette, 0.1)
  }

  collect(): SpecimenSeed {
    return { mode: 'mist', season: this.env.season, seed: this.collectSeed() }
  }

  collectSeed(): number {
    let cleared = 0
    for (let i = 0; i < this.mask.length; i += 7) cleared += this.mask[i]
    const seed = seedFromParts('mist', this.env.season, Math.round(cleared / 1000), Math.round(this.time))
    this.lastCollect = (seed ^ randomSeed()) >>> 0
    return this.lastCollect
  }

  a11ySummary(): string {
    const cleared = this.mask.reduce((a, b) => a + (b > 90 ? 1 : 0), 0) / this.mask.length
    return `晨雾 MIST：玻璃上凝结着程序化水雾；手掌擦开约 ${Math.round(cleared * 100)}% 的面积，露出压花图版与手写句，雾会慢慢回来。`
  }

  clear(): void {
    this.mask.fill(0)
    this.flushMask()
  }

  dispose(): void {
    this.mat.dispose()
    this.maskTex.dispose()
    this.plateTex?.dispose()
  }
}
