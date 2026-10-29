/**
 * MediaPipe Tasks Vision hand tracker (0.10.17), fully lazy-loaded.
 *
 * start() is only ever called from a user gesture. It asks for the camera first
 * (fast, clear permission feedback) and only then loads the ~19 MB wasm + model
 * bundle. A GPU delegate is attempted first and falls back to CPU if the WebGL
 * context cannot support it.
 *
 * The tracker is deliberately "dumb": it emits raw, mirrored landmarks. Smoothing,
 * prediction and gesture classification live in the shared pipeline so the ghost
 * and pointer sources get exactly the same treatment.
 */

import type { CameraState, Hand, HandFrame } from '@hortus/shared'

export interface RawHandSample {
  hands: Hand[]
  /** performance.now() of the frame */
  t: number
  fps: number
  latencyMs: number
  present: boolean
  camera: CameraState
}

interface TrackerCallbacks {
  onCameraState?: (state: CameraState, detail?: string) => void
  onSample?: (sample: RawHandSample) => void
}

export interface TrackerOptions extends TrackerCallbacks {
  video: HTMLVideoElement
  modelPath?: string
  wasmPath?: string
  numHands?: number
  /** cap the detector at this rate; inference on every 60fps frame is wasteful */
  maxFps?: number
}

type Delegate = 'GPU' | 'CPU'

export class HandTracker {
  readonly source = 'camera' as const
  camera: CameraState = 'off'
  delegate: Delegate | 'none' = 'none'
  error: string | null = null
  private opts: TrackerOptions
  private landmarker: { detectForVideo: (v: HTMLVideoElement | HTMLCanvasElement, ts: number) => unknown; close?: () => void } | null =
    null
  private stream: MediaStream | null = null
  private running = false
  private raf = 0
  private vfc = 0
  private lastVideoTime = -1
  private lastDetect = 0
  private lastTs = 0
  private startedAt = 0
  private detectCount = 0
  private fpsWindowStart = 0
  private fps = 0
  private latency = 0
  private lastSeen = 0
  private hands: Hand[] = []
  /** small canvas used to feed MediaPipe a 640×360 frame instead of 720p */
  private detectCanvas: HTMLCanvasElement | null = null
  private detectCtx: CanvasRenderingContext2D | null = null
  private adaptiveInterval = 0
  private disposed = false

  constructor(opts: TrackerOptions) {
    this.opts = opts
  }

  private setCamera(state: CameraState, detail?: string): void {
    this.camera = state
    if (state !== 'on') this.error = detail ?? null
    this.opts.onCameraState?.(state, detail)
  }

  get video(): HTMLVideoElement {
    return this.opts.video
  }

  get isRunning(): boolean {
    return this.running
  }

  /**
   * Requests the camera and starts detection. Resolves with the terminal camera
   * state; never throws — denied / unavailable are ordinary outcomes.
   */
  async start(): Promise<CameraState> {
    if (this.disposed) return 'unavailable'
    if (this.running) return this.camera
    this.setCamera('requesting')

    // 1 · camera first — the permission prompt should not wait on a 19MB download.
    let stream: MediaStream
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        this.setCamera('unavailable', 'mediaDevices unavailable')
        return this.camera
      }
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: false,
      })
    } catch (err) {
      const name = (err as DOMException)?.name ?? ''
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        this.setCamera('denied', 'camera permission denied')
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        this.setCamera('unavailable', 'no camera found')
      } else {
        this.setCamera('unavailable', name || 'camera unavailable')
      }
      return this.camera
    }
    this.stream = stream
    const video = this.opts.video
    video.srcObject = stream
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    try {
      await video.play()
    } catch {
      /* autoplay can be rejected while muted; the frame callback still runs */
    }

    // 2 · lazy model + wasm
    try {
      const vision = await import('@mediapipe/tasks-vision')
      const base = import.meta.env.BASE_URL || '/'
      const fileset = await vision.FilesetResolver.forVisionTasks(this.opts.wasmPath ?? `${base}wasm`)
      const common = {
        baseOptions: {
          modelAssetPath: this.opts.modelPath ?? `${base}models/hand_landmarker.task`,
          delegate: 'GPU' as const,
        },
        runningMode: 'VIDEO' as const,
        numHands: this.opts.numHands ?? 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      }
      let lm: Awaited<ReturnType<typeof vision.HandLandmarker.createFromOptions>>
      try {
        lm = await vision.HandLandmarker.createFromOptions(fileset, common)
        this.delegate = 'GPU'
      } catch {
        // Some drivers / headless GL refuse the GPU delegate — CPU is fine.
        lm = await vision.HandLandmarker.createFromOptions(fileset, {
          ...common,
          baseOptions: { ...common.baseOptions, delegate: 'CPU' as const },
        })
        this.delegate = 'CPU'
      }
      this.landmarker = lm as unknown as HandTracker['landmarker']
    } catch (err) {
      this.teardownStream()
      this.setCamera('unavailable', (err as Error)?.message ?? 'model failed to load')
      return this.camera
    }

    this.running = true
    this.startedAt = performance.now()
    this.fpsWindowStart = this.startedAt
    this.setCamera('on')
    this.schedule()
    return this.camera
  }

  private schedule(): void {
    if (!this.running || this.disposed) return
    const video = this.opts.video
    if ('requestVideoFrameCallback' in video) {
      this.vfc = video.requestVideoFrameCallback(() => {
        this.onVideoFrame()
        this.schedule()
      })
    } else {
      this.raf = requestAnimationFrame(() => {
        this.onVideoFrame()
        this.schedule()
      })
    }
  }

  private onVideoFrame(): void {
    if (!this.running || !this.landmarker) return
    const video = this.opts.video
    if (video.readyState < 2 || video.videoWidth === 0) return
    const now = performance.now()
    // self-throttle: if inference is slow, skip frames so the UI stays alive
    const slowFps = this.latency > 40 ? Math.max(4, Math.min(this.opts.maxFps ?? 30, 1000 / (this.latency * 1.7))) : this.opts.maxFps ?? 30
    const minInterval = Math.max(1000 / (this.opts.maxFps ?? 30), 1000 / slowFps)
    if (now - this.lastDetect < minInterval) return
    if (video.currentTime === this.lastVideoTime) return
    this.lastVideoTime = video.currentTime
    this.lastDetect = now

    let ts = now
    if (ts <= this.lastTs) ts = this.lastTs + 0.01
    this.lastTs = ts

    // downscale to 640×360: MediaPipe landmarks are resolution independent and
    // the smaller tensor is 4× cheaper on CPU / low-end GPUs.
    if (!this.detectCanvas) {
      this.detectCanvas = document.createElement('canvas')
      this.detectCanvas.width = 640
      this.detectCanvas.height = 360
      this.detectCtx = this.detectCanvas.getContext('2d', { alpha: false })
    }
    const cctx = this.detectCtx
    let source: HTMLVideoElement | HTMLCanvasElement = video
    if (cctx && this.detectCanvas) {
      cctx.drawImage(video, 0, 0, 640, 360)
      source = this.detectCanvas
    }

    const t0 = performance.now()
    let result: { landmarks: { x: number; y: number; z: number }[][]; handedness?: { categoryName?: string }[][] }
    try {
      result = this.landmarker.detectForVideo(source, ts) as typeof result
    } catch {
      // A single inference failure is not fatal; keep the last frame.
      return
    }
    this.latency = performance.now() - t0
    const hands: Hand[] = []
    const n = Math.min(2, result.landmarks?.length ?? 0)
    for (let i = 0; i < n; i++) {
      const lm = result.landmarks[i]
      if (!lm || lm.length < 21) continue
      const cat = result.handedness?.[i]?.[0]?.categoryName
      const handedness: Hand['handedness'] = cat === 'Left' ? 'Left' : cat === 'Right' ? 'Right' : 'Unknown'
      hands.push({
        handedness,
        score: 0.95,
        landmarks: lm.slice(0, 21).map((p) => ({
          // mirror x once, at the tracker boundary — every downstream consumer
          // works in selfie space
          x: 1 - p.x,
          y: p.y,
          z: p.z,
        })),
      })
    }
    if (hands.length > 0) this.lastSeen = now
    this.hands = hands
    this.detectCount++
    if (now - this.fpsWindowStart >= 1000) {
      this.fps = (this.detectCount * 1000) / (now - this.fpsWindowStart)
      this.detectCount = 0
      this.fpsWindowStart = now
    }
    this.opts.onSample?.(this.getSample(now))
  }

  /** Convenience for direct consumers: the camera-only HandFrame (gesture = none). */
  getFrame(now = performance.now()): HandFrame {
    const s = this.getSample(now)
    return {
      hands: s.hands,
      t: s.t,
      source: 'camera',
      fps: s.fps,
      latencyMs: s.latencyMs,
      gesture: { gesture: 'none', confidence: 0, hands: s.hands.length },
      present: s.present,
    }
  }

  getSample(now = performance.now()): RawHandSample {
    return {
      hands: this.hands,
      t: now,
      fps: this.fps,
      latencyMs: this.latency,
      present: this.hands.length > 0 || now - this.lastSeen < 600,
      camera: this.camera,
    }
  }

  stop(): void {
    this.running = false
    if (this.vfc && 'cancelVideoFrameCallback' in this.opts.video) {
      this.opts.video.cancelVideoFrameCallback(this.vfc)
    }
    this.vfc = 0
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
    this.teardownStream()
    this.hands = []
    this.lastVideoTime = -1
    if (this.camera === 'on') this.setCamera('off')
  }

  private teardownStream(): void {
    for (const track of this.stream?.getTracks() ?? []) track.stop()
    this.stream = null
    const v = this.opts.video
    if (v.srcObject) v.srcObject = null
  }

  dispose(): void {
    this.disposed = true
    this.stop()
    try {
      this.landmarker?.close?.()
    } catch {
      /* already closed */
    }
    this.landmarker = null
  }
}
