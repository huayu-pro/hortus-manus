/**
 * Adaptive quality governor.
 *
 * FPS is measured in one-second windows. Below 45 fps the render scale steps
 * down; below 30 fps it drops harder and raises a human-readable hint ("use
 * pointer / ghost for a smoother stage"). Recovery is deliberately slow so the
 * stage never oscillates between two quality levels.
 */

export interface QualityState {
  level: 0 | 1 | 2 | 3
  /** multiplier applied to the base device pixel ratio */
  dprScale: number
  /** multiplier applied by modes to particle counts */
  particleScale: number
  /** true once we have dropped below the 30fps floor */
  degraded: boolean
  message: string | null
}

const LEVELS: Omit<QualityState, 'degraded' | 'message'>[] = [
  { level: 0, dprScale: 1, particleScale: 1 },
  { level: 1, dprScale: 0.8, particleScale: 0.78 },
  { level: 2, dprScale: 0.64, particleScale: 0.55 },
  { level: 3, dprScale: 0.5, particleScale: 0.38 },
]

export interface QualityGovernorOptions {
  onChange?: (state: QualityState) => void
}

export class QualityGovernor {
  state: QualityState = { ...LEVELS[0], degraded: false, message: null }
  private frames = 0
  private windowStart = 0
  private lowWindows = 0
  private highWindows = 0
  private lastChange = 0
  private onChange?: (s: QualityState) => void

  constructor(opts: QualityGovernorOptions = {}) {
    this.onChange = opts.onChange
  }

  reset(now = performance.now()): void {
    this.frames = 0
    this.windowStart = now
    this.lowWindows = 0
    this.highWindows = 0
  }

  report(_dtMs: number, now: number): QualityState {
    if (this.windowStart === 0) this.windowStart = now
    this.frames++
    const elapsed = now - this.windowStart
    if (elapsed < 1000) return this.state
    const fps = (this.frames * 1000) / elapsed
    this.frames = 0
    this.windowStart = now

    if (fps < 45) this.lowWindows++
    else this.lowWindows = Math.max(0, this.lowWindows - 1)
    if (fps > 56) this.highWindows++
    else this.highWindows = 0

    const level = this.state.level
    let next: 0 | 1 | 2 | 3 = level
    if (this.lowWindows >= 2 && level < 3 && now - this.lastChange > 2500) {
      next = Math.min(3, level + (fps < 30 ? 2 : 1)) as 0 | 1 | 2 | 3
    } else if (this.highWindows >= 8 && level > 0 && now - this.lastChange > 8000) {
      next = (level - 1) as 0 | 1 | 2 | 3
    }
    if (next !== level) {
      this.lastChange = now
      this.lowWindows = 0
      this.highWindows = 0
      const base = LEVELS[next]
      this.state = {
        ...base,
        degraded: next >= 2,
        message:
          next >= 2
            ? '帧率偏低 · 已自动降低精度，可切到指针或幽灵手 / reduced detail'
            : next === 1
              ? '已降低一档精度 / detail reduced'
              : null,
      }
      this.onChange?.(this.state)
    }
    return this.state
  }
}
