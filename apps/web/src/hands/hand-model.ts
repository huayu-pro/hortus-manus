/**
 * A small, dependency-free parametric hand model.
 *
 * It builds all 21 MediaPipe landmarks from a palm centre + rotation + per-finger
 * curl, so the same code can synthesise:
 *   · the JSON fixtures (recorded-style trajectories, see generate-fixtures.ts)
 *   · the ghost autopilot's fallback when no fixture can be loaded
 *   · pointer / touch "virtual hands" so pointer input has the same parity
 *
 * Canonical units: palm length (wrist → middle MCP) = 1.0, +u points at the
 * fingers, +v points toward the pinky, screen y is down.
 */

import type { Hand, Vec3 } from '@hortus/shared'

export interface HandPoseParams {
  /** palm centre in normalized screen space (0..1) */
  cx: number
  cy: number
  /** palm length in normalized units (0.10 ≈ a hand filling ~1/4 of the frame) */
  scale: number
  /** in-plane rotation in radians (0 = fingers point up) */
  rotation: number
  /** per-finger curl, thumb first, pinky last. 0 = straight, 1 = closed fist */
  curl: [number, number, number, number, number]
  /** finger splay multiplier, 1 = natural */
  spread?: number
  /** wrist roll, tilts the palm across the fingers (visual only) */
  roll?: number
  handedness?: 'Left' | 'Right'
  /**
   * Geometry mirror override: +1 keeps the canonical thumb on the -v side,
   * -1 mirrors it. Defaults from `handedness`; fixtures override it when they
   * need a pose that is anatomically unusual but visually right.
   */
  mirror?: 1 | -1
  /** per-landmark tremor amplitude in palm units */
  tremor?: number
  /** deterministic noise phase */
  phase?: number
}

interface V2 {
  u: number
  v: number
}

const WRIST: V2 = { u: 0, v: 0 }
const THUMB_CMC: V2 = { u: 0.24, v: -0.28 }
const THUMB_MCP: V2 = { u: 0.5, v: -0.47 }
const THUMB_IP: V2 = { u: 0.68, v: -0.6 }
const THUMB_TIP: V2 = { u: 0.84, v: -0.7 }
const INDEX_MCP: V2 = { u: 0.98, v: -0.3 }
const MIDDLE_MCP: V2 = { u: 1.02, v: -0.06 }
const RING_MCP: V2 = { u: 0.98, v: 0.16 }
const PINKY_MCP: V2 = { u: 0.86, v: 0.32 }

/** finger chains: base landmark, base angle (rad from +u toward +v), segment lengths */
const FINGERS: { base: V2; angle: number; segs: [number, number, number]; bias: number }[] = [
  // index, middle, ring, pinky — thumb is handled separately
  { base: INDEX_MCP, angle: -0.055, segs: [0.56, 0.31, 0.22], bias: 0.9 },
  { base: MIDDLE_MCP, angle: -0.012, segs: [0.61, 0.34, 0.24], bias: 1.0 },
  { base: RING_MCP, angle: 0.06, segs: [0.56, 0.31, 0.22], bias: 0.92 },
  { base: PINKY_MCP, angle: 0.19, segs: [0.42, 0.25, 0.19], bias: 0.78 },
]

function chain(
  base: V2,
  angle: number,
  segs: readonly number[],
  curl: number,
  spread: number,
  bendSign = -1,
): V2[] {
  const out: V2[] = [base]
  let p = { ...base }
  // cumulative flex: MCP, PIP, DIP — each segment keeps the bend of its parent
  const a1 = bendSign * curl * 0.95
  const a2 = bendSign * curl * 1.35
  const a3 = bendSign * curl * 0.95
  const angles = [angle + a1 * 0.3 * spread, angle + a1 + a2 * 0.25 * spread, angle + a1 + a2 + a3 * 0.2 * spread]
  for (let i = 0; i < segs.length; i++) {
    const len = segs[i]
    p = { u: p.u + Math.cos(angles[i]) * len, v: p.v + Math.sin(angles[i]) * len }
    out.push(p)
  }
  return out
}

function thumbChain(curl: number, spread: number): V2[] {
  const a = Math.atan2(THUMB_MCP.v - THUMB_CMC.v, THUMB_MCP.u - THUMB_CMC.u)
  const out: V2[] = [THUMB_CMC]
  const segs = [Math.hypot(THUMB_MCP.u - THUMB_CMC.u, THUMB_MCP.v - THUMB_CMC.v), 0.3, 0.26]
  let p = { ...THUMB_CMC }
  const flex1 = -curl * 0.75
  const flex2 = -curl * 1.0
  const angles = [a + flex1 * 0.25, a + flex1, a + flex1 + flex2]
  for (let i = 0; i < 3; i++) {
    p = { u: p.u + Math.cos(angles[i]) * segs[i], v: p.v + Math.sin(angles[i]) * segs[i] }
    out.push(p)
  }
  return out
}

function hashNoise(n: number, phase: number): number {
  const x = Math.sin(n * 127.1 + phase * 311.7) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

/** 21 canonical (u,v) points, in MediaPipe landmark order. */
export function canonicalPoints(p: HandPoseParams): V2[] {
  const curl = p.curl
  const spread = p.spread ?? 1
  const pts: V2[] = new Array(21)
  pts[0] = { ...WRIST }
  const thumb = thumbChain(curl[0], spread)
  pts[1] = thumb[0]
  pts[2] = thumb[1]
  pts[3] = thumb[2]
  pts[4] = thumb[3]
  // index..pinky → landmark blocks 5..8, 9..12, 13..16, 17..20
  for (let f = 0; f < 4; f++) {
    const spec = FINGERS[f]
    const c = curl[f + 1] * spec.bias
    const segs: [number, number, number] = [
      spec.segs[0] * (1 - 0.18 * c),
      spec.segs[1] * (1 - 0.2 * c),
      spec.segs[2] * (1 - 0.2 * c),
    ]
    const chainPts = chain(spec.base, spec.angle, segs, c, spread)
    // chainPts[0] is the MCP; mediapipe order is MCP, PIP, DIP, TIP
    for (let k = 0; k < 4; k++) pts[5 + f * 4 + k] = chainPts[k]
  }
  // Palm shear from wrist roll: rotate the whole hand around the palm centroid.
  const roll = p.roll ?? 0
  if (roll !== 0) {
    const c: V2 = { u: 0.58, v: 0.02 }
    const cs = Math.cos(roll)
    const sn = Math.sin(roll)
    for (const q of pts) {
      const du = q.u - c.u
      const dv = q.v - c.v
      q.u = c.u + du * cs - dv * sn
      q.v = c.v + du * sn + dv * cs
    }
  }
  return pts
}

const PALM_CENTROID = { u: 0.58, v: 0.0 }

/**
 * Builds a full `Hand` in normalized mirrored screen space.
 *
 * Mapping at rotation 0: canonical +u (wrist → fingers) points UP on screen
 * (screen y grows down), canonical +v (toward the pinky) points to the right.
 * A left hand is mirrored across the palm axis so its thumb faces the other way,
 * which is what a selfie camera actually sees.
 */
export function synthHand(p: HandPoseParams): Hand {
  const pts = canonicalPoints(p)
  const rot = p.rotation
  const cs = Math.cos(rot)
  const sn = Math.sin(rot)
  const s = p.scale
  const mirrored = p.mirror ?? ((p.handedness ?? 'Right') === 'Left' ? -1 : 1)
  const tremor = p.tremor ?? 0
  const phase = p.phase ?? 0
  const landmarks: Vec3[] = pts.map((q, i) => {
    const du = (q.u - PALM_CENTROID.u) * s
    const dv = (q.v - PALM_CENTROID.v) * s * mirrored
    // rotate in the screen plane; +u is screen-up
    let x = p.cx + (dv * cs - du * sn)
    let y = p.cy - (du * cs + dv * sn)
    if (tremor > 0) {
      const n1 = hashNoise(i * 3 + 1, phase) * tremor
      const n2 = hashNoise(i * 3 + 2, phase + 0.37) * tremor
      x += n1 * s * 0.5
      y += n2 * s * 0.5
    }
    // depth: fingers slightly closer to the camera than the wrist
    const depth = -0.055 * Math.hypot(q.u - PALM_CENTROID.u, q.v - PALM_CENTROID.v) - 0.01
    return { x, y, z: depth }
  })
  return {
    handedness: p.handedness ?? 'Right',
    score: 0.92,
    landmarks,
  }
}

/** Convenience: a relaxed open palm at a position. */
export function openHand(cx: number, cy: number, scale = 0.11, rotation = 0, handedness: 'Left' | 'Right' = 'Right'): Hand {
  return synthHand({ cx, cy, scale, rotation, curl: [0.04, 0.02, 0.02, 0.02, 0.02], handedness })
}

/** Convenience: a closed fist. */
export function fistHand(cx: number, cy: number, scale = 0.11, rotation = 0, handedness: 'Left' | 'Right' = 'Right'): Hand {
  return synthHand({ cx, cy, scale, rotation, curl: [0.9, 0.95, 0.98, 0.96, 0.9], handedness })
}
