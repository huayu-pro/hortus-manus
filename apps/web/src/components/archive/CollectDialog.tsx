/**
 * HORTUS MANUS — collect dialog (owner: stage).
 *
 * The flow the contract asks for (E3, C6, B14):
 *   seed from the Stage → preview → caption → human press (hold to press,
 *   our version of a captcha: a machine cannot hold a seal) → POST → delete
 *   token saved in localStorage → share link + copy + card download + QR.
 *
 * Nothing is uploaded except mode / season / seed / caption / lang / an
 * anonymous client id. The delete token never leaves localStorage.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Specimen, SpecimenSeed } from '@hortus/shared'
import { useLang } from '@/lib/i18n'
import { api } from '@/lib/api'
import {
  copyText,
  getClientId,
  rememberDeleteToken,
  shareUrlFor,
  deleteTokenFor,
  CAPTION_MAX,
  clampCaption,
} from '@/lib/format'
import { toast } from 'sonner'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Field,
  Textarea,
  useCopyFeedback,
  VisuallyHidden,
} from '@/components/ui'
import { IconCheck, IconDownload, IconLink, IconQR, IconRetry, IconTrash, IconExternal } from '@/components/ui/icons'
import { SpecimenArt } from './SpecimenArt'

type Step = 'edit' | 'saving' | 'done'

export interface CollectDialogProps {
  open: boolean
  seed: SpecimenSeed | null
  onClose: () => void
  onSaved?: (specimen: Specimen) => void
}

export function CollectDialog({ open, seed, onClose, onSaved }: CollectDialogProps) {
  const { copy, lang } = useLang()
  const [caption, setCaption] = useState('')
  const [step, setStep] = useState<Step>('edit')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ specimen: Specimen; deleteToken: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [qrFailed, setQrFailed] = useState(false)
  const { copied, flag } = useCopyFeedback()

  useEffect(() => {
    if (open) {
      setCaption('')
      setStep('edit')
      setError(null)
      setResult(null)
      setConfirmDelete(false)
      setQrFailed(false)
    }
  }, [open, seed?.seed])

  const save = useCallback(async () => {
    if (!seed || step === 'saving') return
    setStep('saving')
    setError(null)
    try {
      const created = await api.createSpecimen({
        ...seed,
        caption: clampCaption(caption.trim()),
        lang,
        clientId: getClientId(),
      })
      rememberDeleteToken(created.specimen.id, created.deleteToken)
      setResult(created)
      setStep('done')
      onSaved?.(created.specimen)
      toast.success(copy.toasts.collected)
    } catch (err) {
      setStep('edit')
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    }
  }, [seed, step, caption, lang, copy, onSaved])

  const remove = useCallback(async () => {
    if (!result) return
    const token = deleteTokenFor(result.specimen.id) ?? result.deleteToken
    setDeleting(true)
    try {
      await api.deleteSpecimen(result.specimen.id, token)
      toast.success(copy.toasts.deleted)
      onClose()
    } catch (err) {
      setDeleting(false)
      toast.error(err instanceof Error ? err.message : copy.toasts.error)
    }
  }, [result, copy, onClose])

  const shareUrl = result ? shareUrlFor(result.specimen) : ''
  const cardUrl = result?.specimen.cardUrl || ''

  const preview = useMemo(() => {
    if (!seed) return null
    return (
      <SpecimenArt
        seed={seed.seed}
        mode={seed.mode}
        season={seed.season}
        caption={caption || undefined}
        className="hm-collect__art"
        label={`${copy.modes[seed.mode].name} · ${copy.seasons[seed.season].name}`}
      />
    )
  }, [seed, caption, copy])

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent
        className="hm-collect"
        closeLabel={copy.common.close}
        onPointerDownOutside={(event) => {
          // never lose a just-saved specimen by a stray click
          if (step === 'saving' || step === 'done') event.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          if (step === 'saving' || step === 'done') event.preventDefault()
        }}
      >
        <DialogTitle className="hm-collect__title">{copy.collect.title}</DialogTitle>
        <DialogDescription className="hm-visually-hidden">
          {copy.collect.savedBody}
        </DialogDescription>

        {step !== 'done' ? (
          <div className="hm-collect__body">
            <div className="hm-collect__preview" data-step={step}>
              {preview}
              <span className="hm-collect__pin" aria-hidden="true" />
              <span className="hm-collect__tape" aria-hidden="true" />
            </div>

            <div className="hm-collect__form">
              {seed ? (
                <dl className="hm-collect__taxonomy">
                  <div>
                    <dt>{copy.specimen.mode}</dt>
                    <dd>{copy.modes[seed.mode].name} · {copy.modes[seed.mode].en}</dd>
                  </div>
                  <div>
                    <dt>{copy.specimen.season}</dt>
                    <dd>{copy.seasons[seed.season].name} · {copy.seasons[seed.season].en}</dd>
                  </div>
                  <div>
                    <dt>{copy.specimen.latin}</dt>
                    <dd className="hm-collect__latin">{copy.modes[seed.mode].latin}</dd>
                  </div>
                </dl>
              ) : null}

              <Field
                label={copy.collect.captionLabel}
                count={{ current: caption.length, max: CAPTION_MAX }}
                hint={copy.common.optional}
                htmlFor="hm-collect-caption"
              >
                <Textarea
                  id="hm-collect-caption"
                  value={caption}
                  maxLength={CAPTION_MAX}
                  placeholder={copy.collect.captionPlaceholder}
                  onChange={(event) => setCaption(event.target.value)}
                  rows={3}
                />
              </Field>

              {error ? (
                <div className="hm-collect__error" role="alert">
                  <p className="hm-collect__error-title">{copy.errors.collectTitle}</p>
                  <p className="hm-collect__error-body">{error || copy.errors.collectBody}</p>
                </div>
              ) : null}

              <div className="hm-collect__actions">
                <Button variant="outline" size="md" onClick={onClose} disabled={step === 'saving'}>
                  {copy.common.cancel}
                </Button>
                <HoldPressButton
                  label={copy.collect.save}
                  holdingLabel={copy.collect.saving}
                  busy={step === 'saving'}
                  onComplete={() => void save()}
                />
              </div>
              <p className="hm-collect__note">{copy.collect.tokenNote}</p>
            </div>
          </div>
        ) : null}

        {step === 'done' && result ? (
          <div className="hm-collect__done">
            <div className="hm-collect__done-art">
              <img
                src={cardUrl}
                alt={copy.collect.cardAlt}
                className="hm-collect__done-img"
                onError={(event) => {
                  ;(event.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
              <SpecimenArt
                seed={result.specimen.seed}
                mode={result.specimen.mode}
                season={result.specimen.season}
                caption={result.specimen.caption}
                className="hm-collect__done-fallback"
                label={copy.collect.cardAlt}
              />
              <span className="hm-collect__pressed" aria-hidden="true">
                <IconCheck size={18} /> {copy.specimen.pressedState}
              </span>
            </div>

            <div className="hm-collect__done-info">
              <h3 className="hm-collect__saved">{copy.collect.savedTitle}</h3>
              <p className="hm-body-s">{copy.collect.savedBody}</p>

              <div className="hm-collect__share">
                <label className="hm-label" htmlFor="hm-share-url">{copy.share.title}</label>
                <div className="hm-collect__share-row">
                  <input id="hm-share-url" className="hm-input" value={shareUrl} readOnly onFocus={(e) => e.currentTarget.select()} />
                  <Button
                    variant="outline"
                    size="sm"
                    glyph={copied ? <IconCheck size={16} /> : <IconLink size={16} />}
                    onClick={() => {
                      void copyText(shareUrl).then((ok) => {
                        if (ok) {
                          flag()
                          toast.success(copy.toasts.copied)
                        } else {
                          toast.error(copy.toasts.error)
                        }
                      })
                    }}
                  >
                    {copied ? copy.common.copied : copy.share.copyLink}
                  </Button>
                </div>
              </div>

              <div className="hm-collect__share-grid">
                <div className="hm-collect__qr">
                  {qrFailed ? (
                    <a className="hm-collect__qr-fallback" href={shareUrl} target="_blank" rel="noreferrer">
                      <IconQR size={26} />
                      <span>{copy.share.qrHint}</span>
                    </a>
                  ) : import.meta.env.VITE_STATIC_MODE === 'true' ? (
                    <a className="hm-collect__qr-fallback" href={shareUrl} target="_blank" rel="noreferrer">
                      <IconLink size={20} />
                      <span>{copy.share.qrHint}</span>
                    </a>
                  ) : (
                    <img
                      src={`/api/specimens/${encodeURIComponent(result.specimen.id)}/qr.png`}
                      alt={copy.collect.qrAlt}
                      width={132}
                      height={132}
                      onError={() => setQrFailed(true)}
                    />
                  )}
                  <span className="hm-micro">{copy.share.qrTitle}</span>
                </div>

                <div className="hm-collect__done-actions">
                  <a className="hm-btn hm-btn--outline hm-btn--sm" href={cardUrl} download={`HORTUS-${result.specimen.id}.png`}>
                    <IconDownload size={16} />
                    <span className="hm-btn__label">{copy.collect.downloadCard}</span>
                  </a>
                  <a className="hm-btn hm-btn--outline hm-btn--sm" href={shareUrl} target="_blank" rel="noreferrer">
                    <IconExternal size={16} />
                    <span className="hm-btn__label">{copy.collect.viewSpecimen}</span>
                  </a>
                  <Button variant="quiet" size="sm" onClick={onClose}>
                    {copy.common.close}
                  </Button>
                </div>
              </div>

              <div className="hm-collect__danger">
                {confirmDelete ? (
                  <div className="hm-collect__confirm" role="alertdialog" aria-label={copy.collect.deleteTitle}>
                    <p className="hm-body-s">{copy.collect.deleteBody}</p>
                    <div className="hm-collect__confirm-actions">
                      <Button variant="danger" size="sm" onClick={() => void remove()} disabled={deleting}>
                        <IconTrash size={14} /> {copy.collect.deleteConfirm}
                      </Button>
                      <Button variant="quiet" size="sm" onClick={() => setConfirmDelete(false)}>
                        {copy.collect.deleteCancel}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="quiet" size="sm" onClick={() => setConfirmDelete(true)}>
                    <IconTrash size={14} /> {copy.herbarium.delete}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}

        <VisuallyHidden>{copy.privacy.noUpload}</VisuallyHidden>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hold-to-press seal: pointer/keyboard must stay down for HOLD_MS. This is our
 * human check — no third-party captcha, no tracking, works offline.
 */
function HoldPressButton({
  label,
  holdingLabel,
  busy,
  onComplete,
}: {
  label: string
  holdingLabel: string
  busy: boolean
  onComplete: () => void
}) {
  const HOLD_MS = 900
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const raf = useRef<number | null>(null)
  const start = useRef<number>(0)

  const stop = useCallback(() => {
    if (raf.current) window.cancelAnimationFrame(raf.current)
    raf.current = null
    setHolding(false)
    setProgress(0)
  }, [])

  useEffect(() => stop, [stop])

  const begin = useCallback(() => {
    if (busy) return
    setHolding(true)
    start.current = performance.now()
    const tick = () => {
      const p = Math.min(1, (performance.now() - start.current) / HOLD_MS)
      setProgress(p)
      if (p >= 1) {
        stop()
        onComplete()
      } else {
        raf.current = window.requestAnimationFrame(tick)
      }
    }
    raf.current = window.requestAnimationFrame(tick)
  }, [busy, onComplete, stop])

  return (
    <button
      type="button"
      className="hm-hold"
      data-holding={holding ? 'true' : undefined}
      data-busy={busy ? 'true' : undefined}
      aria-label={busy ? holdingLabel : label}
      aria-busy={busy}
      onPointerDown={begin}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(event) => {
        if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
          event.preventDefault()
          begin()
        }
      }}
      onKeyUp={(event) => {
        if (event.key === ' ' || event.key === 'Enter') stop()
      }}
      disabled={busy}
    >
      <span className="hm-hold__fill" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <span className="hm-hold__label">{busy ? holdingLabel : label}</span>
      <span className="hm-hold__seal" aria-hidden="true" />
    </button>
  )
}
