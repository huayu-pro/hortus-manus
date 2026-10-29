/**
 * Ghost hands — the autopilot.
 *
 * Plays a fixture through the same pipeline as the camera (smoothed + classified),
 * so every mode behaves identically whether the hands are real or borrowed. Each
 * cycle picks a new fixture (weighted per mode), a new phase and a slightly new
 * loop point, so the stage never looks like a looping video.
 */

import type { Hand, InputSource } from '@hortus/shared'
import { FixturePlayer, FIXTURE_NAMES, loadFixture, type DecodedFixture, type FixtureName } from './fixtures'

export interface GhostOptions {
  /** fixture to start with; undefined = pick by mode/cycle */
  fixture?: FixtureName
  /** mode hint used for fixture weighting */
  mode?: string
  seed?: number
  /** stop emitting (e.g. real hands arrived) */
  enabled?: boolean
}

/** Per-mode fixture preference — the pose that makes each scene read best. */
const MODE_AFFINITY: Record<string, readonly FixtureName[]> = {
  frame: ['frame', 'open-close', 'point'],
  tendril: ['palms-facing', 'point', 'frame'],
  ripple: ['point', 'open-close', 'palms-facing'],
  spore: ['fist', 'open-close', 'point'],
  mycelium: ['palms-facing', 'open-close', 'frame'],
  mist: ['open-close', 'point', 'palms-facing'],
  phyllotaxis: ['open-close', 'point', 'palms-facing'],
}

export class GhostSource {
  readonly source: InputSource = 'ghost'
  private player: FixturePlayer
  private current: FixtureName = 'open-close'
  private mode: string
  private seed: number
  private started = false
  private cycleAt = 0
  private lastCycle = 0
  enabled: boolean

  constructor(opts: GhostOptions = {}) {
    this.mode = opts.mode ?? 'frame'
    this.seed = opts.seed ?? 20261
    this.enabled = opts.enabled ?? true
    this.current = opts.fixture ?? this.pick(this.seed)
    this.player = new FixturePlayer(null)
    void this.begin()
  }

  private pick(n: number): FixtureName {
    const pool = MODE_AFFINITY[this.mode] ?? FIXTURE_NAMES
    const r = hash(n)
    return pool[Math.floor(r * pool.length)] ?? 'open-close'
  }

  private async begin(): Promise<void> {
    // Load the affinity pool in the background so cycle changes never stall.
    const pool = MODE_AFFINITY[this.mode] ?? FIXTURE_NAMES
    for (const n of pool) void loadFixture(n)
    const first = await loadFixture(this.current)
    if (!this.started) {
      this.started = true
      this.cycleAt = performance.now()
      this.apply(first)
    }
  }

  private apply(f: DecodedFixture | null): void {
    this.player.setFixture(f, hash(this.seed + this.lastCycle * 3.3) * 0.85)
  }

  setMode(mode: string): void {
    if (mode === this.mode) return
    this.mode = mode
    this.advance()
  }

  private advance(): void {
    this.lastCycle++
    const next = this.pick(this.seed + this.lastCycle * 977)
    this.current = next
    this.cycleAt = performance.now()
    void loadFixture(next).then((f) => {
      // Guard: another advance may have happened while this was loading.
      if (this.current === next) this.apply(f)
    })
  }

  get ready(): boolean {
    return this.player.ready
  }

  get fixtureName(): string {
    return this.current
  }

  /** Called once per frame by the stage's unified loop. */
  sample(now: number): Hand[] {
    if (!this.enabled) return []
    // Rotate fixtures roughly every 9–14 s so the choreography keeps evolving.
    const span = 9000 + hash(this.lastCycle + this.seed) * 5000
    if (this.player.ready && now - this.cycleAt > span) this.advance()
    return this.player.sample(now)
  }
}

function hash(n: number): number {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}
