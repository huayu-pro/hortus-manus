/**
 * HORTUS MANUS — ⌘K command drawer (C8, owner: stage).
 *
 * A paper card index, not a search box: chapters, seven modes, four seasons,
 * language, sound, camera, collect, and the archive. Keyboard-first:
 *  - ⌘K / Ctrl+K opens (Shell listens), Esc closes, ↑↓ move, Enter runs
 *  - every row is a real button with an aria-label and a mono key hint
 *  - the mode/season rows act on the mounted Stage through the stage bus; when
 *    no Stage is mounted they navigate to /touch with a deep link instead, so
 *    the action always does something honest.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { useLang } from '@/lib/i18n'
import { MODES, SEASONS } from '@hortus/shared'
import type { ModeId, Season } from '@hortus/shared'
import { CHAPTERS } from './chapters'
import { stage, hasStage } from './stageBus'
import { IconArrow, IconCamera, IconLanguage, IconLeaf, IconPress, IconSearch, IconSound, IconSoundOff } from '@/components/ui/icons'
import * as DialogPrimitive from '@radix-ui/react-dialog'

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chapterId: string | null
}

type GroupKey = 'chapters' | 'modes' | 'seasons' | 'actions'

export function CommandPalette({ open, onOpenChange, chapterId }: CommandPaletteProps) {
  const { copy, lang, setLang } = useLang()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [sound, setSound] = useState(false)

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const run = useCallback(
    (fn: () => void) => {
      onOpenChange(false)
      // let the dialog close before scrolling/navigating so focus is restored
      window.setTimeout(fn, 40)
    },
    [onOpenChange],
  )

  const goMode = useCallback(
    (mode: ModeId) => {
      run(() => {
        if (hasStage()) {
          stage.setMode(mode)
        } else {
          navigate(`/touch?mode=${mode}`)
        }
      })
    },
    [navigate, run],
  )

  const goSeason = useCallback(
    (season: Season) => {
      run(() => {
        if (hasStage()) {
          stage.setSeason(season)
        } else {
          navigate(`/touch?season=${season}`)
        }
      })
    },
    [navigate, run],
  )

  const goChapter = useCallback(
    (id: string) => {
      run(() => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          navigate(`/#${id}`)
        }
      })
    },
    [navigate, run],
  )

  const toggleSound = useCallback(() => {
    const next = !sound
    setSound(next)
    if (hasStage()) stage.setSound(next)
  }, [sound])

  const groups = useMemo(
    () => [
      { key: 'chapters' as GroupKey, label: copy.aria.chapterRail },
      { key: 'modes' as GroupKey, label: copy.touch.modeRailTitle },
      { key: 'seasons' as GroupKey, label: copy.herbarium.filterSeason },
      { key: 'actions' as GroupKey, label: copy.common.more },
    ],
    [copy],
  )

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="hm-cmd__overlay" />
        <DialogPrimitive.Content className="hm-cmd" aria-label={copy.aria.commandMenu}>
          <DialogPrimitive.Title className="hm-visually-hidden">{copy.aria.commandMenu}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="hm-visually-hidden">
            {copy.touch.keyboard}
          </DialogPrimitive.Description>

          <Command shouldFilter className="hm-cmd__inner" label={copy.aria.commandMenu} loop>
            <div className="hm-cmd__head">
              <IconSearch size={16} />
              <Command.Input
                className="hm-cmd__input"
                value={query}
                onValueChange={setQuery}
                placeholder={copy.common.search}
                aria-label={copy.aria.commandMenu}
                autoFocus
              />
              <kbd className="hm-cmd__esc">Esc</kbd>
            </div>

            <Command.List className="hm-cmd__list">
              <Command.Empty className="hm-cmd__empty">{copy.empty.results}</Command.Empty>

              {groups.map((group) => (
                <Command.Group key={group.key} heading={group.label} className="hm-cmd__group">
                  {group.key === 'chapters'
                    ? CHAPTERS.map((ch) => (
                        <Command.Item
                          key={ch.id}
                          value={`${ch.number} ${ch.label(copy)} ${ch.act(copy)} ${copy.nav.home}`}
                          className="hm-cmd__item"
                          onSelect={() => goChapter(ch.id)}
                          data-active={ch.id === chapterId ? 'true' : undefined}
                        >
                          <span className="hm-cmd__roman">{ch.number}</span>
                          <span className="hm-cmd__label">{ch.label(copy)}</span>
                          <span className="hm-cmd__hint">{ch.act(copy)}</span>
                          <IconArrow size={14} />
                        </Command.Item>
                      ))
                    : null}

                  {group.key === 'modes'
                    ? MODES.map((mode) => (
                        <Command.Item
                          key={mode.id}
                          value={`${copy.modes[mode.id].name} ${mode.en} ${mode.latin} ${mode.zh} ${copy.modes[mode.id].gesture}`}
                          className="hm-cmd__item"
                          onSelect={() => goMode(mode.id)}
                        >
                          <span
                            className="hm-cmd__swatch"
                            aria-hidden="true"
                            style={{ background: mode.accent }}
                          />
                          <span className="hm-cmd__roman">{copy.modes[mode.id].index}</span>
                          <span className="hm-cmd__label">{copy.modes[mode.id].name}</span>
                          <span className="hm-cmd__hint hm-cmd__hint--latin">{mode.latin}</span>
                        </Command.Item>
                      ))
                    : null}

                  {group.key === 'seasons'
                    ? SEASONS.map((season) => (
                        <Command.Item
                          key={season.id}
                          value={`${copy.seasons[season.id].name} ${season.en} ${copy.seasons[season.id].term} ${copy.seasons[season.id].short}`}
                          className="hm-cmd__item"
                          onSelect={() => goSeason(season.id)}
                        >
                          <span
                            className="hm-cmd__swatch hm-cmd__swatch--dot"
                            aria-hidden="true"
                            style={{ background: season.accent }}
                          />
                          <span className="hm-cmd__label">{copy.seasons[season.id].name}</span>
                          <span className="hm-cmd__hint">{copy.seasons[season.id].short}</span>
                        </Command.Item>
                      ))
                    : null}

                  {group.key === 'actions' ? (
                    <>
                      <Command.Item
                        value={`${copy.nav.touch} greenhouse stage open`}
                        className="hm-cmd__item"
                        onSelect={() => run(() => navigate('/touch'))}
                      >
                        <IconLeaf size={16} />
                        <span className="hm-cmd__label">{copy.nav.touch}</span>
                        <span className="hm-cmd__hint">/touch</span>
                      </Command.Item>
                      <Command.Item
                        value={`${copy.nav.fieldGuide} field guide anatomy`}
                        className="hm-cmd__item"
                        onSelect={() => run(() => navigate('/field-guide'))}
                      >
                        <IconLeaf size={16} />
                        <span className="hm-cmd__label">{copy.nav.fieldGuide}</span>
                        <span className="hm-cmd__hint">/field-guide</span>
                      </Command.Item>
                      <Command.Item
                        value={`${copy.nav.herbarium} archive specimens`}
                        className="hm-cmd__item"
                        onSelect={() => run(() => navigate('/herbarium'))}
                      >
                        <IconLeaf size={16} />
                        <span className="hm-cmd__label">{copy.nav.herbarium}</span>
                        <span className="hm-cmd__hint">/herbarium</span>
                      </Command.Item>
                      <Command.Item
                        value={`${copy.collect.title} collect press flower`}
                        className="hm-cmd__item"
                        onSelect={() => run(() => navigate('/touch?collect=1'))}
                      >
                        <IconPress size={16} />
                        <span className="hm-cmd__label">{copy.touch.collect}</span>
                        <span className="hm-cmd__hint">F</span>
                      </Command.Item>
                      <Command.Item
                        value={`${copy.nav.sound} ${copy.sound.on} audio`}
                        className="hm-cmd__item"
                        onSelect={() => run(toggleSound)}
                      >
                        {sound ? <IconSound size={16} /> : <IconSoundOff size={16} />}
                        <span className="hm-cmd__label">{sound ? copy.sound.off : copy.sound.on}</span>
                        <span className="hm-cmd__hint">S</span>
                      </Command.Item>
                      <Command.Item
                        value={`${copy.camera.title} camera hand tracking`}
                        className="hm-cmd__item"
                        onSelect={() => run(() => navigate('/touch?camera=1'))}
                      >
                        <IconCamera size={16} />
                        <span className="hm-cmd__label">{copy.camera.title}</span>
                        <span className="hm-cmd__hint">CAM</span>
                      </Command.Item>
                      <Command.Item
                        value={`${copy.aria.languageToggle} language ${lang === 'zh' ? 'english en' : 'chinese zh'}`}
                        className="hm-cmd__item"
                        onSelect={() =>
                          run(() => {
                            setLang(lang === 'zh' ? 'en' : 'zh')
                          })
                        }
                      >
                        <IconLanguage size={16} />
                        <span className="hm-cmd__label">{copy.nav.languageSwitch}</span>
                        <span className="hm-cmd__hint">{lang === 'zh' ? 'EN' : '中'}</span>
                      </Command.Item>
                    </>
                  ) : null}
                </Command.Group>
              ))}
            </Command.List>

            <div className="hm-cmd__foot" aria-hidden="true">
              <span>↑ ↓</span>
              <span className="hm-cmd__foot-label">Enter</span>
              <span className="hm-cmd__foot-sep" />
              <span>{copy.touch.keyboard.split(' · ')[0]}</span>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Exported helper for the rail/entry buttons that are not the palette. */
export function useCommandShortcutHint() {
  const { copy } = useLang()
  return copy.shortcuts.find((s) => s.keys === '⌘K')?.label ?? ''
}

