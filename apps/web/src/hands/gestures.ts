/**
 * Gesture grammar: frame / open / pinch / fist / weave.
 *
 * Each pose is scored continuously, then a hysteresis + dwell debounce decides
 * the *discrete* gesture so the scene never flickers between two poses. The
 * portal (the flower-window quad) is derived geometrically from the thumb + index
 * tips of both hands, or from a single hand's thumb-index "L" frame.
 */

import type { Gesture, GestureState, Hand, PortalShape, Vec3 } from '@hortus/shared'
import {
  FINGER_CHAINS,
  INDEX_MCP,
  INDEX_TIP,
  MIDDLE_MCP,
  MIDDLE_TIP,
  PINKY_TIP,
  RING_TIP,
  THUMB_TIP,
  WRIST,
  angleAt,
  centroid,
  clamp,
  dist2,
  smoothstep,
} from './landmarks'

export interface HandPose {
  /** 0..1 per finger, thumb first, pinky last. 1 = fully extended. */
  ext: [number, number, number, number, number]
  extCount: number
  /** distance thumb-tip ↔ index-tip, in hand-scale units */
  pinch: number
  /** finger-tip fan width, in hand-scale units */
  spread: number
  /** true when thumb + index are out and the other three are folded */
  framePose: number
  /** palm centre */
  palm: Vec3
  scale: number
}

/** Per-finger extension: ratio of tip-to-wrist over pip-to-wrist distance. */
function fingerExtension(hand: Hand, chain: readonly number[]): number {
  const lm = hand.landmarks
  const wrist = lm[WRIST]
  const pip = lm[chain[2]]
  const tip = lm[chain[3]]
  const dW = dist2(wrist, pip)
  const dT = dist2(wrist, tip)
  if (dW < 1e-5) return 0
  const ratio = dT / dW
  // A finger pointing straight is ~1.45× the pip distance, a curled one ~0.8×.
  return clamp((ratio - 1.0) / 0.4)
}

export function analyzeHand(hand: Hand): HandPose {
  const lm = hand.landmarks
  const scale = Math.max(0.008, dist2(lm[WRIST], lm[MIDDLE_MCP]))
  const ext: HandPose['ext'] = [0, 0, 0, 0, 0]
  for (let i = 0; i < FINGER_CHAINS.length; i++) {
    ext[i] = fingerExtension(hand, FINGER_CHAINS[i])
  }
  // The thumb needs the extra joint-angle cue: a splayed thumb is straight.
  const thumbStraight = smoothstep(2.1, 2.7, angleAt(lm[1], lm[2], lm[3]))
  ext[0] = clamp(Math.max(ext[0], thumbStraight) * 1.15)
  const extCount = ext.filter((v) => v > 0.6).length
  const pinch = dist2(lm[THUMB_TIP], lm[INDEX_TIP]) / scale
  const spread =
    (dist2(lm[INDEX_TIP], lm[PINKY_TIP]) + dist2(lm[INDEX_TIP], lm[RING_TIP])) / (2 * scale)
  const framePose = clamp(
    Math.min(1, ext[0] * 1.4) *
      Math.min(1, ext[1] * 1.4) *
      (1 - smoothstep(0.25, 0.7, Math.max(ext[2], ext[3], ext[4]))),
  )
  return {
    ext,
    extCount,
    pinch,
    spread,
    framePose,
    palm: centroid([lm[WRIST], lm[INDEX_MCP], lm[MIDDLE_MCP], lm[PINKY_TIP]]),
    scale,
  }
}

/* -------------------------------------------------------------------------- */
/* Portal geometry                                                            */
/* -------------------------------------------------------------------------- */

interface P2 {
  x: number
  y: number
}

/** Andrew's monotone chain convex hull (2D, small point sets). */
function convexHull(points: P2[]): P2[] {
  if (points.length < 3) return points.slice()
  const pts = points
    .slice()
    .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x))
  const cross = (o: P2, a: P2, b: P2) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  const lower: P2[] = []
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop()
    lower.push(p)
  }
  const upper: P2[] = []
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop()
    upper.push(p)
  }
  lower.pop()
  upper.pop()
  return lower.concat(upper)
}

function polygonArea(poly: P2[]): number {
  let a = 0
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    a += p.x * q.y - q.x * p.y
  }
  return Math.abs(a) * 0.5
}

function polyCenter(poly: P2[]): P2 {
  let x = 0
  let y = 0
  for (const p of poly) {
    x += p.x
    y += p.y
  }
  return { x: x / Math.max(1, poly.length), y: y / Math.max(1, poly.length) }
}

/**
 * Two hands → convex hull of the four thumb/index tips (a real window).
 * One hand  → the thumb-index "L" frame: a box whose diagonal is thumb→index.
 * Returns undefined when the shape is too small / degenerate.
 */
export function buildPortal(hands: Hand[], poses: HandPose[]): PortalShape | undefined {
  if (hands.length === 0) return undefined

  if (hands.length >= 2) {
    const a = hands[0].landmarks
    const b = hands[1].landmarks
    const tips: P2[] = [
      { x: a[THUMB_TIP].x, y: a[THUMB_TIP].y },
      { x: a[INDEX_TIP].x, y: a[INDEX_TIP].y },
      { x: b[THUMB_TIP].x, y: b[THUMB_TIP].y },
      { x: b[INDEX_TIP].x, y: b[INDEX_TIP].y },
    ]
    const hull = convexHull(tips)
    if (hull.length < 3) return undefined
    const area = polygonArea(hull)
    if (area < 0.004) return undefined
    const c = polyCenter(hull)
    // Rotation follows the line joining the two palms, so tilting the window
    // tilts the flower with it.
    const pa = poses[0].palm
    const pb = poses[1].palm
    const rotation = Math.atan2(pb.y - pa.y, pb.x - pa.x)
    return { points: hull, area, center: c, rotation }
  }

  const lm = hands[0].landmarks
  const pose = poses[0]
  if (pose.framePose < 0.25) return undefined
  const thumb = lm[THUMB_TIP]
  const index = lm[INDEX_TIP]
  const dx = Math.abs(index.x - thumb.x)
  const dy = Math.abs(index.y - thumb.y)
  if (Math.max(dx, dy) < 0.035) return undefined
  const quad: P2[] = [
    { x: thumb.x, y: thumb.y },
    { x: index.x, y: thumb.y },
    { x: index.x, y: index.y },
    { x: thumb.x, y: index.y },
  ]
  return {
    points: quad,
    area: dx * dy,
    center: { x: (thumb.x + index.x) * 0.5, y: (thumb.y + index.y) * 0.5 },
    rotation: Math.atan2(index.y - thumb.y, index.x - thumb.x),
  }
}

/* -------------------------------------------------------------------------- */
/* Classifier with hysteresis + dwell                                         */
/* -------------------------------------------------------------------------- */

export interface GestureOptions {
  /** ms a candidate must hold before it becomes the gesture */
  dwellMs?: number
  /** ms of no hands before we fall back to `none` */
  lostGraceMs?: number
  reducedMotion?: boolean
}

interface Hysteresis {
  value: number
}

const DWELL: Record<Gesture, number> = {
  none: 0,
  open: 150,
  pinch: 140,
  fist: 160,
  frame: 210,
  weave: 230,
}

export class GestureClassifier {
  private current: Gesture = 'none'
  private since = 0
  private candidate: Gesture = 'none'
  private candidateSince = 0
  private lastHands = 0
  private lastSeen = 0
  private confidence = 0
  private lastPose: HandPose[] = []
  private lastPortal: PortalShape | undefined
  private readonly dwellMs: number
  private readonly lostGraceMs: number
  private readonly reduced: boolean
  // Hysteresis state for continuous metrics
  private pinchOn = false
  private fistOn = false
  private openOn = false
  private frameOn = false
  private weaveOn = false
  private framePoseHeld = 0

  constructor(opts: GestureOptions = {}) {
    this.dwellMs = opts.dwellMs ?? 0
    this.lostGraceMs = opts.lostGraceMs ?? 320
    this.reduced = !!opts.reducedMotion
  }

  reset(): void {
    this.current = 'none'
    this.candidate = 'none'
    this.since = 0
    this.confidence = 0
    this.lastPose = []
    this.lastPortal = undefined
  }

  /** Raw per-frame pose score for each gesture, used only for confidence. */
  private scorePoses(hands: Hand[], poses: HandPose[], t: number): { gesture: Gesture; score: number } {
    const now = t
    if (hands.length === 0) return { gesture: 'none', score: 0 }

    const p0 = poses[0]
    const p1 = poses[1]

    // --- frame (hysteresis on framePose of both hands) --------------------
    const frameScore =
      hands.length >= 2
        ? Math.min(p0.framePose, p1.framePose)
        : clamp(p0.framePose)
    const frameEnter = 0.45
    const frameExit = 0.3
    if (!this.frameOn && frameScore > frameEnter) this.frameOn = true
    else if (this.frameOn && frameScore < frameExit) this.frameOn = false

    // --- weave: two hands, fingers out, palms close but not touching ------
    const handGap = hands.length >= 2 ? dist2(p0.palm, p1.palm) : 0
    const weaveRaw =
      hands.length >= 2
        ? Math.min(
            smoothstep(0.5, 0.9, Math.min(p0.extCount, p1.extCount) / 4),
            smoothstep(0.85, 0.55, handGap),
            smoothstep(0.03, 0.09, handGap),
          )
        : 0
    if (!this.weaveOn && weaveRaw > 0.6) this.weaveOn = true
    else if (this.weaveOn && weaveRaw < 0.35) this.weaveOn = false

    // --- per-hand pinch / fist / open -------------------------------------
    const pinchRaw = clamp(
      Math.min(
        ...poses.map((p) => smoothstep(0.42, 0.22, p.pinch)),
      ),
    )
    const fistRaw = clamp(Math.min(...poses.map((p) => smoothstep(0.9, 0.2, p.extCount + p.ext[0] * 0.3))))
    const openRaw = clamp(
      Math.min(...poses.map((p) => smoothstep(3.2, 3.9, p.extCount) * smoothstep(1.5, 2.2, p.spread))),
    )
    if (!this.pinchOn && pinchRaw > 0.55) this.pinchOn = true
    else if (this.pinchOn && pinchRaw < 0.3) this.pinchOn = false
    if (!this.fistOn && fistRaw > 0.6) this.fistOn = true
    else if (this.fistOn && fistRaw < 0.3) this.fistOn = false
    if (!this.openOn && openRaw > 0.55) this.openOn = true
    else if (this.openOn && openRaw < 0.3) this.openOn = false

    // Keep the frame pose "held" count for the single-hand portal.
    this.framePoseHeld = p0.framePose

    // Priority order matters: two-hand shapes win over per-hand shapes.
    if (this.frameOn && hands.length >= 2) return { gesture: 'frame', score: frameScore }
    if (this.frameOn && hands.length === 1 && p0.framePose > 0.55) return { gesture: 'frame', score: p0.framePose }
    if (this.weaveOn && !this.pinchOn) return { gesture: 'weave', score: weaveRaw }
    if (this.pinchOn) return { gesture: 'pinch', score: pinchRaw }
    if (this.fistOn && !this.openOn) return { gesture: 'fist', score: fistRaw }
    if (this.openOn) return { gesture: 'open', score: openRaw }
    // Between poses: hold the previous gesture while any hand is still around.
    const held = this.current === 'none' ? 'open' : this.current
    return { gesture: held, score: 0.35 }
  }

  update(hands: Hand[], t: number): GestureState {
    const poses = hands.map(analyzeHand)
    this.lastPose = poses
    const seen = hands.length > 0
    if (seen) this.lastSeen = t
    else if (t - this.lastSeen > this.lostGraceMs) {
      this.current = 'none'
      this.candidate = 'none'
      this.confidence = 0
      this.lastPortal = undefined
    }

    const scored = this.scorePoses(hands, poses, t)
    const portal = buildPortal(hands, poses)
    if (portal) this.lastPortal = portal
    else if (hands.length === 0) this.lastPortal = undefined

    if (!seen) {
      return {
        gesture: 'none',
        confidence: 0,
        hands: 0,
        portal: undefined,
      }
    }

    const desired = scored.gesture
    const dwell = this.reduced ? 0 : DWELL[desired] + this.dwellMs
    if (desired !== this.candidate) {
      this.candidate = desired
      this.candidateSince = t
    }
    const heldFor = t - this.candidateSince
    if (desired !== this.current && heldFor >= dwell) {
      this.current = desired
      this.since = t
    } else if (desired === this.current) {
      this.since = this.since || t
    }

    // Confidence: how long the current gesture has held + raw pose score.
    const stability = clamp((t - this.since) / 700)
    this.confidence = clamp(scored.score * 0.65 + stability * 0.35)

    this.lastHands = hands.length
    return {
      gesture: this.current,
      confidence: this.confidence,
      hands: this.lastHands,
      portal: this.current === 'frame' ? this.lastPortal : this.lastPortal,
    }
  }

  /** For HUD + a11y: the continuous pose vector of the primary hand. */
  get pose(): HandPose | undefined {
    return this.lastPose[0]
  }
}

/** One-shot helper used by fixtures/tests and the ghost autopilot. */
export function gestureOf(hands: Hand[], t: number): GestureState {
  const c = new GestureClassifier()
  return c.update(hands, t)
}

export { analyzeHand as analyze, buildPortal as portalOf }
