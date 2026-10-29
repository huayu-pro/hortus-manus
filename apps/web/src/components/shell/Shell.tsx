/**
 * HORTUS MANUS — global chrome (owner: stage).
 *
 * Shell renders:
 *  - the top bar: vine wordmark, chapter nav 01–06, language, sound, camera, ⌘K
 *  - on scroll it condenses into a thin glass/paper strip that shows the current
 *    chapter, a hairline progress rule and the folio
 *  - the right-side chapter rail (desktop) / bottom sheet (mobile drawer)
 *  - the ⌘K command palette
 *  - the folio footer (rendered by pages through <Colophon/>) — see HomePage
 *
 * The bar is `position: fixed` and the page supplies its own top padding so
 * full-bleed plates can still reach the viewport edge behind it.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLang } from '@/lib/i18n'
import { formatClock, readStorage, writeStorage } from '@/lib/format'
import { MODES, SEASONS } from '@hortus/shared'
import type { ModeId, Season } from '@hortus/shared'
import { Wordmark } from './Wordmark'
import { CHAPTERS, PAGE_ROUTES } from './chapters'
import { CommandPalette } from './CommandPalette'
import { useStage, hasStage, stage } from './stageBus'
import { Button, Tooltip, TooltipProvider } from '@/components/ui'
import {
  IconCamera,
  IconLanguage,
  IconMenu,
  IconClose,
  IconSound,
  IconSoundOff,
  IconArrow,
  IconSearch,
} from '@/components/ui/icons'
import { cn } from '@/lib/utils'

const THEME_KEY = 'hm:theme'
const SOUND_KEY = 'hm:sound'

const ROUTE_CHAPTER: Record<string, string> = {
  '/field-guide': 'field-notes',
  '/herbarium': 'herbarium',
  '/touch': 'greenhouse',
}

/* -------------------------------------------------------------------------- */
/* Reading progress + current chapter                                          */
/* -------------------------------------------------------------------------- */

interface ScrollInfo {
  progress: number
  chapterId: string | null
  condensed: boolean
}

function useScrollInfo(enabled: boolean): ScrollInfo {
  const [info, setInfo] = useState<ScrollInfo>({ progress: 0, chapterId: null, condensed: false })

  useEffect(() => {
    if (!enabled) return
    let raf = 0
    const read = () => {
      raf = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0
      const condensed = doc.scrollTop > 64

      let chapterId: string | null = null
      // the last section whose top edge has crossed 35% of the viewport
      const threshold = doc.clientHeight * 0.35
      for (const ch of CHAPTERS) {
        const el = document.getElementById(ch.id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= threshold) chapterId = ch.id
      }
      setInfo({ progress, chapterId, condensed })
    }
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [enabled])

  return info
}

/* -------------------------------------------------------------------------- */
/* Language switch                                                             */
/* -------------------------------------------------------------------------- */

function LangSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, copy } = useLang()
  return (
    <div className="hm-lang" role="group" aria-label={copy.aria.languageToggle}>
      {(['zh', 'en'] as const).map((code) => (
        <button
          key={code}
          type="button"
          className="hm-lang__btn"
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
        >
          {code === 'zh' ? '中' : 'EN'}
        </button>
      ))}
      {compact ? null : <span className="hm-lang__rule" aria-hidden="true" />}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Sound + camera entries                                                      */
/* -------------------------------------------------------------------------- */

function StageEntries() {
  const { copy } = useLang()
  const { state, available } = useStage()
  const [sound, setSound] = useState(() => readStorage(SOUND_KEY) === 'on')
  const [camera, setCamera] = useState(false)

  // follow the real stage when one is mounted
  useEffect(() => {
    if (state) {
      setSound(state.sound)
      setCamera(state.camera === 'on' || state.camera === 'requesting')
    }
  }, [state])

  const toggleSound = useCallback(() => {
    const next = !sound
    setSound(next)
    writeStorage(SOUND_KEY, next ? 'on' : 'off')
    if (available) stage.setSound(next)
  }, [sound, available])

  const toggleCamera = useCallback(() => {
    if (!available) return
    const next = !camera
    setCamera(next)
    stage.setCamera(next)
  }, [camera, available])

  return (
    <div className="hm-entries">
      <Tooltip content={sound ? copy.sound.off : copy.sound.on}>
        <button
          type="button"
          className="hm-entry"
          aria-pressed={sound}
          aria-label={`${copy.aria.soundToggle} · ${copy.nav.sound}`}
          onClick={toggleSound}
          data-on={sound ? 'true' : undefined}
        >
          {sound ? <IconSound size={18} /> : <IconSoundOff size={18} />}
          <span className="hm-entry__text">{copy.nav.sound}</span>
        </button>
      </Tooltip>

      <Tooltip content={available ? copy.camera.allow : copy.camera.cameraOnly}>
        <button
          type="button"
          className="hm-entry"
          aria-pressed={camera}
          aria-label={`${copy.camera.title} · ${copy.care.camera}`}
          onClick={toggleCamera}
          disabled={!available}
          data-on={camera ? 'true' : undefined}
        >
          <IconCamera size={18} />
          <span className="hm-entry__text">{copy.care.camera}</span>
        </button>
      </Tooltip>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Mobile drawer                                                               */
/* -------------------------------------------------------------------------- */

function MobileDrawer({
  open,
  onClose,
  chapterId,
}: {
  open: boolean
  onClose: () => void
  chapterId: string | null
}) {
  const { copy } = useLang()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const items = Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]'),
      ).filter((el) => el.offsetParent !== null)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const focusable = panelRef.current?.querySelector<HTMLElement>('a, button')
    focusable?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="hm-drawer" role="presentation">
      <button type="button" className="hm-drawer__scrim" aria-label={copy.common.close} onClick={onClose} />
      <div
        ref={panelRef}
        className="hm-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="hm-drawer__head">
          <span id={titleId} className="hm-label">
            {copy.nav.menu}
          </span>
          <button type="button" className="hm-drawer__close" aria-label={copy.common.close} onClick={onClose}>
            <IconClose size={20} />
          </button>
        </div>

        <ol className="hm-drawer__chapters">
          {CHAPTERS.map((ch) => {
            const active = ch.id === chapterId
            return (
              <li key={ch.id}>
                <a
                  href={`/#${ch.id}`}
                  className="hm-drawer__chapter"
                  aria-current={active ? 'true' : undefined}
                  onClick={onClose}
                >
                  <span className="hm-drawer__num">{ch.number}</span>
                  <span className="hm-drawer__name">{ch.label(copy)}</span>
                  <span className="hm-drawer__act">{ch.act(copy)}</span>
                </a>
              </li>
            )
          })}
        </ol>

        <div className="hm-drawer__routes">
          {PAGE_ROUTES.slice(1).map((route) => (
            <Link key={route.href} to={route.href} onClick={onClose} className="hm-drawer__route">
              {route.label(copy)}
              <IconArrow size={16} />
            </Link>
          ))}
        </div>

        <div className="hm-drawer__foot">
          <LangSwitch compact />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Shell                                                                       */
/* -------------------------------------------------------------------------- */

export interface ShellProps {
  children: ReactNode
  /** /touch renders its own full-screen chrome: no top bar, no footer */
  bare?: boolean
  /** hide the chapter rail on dense editorial pages */
  noRail?: boolean
  /** show the thin scroll strip (home only, it needs chapter tracking) */
  trackScroll?: boolean
  /** current page route for nav highlighting */
  route?: string
}

export function Shell({
  children,
  bare = false,
  noRail = false,
  trackScroll = false,
  route,
}: ShellProps) {
  const { copy } = useLang()
  const location = useLocation()
  const currentRoute = route ?? location.pathname
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [clock, setClock] = useState(() => formatClock(new Date()))
  const scroll = useScrollInfo(true)

  // live clock, one tick per 30s — D8, and it is a real clock
  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock(new Date())), 30_000)
    return () => window.clearInterval(id)
  }, [])

  // document title per route — real page names, not one global title
  useEffect(() => {
    const routeTitles: Record<string, string> = {
      '/': copy.meta.title,
      '/touch': `${copy.touch.title} — ${copy.meta.siteName}`,
      '/herbarium': `${copy.nav.herbarium} — ${copy.meta.siteName}`,
      '/field-guide': `${copy.nav.fieldGuide} — ${copy.meta.siteName}`,
    }
    document.title = routeTitles[currentRoute] ?? copy.meta.title
  }, [currentRoute, copy])

  // ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const activeChapter = useMemo(() => {
    const id = scroll.chapterId ?? ROUTE_CHAPTER[currentRoute] ?? null
    if (!id) return null
    return CHAPTERS.find((c) => c.id === id) ?? CHAPTERS[0]
  }, [scroll.chapterId, currentRoute])

  const activeRoute = useMemo(() => {
    const match = PAGE_ROUTES.find((r) => r.href === currentRoute)
    return match ? match.label(copy) : null
  }, [currentRoute, copy])

  if (bare) {
    return (
      <>
        <a className="hm-skip-link" href="#main">
          {copy.nav.skip}
        </a>
        {children}
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} chapterId={null} />
      </>
    )
  }

  return (
    <TooltipProvider delayDuration={220}>
      <div
        className={cn('hm-shell', scroll.condensed && 'hm-shell--condensed')}
        data-page={currentRoute}
      >
        <a className="hm-skip-link" href="#main">
          {copy.nav.skip}
        </a>

        <header className="hm-topbar">
          <div className="hm-topbar__inner">
            <Link to="/" className="hm-topbar__brand" aria-label={`${copy.brand.name} ${copy.brand.nameCn} · ${copy.nav.brandHome}`}>
              <Wordmark height={20} />
              <span className="hm-topbar__brand-cn">{copy.brand.nameCn}</span>
            </Link>

            <nav className="hm-topbar__nav" aria-label={copy.aria.navMain}>
              {PAGE_ROUTES.map((r) => {
                const active = r.href === currentRoute
                return (
                  <Link
                    key={r.href}
                    to={r.href}
                    className="hm-topbar__link"
                    aria-current={active ? 'page' : undefined}
                  >
                    {r.label(copy)}
                  </Link>
                )
              })}
            </nav>

            <div className="hm-topbar__tools">
              <LangSwitch />
              <StageEntries />
              <button
                type="button"
                className="hm-entry hm-entry--command"
                onClick={() => setPaletteOpen(true)}
                aria-label={`${copy.aria.commandMenu} · ⌘K`}
              >
                <IconSearch size={18} />
                <kbd className="hm-entry__kbd">⌘K</kbd>
              </button>
              <button
                type="button"
                className="hm-topbar__menu"
                aria-label={copy.nav.menu}
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen(true)}
              >
                <IconMenu size={20} />
              </button>
            </div>
          </div>

          {/* condensed strip: current chapter + progress + folio */}
          <div className="hm-topbar__strip" aria-hidden={trackScroll ? undefined : 'true'}>
            <span className="hm-topbar__strip-chapter">
              {activeChapter ? (
                <>
                  <span className="hm-topbar__strip-num">{activeChapter.number}</span>
                  <span className="hm-topbar__strip-name">{activeChapter.label(copy)}</span>
                  <span className="hm-topbar__strip-act">{activeChapter.act(copy)}</span>
                </>
              ) : (
                <span className="hm-topbar__strip-name">{activeRoute}</span>
              )}
            </span>
            <span className="hm-topbar__strip-progress">
              <span
                className="hm-topbar__strip-bar"
                style={{ transform: `scaleX(${trackScroll ? scroll.progress : 0})` }}
              />
            </span>
            <span className="hm-topbar__strip-clock">
              <span className="hm-live-dot" aria-hidden="true" />
              {clock}
            </span>
          </div>
        </header>

        {noRail ? null : (
          <ChapterRail chapterId={activeChapter?.id ?? null} home={currentRoute === '/'} />
        )}

        {children}

        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} chapterId={scroll.chapterId} />
        <CommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          chapterId={scroll.chapterId}
        />
      </div>
    </TooltipProvider>
  )
}

/* -------------------------------------------------------------------------- */
/* Chapter rail — botanical key track                                          */
/* -------------------------------------------------------------------------- */

export function ChapterRail({
  chapterId,
  variant = 'side',
  home = false,
}: {
  chapterId: string | null
  variant?: 'side' | 'top'
  home?: boolean
}) {
  const { copy } = useLang()
  return (
    <nav className={`hm-rail hm-rail--${variant}`} aria-label={copy.aria.chapterRail}>
      <ol className="hm-rail__list">
        {CHAPTERS.map((ch) => {
          const active = ch.id === chapterId
          return (
            <li key={ch.id} className="hm-rail__item">
              <a
                href={home ? `#${ch.id}` : `/#${ch.id}`}
                className="hm-rail__link"
                aria-current={active ? 'true' : undefined}
                data-active={active ? 'true' : undefined}
              >
                <span className="hm-rail__tick" aria-hidden="true" />
                <span className="hm-rail__num">{ch.number}</span>
                <span className="hm-rail__label">{ch.label(copy)}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* -------------------------------------------------------------------------- */
/* Footer folio — used by every non-bare page                                  */
/* -------------------------------------------------------------------------- */

export function FolioFooter({
  page,
  total = 6,
  note,
}: {
  page: number
  total?: number
  note?: string
}) {
  const { copy, other, lang } = useLang()
  const roman = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI']
  return (
    <footer className="hm-folio">
      <div className="hm-folio__inner">
        <span className="hm-folio__mark">{copy.brand.name}</span>
        <span className="hm-folio__line" aria-hidden="true" />
        <span className="hm-folio__meta">
          {note ?? copy.brand.claim} · {copy.brand.claimNote}
        </span>
        <span className="hm-folio__page">
          {roman[page]} / {roman[total]}
        </span>
        <span className="hm-folio__homage" lang={lang === 'zh' ? 'en' : 'zh'}>
          {other.colophon.homage}
        </span>
      </div>
    </footer>
  )
}

/* -------------------------------------------------------------------------- */
/* Small page-level pieces shared by pages                                     */
/* -------------------------------------------------------------------------- */

/** A section head: kicker (mono), act numeral, title, lead. */
export function SectionHead({
  kicker,
  index,
  title,
  lead,
  align = 'left',
  id,
  as: Heading = 'h2',
}: {
  kicker: string
  index?: string
  title: string
  lead?: string
  align?: 'left' | 'center'
  id?: string
  as?: 'h1' | 'h2'
}) {
  return (
    <header className={`hm-sechead hm-sechead--${align}`} id={id}>
      <div className="hm-sechead__meta">
        {index ? <span className="hm-sechead__index">{index}</span> : null}
        <span className="hm-sechead__kicker">{kicker}</span>
      </div>
      <Heading className="hm-sechead__title">{title}</Heading>
      {lead ? <p className="hm-lead hm-sechead__lead">{lead}</p> : null}
    </header>
  )
}

/** Season swatch used in nav/filters. */
export function SeasonChip({
  season,
  active,
  onSelect,
  count,
}: {
  season: Season
  active: boolean
  onSelect: () => void
  count?: number
}) {
  const { copy } = useLang()
  const meta = SEASONS.find((s) => s.id === season)!
  return (
    <button
      type="button"
      className="hm-seasonchip"
      aria-pressed={active}
      onClick={onSelect}
      data-season={season}
      style={{ ['--chip-accent' as string]: meta.accent }}
    >
      <span className="hm-seasonchip__dot" aria-hidden="true" />
      <span className="hm-seasonchip__name">{copy.seasons[season].name}</span>
      {count !== undefined ? <span className="hm-seasonchip__count">{count}</span> : null}
    </button>
  )
}

/** Mode chip used in nav/filters and the command palette. */
export function ModeChip({
  mode,
  active,
  onSelect,
  showLatin = false,
}: {
  mode: ModeId
  active: boolean
  onSelect: () => void
  showLatin?: boolean
}) {
  const { copy } = useLang()
  const meta = MODES.find((m) => m.id === mode)!
  return (
    <button
      type="button"
      className="hm-modechip"
      aria-pressed={active}
      onClick={onSelect}
      style={{ ['--chip-accent' as string]: meta.accent }}
    >
      <span className="hm-modechip__roman">{copy.modes[mode].index}</span>
      <span className="hm-modechip__name">{copy.modes[mode].name}</span>
      {showLatin ? <span className="hm-modechip__latin">{meta.latin}</span> : null}
    </button>
  )
}

/** Honest empty state — a blank sheet, never a fake loading state. */
export function EmptySheet({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: { label: string; to: string }
}) {
  return (
    <div className="hm-empty">
      <div className="hm-empty__sheet" aria-hidden="true" />
      <h3 className="hm-empty__title">{title}</h3>
      <p className="hm-body-s hm-empty__body">{body}</p>
      {action ? (
        <Link to={action.to} className="hm-btn hm-btn--outline hm-btn--sm hm-empty__cta">
          {action.label}
          <IconArrow size={14} />
        </Link>
      ) : null}
    </div>
  )
}

export { hasStage, stage }
