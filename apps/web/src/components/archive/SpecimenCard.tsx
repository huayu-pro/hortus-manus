/**
 * HORTUS MANUS — specimen card (owner: stage).
 * A pressed sheet: image plate, taxonomy labels, herbarium number, thanks.
 * Whole card opens the SSR share page in a new tab; the thanks/remove actions
 * sit above the link layer so they never trigger navigation.
 */

import { useCallback, useMemo, useState } from 'react'
import type { Specimen } from '@hortus/shared'
import { useLang } from '@/lib/i18n'
import { api } from '@/lib/api'
import {
  cardUrlFor,
  deleteTokenFor,
  forgetDeleteToken,
  formatDate,
  formatCount,
  readStorage,
  shareUrlFor,
  specimenNumber,
  writeStorage,
} from '@/lib/format'
import { toast } from 'sonner'
import { SpecimenArt } from './SpecimenArt'
import { Button } from '@/components/ui'
import { IconThanks, IconTrash, IconArrow } from '@/components/ui/icons'

const THANKS_KEY = 'hm:thanks'

function readThanks(): string[] {
  const raw = readStorage(THANKS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

export interface SpecimenCardProps {
  specimen: Specimen
  /** archive grid vs home rail */
  variant?: 'grid' | 'rail'
  /** first card may be featured (larger) */
  feature?: boolean
  index?: number
  onDeleted?: (id: string) => void
}

export function SpecimenCard({ specimen, variant = 'grid', feature = false, index = 0, onDeleted }: SpecimenCardProps) {
  const { copy, lang } = useLang()
  const [thanks, setThanks] = useState(specimen.thanks)
  const [thanked, setThanked] = useState(() => readThanks().includes(specimen.id))
  const [imageFailed, setImageFailed] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removed, setRemoved] = useState(false)

  const token = useMemo(() => deleteTokenFor(specimen.id), [specimen.id])
  const number = specimenNumber(specimen)
  const date = formatDate(specimen.createdAt, lang)
  const shareUrl = shareUrlFor(specimen)
  const imageUrl = cardUrlFor(specimen.id)

  const thank = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (thanked) {
        toast.message(copy.toasts.thanksAlready)
        return
      }
      try {
        const res = await api.thankSpecimen(specimen.id)
        setThanks(res.thanks)
        setThanked(true)
        const all = new Set(readThanks())
        all.add(specimen.id)
        writeStorage(THANKS_KEY, JSON.stringify([...all]))
        toast.success(copy.toasts.thanks)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : copy.toasts.error)
      }
    },
    [thanked, specimen.id, copy],
  )

  const remove = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (!token) return
      setRemoving(true)
      try {
        await api.deleteSpecimen(specimen.id, token)
        forgetDeleteToken(specimen.id)
        setRemoved(true)
        onDeleted?.(specimen.id)
        toast.success(copy.toasts.deleted)
      } catch (err) {
        setRemoving(false)
        toast.error(err instanceof Error ? err.message : copy.toasts.error)
      }
    },
    [token, specimen.id, onDeleted, copy],
  )

  if (removed) return null

  return (
    <article
      className={`hm-spec hm-spec--${variant}${feature ? ' hm-spec--feature' : ''}`}
      style={{ ['--spec-index' as string]: index }}
    >
      <a
        className="hm-spec__link"
        href={shareUrl}
        target="_blank"
        rel="noreferrer"
      >
        <span className="hm-visually-hidden">{`${copy.herbarium.view} — ${number}`}</span>
      </a>

      <div className="hm-spec__plate">
        {!imageFailed ? (
          <img
            src={imageUrl}
            alt={copy.collect.cardAlt}
            className="hm-spec__img"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : null}
        <SpecimenArt
          seed={specimen.seed}
          mode={specimen.mode}
          season={specimen.season}
          caption={specimen.caption}
          className="hm-spec__art"
          compact={!feature}
          label={`${copy.modes[specimen.mode].name} · ${copy.seasons[specimen.season].name}`}
        />
        <span className="hm-spec__stamp" aria-hidden="true">
          {copy.modes[specimen.mode].index}
        </span>
      </div>

      <div className="hm-spec__meta">
        <div className="hm-spec__head">
          <span className="hm-spec__number">{number}</span>
          <span className="hm-spec__date">{date}</span>
        </div>
        <h3 className="hm-spec__name">
          {specimen.caption?.trim() ? specimen.caption : copy.modes[specimen.mode].name}
        </h3>
        <p className="hm-spec__latin">{copy.modes[specimen.mode].latin}</p>
        <p className="hm-spec__taxonomy">
          {copy.modes[specimen.mode].family} · {copy.seasons[specimen.season].name}
        </p>

        {specimen.caption?.trim() && feature ? (
          <p className="hm-spec__caption-line">{specimen.caption}</p>
        ) : null}

        <div className="hm-spec__foot">
          <button
            type="button"
            className="hm-spec__action"
            onClick={(event) => void thank(event)}
            aria-pressed={thanked}
            data-on={thanked ? 'true' : undefined}
          >
            <IconThanks size={15} />
            <span>{formatCount(thanks)}</span>
            <span className="hm-spec__action-label">{copy.herbarium.thanksAction}</span>
          </button>

          {token ? (
            confirmRemove ? (
              <span className="hm-spec__confirm" onClick={(e) => e.preventDefault()}>
                <Button variant="danger" size="sm" onClick={(event) => void remove(event)} disabled={removing}>
                  {copy.collect.deleteConfirm}
                </Button>
                <Button variant="quiet" size="sm" onClick={() => setConfirmRemove(false)}>
                  {copy.common.cancel}
                </Button>
              </span>
            ) : (
              <button
                type="button"
                className="hm-spec__action hm-spec__action--danger"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  setConfirmRemove(true)
                }}
              >
                <IconTrash size={14} />
                <span className="hm-spec__action-label">{copy.herbarium.delete}</span>
              </button>
            )
          ) : (
            <span className="hm-spec__open" aria-hidden="true">
              {copy.herbarium.view} <IconArrow size={13} />
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
