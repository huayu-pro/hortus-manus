/**
 * Development laboratory for HORTUS MANUS.
 *
 * A standalone page (no App / no router) that mounts the chrome-less Stage plus a
 * complete editorial HUD for manual acceptance: 7 modes, 4 seasons, input-source
 * switching, camera permission, sound, quiet mode, onboarding and a help sheet.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import './styles/fonts.css'
import Stage from './components/stage/Stage'
import type { CameraState, ModeId, Season, SpecimenSeed, StageHandle, StageState } from '@hortus/shared'
import { MODES, SEASONS, findMode, findSeason } from '@hortus/shared'

const MODE_ORDER: ModeId[] = ['frame', 'tendril', 'ripple', 'spore', 'mycelium', 'mist', 'phyllotaxis']
const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter']
const ONBOARD_KEY = 'hm.lab.onboarded.v1'

const params = new URLSearchParams(location.search)
;(window as unknown as { __hmStageLabels?: boolean }).__hmStageLabels = params.get('labels') !== '0'

function initialMode(): ModeId {
  const q = params.get('mode')
  return (MODE_ORDER as string[]).includes(q ?? '') ? (q as ModeId) : 'frame'
}
function initialSeason(): Season {
  const q = params.get('season')
  if ((SEASON_ORDER as string[]).includes(q ?? '')) return q as Season
  const m = new Date().getMonth() + 1
  if (m >= 3 && m <= 5) return 'spring'
  if (m >= 6 && m <= 8) return 'summer'
  if (m >= 9 && m <= 11) return 'autumn'
  return 'winter'
}

function Glyph({ name }: { name: string }) {
  switch (name) {
    case 'window':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5" width="16" height="14" />
          <path d="M12 5v14M4 12h16" />
        </svg>
      )
    case 'knot':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <ellipse cx="12" cy="12" rx="7" ry="3.4" transform="rotate(32 12 12)" />
          <ellipse cx="12" cy="12" rx="7" ry="3.4" transform="rotate(-32 12 12)" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      )
    case 'ripple':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="2.2" />
          <circle cx="12" cy="12" r="5" opacity="0.7" />
          <circle cx="12" cy="12" r="8" opacity="0.42" />
        </svg>
      )
    case 'seed':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="14" r="1.8" />
          <path d="M12 12V4M12 8l-3-2M12 8l3-2M12 10l-4-1M12 10l4-1M9 4l3 2 3-2" opacity="0.8" />
        </svg>
      )
    case 'web':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="5" cy="16" r="1.4" />
          <circle cx="12" cy="6" r="1.4" />
          <circle cx="19" cy="15" r="1.4" />
          <circle cx="12" cy="19" r="1.4" />
          <path d="M5 16l7-10 7 9-7 4zM5 16l14-1M12 6v13" opacity="0.7" />
        </svg>
      )
    case 'mist':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="11" r="5.4" opacity="0.55" />
          <path d="M4 17c2.4 0 2.4-1.6 4.8-1.6S11.2 17 13.6 17s2.4-1.6 4.8-1.6S20.8 17 22 17" opacity="0.85" />
          <path d="M4 20c2.4 0 2.4-1.4 4.8-1.4S11.2 20 13.6 20s2.4-1.4 4.8-1.4S20.8 20 22 20" opacity="0.4" />
        </svg>
      )
    case 'spiral':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a1.6 1.6 0 0 1 1.6-1.6c1.8 0 2.6 2 2 3.6-.9 2.4-4 3-6 1.8-2.8-1.6-3.2-5.6-1-7.8 3-3 8.4-2.2 10.2 1.6 1.6 3.4-.2 7.6-4 8.8" />
        </svg>
      )
    default:
      return null
  }
}

function formatSeed(seed: number): string {
  return seed.toString(16).toUpperCase().padStart(8, '0')
}

function cameraLabel(camera: CameraState): { text: string; cls: string } {
  switch (camera) {
    case 'on':
      return { text: '摄像头开启 CAMERA', cls: 'is-live' }
    case 'requesting':
      return { text: '请求摄像头… REQUESTING', cls: '' }
    case 'denied':
      return { text: '摄像头被拒绝 · 幽灵手 GHOST', cls: 'is-off' }
    case 'unavailable':
      return { text: '无摄像头 · 幽灵手 GHOST', cls: 'is-off' }
    default:
      return { text: '幽灵手演示 GHOST HANDS', cls: '' }
  }
}

function LabApp() {
  const stageRef = useRef<StageHandle>(null)
  const [state, setState] = useState<StageState>({
    mode: initialMode(),
    season: initialSeason(),
    camera: 'off',
    source: 'ghost',
    fps: 0,
    latencyMs: 0,
    gesture: 'none',
    hands: 0,
    quiet: false,
    sound: false,
    seasonLabel: findSeason(initialSeason()).zh,
  })
  const [help, setHelp] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [onboard, setOnboard] = useState(false)
  const [uiHidden, setUiHidden] = useState(params.get('clean') === '1')
  const [collected, setCollected] = useState<SpecimenSeed[]>([])
  const toastTimer = useRef(0)

  useEffect(() => {
    if (params.get('onboard') === '0') return
    let done = false
    try {
      done = localStorage.getItem(ONBOARD_KEY) === '1'
    } catch {
      done = true
    }
    if (!done) setOnboard(true)
  }, [])

  const dismissOnboard = useCallback(() => {
    setOnboard(false)
    try {
      localStorage.setItem(ONBOARD_KEY, '1')
    } catch {
      /* private mode */
    }
  }, [])

  const flash = useCallback((text: string) => {
    setToast(text)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const onState = useCallback((s: StageState) => setState(s), [])

  const onCollect = useCallback(
    (seed: SpecimenSeed) => {
      setCollected((prev) => [seed, ...prev].slice(0, 7))
      flash(`已采集 · ${findMode(seed.mode).zh} · SEED ${formatSeed(seed.seed)}`)
    },
    [flash],
  )

  const setMode = useCallback((mode: ModeId) => stageRef.current?.setMode(mode), [])
  const cycleSeason = useCallback(() => {
    const i = SEASON_ORDER.indexOf(state.season)
    stageRef.current?.setSeason(SEASON_ORDER[(i + 1) % SEASON_ORDER.length])
  }, [state.season])

  const toggleSound = useCallback(() => {
    const next = !state.sound
    stageRef.current?.setSound(next)
    flash(next ? '声音开启 · sound on' : '声音关闭 · muted')
  }, [state.sound, flash])

  const toggleCamera = useCallback(() => {
    const next = state.camera !== 'on'
    void stageRef.current?.setCamera(next)
    flash(next ? '正在请求摄像头…' : '摄像头关闭 · 幽灵手接管')
  }, [state.camera, flash])

  const toggleGhost = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    flash('输入源 · ghost 切换')
  }, [flash])

  const toggleQuiet = useCallback(() => {
    stageRef.current?.enterQuiet()
    flash(state.quiet ? '静默结束' : '静默模式 · 声音与持续动效暂停')
  }, [state.quiet, flash])

  const collect = useCallback(() => {
    stageRef.current?.collect()
  }, [])

  // keyboard: Stage forwards product-chrome keys as CustomEvents
  useEffect(() => {
    const onX = (): void => cycleSeason()
    const onS = (): void => toggleSound()
    const onD = (): void => setUiHidden((v) => !v)
    const onHelp = (): void => setHelp((v) => !v)
    const onEsc = (): void => {
      setHelp(false)
      setOnboard(false)
    }
    window.addEventListener('hm:x', onX)
    window.addEventListener('hm:s', onS)
    window.addEventListener('hm:d', onD)
    window.addEventListener('hm:help', onHelp)
    const onQuality = (e: Event): void => {
      const detail = (e as CustomEvent<{ message?: string | null }>).detail
      if (detail?.message) flash(detail.message)
    }
    window.addEventListener('hm:quality', onQuality)
    window.addEventListener('hm:escape', onEsc)
    return () => {
      window.removeEventListener('hm:x', onX)
      window.removeEventListener('hm:s', onS)
      window.removeEventListener('hm:d', onD)
      window.removeEventListener('hm:help', onHelp)
      window.removeEventListener('hm:quality', onQuality)
      window.removeEventListener('hm:escape', onEsc)
    }
  }, [cycleSeason, toggleSound])

  // lab automation hook (Playwright uses this)
  useEffect(() => {
    ;(window as unknown as { __hmLab?: unknown }).__hmLab = {
      setMode,
      setSeason: (s: Season) => stageRef.current?.setSeason(s),
      collect,
      getState: () => stageRef.current?.getState(),
      setCamera: (on: boolean) => stageRef.current?.setCamera(on),
      setSound: (on: boolean) => stageRef.current?.setSound(on),
      hideUi: (v: boolean) => setUiHidden(v),
    }
  }, [setMode, collect])

  const mode = findMode(state.mode)
  const camera = cameraLabel(state.camera)
  const season = findSeason(state.season)
  const sourceText = state.camera === 'on' ? 'CAMERA' : state.source === 'pointer' ? 'POINTER' : state.source === 'ghost' ? 'GHOST' : '—'

  return (
    <div className="lab-root">
      <div className="lab-stage">
        <Stage
          ref={stageRef}
          immersive
          initialMode={initialMode()}
          initialSeason={initialSeason()}
          onState={onState}
          onCollect={onCollect}
        />
      </div>

      {!uiHidden && (
        <div className="lab-ui">
          <div className="lab-brand">
            <span className="lab-brand__mark">HORTUS MANUS</span>
            <span className="lab-brand__sub">指间花园 · LABORATORY</span>
          </div>

          <div className="lab-care" aria-live="polite">
            <strong>
              {mode.en} / {mode.zh}
            </strong>
            <div>
              <em>{season.en}</em> · {season.zh} {season.latin}
            </div>
            <div className={camera.cls}>{camera.text}</div>
            <div>
              {sourceText} · {state.fps} FPS · {state.latencyMs} MS · {state.hands} HANDS · {state.gesture.toUpperCase()}
            </div>
          </div>

          <div className="lab-debug">
            <div>
              MODE <b>{state.mode}</b> · SEASON <b>{state.season}</b>
            </div>
            <div>
              GESTURE <b>{state.gesture}</b> · CONF {state.hands ? '·' : '—'} · QUIET <b>{state.quiet ? 'ON' : 'OFF'}</b>
            </div>
            <div>LATIN {mode.latin}</div>
            <div>FAMILY {mode.family}</div>
            <div>MOTIF {mode.motif}</div>
          </div>

          <div className="lab-tools">
            <button type="button" className="lab-tool" onClick={toggleCamera} aria-pressed={state.camera === 'on'}>
              <span className="lab-tool__dot" />
              摄像头 <kbd>CAM</kbd>
            </button>
            <button type="button" className="lab-tool" onClick={toggleGhost} aria-pressed={state.source === 'ghost'}>
              <span className="lab-tool__dot" />
              幽灵手 <kbd>G</kbd>
            </button>
            <button type="button" className="lab-tool" onClick={toggleSound} aria-pressed={state.sound}>
              <span className="lab-tool__dot" />
              声音 <kbd>S</kbd>
            </button>
            <button type="button" className="lab-tool" onClick={cycleSeason} aria-pressed={false}>
              <span className="lab-tool__dot" />
              季节 {season.zh} <kbd>X</kbd>
            </button>
            <button type="button" className="lab-tool" onClick={toggleQuiet} aria-pressed={state.quiet}>
              <span className="lab-tool__dot" />
              静默 <kbd>Q</kbd>
            </button>
            <button type="button" className="lab-tool" onClick={() => setHelp((v) => !v)} aria-pressed={help}>
              <span className="lab-tool__dot" />
              帮助 <kbd>?</kbd>
            </button>
          </div>

          <div className="lab-rail" role="group" aria-label="七种花园模式 / seven gardens">
            {MODES.map((m, i) => (
              <button
                key={m.id}
                type="button"
                className="lab-mode"
                aria-pressed={state.mode === m.id}
                aria-label={`${m.zh} ${m.en}`}
                title={`${m.zh} ${m.en} · ${m.gestureZh}`}
                onClick={() => setMode(m.id)}
                data-mode={m.id}
                data-key={i + 1}
              >
                <span className="lab-mode__glyph">
                  <Glyph name={m.glyph} />
                </span>
                <span className="lab-mode__label">
                  {i + 1} {m.zh}
                </span>
              </button>
            ))}
          </div>

          <div className="lab-collect">
            <button type="button" className="lab-collect__btn" onClick={collect} data-testid="collect">
              采集 · COLLECT
            </button>
            <span className="lab-collect__meta">
              {collected.length ? `SEED ${formatSeed(collected[0].seed)} · ${findMode(collected[0].mode).zh}` : 'press C to clear'}
            </span>
          </div>

          {toast && <div className="lab-toast">{toast}</div>}

          {onboard && (
            <div className="lab-onboard" role="dialog" aria-modal="false" aria-labelledby="lab-onboard-title">
              <div className="lab-onboard__eyebrow">HORTUS MANUS · 指间花园</div>
              <div className="lab-onboard__title" id="lab-onboard-title">
                Your hands are the weather.
              </div>
              <div className="lab-onboard__cn">以手为土，以息为风。</div>
              <div className="lab-onboard__steps">
                <div className="lab-onboard__step">
                  <b>01</b>
                  <span>
                    <strong>移动指针 / 举起双手</strong>，舞台会跟随你；不接摄像头也有幽灵手自动演出。
                  </span>
                </div>
                <div className="lab-onboard__step">
                  <b>02</b>
                  <span>
                    <strong>双拳切换花园</strong>，或按 <strong>1–7</strong>；按 <strong>G</strong> 唤回幽灵手。
                  </span>
                </div>
                <div className="lab-onboard__step">
                  <b>03</b>
                  <span>
                    <strong>采集一株标本</strong>：右下「采集」，或用 <strong>C</strong> 清屏重来。
                  </span>
                </div>
              </div>
              <div className="lab-onboard__actions">
                <button type="button" className="lab-link" onClick={dismissOnboard}>
                  跳过 SKIP
                </button>
                <button type="button" className="lab-primary" onClick={dismissOnboard}>
                  开始 ENTER
                </button>
              </div>
            </div>
          )}

          {help && (
            <div className="lab-help" role="dialog" aria-label="键盘与手势帮助">
              <h2>KEYS &amp; GESTURES</h2>
              <div>
                <kbd>1</kbd>–<kbd>7</kbd> 七种模式 · <kbd>Q</kbd><kbd>W</kbd><kbd>E</kbd><kbd>R</kbd> 兼容
              </div>
              <div>
                <kbd>G</kbd> 幽灵手 · <kbd>C</kbd> 清屏 · <kbd>X</kbd> 换季
              </div>
              <div>
                <kbd>S</kbd> 声音 · <kbd>D</kbd> 视图 · <kbd>?</kbd> 帮助 · <kbd>Esc</kbd> 退出
              </div>
              <div style={{ marginTop: 8 }}>手势：开掌 open · 捏合 pinch · 握拳 fist · 双手框 frame · 双掌相对 weave</div>
              <div>双拳保持半秒切到下一座花园。指针：按住 = 握拳，Shift = 捏合，两指 = 双手。</div>
              <button type="button" onClick={() => setHelp(false)}>
                关闭 CLOSE
              </button>
            </div>
          )}
        </div>
      )}

      <div className="hm-stage__sr" role="status" aria-live="polite">
        {mode.zh} {mode.en} · {season.zh} · {camera.text} · {state.fps} FPS
      </div>
    </div>
  )
}

createRoot(document.getElementById('lab-root')!).render(<LabApp />)
