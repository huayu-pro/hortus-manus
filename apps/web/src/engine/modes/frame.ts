/**
 * FRAME / 花窗 — the hero.
 *
 * A window drawn by the hands. Outside: cream laid paper (or the camera feed,
 * washed to a desaturated plate). Inside: a real public-domain peony photograph,
 * breathing at 1.02–1.08× with a soft watercolour edge. Open palm opens and
 * warms the bloom; a fist closes it to a soft bud (mask + scale, not geometry);
 * a pinch plucks a petal that falls and turns into a seed.
 *
 * The procedural petal mesh is kept only as a fallback for the first seconds of
 * boot or if /plates is unavailable — it is never the hero.
 */

import * as THREE from 'three'
import type { HandFrame, ModeId, SpecimenSeed, Season } from '@hortus/shared'
import { randomSeed, seedFromParts } from '@hortus/shared'
import type { Ink2D } from '../Ink2D'
import type { GardenMode, ModeEnv, ModeFrame } from './types'
import { NOISE_GLSL } from './glsl'
import {
  clamp,
  createQuad,
  damp,
  fillPetalSeeds,
  fullscreenMaterial,
  handOpenness,
  makeInstancedPetal,
  makePaperBackground,
  resizePaperBackground,
} from './shared'

const MAX_PORTAL = 24

const WINDOW_FRAG = /* glsl */ `
uniform sampler2D uPhoto;
uniform sampler2D uPaper;
uniform sampler2D uWatercolor;
uniform sampler2D uVideo;
uniform float uHasPhoto;
uniform float uHasVideo;
uniform float uPhotoAspect;
uniform float uAspect;
uniform vec2 uPortal[24];
uniform int uCount;
uniform vec4 uBBox;          // minx, miny, maxx, maxy in shader uv (y up)
uniform vec2 uCenter;
uniform float uRotation;
uniform float uOpen;
uniform float uTime;
uniform vec3 uPaperColor;
uniform vec3 uSeasonTint;
uniform vec3 uInk;
varying vec2 vUv;

${NOISE_GLSL}

float sdPolygon(vec2 p, out bool inside, out float dist) {
  inside = false;
  dist = 1.0;
  for (int i = 0; i < 24; i++) {
    if (i >= uCount) break;
    vec2 a = uPortal[i];
    vec2 b = uPortal[(i + 1) % 24];
    if (i == uCount - 1) b = uPortal[0];
    vec2 ab = b - a;
    dist = min(dist, abs(ab.x * (a.y - p.y) - (a.x - p.x) * ab.y) / max(0.0001, length(ab)));
    bool cond = ((a.y > p.y) != (b.y > p.y)) &&
                (p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y + 0.00001) + a.x);
    if (cond) inside = !inside;
  }
  return inside ? 1.0 : 0.0;
}

void main(){
  vec2 uv = vUv;
  bool inside;
  float edge;
  float ins = sdPolygon(uv, inside, edge);
  float wobble = snoise(vec3(uv * vec2(26.0, 22.0), uTime * 0.02)) * 0.008 + snoise(vec3(uv * 90.0, 2.0)) * 0.003;
  float edgeW = edge + wobble;
  float cover = ins * smoothstep(0.002, 0.016, edgeW);

  // --- paper / camera outside the window ---------------------------------
  vec3 paper = texture2D(uPaper, uv * vec2(uAspect, 1.0) * 0.55).rgb;
  vec3 wash = texture2D(uWatercolor, uv * vec2(uAspect, 1.0) * 0.36 + 0.21).rgb;
  vec3 col = mix(paper, wash, 0.18) * uPaperColor;
  col *= vec3(1.035, 1.005, 0.945);
  col *= 0.95 + 0.09 * smoothstep(0.0, 1.15, uv.y);

  if (uHasVideo > 0.5) {
    vec3 vid = texture2D(uVideo, vec2(1.0 - uv.x, uv.y)).rgb;
    float lum = dot(vid, vec3(0.299, 0.587, 0.114));
    vec3 plate = vec3(lum) * vec3(1.0, 0.975, 0.93);
    col = mix(col * 0.95, plate, 0.34);
    col = mix(col, col * uSeasonTint, 0.14);
  }

  // --- photographic bloom inside -----------------------------------------
  vec2 bmin = uBBox.xy;
  vec2 bmax = uBBox.zw;
  vec2 span = max(vec2(0.002), bmax - bmin);
  vec2 puv = (uv - bmin) / span;
  float bboxAspect = (span.x * uAspect) / max(0.001, span.y);
  vec2 fit = uPhotoAspect > bboxAspect
    ? vec2(bboxAspect / uPhotoAspect, 1.0)
    : vec2(1.0, uPhotoAspect / bboxAspect);
  puv = (puv - 0.5) * fit + 0.5;
  // breathing / parallax: 1.02 at fist → 1.08 at open
  float breath = 1.02 + 0.055 * uOpen + 0.012 * sin(uTime * 0.23);
  puv = (puv - 0.5) / breath + 0.5;
  puv += vec2(sin(uTime * 0.11) * 0.006, cos(uTime * 0.09) * 0.004);
  // slight turn with the window
  vec2 rq = puv - 0.5;
  float cr = cos(uRotation * 0.25);
  float sr = sin(uRotation * 0.25);
  puv = vec2(rq.x * cr - rq.y * sr, rq.x * sr + rq.y * cr) + 0.5;

  vec3 photo = texture2D(uPhoto, clamp(puv, 0.001, 0.999)).rgb;
  // warm / open the light
  vec3 warm = mix(vec3(0.72, 0.68, 0.62), vec3(1.05, 1.0, 0.93), uOpen);
  photo *= warm;
  photo = pow(max(photo, vec3(0.0)), vec3(0.9));   // lifted print, not a screen photo
  photo *= mix(vec3(1.0), uSeasonTint, 0.08);
  photo += (texture2D(uPaper, puv * 4.0).rgb - 0.5) * 0.016;
  photo = mix(photo, photo * vec3(1.06, 1.02, 0.95), smoothstep(0.55, 1.0, uOpen) * 0.4);

  // bloom ellipse: a fist contracts the photo into a soft bud
  vec2 halfSpan = span * 0.5;
  vec2 q = (uv - uCenter) / max(vec2(0.01), halfSpan);
  float bloomR = mix(0.7, 1.14, uOpen) + 0.02 * sin(uTime * 0.3);
  float bloom = smoothstep(bloomR + 0.12, bloomR - 0.07, length(q));
  float photoMask = cover * bloom;

  // watercolour edge bleed: pigment gathers where photo meets paper
  float bleed = cover * (1.0 - smoothstep(0.0, 0.1, edgeW));
  vec3 pigment = mix(paper * 0.72, uSeasonTint * 0.78, 0.4);
  photo = mix(photo, pigment, bleed * 0.14);

  col = mix(col, photo, photoMask);

  // window shadow + a faint inner highlight ring
  float outsideShadow = smoothstep(0.06, 0.0, edgeW) * (1.0 - ins * 0.55);
  col = mix(col, uInk, outsideShadow * 0.14);
  float innerLight = ins * (1.0 - smoothstep(0.0, 0.02, edgeW)) * 0.02;
  col += vec3(innerLight, innerLight * 0.96, innerLight * 0.88);

  if (ins > 0.5 && uHasPhoto < 0.5) discard;
  gl_FragColor = vec4(col, 1.0);
}
`

const PETAL_VERT = /* glsl */ `
uniform float uOpen;
uniform float uTime;
uniform float uScale;
uniform vec2 uCenter;
attribute vec4 aSeed;
varying vec2 vUvP;
varying float vLayer;
void main(){
  float t = position.y + 0.5;
  float layer = aSeed.y;
  float prof = pow(sin(clamp(t, 0.0, 1.0) * 3.14159265), 0.5);
  float w = mix(prof, 0.14, smoothstep(0.9, 1.0, t));
  float petalLen = mix(0.18, 0.4, layer) * (0.6 + 0.4 * uOpen);
  float radius = mix(0.012, 0.36, pow(layer, 0.8)) * (0.2 + 0.8 * uOpen);
  float lx = position.x * w * petalLen * 1.15;
  float ly = t * petalLen;
  float angle = aSeed.x + (1.0 - uOpen) * 0.2 * (layer - 0.5);
  vec2 dir = vec2(cos(angle), sin(angle));
  vec2 perp = vec2(-dir.y, dir.x);
  vec2 p = dir * (radius + ly) + perp * lx;
  p += dir * sin(uTime * 0.5 + aSeed.z * 6.2831) * 0.005;
  vUvP = vec2(position.x + 0.5, t);
  vLayer = layer;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(uCenter + p * uScale, 0.0, 1.0);
}
`

const PETAL_FRAG = /* glsl */ `
uniform vec3 uColorDeep;
uniform vec3 uColorLight;
uniform vec3 uColorEdge;
uniform float uOpen;
varying vec2 vUvP;
varying float vLayer;
${NOISE_GLSL}
void main(){
  float across = vUvP.x;
  float along = vUvP.y;
  float mottle = snoise(vec3(across * 7.0, along * 8.0, vLayer * 5.0)) * 0.5 + 0.5;
  vec3 col = mix(uColorDeep, uColorLight, smoothstep(0.0, 0.85, along) * 0.75 + mottle * 0.2);
  float rim = smoothstep(0.7, 1.0, abs(across * 2.0 - 1.0)) * 0.4 + smoothstep(0.84, 1.0, along) * 0.3;
  col = mix(col, uColorEdge, rim * 0.4);
  col *= 0.88 + 0.12 * smoothstep(0.0, 0.4, along);
  float alpha = smoothstep(0.02, 0.3, along) * (0.3 + 0.18 * vLayer) * (0.35 + 0.65 * uOpen);
  gl_FragColor = vec4(col, alpha);
}
`

interface PluckedPetal {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  spin: number
  life: number
  maxLife: number
  size: number
  landed: boolean
  seedPhase: number
}

export class FrameMode implements GardenMode {
  readonly id: ModeId = 'frame'
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  private env!: ModeEnv
  private bg: THREE.Mesh | null = null
  private windowMat: THREE.ShaderMaterial | null = null
  private petalMesh: THREE.Mesh | null = null
  private petalMat: THREE.ShaderMaterial | null = null
  private petalSeeds: Float32Array | null = null
  private portal: { x: number; y: number }[] = []
  private portalTarget: { x: number; y: number }[] = []
  private open = 0.62
  private openTarget = 0.62
  private pinchWas = false
  private area = 0.2
  private center = { x: 0.5, y: 0.5 }
  private bbox = { minX: 0.25, minY: 0.15, maxX: 0.75, maxY: 0.85 }
  private petals: PluckedPetal[] = []
  private lastCollect = 0
  private handPresent = false
  private photo: THREE.Texture | null = null
  private photoAspect = 1.5
  private petalCount = 140
  private time = 0

  init(env: ModeEnv): void {
    this.env = env
    this.camera.position.set(0, 0, 5)
    this.bg = makePaperBackground(env, { light: 1.0 })
    this.scene.add(this.bg)

    // Fallback petal mesh (hidden whenever the photo plate is available)
    const count = Math.round(this.petalCount * (0.55 + env.quality * 0.45))
    this.petalCount = count
    const { geometry, seeds } = makeInstancedPetal(count)
    fillPetalSeeds(seeds)
    this.petalSeeds = seeds
    const pm = new THREE.ShaderMaterial({
      vertexShader: PETAL_VERT,
      fragmentShader: PETAL_FRAG,
      uniforms: {
        uOpen: { value: 0.62 },
        uTime: { value: 0 },
        uScale: { value: 1 },
        uCenter: { value: new THREE.Vector2(0, 0) },
        uColorDeep: { value: new THREE.Color(env.palette.peony) },
        uColorLight: { value: new THREE.Color(env.palette.blush) },
        uColorEdge: { value: new THREE.Color(env.palette.seasonDeep) },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    this.petalMat = pm
    this.petalMesh = new THREE.Mesh(geometry, pm)
    this.petalMesh.frustumCulled = false
    this.petalMesh.renderOrder = 10
    this.petalMesh.visible = false
    this.scene.add(this.petalMesh)

    this.windowMat = fullscreenMaterial(WINDOW_FRAG, {
      uPhoto: { value: env.assets.paper },
      uPaper: { value: env.assets.paper },
      uWatercolor: { value: env.assets.watercolor },
      uVideo: { value: env.assets.paper },
      uHasPhoto: { value: 0 },
      uHasVideo: { value: 0 },
      uPhotoAspect: { value: 1.5 },
      uAspect: { value: 1.6 },
      uPortal: { value: Array.from({ length: MAX_PORTAL }, () => new THREE.Vector2()) },
      uCount: { value: 4 },
      uBBox: { value: new THREE.Vector4(0.25, 0.15, 0.75, 0.85) },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uRotation: { value: 0 },
      uOpen: { value: 0.62 },
      uTime: { value: 0 },
      uPaperColor: { value: new THREE.Color(1, 1, 1) },
      uSeasonTint: { value: new THREE.Color(env.palette.seasonAccent) },
      uInk: { value: new THREE.Color(env.palette.ink) },
    })
    this.windowMat.transparent = true
    this.windowMat.depthTest = false
    const win = createQuad(this.windowMat)
    win.renderOrder = 2000
    this.scene.add(win)

    this.portalTarget = this.defaultPortal(0)
    this.portal = this.portalTarget.map((p) => ({ ...p }))
    this.refreshAssets()
    this.resize(env)
  }

  refreshAssets(): void {
    if (!this.env) return
    const season = this.env.season
    const pick =
      season === 'summer'
        ? this.env.assets.plateAndrews
        : season === 'autumn'
          ? this.env.assets.plateBotmag
          : season === 'winter'
            ? this.env.assets.platePeony
            : this.env.assets.plateRed
    const chosen =
      pick ??
      this.env.assets.plateRed ??
      this.env.assets.plateAndrews ??
      this.env.assets.plateBotmag ??
      this.env.assets.platePeony
    this.photo = chosen
    if (chosen?.image) {
      const img = chosen.image as HTMLImageElement
      this.photoAspect = img.width && img.height ? img.width / img.height : 1.5
    }
    if (this.windowMat) {
      this.windowMat.uniforms.uPhoto.value = chosen ?? this.env.assets.paper
      this.windowMat.uniforms.uHasPhoto.value = chosen ? 1 : 0
      this.windowMat.uniforms.uPhotoAspect.value = this.photoAspect
      this.windowMat.uniforms.uPaper.value = this.env.assets.paper
      this.windowMat.uniforms.uWatercolor.value = this.env.assets.watercolor
    }
    if (this.petalMesh) this.petalMesh.visible = !chosen
  }

  private defaultPortal(time: number): { x: number; y: number }[] {
    const breathe = 1 + Math.sin(time * 0.28) * 0.018
    const cx = 0.5
    const cy = 0.5
    const w = this.env?.width ?? 1440
    const h = this.env?.height ?? 900
    // plate diameter follows the shorter side, so 390×844 gets a real round window
    const radiusPx = Math.min(w, h) * 0.38 * breathe
    const rx = radiusPx / Math.max(1, w)
    const ry = radiusPx / Math.max(1, h)
    const out: { x: number; y: number }[] = []
    const n = 24
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2
      const wob = 1 + Math.sin(a * 3 + 0.7) * 0.035 + Math.cos(a * 2 - 0.4) * 0.025
      out.push({
        x: cx + Math.cos(a) * rx * wob,
        y: cy + Math.sin(a) * ry * wob,
      })
    }
    return out
  }

  private targetPortal(frame: HandFrame, time: number): { x: number; y: number }[] {
    const portal = frame.gesture.portal
    if (frame.gesture.gesture === 'frame' && portal && portal.points.length >= 3) {
      const area = Math.abs(polygonArea(portal.points))
      if (area > 0.02) {
        return portal.points
          .slice(0, MAX_PORTAL)
          .map((p) => ({ x: clamp(p.x, 0.08, 0.92), y: clamp(p.y, 0.08, 0.92) }))
      }
    }
    return this.defaultPortal(time)
  }

  resize(env: ModeEnv): void {
    this.env = env
    const aspect = env.width / Math.max(1, env.height)
    if (this.bg) resizePaperBackground(this.bg, env)
    if (this.windowMat) {
      this.windowMat.uniforms.uAspect.value = aspect
      this.windowMat.uniforms.uPaper.value = env.assets.paper
      this.windowMat.uniforms.uWatercolor.value = env.assets.watercolor
    }
  }

  update(frame: ModeFrame): void {
    const { hands, dt, time } = frame
    this.time = time
    this.handPresent = hands.hands.length > 0
    const gesture = hands.gesture.gesture

    this.portalTarget = this.targetPortal(hands, time)
    if (this.portal.length !== this.portalTarget.length) this.portal = this.portalTarget.map((p) => ({ ...p }))
    for (let i = 0; i < this.portal.length; i++) {
      const a = this.portal[i]
      const b = this.portalTarget[i]
      a.x = damp(a.x, b.x, 8, dt)
      a.y = damp(a.y, b.y, 8, dt)
    }
    this.area = polygonArea(this.portal)
    this.center = polyCenter(this.portal)
    this.bbox = polyBBox(this.portal)

    const rawOpen = this.handPresent ? handOpenness(hands.hands) : 0.66 + Math.sin(time * 0.22) * 0.12
    this.openTarget = gesture === 'fist' ? 0.04 : gesture === 'pinch' ? 0.72 : clamp(0.22 + rawOpen * 0.82)
    this.open = damp(this.open, this.openTarget, 4.5, dt)

    if (this.windowMat) {
      const u = this.windowMat.uniforms
      const arr = u.uPortal.value as THREE.Vector2[]
      for (let i = 0; i < MAX_PORTAL; i++) {
        const p = this.portal[Math.min(i, this.portal.length - 1)] ?? this.portal[0]
        arr[i].set(p.x, 1 - p.y)
      }
      u.uCount.value = Math.min(MAX_PORTAL, Math.max(3, this.portal.length))
      u.uBBox.value.set(this.bbox.minX, 1 - this.bbox.maxY, this.bbox.maxX, 1 - this.bbox.minY)
      u.uCenter.value.set(this.center.x, 1 - this.center.y)
      const rot = Math.atan2(
        (this.portal[1]?.y ?? 0) - (this.portal[0]?.y ?? 0),
        (this.portal[1]?.x ?? 1) - (this.portal[0]?.x ?? 0),
      )
      u.uRotation.value = rot
      u.uOpen.value = this.open
      u.uTime.value = time
      u.uSeasonTint.value.set(this.env.palette.seasonAccent)
      u.uPaperColor.value.setRGB(1, 1, 1)
      u.uInk.value.set(this.env.palette.ink)
      u.uHasPhoto.value = this.photo ? 1 : 0
      const video = this.env.video ?? null
      u.uHasVideo.value = video ? 1 : 0
      if (video) u.uVideo.value = video
    }

    if (this.petalMat) {
      const aspect = this.env.width / Math.max(1, this.env.height)
      const worldX = (this.center.x - 0.5) * 2 * aspect
      const worldY = (0.5 - this.center.y) * 2
      const scale = clamp(Math.sqrt(Math.max(0.004, this.area)) * 1.7, 0.5, 1.15)
      this.petalMat.uniforms.uOpen.value = this.open
      this.petalMat.uniforms.uTime.value = time
      this.petalMat.uniforms.uScale.value = scale
      ;(this.petalMat.uniforms.uCenter.value as THREE.Vector2).set(worldX, worldY)
      this.petalMat.uniforms.uColorDeep.value.set(this.env.palette.peony)
      this.petalMat.uniforms.uColorLight.value.set(this.env.palette.blush)
      this.petalMat.uniforms.uColorEdge.value.set(this.env.palette.seasonDeep)
    }

    // pinch plucks a petal
    const pinching = gesture === 'pinch'
    if (pinching && !this.pinchWas) this.pluck(4)
    if (pinching && Math.random() < dt * 4) this.pluck(1)
    this.pinchWas = pinching
    this.stepPetals(dt)
  }

  private pluck(n: number): void {
    const w = this.env.width
    const h = this.env.height
    for (let i = 0; i < n; i++) {
      const p = this.portal[Math.floor(Math.random() * this.portal.length)]
      if (!p) continue
      this.petals.push({
        x: p.x * w + (Math.random() - 0.5) * 30,
        y: p.y * h + Math.random() * 30,
        vx: (Math.random() - 0.5) * 26,
        vy: 8 + Math.random() * 16,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 1.6,
        life: 0,
        maxLife: 7 + Math.random() * 3,
        size: 7 + Math.random() * 7,
        landed: false,
        seedPhase: Math.random() * 6.28,
      })
    }
  }

  private stepPetals(dt: number): void {
    const h = this.env.height
    for (let i = this.petals.length - 1; i >= 0; i--) {
      const p = this.petals[i]
      p.life += dt
      if (p.life > p.maxLife) {
        this.petals.splice(i, 1)
        continue
      }
      if (p.landed) continue
      p.vy += 9 * dt
      p.vx += Math.sin(p.life * 1.8 + p.seedPhase) * 10 * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.rot += p.spin * dt
      if (p.y > h - 74) {
        p.landed = true
        p.y = h - 74 - Math.random() * 8
        p.vx = 0
        p.vy = 0
      }
    }
  }

  render(renderer: THREE.WebGLRenderer): void {
    renderer.render(this.scene, this.camera)
  }

  drawOverlay(ink: Ink2D): void {
    const w = ink.width
    const h = ink.height
    const pts = this.portal.map((p) => ({ x: p.x * w, y: p.y * h }))
    // paper shadow under the cut window
    ink.fillPolygon(
      pts.map((p) => ({ x: p.x + 7, y: p.y + 9 })),
      'rgba(28,33,26,0.09)',
      0.55,
    )
    // window edge: cut paper + ink rule + a hairline shadow
    ink.polygon(pts, { color: 'rgba(28,33,26,0.5)', width: 1.3, alpha: 0.9 })
    ink.polygon(
      pts.map((p) => ({ x: p.x + 1.6, y: p.y + 2.2 })),
      { color: 'rgba(28,33,26,0.10)', width: 1, alpha: 0.8 },
    )
    // dew beads along the window edge
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]
      const b = pts[(i + 1) % pts.length]
      const len = Math.hypot(b.x - a.x, b.y - a.y)
      const n = Math.max(1, Math.floor(len / 52))
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n
        const x = a.x + (b.x - a.x) * t
        const y = a.y + (b.y - a.y) * t
        const r = 1 + ((i * 7 + k * 13) % 5) * 0.45
        ink.dew(x, y, r, this.env.palette.mist, 0.5 + ((i + k) % 3) * 0.12)
      }
    }
    // pollen dust inside the window
    const cx = this.center.x * w
    const cy = this.center.y * h
    const rMax = Math.min(w, h) * 0.3
    for (let i = 0; i < 18; i++) {
      const a = i * 2.39996 + 0.3 + this.time * 0.05
      const rr = (0.2 + ((i * 0.37) % 0.8)) * rMax
      ink.dot(
        cx + Math.cos(a) * rr,
        cy + Math.sin(a) * rr * 0.82,
        0.7 + (i % 4) * 0.35,
        'rgba(216,168,78,0.5)',
        0.55 + (i % 3) * 0.1,
      )
    }
    // plucked petals → seeds
    for (const p of this.petals) {
      const ctx = ink.ctx
      ctx.save()
      const fade = Math.min(1, (p.maxLife - p.life) / 1.2)
      ctx.globalAlpha *= fade * ink.alpha * 0.9
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      if (!p.landed) {
        const g = ctx.createLinearGradient(0, -p.size, 0, p.size)
        g.addColorStop(0, 'rgba(232,196,190,0.95)')
        g.addColorStop(1, 'rgba(201,127,127,0.6)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.ellipse(0, 0, p.size * 0.52, p.size, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
      if (p.landed) {
        const sway = Math.sin(p.life * 2 + p.seedPhase) * 2
        ink.path(
          [
            { x: p.x, y: p.y },
            { x: p.x + sway, y: p.y - 10 },
            { x: p.x - sway * 0.6, y: p.y - 18 },
          ],
          { color: 'rgba(74,90,66,0.5)', width: 0.8, alpha: fade * 0.8 },
        )
        ink.dot(p.x, p.y - 18, 1.2, 'rgba(216,168,78,0.65)', fade * 0.8)
        for (let k = 0; k < 3; k++) {
          const a2 = k * 2.1 + p.seedPhase
          ink.line(p.x, p.y - 18, p.x + Math.cos(a2) * 5, p.y - 18 + Math.sin(a2) * 4, {
            color: 'rgba(246,241,231,0.5)',
            width: 0.5,
            alpha: fade * 0.5,
          })
        }
      }
    }
    // small pressed-leaf sketch in the lower margin
    const lx = 56
    const ly = h - 128
    ink.path(
      [
        { x: lx, y: ly + 70 },
        { x: lx + 8, y: ly + 36 },
        { x: lx + 20, y: ly + 8 },
      ],
      { color: 'rgba(74,90,66,0.4)', width: 1, alpha: 0.8 },
    )
    for (let i = 0; i < 5; i++) {
      const t = i / 5
      const bx = lx + t * 16
      const by = ly + 62 - t * 56
      ink.path(
        [
          { x: bx, y: by },
          { x: bx + 12, y: by - 8 },
          { x: bx + 20, y: by - 14 },
        ],
        { color: 'rgba(111,135,95,0.35)', width: 0.7, alpha: 0.7 },
      )
      ink.path(
        [
          { x: bx + 2, y: by - 2 },
          { x: bx - 8, y: by - 9 },
          { x: bx - 14, y: by - 14 },
        ],
        { color: 'rgba(111,135,95,0.3)', width: 0.7, alpha: 0.6 },
      )
    }
    // labels
    ink.label('PAEONIA SUFFRUTICOSA', 26, 34, { size: 10, letterSpacing: 1.6, color: 'rgba(28,33,26,0.45)' })
    ink.label('花窗 · FRAME', 26, 52, { size: 11, family: 'display', color: 'rgba(28,33,26,0.7)', letterSpacing: 1 })
    ink.label('PL. XII · PÆONIA MOUTAN', 26, h - 30, { size: 9, color: 'rgba(28,33,26,0.38)', letterSpacing: 1.4 })
    ink.label('a window made of hands', w - 26, h - 30, {
      size: 10,
      align: 'right',
      color: 'rgba(28,33,26,0.4)',
      letterSpacing: 1.2,
    })
    ink.frameMarks('rgba(28,33,26,0.26)', 22)
    ink.vignette(this.env.palette, 0.1)
  }

  collect(): SpecimenSeed {
    return { mode: 'frame', season: this.env.season, seed: this.collectSeed() }
  }

  collectSeed(): number {
    const seed = seedFromParts(
      'frame',
      this.env.season,
      Math.round(this.open * 1000),
      Math.round(this.area * 10000),
      Math.round(this.center.x * 1000),
      Math.round(this.center.y * 1000),
    )
    this.lastCollect = (seed ^ randomSeed()) >>> 0
    return this.lastCollect
  }

  a11ySummary(): string {
    return `花窗 FRAME：手围出的窗内是一幅芍药图版（pressed plate），以 ${Math.round(this.open * 100)}% 开度呼吸；当前${this.handPresent ? '有手' : '无手，幽灵手在演示'}。`
  }

  clear(): void {
    this.petals.length = 0
    this.open = 0.5
  }

  setSeason(): void {
    this.refreshAssets()
  }

  dispose(): void {
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      mesh.geometry?.dispose()
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat?.dispose()
    })
    this.petals.length = 0
  }
}

function polygonArea(poly: { x: number; y: number }[]): number {
  let a = 0
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    a += p.x * q.y - q.x * p.y
  }
  return Math.abs(a) * 0.5
}

function polyCenter(poly: { x: number; y: number }[]): { x: number; y: number } {
  let x = 0
  let y = 0
  for (const p of poly) {
    x += p.x
    y += p.y
  }
  return { x: x / Math.max(1, poly.length), y: y / Math.max(1, poly.length) }
}

function polyBBox(poly: { x: number; y: number }[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = 1
  let minY = 1
  let maxX = 0
  let maxY = 0
  for (const p of poly) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  return { minX, minY, maxX, maxY }
}

export type { Season }
