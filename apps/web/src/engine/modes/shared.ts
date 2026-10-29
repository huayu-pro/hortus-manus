/** Small shared helpers for the seven modes. */

import * as THREE from 'three'
import type { Hand, Vec3 } from '@hortus/shared'
import { QUAD_VERT } from './glsl'
import type { ModeEnv } from './types'

export function createQuad(material: THREE.Material): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(2, 2)
  const mesh = new THREE.Mesh(geo, material)
  mesh.frustumCulled = false
  mesh.renderOrder = -1000
  return mesh
}

/** Full-screen shader quad with a uv varying. */
export function fullscreenMaterial(fragmentShader: string, uniforms: Record<string, THREE.IUniform>): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: QUAD_VERT,
    fragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false,
    transparent: false,
  })
}

/** Screen (0..1, y down) → ortho world coords for an aspect-aware camera. */
export function screenToWorld(x: number, y: number, aspect: number): [number, number] {
  return [(x - 0.5) * 2 * aspect, (0.5 - y) * 2]
}

export function handPoint(hand: Hand, index: number, aspect: number): { x: number; y: number } {
  const p = hand.landmarks[index]
  const [x, y] = screenToWorld(p.x, p.y, aspect)
  return { x, y }
}

export function handCenter(hands: Hand[]): Vec3 | null {
  if (hands.length === 0) return null
  let x = 0
  let y = 0
  let z = 0
  let n = 0
  for (const hand of hands) {
    for (const i of [0, 5, 9, 13, 17]) {
      const p = hand.landmarks[i]
      x += p.x
      y += p.y
      z += p.z
      n++
    }
  }
  return { x: x / n, y: y / n, z: z / n }
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function clamp(v: number, a = 0, b = 1): number {
  return v < a ? a : v > b ? b : v
}

export function smoothstep(a: number, b: number, x: number): number {
  const t = clamp((x - a) / (b - a || 1e-6))
  return t * t * (3 - 2 * t)
}

export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

export function setCameraAspect(camera: THREE.OrthographicCamera | THREE.PerspectiveCamera, env: ModeEnv): void {
  const aspect = env.width / Math.max(1, env.height)
  if (camera instanceof THREE.OrthographicCamera) {
    camera.left = -aspect
    camera.right = aspect
    camera.top = 1
    camera.bottom = -1
    camera.updateProjectionMatrix()
  } else {
    camera.aspect = aspect
    camera.updateProjectionMatrix()
  }
}

/** Base plane geometry used for instanced petals (unit plane, y in -0.5..0.5). */
export function petalGeometry(): THREE.PlaneGeometry {
  return new THREE.PlaneGeometry(1, 1, 5, 8)
}

/**
 * Instanced buffer geometry with one custom vec4 per instance:
 * (angle, layer 0..1, phase, tone 0..1).
 */
export function makeInstancedPetal(count: number): {
  geometry: THREE.InstancedBufferGeometry
  seeds: Float32Array
} {
  const base = petalGeometry()
  const geo = new THREE.InstancedBufferGeometry()
  geo.index = base.index
  geo.setAttribute('position', base.getAttribute('position'))
  geo.setAttribute('uv', base.getAttribute('uv'))
  geo.instanceCount = count
  const seeds = new Float32Array(count * 4)
  const attr = new THREE.InstancedBufferAttribute(seeds, 4)
  attr.setUsage(THREE.DynamicDrawUsage)
  geo.setAttribute('aSeed', attr)
  return { geometry: geo, seeds }
}

export function fillPetalSeeds(seeds: Float32Array, golden = 2.399963229728653): void {
  const n = seeds.length / 4
  for (let i = 0; i < n; i++) {
    const k = n <= 1 ? 0 : i / (n - 1)
    // outer petals first in the buffer so inner petals draw on top
    const layer = 1 - k
    seeds[i * 4] = i * golden
    seeds[i * 4 + 1] = layer
    seeds[i * 4 + 2] = (i * 0.618) % 1
    seeds[i * 4 + 3] = (i * 0.37) % 1
  }
}

/** Approximate gesture openness from a hand (0 fist … 1 open). */
export function handOpenness(hands: Hand[]): number {
  if (hands.length === 0) return 0.55
  let sum = 0
  let count = 0
  for (const hand of hands) {
    const lm = hand.landmarks
    const scale = Math.max(0.008, Math.hypot(lm[5].x - lm[0].x, lm[5].y - lm[0].y))
    for (const [pip, tip] of [
      [6, 8],
      [10, 12],
      [14, 16],
      [18, 20],
    ] as const) {
      const dw = Math.hypot(lm[pip].x - lm[0].x, lm[pip].y - lm[0].y)
      const dt = Math.hypot(lm[tip].x - lm[0].x, lm[tip].y - lm[0].y)
      const ratio = dt / Math.max(1e-5, dw)
      sum += clamp((ratio - 1.0) / 0.4)
      count++
    }
  }
  return count ? sum / count : 0.55
}

/** Map a 0..1 hand coordinate into a full-screen shader uv (x already mirrored). */
export function uvOf(p: Vec3): { x: number; y: number } {
  return { x: p.x, y: p.y }
}

export function hexToVec3(hex: string): THREE.Color {
  return new THREE.Color(hex)
}

export function disposeObject(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
    else mat?.dispose()
  })
}

const PAPER_FRAG = /* glsl */ `
uniform sampler2D uPaper;
uniform sampler2D uWatercolor;
uniform float uAspect;
uniform vec3 uTint;
uniform vec3 uInk;
uniform float uLight;
varying vec2 vUv;
void main(){
  vec3 paper = texture2D(uPaper, vUv * vec2(uAspect, 1.0) * 0.55).rgb;
  vec3 wash = texture2D(uWatercolor, vUv * vec2(uAspect, 1.0) * 0.36 + 0.2).rgb;
  vec3 col = mix(paper, wash, 0.22) * uTint;
  // a soft pool of light from the upper left, a shadow at the lower right
  float d = length((vUv - vec2(0.42, 0.58)) * vec2(uAspect, 1.0));
  col += vec3(0.035, 0.03, 0.022) * smoothstep(0.75, 0.0, d) * uLight;
  col *= 0.96 + 0.06 * smoothstep(0.0, 1.1, vUv.y);
  col = mix(col, uInk, smoothstep(0.95, 0.35, length((vUv - 0.5) * vec2(1.2, 1.0))) * 0.06);
  gl_FragColor = vec4(col, 1.0);
}
`

/** Shared paper ground: paper + a watercolour wash + soft light. */
export function makePaperBackground(env: ModeEnv, opts: { light?: number; tint?: string } = {}): THREE.Mesh {
  const mat = fullscreenMaterial(PAPER_FRAG, {
    uPaper: { value: env.assets.paper },
    uWatercolor: { value: env.assets.watercolor },
    uAspect: { value: env.width / Math.max(1, env.height) },
    uTint: { value: new THREE.Color(opts.tint ?? '#ffffff') },
    uInk: { value: new THREE.Color(env.palette.ink) },
    uLight: { value: opts.light ?? 1 },
  })
  const mesh = createQuad(mat)
  mesh.renderOrder = -1000
  return mesh
}

/** Update a paper background's aspect uniform on resize. */
export function resizePaperBackground(mesh: THREE.Mesh | null, env: ModeEnv): void {
  if (!mesh) return
  const mat = mesh.material as THREE.ShaderMaterial
  mat.uniforms.uAspect.value = env.width / Math.max(1, env.height)
  mat.uniforms.uTint.value.set('#ffffff')
}

