/**
 * GardenEngine — one canvas, seven gardens.
 *
 * Owns the WebGL renderer, the single rAF loop, the Canvas2D ink overlay, the
 * quality governor and the 500ms ink crossfade between modes. Modes own their
 * own scene + camera; the engine only decides which one is on stage.
 */

import * as THREE from 'three'

// The engine's custom shaders work in sRGB values throughout (Canvas2D palette,
// hand-mixed petals). Keep three from silently converting every colour.
THREE.ColorManagement.enabled = false
import type { HandFrame, ModeId, Season, SpecimenSeed, StageState } from '@hortus/shared'
import { Ink2D } from './Ink2D'
import { paletteFor, type Palette } from './palette'
import { QualityGovernor, type QualityState } from './quality'
import { AudioEngine } from './audio'
import type { EngineAssets, GardenMode, ModeEnv } from './modes/types'
import { createMode } from './modes'
import {
  canvasTexture,
  loadPlateTexture,
  makeDewTexture,
  makeFluffTexture,
  makeMossTexture,
  makePaperTexture,
  makeWatercolorTexture,
  paintFernPlate,
  paintPond,
} from './textures'

export interface GardenEngineOptions {
  glCanvas: HTMLCanvasElement
  overlayCanvas: HTMLCanvasElement
  mode: ModeId
  season: Season
  reducedMotion?: boolean
  getFrame: () => HandFrame
  onFps?: (fps: number) => void
  onQuality?: (state: QualityState) => void
  video?: HTMLVideoElement | null
  /** draw editorial labels into the ink overlay (lab only) */
  labels?: boolean
}

interface Transition {
  from: GardenMode
  to: GardenMode
  start: number
  duration: number
}

export class GardenEngine {
  readonly renderer: THREE.WebGLRenderer
  readonly ink: Ink2D
  readonly audio: AudioEngine
  readonly env: ModeEnv
  private opts: GardenEngineOptions
  private modes = new Map<ModeId, GardenMode>()
  private active: GardenMode | null = null
  private modeId: ModeId
  private transition: Transition | null = null
  private governor: QualityGovernor
  private raf = 0
  private lastFrame = 0
  private startedAt = 0
  private fps = 60
  private fpsFrames = 0
  private fpsStart = 0
  private paused = false
  private inView = true
  private disposed = false
  private io: IntersectionObserver | null = null
  private onVisibility = (): void => {
    if (document.hidden) {
      this.paused = true
      void this.audio.suspend()
    } else {
      this.paused = !this.inView
      this.lastFrame = 0
      void this.audio.resume()
    }
  }
  private onResize = (): void => this.resize()

  // crossfade resources
  private rtA: THREE.WebGLRenderTarget | null = null
  private rtB: THREE.WebGLRenderTarget | null = null
  private compositeScene = new THREE.Scene()
  private compositeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private compositeMat: THREE.ShaderMaterial
  private videoTexture: THREE.VideoTexture | null = null
  private videoActive = false

  constructor(opts: GardenEngineOptions) {
    this.opts = opts
    this.modeId = opts.mode
    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.glCanvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    })
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.autoClear = true
    this.ink = new Ink2D(opts.overlayCanvas)
    this.ink.labels = opts.labels ?? (globalThis as unknown as { __hmStageLabels?: boolean }).__hmStageLabels === true
    this.audio = new AudioEngine()
    this.governor = new QualityGovernor({ onChange: (q) => this.applyQuality(q) })
    if (opts.reducedMotion) this.audio.reducedMotion = true

    const palette = paletteFor(opts.season)
    const assets = this.buildAssets(palette)
    this.env = {
      width: 1,
      height: 1,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      season: opts.season,
      palette,
      quality: 1,
      reducedMotion: !!opts.reducedMotion,
      assets,
    }

    this.compositeMat = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uA;
        uniform sampler2D uB;
        uniform float uMix;
        varying vec2 vUv;
        void main(){
          vec4 a = texture2D(uA, vUv);
          vec4 b = texture2D(uB, vUv);
          // slight ink-bleed edge: the outgoing scene dissolves along a soft front
          float n = sin(vUv.y * 18.0 + vUv.x * 7.0) * 0.02;
          float m = smoothstep(0.0, 1.0, clamp(uMix * 1.08 - 0.04 + n, 0.0, 1.0));
          gl_FragColor = mix(a, b, m);
        }
      `,
      uniforms: {
        uA: { value: null },
        uB: { value: null },
        uMix: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
    })
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.compositeMat)
    quad.frustumCulled = false
    this.compositeScene.add(quad)

    this.ensureMode(opts.mode)
    this.active = this.modes.get(opts.mode) ?? null
    this.resize()
    window.addEventListener('resize', this.onResize)
    document.addEventListener('visibilitychange', this.onVisibility)
    if (typeof IntersectionObserver !== 'undefined') {
      this.io = new IntersectionObserver(
        (entries) => {
          this.inView = entries.some((e) => e.isIntersecting)
          this.paused = !this.inView || document.hidden
          if (this.inView) this.lastFrame = 0
        },
        { threshold: 0.02 },
      )
      this.io.observe(opts.glCanvas)
    }
    if (opts.video) this.setVideo(opts.video)
    void this.loadPlates()

    // Warm the other six mode shaders while the user is still reading the label.
    setTimeout(() => this.warmAll(), 1400)
  }

  private buildAssets(palette: Palette): EngineAssets {
    return {
      paper: makePaperTexture(palette),
      watercolor: makeWatercolorTexture(palette),
      moss: makeMossTexture(palette),
      dew: makeDewTexture(palette),
      fluff: makeFluffTexture(palette),
      pond: canvasTexture(768, 480, (ctx) => paintPond(ctx, 768, 480, palette)),
      fernPlate: canvasTexture(768, 480, (ctx) => paintFernPlate(ctx, 768, 480, palette)),
      platePeony: null,
      plateRed: null,
      plateAndrews: null,
      plateBotmag: null,
      plateMonet: null,
    }
  }

  private platesStarted = false
  private async loadPlates(): Promise<void> {
    if (this.platesStarted) return
    this.platesStarted = true
    const base = import.meta.env.BASE_URL || '/'
    const [peony, red, andrews, botmag, monet] = await Promise.all([
      loadPlateTexture(`${base}plates/peony-white.webp`),
      loadPlateTexture(`${base}plates/peony-red.webp`),
      loadPlateTexture(`${base}plates/peony-andrews.webp`),
      loadPlateTexture(`${base}plates/peony-botmag.webp`),
      loadPlateTexture(`${base}plates/monet-waterlilies.webp`),
    ])
    if (this.disposed) {
      for (const t of [peony, red, andrews, botmag, monet]) t?.dispose()
      return
    }
    this.env.assets.platePeony = peony
    this.env.assets.plateRed = red
    this.env.assets.plateAndrews = andrews
    this.env.assets.plateBotmag = botmag
    this.env.assets.plateMonet = monet
    for (const m of this.modes.values()) m.refreshAssets?.()
  }

  setVideo(video: HTMLVideoElement | null): void {
    this.videoTexture?.dispose()
    this.videoTexture = null
    if (video) {
      this.videoTexture = new THREE.VideoTexture(video)
      this.videoTexture.colorSpace = THREE.NoColorSpace
      this.videoTexture.minFilter = THREE.LinearFilter
      this.videoTexture.magFilter = THREE.LinearFilter
    }
  }

  setVideoActive(active: boolean): void {
    this.videoActive = active
  }

  get videoTextureRef(): THREE.VideoTexture | null {
    return this.videoActive ? this.videoTexture : null
  }

  private ensureMode(id: ModeId): GardenMode {
    const existing = this.modes.get(id)
    if (existing) return existing
    const mode = createMode(id)
    mode.init(this.env)
    mode.resize(this.env)
    this.modes.set(id, mode)
    try {
      this.renderer.compile(mode.scene, mode.camera)
    } catch {
      /* compile is best-effort */
    }
    return mode
  }

  private warmAll(): void {
    if (this.disposed) return
    const ids: ModeId[] = ['frame', 'tendril', 'ripple', 'spore', 'mycelium', 'mist', 'phyllotaxis']
    for (const id of ids) {
      if (this.disposed) return
      if (!this.modes.has(id)) this.ensureMode(id)
    }
    void this.loadPlates()
  }

  setMode(id: ModeId): void {
    if (id === this.modeId && this.active) return
    const next = this.ensureMode(id)
    const prev = this.active
    this.modeId = id
    this.active = next
    if (!prev || prev === next || this.env.reducedMotion) {
      this.transition = null
      return
    }
    this.transition = {
      from: prev,
      to: next,
      start: performance.now(),
      duration: 500,
    }
  }

  setSeason(season: Season): void {
    if (season === this.env.season) return
    this.env.season = season
    this.env.palette = paletteFor(season)
    for (const m of this.modes.values()) m.setSeason?.(season)
  }

  setReducedMotion(reduced: boolean): void {
    this.env.reducedMotion = reduced
    this.audio.reducedMotion = reduced
    if (reduced) this.transition = null
  }

  resize(): void {
    if (this.disposed) return
    const canvas = this.opts.glCanvas
    const parent = canvas.parentElement
    const rect = parent?.getBoundingClientRect()
    const width = Math.max(1, Math.floor(rect?.width || canvas.clientWidth || 1))
    const height = Math.max(1, Math.floor(rect?.height || canvas.clientHeight || 1))
    this.env.width = width
    this.env.height = height
    const base = Math.min(window.devicePixelRatio || 1, 2)
    this.env.dpr = Math.max(0.65, Math.min(2, base * this.governor.state.dprScale))
    this.renderer.setPixelRatio(this.env.dpr)
    this.renderer.setSize(width, height, false)
    const overlay = this.opts.overlayCanvas
    overlay.width = Math.max(1, Math.round(width * this.env.dpr))
    overlay.height = Math.max(1, Math.round(height * this.env.dpr))
    overlay.style.width = `${width}px`
    overlay.style.height = `${height}px`
    this.ink.resize(width, height, this.env.dpr)
    for (const mode of this.modes.values()) mode.resize(this.env)
    this.allocTargets()
  }

  private allocTargets(): void {
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2())
    const w = Math.max(2, Math.round(size.x))
    const h = Math.max(2, Math.round(size.y))
    if (this.rtA && this.rtA.width === w && this.rtA.height === h) return
    this.rtA?.dispose()
    this.rtB?.dispose()
    const opts = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      depthBuffer: false,
      stencilBuffer: false,
      type: THREE.UnsignedByteType,
    }
    this.rtA = new THREE.WebGLRenderTarget(w, h, opts)
    this.rtB = new THREE.WebGLRenderTarget(w, h, opts)
  }

  private applyQuality(state: QualityState): void {
    this.env.quality = state.particleScale
    this.resize()
    this.opts.onQuality?.(state)
  }

  start(): void {
    if (this.raf) return
    this.startedAt = performance.now()
    this.lastFrame = 0
    this.fpsStart = this.startedAt
    this.governor.reset(this.startedAt)
    this.raf = requestAnimationFrame(this.tick)
  }

  private tick = (now: number): void => {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.tick)
    if (!this.active) return
    if (this.paused) {
      this.lastFrame = 0
      return
    }
    const dtMs = this.lastFrame === 0 ? 16.7 : Math.min(50, Math.max(1, now - this.lastFrame))
    this.lastFrame = now
    const dt = dtMs / 1000
    const time = this.env.reducedMotion ? 8 : (now - this.startedAt) / 1000
    const frame = this.opts.getFrame()
    this.env.video = this.videoTextureRef
    // give shaders / the first fixture load a 6 s grace window before adapting
    const quality =
      now - this.startedAt > 6000 ? this.governor.report(dtMs, now) : this.governor.state
    this.audio.update(now / 1000, frame.present)
    this.audio.setHandX(frame.hands[0]?.landmarks[9]?.x ?? null)

    const modeFrame = {
      hands: frame,
      dt,
      time,
      season: this.env.season,
      quality: quality.particleScale,
      reducedMotion: this.env.reducedMotion,
    }
    // update
    if (this.transition) this.transition.from.update(modeFrame)
    this.active.update(modeFrame)

    // render
    if (this.transition && this.rtA && this.rtB) {
      const t = Math.min(1, (now - this.transition.start) / this.transition.duration)
      this.renderer.setRenderTarget(this.rtA)
      this.renderer.clear()
      this.transition.from.render(this.renderer)
      this.renderer.setRenderTarget(this.rtB)
      this.renderer.clear()
      this.transition.to.render(this.renderer)
      this.renderer.setRenderTarget(null)
      this.renderer.clear()
      this.compositeMat.uniforms.uA.value = this.rtA.texture
      this.compositeMat.uniforms.uB.value = this.rtB.texture
      this.compositeMat.uniforms.uMix.value = t * t * (3 - 2 * t)
      this.renderer.render(this.compositeScene, this.compositeCamera)
      this.ink.clear()
      this.ink.alpha = 1 - t
      this.transition.from.drawOverlay(this.ink)
      this.ink.alpha = t
      this.transition.to.drawOverlay(this.ink)
      this.ink.alpha = 1
      if (t >= 1) this.transition = null
    } else {
      this.renderer.setRenderTarget(null)
      this.active.render(this.renderer)
      this.ink.clear()
      this.ink.alpha = 1
      this.active.drawOverlay(this.ink)
    }

    // fps accounting (visible frames only)
    this.fpsFrames++
    if (now - this.fpsStart >= 500) {
      this.fps = (this.fpsFrames * 1000) / (now - this.fpsStart)
      this.fpsFrames = 0
      this.fpsStart = now
      this.opts.onFps?.(this.fps)
    }
  }

  getFps(): number {
    return this.fps
  }

  get mode(): ModeId {
    return this.modeId
  }

  collect(): SpecimenSeed {
    if (!this.active) {
      return { mode: this.modeId, season: this.env.season, seed: Date.now() >>> 0 }
    }
    return this.active.collect()
  }

  clear(): void {
    this.active?.clear?.()
  }

  getState(): Partial<StageState> {
    return { mode: this.modeId, season: this.env.season, fps: Math.round(this.fps) }
  }

  a11ySummary(): string {
    return this.active?.a11ySummary() ?? ''
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.io?.disconnect()
    for (const mode of this.modes.values()) {
      try {
        mode.dispose()
      } catch {
        /* best effort */
      }
    }
    this.modes.clear()
    this.rtA?.dispose()
    this.rtB?.dispose()
    this.compositeMat.dispose()
    this.videoTexture?.dispose()
    for (const tex of Object.values(this.env.assets)) {
      if (tex && 'dispose' in tex) (tex as THREE.Texture).dispose()
    }
    this.audio.dispose()
    this.renderer.dispose()
    try {
      this.renderer.forceContextLoss()
    } catch {
      /* ignored */
    }
  }
}
