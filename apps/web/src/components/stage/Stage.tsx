/**
 * Stage — the product-embedded living garden.
 *
 * Chrome-less by contract with the page owner: this component renders only the
 * GL canvas, the ink overlay, a hidden <video> for the camera and the a11y live
 * region. The page builds its own HUD around it (see lab-main.tsx for a full
 * reference HUD). All functionality is reachable through StageHandle.
 *
 * No camera is requested on mount. The ghost autopilot drives the stage until
 * the user points, touches, uses the keyboard, or explicitly turns the camera on.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import type {
  CameraState,
  Gesture,
  HandFrame,
  InputSource,
  ModeId,
  Season,
  SpecimenSeed,
  StageHandle,
  StageProps,
  StageState,
} from '@hortus/shared'
import { MODES, findMode, isModeId, seasonLabel } from '@hortus/shared'
import type { GardenEngine } from '@/engine/GardenEngine'
import type { HandsController } from '@/hands'
import './stage.css'

const ZERO_FRAME: HandFrame = {
  hands: [],
  t: 0,
  source: 'ghost',
  fps: 0,
  latencyMs: 0,
  gesture: { gesture: 'none', confidence: 0, hands: 0 },
  present: false,
}

const MODE_ORDER: ModeId[] = ['frame', 'tendril', 'ripple', 'spore', 'mycelium', 'mist', 'phyllotaxis']
const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter']

function initialSeason(props: StageProps): Season {
  if (props.initialSeason) return props.initialSeason
  const m = new Date().getMonth() + 1
  if (m >= 3 && m <= 5) return 'spring'
  if (m >= 6 && m <= 8) return 'summer'
  if (m >= 9 && m <= 11) return 'autumn'
  return 'winter'
}

export const Stage = forwardRef<StageHandle, StageProps>(function Stage(props, ref) {
  const { immersive = false, className, onState, onCollect } = props
  const hostRef = useRef<HTMLDivElement>(null)
  const glRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const engineRef = useRef<GardenEngine | null>(null)
  const handsRef = useRef<HandsController | null>(null)
  const stateRef = useRef<StageState>({
    mode: props.initialMode ?? 'frame',
    season: initialSeason(props),
    camera: 'off',
    source: 'ghost',
    fps: 0,
    latencyMs: 0,
    gesture: 'none',
    hands: 0,
    quiet: false,
    sound: false,
    seasonLabel: seasonLabel(props.initialSeason ?? initialSeason(props), 'zh'),
  })
  const frameRef = useRef<HandFrame>(ZERO_FRAME)
  const emitRef = useRef(0)
  const lastEmit = useRef(0)
  const soundRef = useRef(false)
  const quietRef = useRef(false)
  const onStateRef = useRef(onState)
  const onCollectRef = useRef(onCollect)
  onStateRef.current = onState
  onCollectRef.current = onCollect

  const [ready, setReady] = useState(false)
  const [a11yText, setA11yText] = useState('花园正在醒来 / the garden is waking')

  const commit = useCallback((patch: Partial<StageState>, force = false) => {
    stateRef.current = { ...stateRef.current, ...patch }
    const now = performance.now()
    if (force || now - lastEmit.current > 96) {
      lastEmit.current = now
      onStateRef.current?.(stateRef.current)
    }
  }, [])

  /* ------------------------------------------------------------------ boot */
  useEffect(() => {
    let disposed = false
    let engine: GardenEngine | null = null
    let hands: HandsController | null = null
    let resizeObserver: ResizeObserver | null = null
    let media: MediaQueryList | null = null
    const cleanups: (() => void)[] = []
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    const boot = async (): Promise<void> => {
      const gl = glRef.current
      const overlay = overlayRef.current
      const video = videoRef.current
      const host = hostRef.current
      if (!gl || !overlay || !video || !host) return
      const [{ GardenEngine: Engine }, handsMod] = await Promise.all([
        import('@/engine/GardenEngine'),
        import('@/hands'),
      ])
      if (disposed) return
      hands = new handsMod.HandsController({
        video,
        stageEl: host,
        reducedMotion: reduced,
        mode: stateRef.current.mode,
        onCameraState: (camera: CameraState) => {
          commit({ camera, source: camera === 'on' ? 'camera' : hands?.source ?? 'ghost' })
          engine?.setVideoActive(camera === 'on')
          if (camera !== 'on') engine?.setVideoActive(false)
        },
        onSourceChange: (source: InputSource) => commit({ source }),
      })
      engine = new Engine({
        glCanvas: gl,
        overlayCanvas: overlay,
        mode: stateRef.current.mode,
        season: stateRef.current.season,
        reducedMotion: reduced,
        video,
        getFrame: () => {
          const f = hands?.update(performance.now()) ?? ZERO_FRAME
          frameRef.current = f
          return f
        },
        onFps: (fps) => commit({ fps: Math.round(fps) }),
        onQuality: (q) => {
          // chrome-less Stage: surface the readable degradation hint to the page
          window.dispatchEvent(new CustomEvent('hm:quality', { detail: q }))
          if (q.message) setA11yText(q.message)
        },
      })
      engineRef.current = engine
      handsRef.current = hands
      engine.audio.setMode(stateRef.current.mode)
      engine.start()
      setReady(true)
      commit({ source: hands.source, camera: hands.camera }, true)

      resizeObserver = new ResizeObserver(() => engine?.resize())
      resizeObserver.observe(host)

      // reduced motion listener
      media = window.matchMedia('(prefers-reduced-motion: reduce)')
      const onMedia = (e: MediaQueryListEvent): void => {
        engine?.setReducedMotion(e.matches)
      }
      media.addEventListener?.('change', onMedia)
      cleanups.push(() => media?.removeEventListener?.('change', onMedia))

      // expose for debug labs only
      ;(window as unknown as { __hmStage?: unknown }).__hmStage = { engine, hands }
    }
    void boot()

    return () => {
      disposed = true
      cleanups.forEach((c) => c())
      resizeObserver?.disconnect()
      hands?.dispose()
      engine?.dispose()
      engineRef.current = null
      handsRef.current = null
    }
  }, [commit])

  /* ------------------------------------------------------------- state pump */
  useEffect(() => {
    if (!ready) return
    let raf = 0
    let last = 0
    const tick = (now: number): void => {
      raf = requestAnimationFrame(tick)
      if (now - last < 100) return
      last = now
      const f = frameRef.current
      const engine = engineRef.current
      commit({
        mode: engine?.mode ?? stateRef.current.mode,
        season: engine?.env.season ?? stateRef.current.season,
        fps: engine ? Math.round(engine.getFps()) : stateRef.current.fps,
        latencyMs: Math.round(f.latencyMs),
        gesture: f.gesture.gesture,
        hands: f.gesture.hands,
        source: f.source,
        camera: handsRef.current?.camera ?? stateRef.current.camera,
        seasonLabel: seasonLabel(stateRef.current.season, 'zh'),
      })
      const summary = engine?.a11ySummary()
      if (summary) setA11yText(summary)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ready, commit])

  /* --------------------------------------------------------------- keyboard */
  useEffect(() => {
    const active = (): boolean => {
      const el = document.activeElement
      return !!el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)
    }
    const cycleMode = (dir: number): void => {
      const cur = stateRef.current.mode
      const i = MODE_ORDER.indexOf(cur)
      setMode(MODE_ORDER[(i + dir + MODE_ORDER.length) % MODE_ORDER.length])
    }
    const setMode = (mode: ModeId): void => {
      engineRef.current?.setMode(mode)
      handsRef.current?.setMode(mode)
      engineRef.current?.audio.setMode(mode)
      commit({ mode, seasonLabel: seasonLabel(stateRef.current.season, 'zh') }, true)
    }
    const onKey = (e: KeyboardEvent): void => {
      if (active() || e.metaKey || e.ctrlKey || e.altKey) return
      const modeByKey: Record<string, ModeId> = {
        '1': 'frame',
        '2': 'tendril',
        '3': 'ripple',
        '4': 'spore',
        '5': 'mycelium',
        '6': 'mist',
        '7': 'phyllotaxis',
        q: 'frame',
        w: 'tendril',
        e: 'ripple',
        r: 'spore',
      }
      const k = e.key.toLowerCase()
      if (modeByKey[k]) {
        e.preventDefault()
        setMode(modeByKey[k])
        return
      }
      switch (k) {
        case 'c':
          e.preventDefault()
          engineRef.current?.clear()
          setA11yText('已清屏 / cleared')
          break
        case 'g':
          e.preventDefault()
          if (handsRef.current) {
            handsRef.current.setGhostEnabled(!handsRef.current.ghostEnabled)
            commit({ source: handsRef.current.ghostEnabled ? 'ghost' : handsRef.current.source }, true)
          }
          break
        case 'escape':
          if (quietRef.current) {
            quietRef.current = false
            engineRef.current?.setReducedMotion(false)
            commit({ quiet: false }, true)
          }
          window.dispatchEvent(new CustomEvent('hm:escape'))
          break
        case 'x':
        case 's':
        case 'd':
        case '?':
        case '/':
          // product chrome owns these (season / sound / view / help): let the page react
          window.dispatchEvent(new CustomEvent(`hm:${k === '?' ? 'help' : k === '/' ? 'help' : k}`))
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [commit])

  /* --------------------------------------------------------------- gestures */
  useEffect(() => {
    if (!ready) return
    let raf = 0
    let fistSince = 0
    let lastSwitch = 0
    const tick = (): void => {
      raf = requestAnimationFrame(tick)
      const g = frameRef.current.gesture
      const now = performance.now()
      if (g.gesture === 'fist' && g.hands >= 2) {
        if (!fistSince) fistSince = now
        if (now - fistSince > 520 && now - lastSwitch > 1600) {
          lastSwitch = now
          fistSince = 0
          const cur = stateRef.current.mode
          const i = MODE_ORDER.indexOf(cur)
          const next = MODE_ORDER[(i + 1) % MODE_ORDER.length]
          engineRef.current?.setMode(next)
          handsRef.current?.setMode(next)
          engineRef.current?.audio.setMode(next)
          commit({ mode: next }, true)
          setA11yText(`双拳切换 · 模式 ${findMode(next).zh}`)
        }
      } else fistSince = 0
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ready, commit])

  /* ---------------------------------------------------------------- handles */
  const setMode = useCallback(
    (mode: ModeId) => {
      if (!isModeId(mode)) return
      engineRef.current?.setMode(mode)
      handsRef.current?.setMode(mode)
      engineRef.current?.audio.setMode(mode)
      commit({ mode }, true)
    },
    [commit],
  )

  const setSeason = useCallback(
    (season: Season) => {
      engineRef.current?.setSeason(season)
      commit({ season, seasonLabel: seasonLabel(season, 'zh') }, true)
      setA11yText(`季节 · ${seasonLabel(season, 'zh')}`)
    },
    [commit],
  )

  useImperativeHandle(
    ref,
    (): StageHandle => ({
      setMode,
      setSeason,
      setCamera: async (on: boolean) => {
        const state = await handsRef.current?.setCamera(on)
        engineRef.current?.setVideoActive(state === 'on')
        commit({ camera: state ?? 'off' }, true)
      },
      setSound: (on: boolean) => {
        soundRef.current = on
        const audio = engineRef.current?.audio
        if (!audio) return
        void audio.unlock().then(() => audio.setMuted(!on))
        commit({ sound: on }, true)
      },
      clear: () => {
        engineRef.current?.clear()
        setA11yText('已清屏 / cleared')
      },
      enterQuiet: () => {
        quietRef.current = !quietRef.current
        engineRef.current?.setReducedMotion(quietRef.current)
        if (quietRef.current) {
          engineRef.current?.audio.setMuted(true)
          soundRef.current = false
        }
        commit({ quiet: quietRef.current, sound: soundRef.current }, true)
      },
      collect: () => {
        const engine = engineRef.current
        const seed: SpecimenSeed = engine
          ? engine.collect()
          : { mode: stateRef.current.mode, season: stateRef.current.season, seed: Date.now() >>> 0 }
        onCollectRef.current?.(seed)
        setA11yText(`已采集标本 · seed ${seed.seed.toString(16).toUpperCase()}`)
        return seed
      },
      getState: () => stateRef.current,
    }),
    [setMode, setSeason, commit],
  )

  /* ------------------------------------------------------------------ render */
  return (
    <div
      ref={hostRef}
      className={`hm-stage${immersive ? ' hm-stage--immersive' : ' hm-stage--framed'}${className ? ` ${className}` : ''}`}
      data-ready={ready ? 'true' : 'false'}
    >
      <canvas ref={glRef} className="hm-stage__gl" aria-hidden="true" />
      <canvas
        ref={overlayRef}
        className="hm-stage__ink"
        role="img"
        aria-label={a11yText}
        tabIndex={0}
      />
      <video ref={videoRef} className="hm-stage__video" muted playsInline aria-hidden="true" />
      <div className="hm-stage__sr" role="status" aria-live="polite" aria-atomic="true">
        {a11yText}
      </div>
    </div>
  )
})

export default Stage
export type { StageProps, StageHandle, StageState, Gesture }
export { MODES }
