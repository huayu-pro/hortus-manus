/**
 * HORTUS MANUS — /touch, the full-screen hand greenhouse (owner: stage).
 *
 * The page is frameless: the Stage canvas is the page. We own four chrome
 * corners only (agreed with mechanics):
 *   top-left  exit        top-right  language / help / sound / camera
 *   bottom-center mode key            bottom-right collect
 * Everything else belongs to the garden.
 *
 * Collect: Stage fires `onCollect(seed)` → this page opens the collect dialog
 * (preview → caption → hold-to-press → POST → share/copy/download/QR).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Stage } from '@/components/stage/Stage'
import type { ModeId, Season, SpecimenSeed, StageHandle, StageState } from '@hortus/shared'
import { MODES, SEASONS, isModeId } from '@hortus/shared'
import { LangProvider, useLang } from '@/lib/i18n'
import type { Copy } from '@hortus/shared/copy'
import { readStorage, writeStorage } from '@/lib/format'
import { publishStageState, registerStage } from '@/components/shell/stageBus'
import { CollectDialog } from '@/components/archive/CollectDialog'
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle, VisuallyHidden } from '@/components/ui'
import { ModeGlyph } from '@/components/editorial/Glyphs'
import {
  IconCamera,
  IconClose,
  IconLeaf,
  IconPress,
  IconSound,
  IconSoundOff,
} from '@/components/ui/icons'
import { toast } from 'sonner'
import '@/styles/sections.css'

const SOUND_KEY = 'hm:sound'

type CareCamera = 'off' | 'requesting' | 'on' | 'denied' | 'unavailable'
type CareSource = 'camera' | 'pointer' | 'ghost' | 'none'

function cameraLabel(copy: Copy, value: CareCamera | 'off' | undefined): string {
  switch (value ?? 'off') {
    case 'on':
      return copy.care.cameraOn
    case 'requesting':
      return copy.care.cameraRequesting
    case 'denied':
      return copy.care.cameraDenied
    case 'unavailable':
      return copy.care.cameraUnavailable
    default:
      return copy.care.cameraOff
  }
}

function sourceLabel(copy: Copy, value: CareSource | undefined): string {
  switch (value ?? 'none') {
    case 'camera':
      return copy.care.sourceCamera
    case 'pointer':
      return copy.care.sourcePointer
    case 'ghost':
      return copy.care.sourceGhost
    default:
      return copy.care.sourceNone
  }
}

function TouchInner() {
  const { copy, lang, toggleLang } = useLang()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const stageRef = useRef<StageHandle | null>(null)
  const [state, setState] = useState<StageState | null>(null)
  const [seed, setSeed] = useState<SpecimenSeed | null>(null)
  const [collectOpen, setCollectOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [cameraAsk, setCameraAsk] = useState(false)
  const [sound, setSound] = useState(() => readStorage(SOUND_KEY) === 'on')

  const initialMode: ModeId = useMemo(() => {
    const raw = params.get('mode')
    return raw && isModeId(raw) ? raw : 'frame'
  }, [params])

  const initialSeason: Season | undefined = useMemo(() => {
    const raw = params.get('season')
    return raw && SEASONS.some((s) => s.id === raw) ? (raw as Season) : undefined
  }, [params])

  const handleState = useCallback((next: StageState) => {
    setState(next)
    publishStageState(next)
  }, [])

  const handleCollect = useCallback((next: SpecimenSeed) => {
    setSeed(next)
    setCollectOpen(true)
  }, [])

  // register the stage with the chrome bus (sound/camera entries in Shell)
  useEffect(() => {
    const id = window.setTimeout(() => {
      registerStage(stageRef.current)
    }, 0)
    return () => {
      window.clearTimeout(id)
      registerStage(null)
    }
  }, [])

  // document title for the frameless page
  useEffect(() => {
    document.title = `${copy.touch.title} — ${copy.meta.siteName}`
  }, [copy])

  // apply the persisted sound preference once, after the stage is ready
  useEffect(() => {
    if (!state) return
    if (sound && !state.sound) stageRef.current?.setSound(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(state)])

  // deep links from the ⌘K palette / shell — handled once per mount
  const deepLinkHandled = useRef(false)
  useEffect(() => {
    if (deepLinkHandled.current) return
    deepLinkHandled.current = true
    if (params.get('camera') === '1') setCameraAsk(true)
    if (params.get('collect') === '1') {
      const id = window.setTimeout(() => stageRef.current?.collect(), 900)
      return () => window.clearTimeout(id)
    }
    return undefined
  }, [params])

  // Escape leaves the greenhouse
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (collectOpen || helpOpen || cameraAsk) return
      if (document.querySelector('.hm-dialog__overlay')) return
      navigate('/')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, collectOpen, helpOpen, cameraAsk])

  // product keyboard: F collects; Stage forwards S / X / D / ? as custom events
  useEffect(() => {
    const stateLive = { current: state }
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, [contenteditable="true"]')) return
      if (event.key.toLowerCase() === 'f') {
        event.preventDefault()
        stageRef.current?.collect()
      }
    }
    const onSound = () => {
      setSound((prev) => {
        const next = !prev
        writeStorage(SOUND_KEY, next ? 'on' : 'off')
        stageRef.current?.setSound(next)
        toast.success(next ? copy.toasts.soundOn : copy.toasts.soundOff)
        return next
      })
    }
    const onSeason = () => {
      const current = stateLive.current?.season ?? 'spring'
      const order: Season[] = ['spring', 'summer', 'autumn', 'winter']
      const next = order[(order.indexOf(current) + 1) % order.length]
      stageRef.current?.setSeason(next)
      toast.success(copy.toasts.seasonChanged)
    }
    const onHelp = () => setHelpOpen(true)
    const onEscape = () => {
      if (collectOpen || helpOpen || cameraAsk) return
      if (document.querySelector('.hm-dialog__overlay')) return
      navigate('/')
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('hm:s', onSound)
    window.addEventListener('hm:x', onSeason)
    window.addEventListener('hm:help', onHelp)
    window.addEventListener('hm:escape', onEscape)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('hm:s', onSound)
      window.removeEventListener('hm:x', onSeason)
      window.removeEventListener('hm:help', onHelp)
      window.removeEventListener('hm:escape', onEscape)
    }
  }, [state, copy, collectOpen, helpOpen, cameraAsk, navigate])

  // readable camera feedback
  useEffect(() => {
    if (!state) return
    if (state.camera === 'denied') toast.error(copy.camera.denied)
    if (state.camera === 'unavailable') toast.error(copy.camera.unavailable)
  }, [state?.camera, copy])

  const toggleSound = useCallback(() => {
    const next = !sound
    setSound(next)
    writeStorage(SOUND_KEY, next ? 'on' : 'off')
    stageRef.current?.setSound(next)
    toast.success(next ? copy.toasts.soundOn : copy.toasts.soundOff)
  }, [sound, copy])

  const askCamera = useCallback(() => {
    if (state?.camera === 'on') {
      stageRef.current?.setCamera(false)
      return
    }
    setCameraAsk(true)
  }, [state?.camera])

  const allowCamera = useCallback(() => {
    setCameraAsk(false)
    stageRef.current?.setCamera(true)
  }, [])

  const mode = state?.mode ?? initialMode
  const gestureLabel =
    state?.gesture && state.gesture !== 'none' ? copy.gestures[state.gesture].name : copy.touch.gestureIdle

  return (
    <div className="hm-touch" data-mode={mode}>
      <h1 className="hm-visually-hidden">{copy.touch.title}</h1>
      <Stage
        ref={stageRef}
        immersive
        initialMode={initialMode}
        initialSeason={initialSeason}
        onState={handleState}
        onCollect={handleCollect}
      />

      {/* top-left: exit */}
      <div className="hm-touch__corner hm-touch__corner--tl">
        <Link to="/" className="hm-touch__exit">
          <IconClose size={16} />
          <span>{copy.touch.exit}</span>
          <kbd className="hm-touch__kbd">Esc</kbd>
        </Link>
      </div>

      {/* top-center: wordmark + privacy line */}
      <div className="hm-touch__brand" aria-hidden="true">
        <span className="hm-touch__brand-mark">{copy.brand.name}</span>
        <span className="hm-touch__brand-sub">{copy.touch.privacyShort}</span>
      </div>

      {/* top-right: language / help / sound / camera */}
      <div className="hm-touch__corner hm-touch__corner--tr">
        <button type="button" className="hm-touch__tool hm-touch__tool--lang" onClick={toggleLang} aria-label={`${copy.aria.languageToggle} · ${lang === 'zh' ? '中' : 'EN'}`}>
          {lang === 'zh' ? '中' : 'EN'}
        </button>
        <button type="button" className="hm-touch__tool" onClick={() => setHelpOpen(true)} aria-label={`${copy.touch.help} · ?`}>
          <span className="hm-touch__tool-glyph">?</span>
        </button>
        <button
          type="button"
          className="hm-touch__tool"
          aria-pressed={sound}
          onClick={toggleSound}
          aria-label={copy.aria.soundToggle}
        >
          {sound ? <IconSound size={18} /> : <IconSoundOff size={18} />}
        </button>
        <button
          type="button"
          className="hm-touch__tool"
          aria-pressed={state?.camera === 'on'}
          onClick={askCamera}
          aria-label={copy.camera.title}
          data-on={state?.camera === 'on' ? 'true' : undefined}
        >
          <IconCamera size={18} />
        </button>
      </div>

      {/* bottom-left: care label, real readouts only */}
      <div className="hm-touch__care" aria-label={copy.aria.liveReadout}>
        <span className="hm-touch__care-label">{copy.care.label}</span>
        <div className="hm-touch__care-grid">
          <span>
            <em>{copy.care.mode}</em>
            {copy.modes[mode].name}
          </span>
          <span>
            <em>{copy.care.season}</em>
            {copy.seasons[state?.season ?? initialSeason ?? 'spring'].name}
          </span>
          <span>
            <em>{copy.care.fps}</em>
            {state?.fps ? `${Math.round(state.fps)} ${copy.care.fpsUnit}` : `— ${copy.care.fpsUnit}`}
          </span>
          <span>
            <em>{copy.care.latency}</em>
            {state?.latencyMs ? `${Math.round(state.latencyMs)} ${copy.care.latencyUnit}` : `— ${copy.care.latencyUnit}`}
          </span>
          <span>
            <em>{copy.care.camera}</em>
            {cameraLabel(copy, state?.camera)}
          </span>
          <span>
            <em>{copy.care.source}</em>
            {sourceLabel(copy, state?.source)}
          </span>
        </div>
      </div>

      {/* bottom-center: seven modes */}
      <nav className="hm-touch__modes" aria-label={copy.aria.modeRail}>
        <span className="hm-touch__modes-title">{copy.touch.modeRailTitle}</span>
        <div className="hm-touch__modes-list">
          {MODES.map((meta) => {
            const active = mode === meta.id
            return (
              <button
                key={meta.id}
                type="button"
                className="hm-touch__mode"
                aria-pressed={active}
                onClick={() => stageRef.current?.setMode(meta.id)}
                title={copy.modes[meta.id].tagline}
              >
                <ModeGlyph mode={meta.id} size={24} />
                <span className="hm-touch__mode-name">{copy.modes[meta.id].name}</span>
                <span className="hm-touch__mode-num">{copy.modes[meta.id].index}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* bottom-right: collect */}
      <div className="hm-touch__corner hm-touch__corner--br">
        <div className="hm-touch__gesture" aria-live="polite">
          <IconLeaf size={14} />
          <span>{gestureLabel}</span>
        </div>
        <button
          type="button"
          className="hm-touch__collect"
          onClick={() => stageRef.current?.collect()}
        >
          <IconPress size={18} />
          <span className="hm-touch__collect-label">{copy.touch.collect}</span>
          <span className="hm-touch__collect-hint">{copy.touch.collectHint}</span>
          <kbd className="hm-touch__kbd">F</kbd>
        </button>
      </div>

      {/* mobile-only hint */}
      <p className="hm-touch__mobile-hint">{copy.touch.noHand}</p>

      {/* camera ritual */}
      <Dialog open={cameraAsk} onOpenChange={setCameraAsk}>
        <DialogContent closeLabel={copy.common.close} className="hm-camera">
          <DialogTitle className="hm-camera__title">{copy.camera.title}</DialogTitle>
          <DialogDescription className="hm-camera__body">{copy.camera.body}</DialogDescription>
          <ol className="hm-camera__steps">
            {copy.camera.privacySteps.map((step, index) => (
              <li key={step}>
                <span className="hm-camera__step-num">{String(index + 1).padStart(2, '0')}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="hm-camera__note">{copy.camera.cameraOnly}</p>
          <div className="hm-camera__actions">
            <Button variant="outline" onClick={() => setCameraAsk(false)}>
              {copy.camera.notNow}
            </Button>
            <Button variant="solid" onClick={allowCamera}>
              {copy.camera.allow}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* help */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent closeLabel={copy.common.close} className="hm-help">
          <DialogTitle className="hm-help__title">{copy.touch.title}</DialogTitle>
          <DialogDescription className="hm-help__sub">{copy.touch.subtitle}</DialogDescription>
          <div className="hm-help__grid">
            <section>
              <h3 className="hm-help__head">{copy.fieldGuide.gesturesTitle}</h3>
              <ul className="hm-help__list">
                {Object.values(copy.gestures).map((gesture) => (
                  <li key={gesture.en}>
                    <span className="hm-help__name">{gesture.name}</span>
                    <span className="hm-help__desc">{gesture.hand}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="hm-help__head">{copy.fieldGuide.shortcutsTitle}</h3>
              <ul className="hm-help__keys">
                {copy.shortcuts.map((shortcut) => (
                  <li key={shortcut.keys}>
                    <kbd>{shortcut.keys}</kbd>
                    <span>{shortcut.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <p className="hm-help__privacy">{copy.privacy.noUpload}</p>
          <VisuallyHidden>{copy.touch.keyboard}</VisuallyHidden>
        </DialogContent>
      </Dialog>

      <CollectDialog open={collectOpen} seed={seed} onClose={() => setCollectOpen(false)} />
    </div>
  )
}

export default function TouchPage() {
  return (
    <LangProvider>
      <TouchInner />
    </LangProvider>
  )
}
