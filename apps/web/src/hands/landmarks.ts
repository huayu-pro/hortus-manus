/** MediaPipe hand landmark indices + small vector helpers shared by every hand module. */

import type { Vec3 } from '@hortus/shared'

export const WRIST = 0
export const THUMB_CMC = 1
export const THUMB_MCP = 2
export const THUMB_IP = 3
export const THUMB_TIP = 4
export const INDEX_MCP = 5
export const INDEX_PIP = 6
export const INDEX_DIP = 7
export const INDEX_TIP = 8
export const MIDDLE_MCP = 9
export const MIDDLE_PIP = 10
export const MIDDLE_DIP = 11
export const MIDDLE_TIP = 12
export const RING_MCP = 13
export const RING_PIP = 14
export const RING_DIP = 15
export const RING_TIP = 16
export const PINKY_MCP = 17
export const PINKY_PIP = 18
export const PINKY_DIP = 19
export const PINKY_TIP = 20

/** Finger chains in MediaPipe order (thumb first). */
export const FINGER_CHAINS: readonly (readonly number[])[] = [
  [THUMB_CMC, THUMB_MCP, THUMB_IP, THUMB_TIP],
  [INDEX_MCP, INDEX_PIP, INDEX_DIP, INDEX_TIP],
  [MIDDLE_MCP, MIDDLE_PIP, MIDDLE_DIP, MIDDLE_TIP],
  [RING_MCP, RING_PIP, RING_DIP, RING_TIP],
  [PINKY_MCP, PINKY_PIP, PINKY_DIP, PINKY_TIP],
]

export const FINGER_TIPS = [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP]
export const PALM_INDICES = [WRIST, INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP]

/** Bone pairs used for the skeletal overlay. */
export const HAND_BONES: readonly (readonly [number, number])[] = [
  [WRIST, THUMB_CMC],
  [THUMB_CMC, THUMB_MCP],
  [THUMB_MCP, THUMB_IP],
  [THUMB_IP, THUMB_TIP],
  [WRIST, INDEX_MCP],
  [INDEX_MCP, INDEX_PIP],
  [INDEX_PIP, INDEX_DIP],
  [INDEX_DIP, INDEX_TIP],
  [WRIST, MIDDLE_MCP],
  [MIDDLE_MCP, MIDDLE_PIP],
  [MIDDLE_PIP, MIDDLE_DIP],
  [MIDDLE_DIP, MIDDLE_TIP],
  [WRIST, RING_MCP],
  [RING_MCP, RING_PIP],
  [RING_PIP, RING_DIP],
  [RING_DIP, RING_TIP],
  [WRIST, PINKY_MCP],
  [PINKY_MCP, PINKY_PIP],
  [PINKY_PIP, PINKY_DIP],
  [PINKY_DIP, PINKY_TIP],
  [INDEX_MCP, MIDDLE_MCP],
  [MIDDLE_MCP, RING_MCP],
  [RING_MCP, PINKY_MCP],
]

export function clamp(v: number, lo = 0, hi = 1): number {
  return v < lo ? lo : v > hi ? hi : v
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6))
  return t * t * (3 - 2 * t)
}

export function dist2(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function dist3(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/** Angle ABC at B in the image plane. */
export function angleAt(a: Vec3, b: Vec3, c: Vec3): number {
  const v1x = a.x - b.x
  const v1y = a.y - b.y
  const v2x = c.x - b.x
  const v2y = c.y - b.y
  const n1 = Math.hypot(v1x, v1y)
  const n2 = Math.hypot(v2x, v2y)
  if (n1 < 1e-6 || n2 < 1e-6) return 0
  return Math.acos(clamp((v1x * v2x + v1y * v2y) / (n1 * n2), -1, 1))
}

export function midpoint(a: Vec3, b: Vec3): Vec3 {
  return { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5, z: (a.z + b.z) * 0.5 }
}

export function centroid(points: readonly Vec3[]): Vec3 {
  let x = 0
  let y = 0
  let z = 0
  for (const p of points) {
    x += p.x
    y += p.y
    z += p.z
  }
  const n = Math.max(1, points.length)
  return { x: x / n, y: y / n, z: z / n }
}

export function handScale(hand: { landmarks: Vec3[] }): number {
  const lm = hand.landmarks
  return Math.max(0.001, dist2(lm[WRIST], lm[MIDDLE_MCP]))
}

/** Normalized palm centre (used by most modes as the hand's "origin"). */
export function palmCenter(hand: { landmarks: Vec3[] }): Vec3 {
  const lm = hand.landmarks
  return centroid(PALM_INDICES.map((i) => lm[i]))
}
