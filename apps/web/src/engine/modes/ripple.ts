/**
 * RIPPLE / 雨池 — Monet's pond, painted with a full-screen water shader.
 *
 * The base colour comes from a public-domain Monet plate when available (a
 * painted watercolour pond otherwise). Surface normals are layered sines plus up
 * to 12 analytic ripples; the fingertip positions of every hand seed ripples as
 * they touch the water, and hand movement drags a soft wind across the surface.
 */

import * as THREE from 'three'
import type { HandFrame, ModeId, SpecimenSeed } from '@hortus/shared'
import { randomSeed, seedFromParts } from '@hortus/shared'
import type { Ink2D } from '../Ink2D'
import type { GardenMode, ModeEnv, ModeFrame } from './types'
import { NOISE_GLSL } from './glsl'
import { clamp, createQuad, fullscreenMaterial, handOpenness, smoothstep } from './shared'
import { paintPond } from '../textures'

const MAX_RIPPLES = 12

const WATER_FRAG = /* glsl */ `
uniform sampler2D uBase;
uniform float uTime;
uniform vec2 uRes;
uniform vec4 uRipples[12];
uniform int uCount;
uniform vec2 uWind;
uniform vec3 uTint;
uniform vec3 uSky;
uniform float uSeason;
varying vec2 vUv;

${NOISE_GLSL}

void main(){
  float aspect = uRes.x / max(1.0, uRes.y);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 grad = vec2(0.0);

  // long, slow swell
  float swell = snoise(vec3(p * 2.4, uTime * 0.045));
  grad += vec2(cos(p.x * 5.2 + uTime * 0.22), sin(p.y * 7.4 - uTime * 0.18)) * 0.0015;
  grad += vec2(swell * 0.0013, cos(p.y * 3.1 + uTime * 0.12) * 0.001);

  // finger ripples
  for (int i = 0; i < 12; i++) {
    if (i >= uCount) break;
    vec4 r = uRipples[i];
    vec2 c = vec2(r.x * aspect, r.y);
    float d = distance(p, c);
    float age = r.z;
    float wave = sin(d * 42.0 - age * 10.0) * exp(-d * 4.2) * exp(-age * 1.35) * r.w;
    grad += normalize(p - c + vec2(0.0001)) * wave * 0.0045;
  }

  grad += uWind * 0.004;

  vec2 duv = clamp(vUv + grad, 0.001, 0.999);
  vec3 col = texture2D(uBase, duv).rgb;
  vec3 col2 = texture2D(uBase, clamp(vUv + grad * 2.3, 0.001, 0.999)).rgb;
  col = mix(col, col2, 0.42);
  col = mix(col, uTint, 0.16);

  // specular from the perturbed normal
  vec3 n = normalize(vec3(-grad * 22.0, 1.0));
  vec3 lightDir = normalize(vec3(-0.35, 0.75, 0.6));
  float spec = pow(max(dot(n, lightDir), 0.0), 64.0);
  col += vec3(1.0, 0.975, 0.9) * spec * 0.32;

  // caustic filaments
  float caust = abs(sin((p.x + p.y) * 20.0 + snoise(vec3(p * 5.0, uTime * 0.2)) * 3.0));
  col += uSky * smoothstep(0.88, 1.0, caust) * 0.035;

  // fine pigment grain from the painting
  col += (texture2D(uBase, vUv * 7.0).rgb - 0.5) * 0.012;

  // vignette
  col *= 0.9 + 0.13 * smoothstep(0.05, 1.0, vUv.y);
  col = mix(col, vec3(0.09, 0.11, 0.08), smoothstep(0.55, 0.0, length((vUv - vec2(0.5)) * vec2(1.2, 1.0))) * 0.18);
  gl_FragColor = vec4(col, 1.0);
}
`

interface Ripple {
  x: number
  y: number
  age: number
  strength: number
}

export class RippleMode implements GardenMode {
  readonly id: ModeId = 'ripple'
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  private env!: ModeEnv
  private mat: THREE.ShaderMaterial
  private base: THREE.Texture
  private ripples: Ripple[] = []
  private tips = new Map<string, { x: number; y: number; t: number }>()
  private lastAuto = 0
  private wind = new THREE.Vector2()
  private handX = 0.5

  constructor() {
    this.base = new THREE.Texture()
    this.mat = fullscreenMaterial(WATER_FRAG, {
      uBase: { value: this.base },
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uRipples: { value: Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4()) },
      uCount: { value: 0 },
      uWind: { value: this.wind },
      uTint: { value: new THREE.Color('#ffffff') },
      uSky: { value: new THREE.Color('#c9d8d0') },
      uSeason: { value: 0 },
    })
  }

  init(env: ModeEnv): void {
    this.env = env
    this.base = env.assets.plateMonet ?? env.assets.pond
    this.mat.uniforms.uBase.value = this.base
    this.mat.uniforms.uTint.value.set(env.palette.water)
    this.mat.uniforms.uSky.value.set(env.palette.mist)
    const quad = createQuad(this.mat)
    this.scene.add(quad)
    this.camera.position.z = 5
    this.resize(env)
  }

  resize(env: ModeEnv): void {
    this.env = env
    this.mat.uniforms.uRes.value.set(env.width, env.height)
  }

  private spawn(x: number, y: number, strength = 1): void {
    if (this.ripples.length >= MAX_RIPPLES) this.ripples.shift()
    this.ripples.push({ x: clamp(x), y: clamp(y), age: 0, strength })
  }

  update(frame: ModeFrame): void {
    const { hands, dt, time } = frame
    this.mat.uniforms.uTime.value = time
    this.mat.uniforms.uRes.value.set(this.env.width, this.env.height)
    this.mat.uniforms.uTint.value.set(this.env.palette.water)
    this.mat.uniforms.uSky.value.set(this.env.palette.mist)

    // fingertip ripples
    let vx = 0
    let vy = 0
    let vn = 0
    for (let hi = 0; hi < hands.hands.length; hi++) {
      const hand = hands.hands[hi]
      for (const tipIndex of [4, 8, 12, 16, 20]) {
        const p = hand.landmarks[tipIndex]
        const key = `${hi}:${tipIndex}`
        const prev = this.tips.get(key)
        const moved = prev ? Math.hypot(p.x - prev.x, p.y - prev.y) : 0
        if (prev) {
          vx += (p.x - prev.x) / Math.max(dt, 1e-3)
          vy += (p.y - prev.y) / Math.max(dt, 1e-3)
          vn++
        }
        // slow drifting touch + sharp movement both make waves
        if (!prev || moved > 0.028 || time - prev.t > 0.55) {
          if (!prev || moved > 0.006 || time - prev.t > 0.55) this.spawn(p.x, p.y, 0.7 + Math.min(1, moved * 12))
          this.tips.set(key, { x: p.x, y: p.y, t: time })
        }
      }
      this.handX = hand.landmarks[9].x
    }
    if (hands.hands.length === 0 && time - this.lastAuto > 1.7) {
      this.lastAuto = time
      this.spawn(0.28 + Math.random() * 0.44, 0.3 + Math.random() * 0.4, 0.8)
    }
    const windScale = vn ? Math.min(0.35, Math.hypot(vx / vn, vy / vn) * 0.015) : 0
    this.wind.x += ((vx / Math.max(1, vn)) * 0.02 - this.wind.x) * Math.min(1, dt * 3)
    this.wind.y += ((vy / Math.max(1, vn)) * 0.02 - this.wind.y) * Math.min(1, dt * 3)
    this.wind.clampLength(0, 0.06)
    void windScale

    // age + drop
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i]
      r.age += dt
      if (r.age > 3.6) this.ripples.splice(i, 1)
    }
    const arr = this.mat.uniforms.uRipples.value as THREE.Vector4[]
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const r = this.ripples[i]
      if (r) arr[i].set(r.x, 1 - r.y, r.age, r.strength)
      else arr[i].set(0, 0, 99, 0)
    }
    this.mat.uniforms.uCount.value = this.ripples.length
  }

  render(renderer: THREE.WebGLRenderer): void {
    renderer.render(this.scene, this.camera)
  }

  drawOverlay(ink: Ink2D): void {
    const w = ink.width
    const h = ink.height
    // faint rings at recent ripples — the drawing hand's memory of the touch
    for (const r of this.ripples.slice(-4)) {
      const rad = 8 + r.age * 34
      ink.circle(r.x * w, r.y * h, rad, { color: 'rgba(246,241,231,0.20)', width: 0.8, alpha: 0.5 * (1 - r.age / 3.6) })
    }
    ink.label('NYMPHAEA · ATTRACTION', 24, 34, { size: 10, letterSpacing: 1.6, color: 'rgba(246,241,231,0.65)' })
    ink.label('雨池 · RIPPLE', 24, 52, { size: 11, family: 'display', color: 'rgba(246,241,231,0.9)', letterSpacing: 1 })
    ink.label('touch the water', w - 24, h - 30, { size: 10, align: 'right', color: 'rgba(246,241,231,0.55)', letterSpacing: 1.4 })
    ink.frameMarks('rgba(246,241,231,0.32)', 22)
    ink.vignette(this.env.palette, 0.14)
  }

  collect(): SpecimenSeed {
    return { mode: 'ripple', season: this.env.season, seed: this.collectSeed() }
  }

  collectSeed(): number {
    const seed = seedFromParts(
      'ripple',
      this.env.season,
      Math.round(this.handX * 1000),
      Math.round(this.ripples.length * 10 + (this.ripples[0]?.age ?? 0) * 10),
    )
    return (seed ^ randomSeed()) >>> 0
  }

  a11ySummary(): string {
    return `雨池 RIPPLE：水面以程序化法线流动，指尖每触碰一次就留下一圈逐渐平息的涟漪；当前有 ${this.ripples.length} 圈。`
  }

  refreshAssets(): void {
    if (this.env.assets.plateMonet) {
      this.base = this.env.assets.plateMonet
      this.mat.uniforms.uBase.value = this.base
    }
  }

  setSeason(season: string): void {
    void season
    this.mat.uniforms.uTint.value.set(this.env.palette.water)
    this.mat.uniforms.uSky.value.set(this.env.palette.mist)
  }

  clear(): void {
    this.ripples.length = 0
  }

  dispose(): void {
    this.mat.dispose()
    this.camera.clear?.()
  }
}

/** Keep the painter import referenced for the fallback asset builder. */
void paintPond
