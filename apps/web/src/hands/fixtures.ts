/**
 * Fixture loading + playback.
 *
 * The JSON files in /public/fixtures are compact: each landmark is 3 numbers in
 * a flat array and hands are tagged by handedness. This module expands them back
 * to `Hand[]`, caches them, and offers a looping player whose loop point is
 * jittered every cycle so a fixture never reads as a perfect repeat.
 */

import type { Hand, HandFixture, InputSource } from '@hortus/shared'

interface CompactFrame {
  t: number
  hands: { h: 'Left' | 'Right'; s: number; p: number[] }[]
}

interface CompactFixture {
  name: string
  fps: number
  durationMs: number
  frames: CompactFrame[]
}

export interface DecodedFixture {
  name: string
  fps: number
  durationMs: number
  frames: { t: number; hands: Hand[] }[]
}

const BASE = `${import.meta.env.BASE_URL}fixtures`
const cache = new Map<string, DecodedFixture>()
const pending = new Map<string, Promise<DecodedFixture | null>>()

export const FIXTURE_NAMES = ['open-close', 'frame', 'fist', 'palms-facing', 'point'] as const
export type FixtureName = (typeof FIXTURE_NAMES)[number]

function decode(raw: CompactFixture): DecodedFixture {
  const frames = raw.frames.map((f) => ({
    t: f.t,
    hands: f.hands.map((h) => {
      const landmarks = []
      for (let i = 0; i < 21; i++) {
        landmarks.push({
          x: h.p[i * 3] ?? 0.5,
          y: h.p[i * 3 + 1] ?? 0.5,
          z: h.p[i * 3 + 2] ?? 0,
        })
      }
      return {
        handedness: h.h === 'Left' ? ('Left' as const) : ('Right' as const),
        score: h.s ?? 0.9,
        landmarks,
      }
    }),
  }))
  return { name: raw.name, fps: raw.fps, durationMs: raw.durationMs, frames }
}

/** Loads and decodes a fixture. Returns null when the file is missing — callers fall back. */
export async function loadFixture(name: FixtureName | string): Promise<DecodedFixture | null> {
  const hit = cache.get(name)
  if (hit) return hit
  const inflight = pending.get(name)
  if (inflight) return inflight
  const p = (async () => {
    try {
      const res = await fetch(`${BASE}/${name}.json`, { cache: 'force-cache' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = (await res.json()) as CompactFixture
      const dec = decode(raw)
      cache.set(name, dec)
      return dec
    } catch {
      return null
    } finally {
      pending.delete(name)
    }
  })()
  pending.set(name, p)
  return p
}

/** Warm the cache for the ghost autopilot without blocking first paint. */
export function prefetchFixtures(): void {
  for (const n of FIXTURE_NAMES) void loadFixture(n)
}

/** Converts a decoded fixture to the public `HandFixture` shape (tests / debugging). */
export function toPublicFixture(f: DecodedFixture): HandFixture {
  return {
    name: f.name,
    fps: f.fps,
    durationMs: f.durationMs,
    frames: f.frames.map((fr) => ({ t: fr.t, hands: fr.hands })),
  }
}

export interface PlayerOptions {
  /** loop length jitter, 0..1 of the fixture duration (default 0.12) */
  jitter?: number
  /** start offset, 0..1 */
  offset?: number
  /** playback speed multiplier */
  speed?: number
  /** seed for the deterministic jitter sequence */
  seed?: number
}

/**
 * Plays a fixture on a wall clock, looping with a slightly randomised loop
 * point and a random phase offset so two ghost stages never look identical.
 */
export class FixturePlayer {
  readonly source: InputSource = 'ghost'
  private fixture: DecodedFixture | null = null
  private t0 = 0
  private loopStart = 0
  private loopEnd = 0
  private readonly jitter: number
  private readonly speed: number
  private readonly seed: number
  private cycle = 0
  private lastIdx = -1

  constructor(fixture: DecodedFixture | null, opts: PlayerOptions = {}) {
    this.jitter = opts.jitter ?? 0.12
    this.speed = opts.speed ?? 1
    this.seed = opts.seed ?? 12345
    this.setFixture(fixture, opts.offset ?? 0)
  }

  setFixture(fixture: DecodedFixture | null, offset = 0): void {
    this.fixture = fixture
    this.t0 = performance.now()
    this.cycle = 0
    this.lastIdx = -1
    if (!fixture || fixture.frames.length === 0) {
      this.loopStart = 0
      this.loopEnd = 0
      return
    }
    const dur = fixture.durationMs
    this.loopStart = -offset * dur
    this.loopEnd = this.nextLoopEnd()
  }

  private nextLoopEnd(): number {
    if (!this.fixture) return 0
    const d = this.fixture.durationMs
    const j = (hash(this.cycle + this.seed) * 2 - 1) * this.jitter * d
    return d + j
  }

  get ready(): boolean {
    return !!this.fixture && this.fixture.frames.length > 1
  }

  get name(): string {
    return this.fixture?.name ?? 'none'
  }

  /** Elapsed fixture time in ms (looped). */
  private elapsed(now: number): number {
    if (!this.fixture) return 0
    const span = Math.max(400, this.loopEnd - this.loopStart)
    let e = (now - this.t0) * this.speed + this.loopStart
    // roll cycles so the loop point can be re-jittered
    let guard = 0
    while (e > this.loopEnd && guard++ < 8) {
      const over = e - this.loopEnd
      this.cycle++
      this.loopStart = 0
      this.loopEnd = this.nextLoopEnd()
      this.t0 = now - over / Math.max(this.speed, 0.001)
      e = (now - this.t0) * this.speed
    }
    return Math.max(0, Math.min(this.fixture.durationMs - 1, e))
  }

  /** Current interpolated hands. */
  sample(now: number): Hand[] {
    const f = this.fixture
    if (!f || f.frames.length === 0) return []
    const e = this.elapsed(now)
    const frames = f.frames
    // binary search for the frame at or before e
    let lo = 0
    let hi = frames.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (frames[mid].t * 1000 <= e) lo = mid
      else hi = mid - 1
    }
    const a = frames[lo]
    const b = frames[Math.min(lo + 1, frames.length - 1)]
    if (a === b || !b) return a.hands
    const span = (b.t - a.t) * 1000
    const k = span > 0 ? (e - a.t * 1000) / span : 0
    this.lastIdx = lo
    return lerpHands(a.hands, b.hands, k)
  }
}

function lerpHands(a: Hand[], b: Hand[], k: number): Hand[] {
  if (a.length === 0) return b
  if (b.length === 0) return a
  const out: Hand[] = []
  const n = Math.min(a.length, b.length)
  for (let h = 0; h < n; h++) {
    const ha = a[h]
    const hb = b[h]
    const landmarks = ha.landmarks.map((p, i) => {
      const q = hb.landmarks[i] ?? p
      return { x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k, z: p.z + (q.z - p.z) * k }
    })
    out.push({
      handedness: ha.handedness,
      score: ha.score + (hb.score - ha.score) * k,
      landmarks,
    })
  }
  return out
}

function hash(n: number): number {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}
