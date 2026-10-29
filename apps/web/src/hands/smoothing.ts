/**
 * One Euro filter (Casiez et al. 2012) + a short constant-velocity prediction.
 *
 * Every hand gets its own bank of filters so the two hands never share state.
 * Landmarks are in normalized image space (0..1), so the filter constants below
 * are in "normalized units / second" and are independent of viewport size.
 */

import type { Hand, Vec3 } from '@hortus/shared'
import { clamp } from './landmarks'

export interface OneEuroConfig {
  minCutoff: number
  beta: number
  dCutoff: number
}

export const DEFAULT_ONE_EURO: OneEuroConfig = { minCutoff: 1.2, beta: 0.02, dCutoff: 1.0 }

function alphaFor(cutoff: number, dt: number): number {
  const tau = 1 / (2 * Math.PI * cutoff)
  return 1 / (1 + tau / Math.max(dt, 1e-5))
}

export class OneEuroFilter {
  private xPrev: number | null = null
  private dxPrev = 0
  private tPrev = -1
  private readonly cfg: OneEuroConfig

  constructor(cfg: OneEuroConfig = DEFAULT_ONE_EURO) {
    this.cfg = cfg
  }

  reset(): void {
    this.xPrev = null
    this.dxPrev = 0
    this.tPrev = -1
  }

  filter(x: number, t: number): number {
    if (this.xPrev === null || this.tPrev < 0) {
      this.xPrev = x
      this.tPrev = t
      return x
    }
    const dt = Math.max(t - this.tPrev, 1e-4)
    this.tPrev = t
    const dx = (x - this.xPrev) / dt
    const aD = alphaFor(this.cfg.dCutoff, dt)
    this.dxPrev = aD * dx + (1 - aD) * this.dxPrev
    const cutoff = this.cfg.minCutoff + this.cfg.beta * Math.abs(this.dxPrev)
    const a = alphaFor(cutoff, dt)
    const xHat = a * x + (1 - a) * this.xPrev
    this.xPrev = xHat
    return xHat
  }
}

interface HandSlot {
  filters: OneEuroFilter[]
  vel: Float32Array // 63 velocity components (normalized units / s)
  prev: Float32Array | null
  tPrev: number
}

const COMPONENTS = 63

/**
 * Smoothes both hands and predicts `predictMs` ahead (default 30 ms) so the
 * scene keeps up with fast gestures without feeling laggy.
 */
export class HandSmoother {
  private slots = new Map<string, HandSlot>()
  predictMs = 30
  private cfg: OneEuroConfig

  constructor(cfg: OneEuroConfig = DEFAULT_ONE_EURO) {
    this.cfg = cfg
  }

  reset(): void {
    this.slots.clear()
  }

  private slot(key: string): HandSlot {
    let s = this.slots.get(key)
    if (!s) {
      s = {
        filters: Array.from({ length: COMPONENTS }, () => new OneEuroFilter(this.cfg)),
        vel: new Float32Array(COMPONENTS),
        prev: null,
        tPrev: -1,
      }
      this.slots.set(key, s)
    }
    return s
  }

  smooth(hand: Hand, tSec: number, key?: string): Hand {
    const slot = this.slot(key ?? hand.handedness)
    const lm = hand.landmarks
    const out: Vec3[] = new Array(lm.length)
    const raw = new Float32Array(COMPONENTS)
    const dt = slot.tPrev >= 0 ? Math.max(tSec - slot.tPrev, 1e-4) : 0
    const predict = this.predictMs / 1000

    for (let i = 0; i < lm.length && i < 21; i++) {
      const p = lm[i]
      const k = i * 3
      const fx = slot.filters[k].filter(p.x, tSec)
      const fy = slot.filters[k + 1].filter(p.y, tSec)
      const fz = slot.filters[k + 2].filter(p.z, tSec)
      raw[k] = p.x
      raw[k + 1] = p.y
      raw[k + 2] = p.z

      let px = fx
      let py = fy
      let pz = fz
      if (dt > 0 && slot.prev) {
        // Velocity is measured on the *raw* signal so prediction stays honest.
        const vx = (p.x - slot.prev[k]) / dt
        const vy = (p.y - slot.prev[k + 1]) / dt
        const vz = (p.z - slot.prev[k + 2]) / dt
        const a = 1 - Math.exp(-dt * 18)
        slot.vel[k] = a * vx + (1 - a) * slot.vel[k]
        slot.vel[k + 1] = a * vy + (1 - a) * slot.vel[k + 1]
        slot.vel[k + 2] = a * vz + (1 - a) * slot.vel[k + 2]
        px += slot.vel[k] * predict
        py += slot.vel[k + 1] * predict
        pz += slot.vel[k + 2] * predict
      }

      out[i] = {
        x: clamp(px, -0.2, 1.2),
        y: clamp(py, -0.2, 1.2),
        z: clamp(pz, -0.6, 0.6),
      }
    }

    slot.prev = raw
    slot.tPrev = tSec
    return { handedness: hand.handedness, score: hand.score, landmarks: out }
  }
}

/** Apply smoothing to a list of hands; the key keeps identity stable per slot. */
export function smoothHands(
  smoother: HandSmoother,
  hands: Hand[],
  tSec: number,
  predictMs = 30,
): Hand[] {
  smoother.predictMs = predictMs
  return hands.map((h) => smoother.smooth(h, tSec, h.handedness))
}
