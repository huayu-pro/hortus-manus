import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import type {
  Lang,
  ModeId,
  Season,
  Specimen,
  StageHandle,
  StageState,
} from '@hortus/shared'
import {
  MODES,
  SEASONS,
  daypartOfHour,
  findMode,
  formatSeed,
  getCopy,
  seasonOfDate,
} from '@hortus/shared'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import type { StageProps } from '@hortus/shared'
import { api } from '@/lib/api'
import '../styles/home.css'

const StageLazy = lazy(async () => {
  const mod = await import('@/components/stage/Stage')
  return { default: mod.Stage }
})
const StageAny = StageLazy as unknown as ForwardRefExoticComponent<StageProps & RefAttributes<StageHandle>>

/* -------------------------------------------------------------------------- */
/* Tiny error boundary: the engine must never take the editorial page down.    */
/* -------------------------------------------------------------------------- */
class StageBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn('[hortus] live stage fell back to plate:', error.message, info.componentStack?.slice(0, 120))
  }
  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const CHAPTERS = [
  { id: 'gate', index: 'I', zh: '园门', en: 'GATE' },
  { id: 'pollination', index: 'II', zh: '授粉', en: 'POLLINATION' },
  { id: 'greenhouse', index: 'III', zh: '温室', en: 'GLASSHOUSE' },
  { id: 'field-notes', index: 'IV', zh: '田野笔记', en: 'FIELD NOTES' },
  { id: 'herbarium', index: 'V', zh: '标本馆', en: 'HERBARIUM' },
  { id: 'colophon', index: 'VI', zh: '版权页', en: 'COLOPHON' },
] as const

const HAND_LINES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
] as const

const HAND_POINTS: [number, number][] = [
  [48, 160],
  [34, 122],
  [28, 94],
  [24, 72],
  [22, 52],
  [34, 104],
  [28, 66],
  [24, 38],
  [20, 16],
  [50, 100],
  [48, 58],
  [46, 26],
  [44, 0],
  [66, 104],
  [68, 64],
  [70, 34],
  [72, 12],
  [80, 112],
  [86, 78],
  [90, 52],
  [94, 32],
]

function HandDiagram({ className = '' }: { className?: string }) {
  return (
    <svg className={`hm-hand-diagram ${className}`} viewBox="0 0 120 178" fill="none" aria-hidden="true">
      <path
        d="M48 160c-4-18-10-32-17-43-5-8-12-13-17-21-3-5-2-11 2-13 5-3 10 1 13 7l8 14c1-12 1-25 2-39 1-8 1-16 0-24-1-6 2-10 7-10 4 0 6 4 6 9l2 30c2-9 3-19 5-27 2-7 6-10 10-8 4 2 5 6 4 12l-4 25c3-7 6-14 10-19 3-4 8-4 10 0 2 3 1 7-1 12l-6 17c4-5 8-10 12-12 4-2 8 0 8 4 0 3-2 6-5 10-5 7-10 17-11 26-2 13-1 26 2 40"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {HAND_LINES.map(([a, b], i) => (
        <line
          key={`l${i}`}
          x1={HAND_POINTS[a][0]}
          y1={HAND_POINTS[a][1]}
          x2={HAND_POINTS[b][0]}
          y2={HAND_POINTS[b][1]}
          stroke="currentColor"
          strokeWidth=".35"
          opacity=".45"
        />
      ))}
      {HAND_POINTS.map(([x, y], i) => (
        <g key={`p${i}`}>
          <circle cx={x} cy={y} r={i === 0 ? 2.2 : 1.4} fill="currentColor" />
          <circle cx={x} cy={y} r={5.5} fill="none" stroke="currentColor" strokeWidth=".25" opacity=".25" />
        </g>
      ))}
    </svg>
  )
}

function marqueeText(items: readonly string[]): string {
  return items.join('   ·   ')
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const stored = window.localStorage.getItem('hm:lang')
      if (stored === 'zh' || stored === 'en') return stored
    } catch {
      /* storage may be blocked */
    }
    return 'zh'
  })
  const c = getCopy(lang)
  const [active, setActive] = useState('gate')
  const [specimens, setSpecimens] = useState<Specimen[] | null>(null)
  const [stageState, setStageState] = useState<StageState | null>(null)
  const [stageMounted, setStageMounted] = useState(false)
  const stageHostRef = useRef<HTMLDivElement>(null)
  const [pressed, setPressed] = useState<{ id: number; x: number; y: number; rot: number }[]>([])
  const stageRef = useRef<StageHandle>(null)
  const plateRef = useRef<HTMLElement>(null)
  const pressId = useRef(0)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const season: Season = seasonOfDate()
  const seasonMeta = SEASONS.find((s) => s.id === season) ?? SEASONS[0]
  const now = new Date()
  const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const daypart = daypartOfHour(now.getHours())
  const daypartLabel =
    lang === 'zh'
      ? { dawn: '黎明', morning: '清晨', noon: '正午', afternoon: '午后', dusk: '黄昏', night: '夜' }[daypart]
      : { dawn: 'DAWN', morning: 'MORNING', noon: 'NOON', afternoon: 'AFTERNOON', dusk: 'DUSK', night: 'NIGHT' }[daypart]

  useEffect(() => {
    document.documentElement.dataset.season = season
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [season, lang])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActive(visible.target.id)
      },
      { rootMargin: '-24% 0px -46% 0px', threshold: [0.08, 0.3, 0.6] },
    )
    Object.values(sectionRefs.current).forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    api
      .listSpecimens({ limit: 4, sort: 'new' })
      .then((res) => setSpecimens(res.items))
      .catch(() => setSpecimens([]))
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    const el = plateRef.current
    if (!el) return
    const onMove = (event: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (event.clientX - r.left) / r.width - 0.5
      const y = (event.clientY - r.top) / r.height - 0.5
      el.style.setProperty('--plate-px', `${(x * -10).toFixed(2)}px`)
      el.style.setProperty('--plate-py', `${(y * -8).toFixed(2)}px`)
    }
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [reduceMotion])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'f' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      pressId.current += 1
      setPressed((list) => [
        ...list.slice(-7),
        {
          id: pressId.current,
          x: 4 + Math.random() * 88,
          y: 22 + Math.random() * 64,
          rot: -18 + Math.random() * 36,
        },
      ])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const el = stageHostRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStageMounted(true)
          io.disconnect()
        }
      },
      { rootMargin: '400px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const el = sectionRefs.current[id]
    el?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  const setSection = (id: string, el: HTMLElement | null) => {
    sectionRefs.current[id] = el
  }

  const setMode = (mode: ModeId) => {
    stageRef.current?.setMode(mode)
    if (stageState && lang === 'zh') {
      /* no toast here; the stage's own aria-live announces the mode */
    }
  }

  const onStageState = (state: StageState) => setStageState(state)

  const specimenCards = specimens ?? []
  const modeMeta = stageState ? findMode(stageState.mode) : MODES[0]

  return (
    <main className="hm-home" data-lang={lang}>
      <div className="hm-paper-field" aria-hidden="true" />
      <div className="hm-pressed-layer" aria-hidden="true">
        {pressed.map((p) => (
          <span
            key={p.id}
            className="hm-pressed-flower"
            style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `rotate(${p.rot}deg)` }}
          >
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="3" fill="currentColor" />
              {Array.from({ length: 7 }).map((_, i) => (
                <ellipse
                  key={i}
                  cx="20"
                  cy="11.5"
                  rx="4.2"
                  ry="7.2"
                  stroke="currentColor"
                  strokeWidth=".8"
                  transform={`rotate(${i * (360 / 7)} 20 20)`}
                />
              ))}
            </svg>
          </span>
        ))}
      </div>

      <header className="hm-top">
        <Link to="/" className="hm-brand" aria-label={`${c.brand.name} ${c.brand.nameCn}`}>
          <svg className="hm-brand-leaf" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 21V9M12 13c-4-1-6-4-6-8 4 0 6 3 6 8Zm0-3c4-1 6-4 6-8-4 0-6 3-6 8Z" stroke="currentColor" strokeWidth="1" />
          </svg>
          <span className="hm-brand-word">{c.brand.name}</span>
          <span className="hm-brand-cn">{c.brand.nameCn}</span>
        </Link>
        <nav className="hm-top-nav" aria-label={lang === 'zh' ? '章节' : 'Chapters'}>
          <button type="button" onClick={() => scrollTo('gate')} data-active={active === 'gate'} className="hm-top-link">
            {c.nav.home}
          </button>
          <Link className="hm-top-link" to="/touch">{c.nav.touch}</Link>
          <Link className="hm-top-link" to="/field-guide">{c.nav.fieldGuide}</Link>
          <Link className="hm-top-link" to="/herbarium">{c.nav.herbarium}</Link>
        </nav>
        <div className="hm-top-right">
          <span className="hm-label hm-issue">ISSUE 01 · LOCAL EDITION</span>
          <button type="button" className="hm-lang" onClick={() => { const next: Lang = lang === 'zh' ? 'en' : 'zh'; setLang(next); try { window.localStorage.setItem('hm:lang', next) } catch { /* ignore */ } }}>
            {lang === 'zh' ? 'EN' : '中'}
          </button>
        </div>
      </header>

      <nav className="hm-mobile-links" aria-label={lang === 'zh' ? '主要页面' : 'Pages'}>
        <Link to="/touch">{c.nav.touch}</Link>
        <Link to="/field-guide">{c.nav.fieldGuide}</Link>
        <Link to="/herbarium">{c.nav.herbarium}</Link>
      </nav>

      <nav className="hm-rail" aria-label={lang === 'zh' ? '页面进度' : 'Progress'}>
        {CHAPTERS.map((ch) => (
          <button
            key={ch.id}
            type="button"
            className="hm-rail-item"
            data-active={active === ch.id}
            onClick={() => scrollTo(ch.id)}
            aria-current={active === ch.id ? 'true' : undefined}
          >
            <span className="hm-rail-index">{ch.index}</span>
            <span className="hm-rail-label">{lang === 'zh' ? ch.zh : ch.en}</span>
          </button>
        ))}
      </nav>

      {/* I · GATE ------------------------------------------------------------ */}
      <section
        id="gate"
        className="hm-act hm-gate"
        ref={(el) => setSection('gate', el)}
        aria-labelledby="gate-title"
      >
        <div className="hm-gate-grid">
          <div className="hm-gate-copy">
            <p className="hm-label hm-gate-kicker">ISSUE 01 — A LIVING HERBARIUM FOR YOUR HANDS</p>
            <h1 id="gate-title" className="hm-gate-title">
              <span>{lang === 'zh' ? '指间' : 'A garden'}</span>
              <em>{lang === 'zh' ? '花园' : 'in your hands'}</em>
            </h1>
            <p className="hm-gate-claim">{c.brand.claim}</p>
            <p className="hm-gate-en hm-italic">Your hands are the weather.</p>
            <p className="hm-gate-lead">{c.acts.gate.lead}</p>
            <div className="hm-gate-ctas">
              <Link to="/touch" className="hm-btn-solid">
                <span>{c.acts.gate.cta}</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <button type="button" className="hm-btn-quiet" onClick={() => scrollTo('greenhouse')}>
                {lang === 'zh' ? '先看它如何生长' : 'See it grow first'}
              </button>
            </div>
            <p className="hm-gate-hint hm-label">{c.acts.gate.ctaHint}</p>
            <div className="hm-gate-signature">
              <span className="hm-signal-dot" aria-hidden="true" />
              <span className="hm-label">SPECIMEN 04 / RE:ACTIVE</span>
              <span className="hm-label">STUDYING THE INTERACTIVE BOTANY</span>
            </div>
          </div>

          <figure className="hm-gate-plate" ref={plateRef}>
            <img src="plates/peony-red.webp" alt={lang === 'zh' ? '深红色牡丹，金色花蕊' : 'Crimson peony with golden stamens'} />
            <div className="hm-plate-wash" aria-hidden="true" />
            <svg className="hm-plate-hand" viewBox="0 0 120 178" fill="none" aria-hidden="true">
              {HAND_LINES.map(([a, b], i) => (
                <line
                  key={`hl${i}`}
                  x1={HAND_POINTS[a][0]}
                  y1={HAND_POINTS[a][1]}
                  x2={HAND_POINTS[b][0]}
                  y2={HAND_POINTS[b][1]}
                  stroke="currentColor"
                  strokeWidth=".35"
                  opacity=".38"
                />
              ))}
              {HAND_POINTS.map(([x, y], i) => (
                <circle key={`hp${i}`} cx={x} cy={y} r={i === 0 ? 2 : 1.2} fill="currentColor" />
              ))}
            </svg>
            <div className="hm-plate-frame" aria-hidden="true" />
            <figcaption className="hm-plate-caption">
              <span className="hm-plate-cn">牡丹</span>
              <span className="hm-plate-latin hm-italic">Paeonia suffruticosa</span>
              <span className="hm-label">FAMILY: PAEONIACEAE · BLOOM: APR — MAY</span>
            </figcaption>
            <div className="hm-plate-side hm-label">PAEONIA SUFFRUTICOSA · SPECIMEN IV</div>
            <div className="hm-live-badge">
              <span className="hm-live-dot" aria-hidden="true" />
              {lang === 'zh' ? '幽灵手 · 活体图版' : 'GHOST HANDS · LIVING PLATE'}
            </div>
          </figure>
        </div>

        <div className="hm-gate-bottom">
          <div className="hm-telemetry hm-label">
            <span>GLASSHOUSE 21.4°C</span>
            <span>RH 58%</span>
            <span>{timeLabel}</span>
            <span>{lang === 'zh' ? seasonMeta.zh : seasonMeta.en} · {daypartLabel}</span>
            <span>LOCAL · NO CLOUD</span>
          </div>
          <button type="button" className="hm-scroll-cue hm-label" onClick={() => scrollTo('pollination')}>
            {lang === 'zh' ? '向下授粉' : 'SCROLL TO POLLINATE'} <span aria-hidden="true">↓</span>
          </button>
        </div>
      </section>

      {/* II · POLLINATION ---------------------------------------------------- */}
      <section
        id="pollination"
        className="hm-act hm-pollination"
        ref={(el) => setSection('pollination', el)}
        aria-labelledby="poll-title"
      >
        <div className="hm-act-head">
          <p className="hm-label">ACT II · POLLINATION · 授粉</p>
          <h2 id="poll-title" className="hm-display-cn hm-poll-title">
            {c.acts.pollination.title.split('\n').map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </h2>
        </div>
        <div className="hm-poll-grid">
          <div className="hm-poll-copy">
            <p className="hm-lead">{c.acts.pollination.lead}</p>
            <p className="hm-body">{c.acts.pollination.body}</p>
            <ul className="hm-poll-privacy">
              <li><span className="hm-label">01</span>{lang === 'zh' ? '摄像头画面只在本机。' : 'The camera never leaves this machine.'}</li>
              <li><span className="hm-label">02</span>{lang === 'zh' ? '不接摄像头也能完整地玩。' : 'Every mode works without a camera.'}</li>
              <li><span className="hm-label">03</span>{lang === 'zh' ? '采集只保存种子与元数据。' : 'A specimen stores a seed, not a photo.'}</li>
            </ul>
            <Link to="/touch" className="hm-btn-solid">
              {c.acts.pollination.cta} <span aria-hidden="true">↗</span>
            </Link>
            <p className="hm-label hm-poll-hint">{c.acts.pollination.ctaHint}</p>
          </div>
          <div className="hm-poll-figure">
            <div className="hm-poll-hand">
              <HandDiagram className="hm-poll-hand-svg" />
              <span className="hm-poll-hand-label hm-label">21 LANDMARKS · ONE WEATHER</span>
            </div>
            <figure className="hm-poll-plate">
              <img src="plates/peony-white.webp" alt={lang === 'zh' ? '白牡丹微距' : 'White peony macro'} loading="lazy" />
              <figcaption className="hm-label">PLATE II · PAEONIA · 白色图版</figcaption>
            </figure>
          </div>
        </div>
        <div className="hm-mode-strip" aria-label={lang === 'zh' ? '七种花式' : 'Seven modes'}>
          {MODES.map((mode, i) => (
            <Link key={mode.id} to={`/touch?mode=${mode.id}`} className="hm-mode-chip">
              <span className="hm-mode-index hm-label">0{i + 1}</span>
              <span className="hm-mode-zh">{mode.zh}</span>
              <span className="hm-mode-en hm-label">{mode.en}</span>
              <span className="hm-mode-rule" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      {/* III · GREENHOUSE ---------------------------------------------------- */}
      <section
        id="greenhouse"
        className="hm-act hm-greenhouse"
        ref={(el) => setSection('greenhouse', el)}
        aria-labelledby="greenhouse-title"
      >
        <div className="hm-green-head">
          <p className="hm-label">ACT III · THE GLASSHOUSE · 温室</p>
          <h2 id="greenhouse-title" className="hm-display-cn">
            {c.acts.greenhouse.title.split('\n').map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </h2>
          <p className="hm-lead hm-green-lead">{c.acts.greenhouse.lead}</p>
        </div>
        <div className="hm-stage-shell">
          <div className="hm-stage-bar">
            <span className="hm-label">
              <span className="hm-signal-dot" aria-hidden="true" />
              {stageState?.camera === 'on'
                ? lang === 'zh' ? '摄像头 · 活体' : 'CAMERA · LIVE'
                : lang === 'zh' ? '幽灵手 · 自动' : 'GHOST HANDS · AUTO'}
            </span>
            <span className="hm-label">{stageState?.fps ? `${Math.round(stageState.fps)} FPS` : '— FPS'} · {modeMeta.en}</span>
            <button
              type="button"
              className="hm-stage-cam"
              onClick={() => stageRef.current?.setCamera(true)}
              disabled={stageState?.camera === 'on'}
            >
              {stageState?.camera === 'on' ? (lang === 'zh' ? '摄像头已开' : 'CAMERA ON') : (lang === 'zh' ? '开摄像头' : 'USE CAMERA')}
            </button>
          </div>
          <div className="hm-stage-viewport" ref={stageHostRef}>
            {stageMounted ? (
            <StageBoundary
              fallback={
                <div className="hm-stage-fallback">
                  <img src="plates/peony-red.webp" alt="" />
                  <p className="hm-label">THE LIVE STAGE IS RESTING · 活体舞台暂时在休息</p>
                  <Link to="/touch" className="hm-btn-quiet">{lang === 'zh' ? '进入全屏温室' : 'Open the full glasshouse'}</Link>
                </div>
              }
            >
              <Suspense fallback={<div className="hm-stage-fallback"><p className="hm-label">THE GLASSHOUSE IS WAKING · 温室正在醒来</p></div>}>
                <StageAny
                  ref={stageRef}
                  initialMode="frame"
                  initialSeason={season}
                  immersive={false}
                  onState={onStageState}
                  className="hm-stage-live"
                />
              </Suspense>
            </StageBoundary>
            ) : (
              <div className="hm-stage-fallback">
                <img src="plates/peony-botmag.webp" alt="" />
                <p className="hm-label">THE GLASSHOUSE IS WAKING · 温室正在醒来</p>
              </div>
            )}
            <div className="hm-stage-side hm-label" aria-hidden="true">
              <span>LIVE PLATE</span>
              <span>{modeMeta.latin}</span>
            </div>
          </div>
          <div className="hm-stage-rail" role="group" aria-label={lang === 'zh' ? '切换花式' : 'Switch mode'}>
            {MODES.map((mode, i) => (
              <button
                key={mode.id}
                type="button"
                className="hm-stage-mode"
                data-active={stageState?.mode === mode.id}
                onClick={() => setMode(mode.id)}
                aria-pressed={stageState?.mode === mode.id}
              >
                <span className="hm-label">0{i + 1}</span>
                <span>{mode.zh}</span>
                <span className="hm-label">{mode.en}</span>
              </button>
            ))}
            <div className="hm-stage-rail-end">
              {SEASONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="hm-season-chip"
                  data-active={stageState?.season === s.id}
                  onClick={() => stageRef.current?.setSeason(s.id)}
                  aria-pressed={stageState?.season === s.id}
                >
                  {lang === 'zh' ? s.zh : s.en.charAt(0) + s.en.slice(1).toLowerCase()}
                </button>
              ))}
              <Link to="/touch" className="hm-stage-full">
                {lang === 'zh' ? '全屏温室' : 'FULL SCREEN'} ↗
              </Link>
            </div>
          </div>
        </div>
        <p className="hm-stage-caption hm-caption">{c.acts.greenhouse.caption}</p>
      </section>

      {/* IV · FIELD NOTES --------------------------------------------------- */}
      <section
        id="field-notes"
        className="hm-act hm-field"
        ref={(el) => setSection('field-notes', el)}
        aria-labelledby="field-title"
      >
        <div className="hm-field-grid">
          <div className="hm-field-copy">
            <p className="hm-label">ACT IV · FIELD NOTES · 田野笔记</p>
            <h2 id="field-title" className="hm-display-cn">
              {c.fieldNotes.title.split('。').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 ? '。' : ''}</span>
              ))}
            </h2>
            <p className="hm-lead">{c.fieldNotes.lead}</p>
            <div className="hm-field-entries">
              {c.fieldNotes.entries.slice(0, 3).map((entry) => (
                <article className="hm-field-entry" key={entry.date}>
                  <p className="hm-label">{entry.date}</p>
                  <h3 className="hm-h4">{entry.title}</h3>
                  <p className="hm-body-s">{entry.body}</p>
                  <p className="hm-hand hm-field-hand">{entry.hand}</p>
                </article>
              ))}
            </div>
            <Link to="/field-guide" className="hm-btn-quiet">
              {c.acts.fieldNotes.cta} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <figure className="hm-field-plate">
            <img src="plates/peony-botmag.webp" alt={lang === 'zh' ? '1809 年牡丹植物学版画' : '1809 peony botanical plate'} loading="lazy" />
            <figcaption className="hm-field-caption">
              <span className="hm-label">PLATE III · BOT. MAG. 1809</span>
              <span className="hm-hand">{lang === 'zh' ? '“花不知道季节。”' : '“The flower does not know the season.”'}</span>
            </figcaption>
            <div className="hm-field-stamp hm-label">FIELD NOTE 017</div>
          </figure>
        </div>
        <div className="hm-field-foot">
          <div className="hm-field-note">
            <span className="hm-label">01 / HAND</span>
            <p className="hm-body-s">{lang === 'zh' ? '手是天气，不是鼠标。' : 'A hand is weather, not a mouse.'}</p>
          </div>
          <div className="hm-field-note">
            <span className="hm-label">02 / TIME</span>
            <p className="hm-body-s">{lang === 'zh' ? '每一分钟，光都换一点。' : 'Every minute, the light shifts a little.'}</p>
          </div>
          <div className="hm-field-note">
            <span className="hm-label">03 / MEMORY</span>
            <p className="hm-body-s">{lang === 'zh' ? '被压进纸里的，才留下来。' : 'Only what is pressed into paper stays.'}</p>
          </div>
        </div>
      </section>

      {/* V · HERBARIUM ------------------------------------------------------ */}
      <section
        id="herbarium"
        className="hm-act hm-herbarium"
        ref={(el) => setSection('herbarium', el)}
        aria-labelledby="herbarium-title"
      >
        <div className="hm-herb-head">
          <div>
            <p className="hm-label">ACT V · THE HERBARIUM · 标本馆</p>
            <h2 id="herbarium-title" className="hm-display-cn">{c.herbarium.title}</h2>
          </div>
          <p className="hm-body hm-herb-lead">{c.herbarium.lead}</p>
        </div>
        {specimenCards.length > 0 ? (
          <div className="hm-herb-rail">
            {specimenCards.map((s, i) => (
              <a key={s.id} className="hm-herb-card" href={`/s/${s.id}`} target="_blank" rel="noreferrer">
                <span className="hm-herb-index hm-label">0{i + 1} / {formatSeed(s.seed)}</span>
                <img src={`/api/specimens/${s.id}/card.png`} alt={lang === 'zh' ? `${findMode(s.mode).zh}标本卡` : `${findMode(s.mode).en} specimen card`} loading="lazy" />
                <span className="hm-herb-meta">
                  <span>{findMode(s.mode).zh}</span>
                  <span className="hm-label">{findMode(s.mode).latin}</span>
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="hm-herb-empty">
            <div className="hm-herb-empty-plate">
              <img src="plates/peony-andrews.webp" alt="" loading="lazy" />
              <span className="hm-herb-empty-stamp hm-label">HERBARIUM · WAITING</span>
            </div>
            <div>
              <h3 className="hm-h3">{c.herbarium.emptyTitle}</h3>
              <p className="hm-body">{c.herbarium.emptyBody}</p>
              <Link to="/touch" className="hm-btn-solid">{c.herbarium.emptyCta} ↗</Link>
            </div>
          </div>
        )}
        <div className="hm-herb-foot">
          <span className="hm-label">{specimenCards.length > 0 ? `${specimenCards.length} / ${c.herbarium.countLabel}` : c.acts.herbarium.caption}</span>
          <Link to="/herbarium" className="hm-btn-quiet">{c.acts.herbarium.cta} →</Link>
        </div>
      </section>

      {/* VI · COLOPHON ------------------------------------------------------ */}
      <section
        id="colophon"
        className="hm-act hm-colophon"
        ref={(el) => setSection('colophon', el)}
        aria-labelledby="colophon-title"
      >
        <div className="hm-colophon-glow" aria-hidden="true" />
        <div className="hm-colophon-top">
          <p className="hm-label">{c.colophon.kicker}</p>
          <h2 id="colophon-title" className="hm-display hm-colophon-title">{c.colophon.title}</h2>
          <p className="hm-lead">{c.colophon.lead}</p>
        </div>
        <div className="hm-colophon-grid">
          <div>
            <p className="hm-label">{c.colophon.typeCredit}</p>
            <p className="hm-body-s">{c.colophon.typeBody}</p>
          </div>
          <div>
            <p className="hm-label">{c.colophon.plateCredit}</p>
            <p className="hm-body-s">{c.colophon.plateBody}</p>
          </div>
          <div>
            <p className="hm-label">{c.colophon.techCredit}</p>
            <p className="hm-body-s">{c.colophon.techBody}</p>
          </div>
          <div>
            <p className="hm-label">{c.colophon.privacyCredit}</p>
            <p className="hm-body-s">{c.colophon.privacyBody}</p>
          </div>
        </div>
        <div className="hm-colophon-homage">
          <span className="hm-label">HOMAGE</span>
          <p className="hm-homage-line hm-italic">for Gerard &amp; Claude</p>
          <p className="hm-body-s">{lang === 'zh' ? '给把花园放进天空的人，和把天空放进池塘的人。' : 'For the one who put a garden in the sky, and the one who put the sky in a pond.'}</p>
        </div>
        <div className="hm-marquee" aria-hidden="true">
          <span>{marqueeText(c.marquee.items)}</span>
          <span>{marqueeText(c.marquee.items)}</span>
        </div>
        <div className="hm-colophon-foot">
          <span className="hm-label">{c.colophon.madeLocal}</span>
          <span className="hm-label">{c.colophon.copyright}</span>
          <button type="button" className="hm-label hm-backtop" onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}>
            {c.colophon.backTop} ↑
          </button>
        </div>
      </section>
    </main>
  )
}