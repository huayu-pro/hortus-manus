/**
 * HORTUS MANUS — live vitals (owner: stage).
 *
 * All numbers here are measured in this browser:
 *  - FPS: requestAnimationFrame deltas over a rolling 1s window
 *  - frame time: 1000 / fps
 *  - input latency: pointerdown → next animation frame (what a visitor feels)
 *  - API health: GET /api/health round-trip + specimen count
 * Nothing is simulated. If a value cannot be measured it prints an em dash.
 */

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { formatCount, readout } from '@/lib/format'
import { useLang } from '@/lib/i18n'

export interface PerformanceSample {
  fps: number | null
  frameMs: number | null
  latencyMs: number | null
  dpr: number
  viewport: { w: number; h: number }
  reducedMotion: boolean
  pointer: 'fine' | 'coarse'
}

export function usePerformance(): PerformanceSample {
  const [sample, setSample] = useState<PerformanceSample>(() => ({
    fps: null,
    frameMs: null,
    latencyMs: null,
    dpr: typeof window === 'undefined' ? 1 : window.devicePixelRatio,
    viewport: {
      w: typeof window === 'undefined' ? 0 : window.innerWidth,
      h: typeof window === 'undefined' ? 0 : window.innerHeight,
    },
    reducedMotion: false,
    pointer: 'fine',
  }))

  useEffect(() => {
    let frames = 0
    let last = performance.now()
    let raf = 0
    let alive = true
    let latency: number | null = null
    let latencyTimer = 0

    const tick = (now: number) => {
      if (!alive) return
      frames += 1
      const elapsed = now - last
      if (elapsed >= 1000) {
        const fps = (frames * 1000) / elapsed
        frames = 0
        last = now
        setSample((prev) => ({
          ...prev,
          fps: Math.round(fps),
          frameMs: Math.round((1000 / Math.max(1, fps)) * 10) / 10,
          latencyMs: latency,
          dpr: window.devicePixelRatio,
          viewport: { w: window.innerWidth, h: window.innerHeight },
        }))
      }
      raf = window.requestAnimationFrame(tick)
    }

    const measureLatency = () => {
      const down = performance.now()
      window.requestAnimationFrame(() => {
        latency = Math.round((performance.now() - down) * 10) / 10
      })
      window.clearTimeout(latencyTimer)
      latencyTimer = window.setTimeout(() => {
        latency = null
      }, 4000)
    }

    const mqlReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mqlPointer = window.matchMedia('(pointer: coarse)')
    setSample((prev) => ({
      ...prev,
      reducedMotion: mqlReduced.matches,
      pointer: mqlPointer.matches ? 'coarse' : 'fine',
    }))

    window.addEventListener('pointerdown', measureLatency, { passive: true })
    raf = window.requestAnimationFrame(tick)

    return () => {
      alive = false
      window.cancelAnimationFrame(raf)
      window.removeEventListener('pointerdown', measureLatency)
      window.clearTimeout(latencyTimer)
    }
  }, [])

  return sample
}

export interface ApiHealth {
  ok: boolean
  version: string
  specimens: number
  roundTripMs: number | null
  checkedAt: number | null
}

export function useApiHealth(intervalMs = 30_000): ApiHealth {
  const [health, setHealth] = useState<ApiHealth>({
    ok: false,
    version: '',
    specimens: 0,
    roundTripMs: null,
    checkedAt: null,
  })
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    const check = async () => {
      const start = performance.now()
      try {
        const res = await api.getHealth()
        if (!mounted.current) return
        setHealth({
          ok: Boolean(res.ok),
          version: res.version,
          specimens: res.specimens,
          roundTripMs: Math.round(performance.now() - start),
          checkedAt: Date.now(),
        })
      } catch {
        if (!mounted.current) return
        setHealth((prev) => ({ ...prev, ok: false, roundTripMs: null, checkedAt: Date.now() }))
      }
    }
    void check()
    const id = window.setInterval(() => void check(), intervalMs)
    return () => {
      mounted.current = false
      window.clearInterval(id)
    }
  }, [intervalMs])

  return health
}

/** The small paper strip used on the field guide and the home field-note act. */
export function VitalsStrip({ compact = false }: { compact?: boolean }) {
  const { copy } = useLang()
  const perf = usePerformance()
  const health = useApiHealth(20_000)

  return (
    <div className={`hm-vitals${compact ? ' hm-vitals--compact' : ''}`} role="status" aria-live="off" aria-label={copy.aria.liveReadout}>
      <div className="hm-vitals__cell">
        <span className="hm-vitals__k">{copy.care.fps}</span>
        <span className="hm-vitals__v" data-live={perf.fps !== null ? 'true' : undefined}>
          {readout(perf.fps, copy.care.fpsUnit)}
        </span>
      </div>
      <div className="hm-vitals__cell">
        <span className="hm-vitals__k">{copy.care.latency}</span>
        <span className="hm-vitals__v">{perf.latencyMs !== null ? readout(perf.latencyMs, copy.care.latencyUnit, 1) : `— ${copy.care.latencyUnit}`}</span>
      </div>
      <div className="hm-vitals__cell">
        <span className="hm-vitals__k">{copy.specimen.herbariumNo}</span>
        <span className="hm-vitals__v">{health.ok ? formatCount(health.specimens) : '—'}</span>
      </div>
      <div className="hm-vitals__cell">
        <span className="hm-vitals__k">{copy.care.camera}</span>
        <span className="hm-vitals__v">{health.ok ? copy.common.online : copy.common.offline}</span>
      </div>
      {!compact ? (
        <>
          <div className="hm-vitals__cell">
            <span className="hm-vitals__k">DPR</span>
            <span className="hm-vitals__v">{perf.dpr.toFixed(2)}</span>
          </div>
          <div className="hm-vitals__cell">
            <span className="hm-vitals__k">VIEWPORT</span>
            <span className="hm-vitals__v">
              {perf.viewport.w}×{perf.viewport.h}
            </span>
          </div>
        </>
      ) : null}
    </div>
  )
}
