/**
 * HandsController — one frame source for the whole stage.
 *
 * Priority: camera (when the user has explicitly turned it on) → pointer/keyboard
 * → ghost autopilot. Everything goes through the same smoothing and gesture
 * classifier so the scene cannot tell the difference.
 */

import type { CameraState, GestureState, Hand, HandFrame, InputSource } from '@hortus/shared'
import { GestureClassifier } from './gestures'
import { GhostSource } from './ghost'
import { PointerSource } from './pointer'
import { HandSmoother } from './smoothing'
import { HandTracker } from './tracker'

export interface HandsControllerOptions {
  video: HTMLVideoElement
  stageEl: HTMLElement
  reducedMotion?: boolean
  mode?: string
  onCameraState?: (state: CameraState, detail?: string) => void
  onSourceChange?: (source: InputSource) => void
}

const ZERO_GESTURE: GestureState = { gesture: 'none', confidence: 0, hands: 0 }

export class HandsController {
  readonly tracker: HandTracker
  readonly ghost: GhostSource
  readonly pointer: PointerSource
  private smoother = new HandSmoother()
  private classifier: GestureClassifier
  camera: CameraState = 'off'
  source: InputSource = 'ghost'
  private mode: string
  private last: HandFrame | null = null
  private lastSource: InputSource = 'ghost'
  private lastGesture: GestureState = ZERO_GESTURE
  private onCameraState?: (state: CameraState, detail?: string) => void
  private onSourceChange?: (source: InputSource) => void
  private busy = false
  private reducedMotion: boolean
  private freezeAt = 0

  constructor(opts: HandsControllerOptions) {
    this.mode = opts.mode ?? 'frame'
    this.reducedMotion = !!opts.reducedMotion
    this.onCameraState = opts.onCameraState
    this.onSourceChange = opts.onSourceChange
    this.classifier = new GestureClassifier({ reducedMotion: opts.reducedMotion })
    this.tracker = new HandTracker({
      video: opts.video,
      onCameraState: (s, detail) => {
        this.camera = s
        this.onCameraState?.(s, detail)
      },
    })
    this.ghost = new GhostSource({ mode: this.mode })
    this.pointer = new PointerSource()
    this.pointer.attach(opts.stageEl)
  }

  setMode(mode: string): void {
    this.mode = mode
    this.ghost.setMode(mode)
  }

  setGhostEnabled(on: boolean): void {
    this.ghost.enabled = on
  }

  get ghostEnabled(): boolean {
    return this.ghost.enabled
  }

  async setCamera(on: boolean): Promise<CameraState> {
    if (this.busy) return this.camera
    this.busy = true
    try {
      if (on) {
        const state = await this.tracker.start()
        this.camera = state
        return state
      }
      this.tracker.stop()
      this.camera = 'off'
      return 'off'
    } finally {
      this.busy = false
    }
  }

  private pickSource(now: number): { hands: Hand[]; source: InputSource; cameraSample?: ReturnType<HandTracker['getSample']> } {
    if (this.camera === 'on') {
      const sample = this.tracker.getSample(now)
      return { hands: sample.hands, source: 'camera', cameraSample: sample }
    }
    if (this.pointer.active) {
      const hands = this.pointer.sample(now)
      if (hands.length > 0) return { hands, source: 'pointer' }
    }
    if (this.ghost.enabled) {
      // reduced motion: hold one elegant ghost pose instead of an endless performance
      if (this.reducedMotion && this.freezeAt === 0) this.freezeAt = now
      return { hands: this.ghost.sample(this.reducedMotion ? this.freezeAt : now), source: 'ghost' }
    }
    return { hands: [], source: 'none' }
  }

  /** The stage calls this exactly once per rendered frame. */
  update(now: number): HandFrame {
    const picked = this.pickSource(now)
    const raw = picked.hands
    const smoothed = raw.length ? this.smoother.smooth(raw[0], now / 1000, raw[0].handedness) : null
    const hands = smoothed ? [smoothed, ...raw.slice(1)] : []
    const gesture = this.classifier.update(hands, now)
    this.lastGesture = gesture

    if (picked.source !== this.lastSource) {
      this.smoother.reset()
      this.lastSource = picked.source
      this.onSourceChange?.(picked.source)
    }
    this.source = picked.source

    const sample = picked.cameraSample
    const frame: HandFrame = {
      hands,
      t: now,
      source: picked.source,
      fps: sample?.fps || (picked.source === 'ghost' ? 24 : 60),
      latencyMs: sample?.latencyMs || 0,
      gesture,
      present: picked.source === 'ghost' ? true : !!sample?.present || hands.length > 0,
    }
    this.last = frame
    return frame
  }

  getFrame(): HandFrame {
    return this.last ?? {
      hands: [],
      t: performance.now(),
      source: this.source,
      fps: 0,
      latencyMs: 0,
      gesture: this.lastGesture,
      present: false,
    }
  }

  get gesture(): GestureState {
    return this.lastGesture
  }

  dispose(): void {
    this.pointer.detach()
    this.tracker.dispose()
  }
}
