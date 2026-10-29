/**
 * HORTUS MANUS — 404 (owner: stage).
 * "This specimen has not been pressed yet." Warm, useful, and it shows one
 * unclaimed flower generated from the requested path — deterministic, honest.
 */

import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LangProvider, useLang } from '@/lib/i18n'
import { Shell, FolioFooter } from '@/components/shell/Shell'
import { PageShell } from '@/components/shell/PageShell'
import { SpecimenArt } from '@/components/archive/SpecimenArt'
import { hashString } from '@hortus/shared'
import { IconArrow, IconLeaf } from '@/components/ui/icons'

function NotFoundInner() {
  const { copy } = useLang()
  const location = useLocation()
  const seed = hashString(location.pathname) >>> 0

  useEffect(() => {
    document.title = `${copy.notFound.code} — ${copy.meta.siteName}`
  }, [copy])

  return (
    <Shell route={location.pathname}>
      <PageShell tone="mist">
        <div className="hm-404">
          <div className="hm-404__copy">
            <p className="hm-404__code" aria-hidden="true">
              404
            </p>
            <span className="hm-label">{copy.notFound.kicker}</span>
            <h1 className="hm-404__title">{copy.notFound.title}</h1>
            <p className="hm-lead">{copy.notFound.body}</p>
            <p className="hm-body-s">{copy.notFound.hint}</p>

            <div className="hm-404__actions">
              <Link to="/" className="hm-btn hm-btn--solid hm-btn--md">
                {copy.notFound.home}
                <IconArrow size={16} />
              </Link>
              <Link to="/herbarium" className="hm-btn hm-btn--outline hm-btn--md">
                {copy.notFound.cta}
                <IconArrow size={16} />
              </Link>
            </div>

            <p className="hm-404__cmd">
              <kbd>⌘K</kbd>
              <span>{copy.shortcuts.find((s) => s.keys === '⌘K')?.label}</span>
            </p>
          </div>

          <figure className="hm-404__plate">
            <SpecimenArt
              seed={seed}
              mode="phyllotaxis"
              season="winter"
              className="hm-404__art"
              label={copy.notFound.ghostNote}
            />
            <figcaption className="hm-hand">{copy.notFound.ghostNote}</figcaption>
            <span className="hm-404__pin" aria-hidden="true" />
          </figure>

          <p className="hm-404__footnote hm-micro">
            <IconLeaf size={12} /> {copy.colophon.disclaimer}
          </p>
        </div>
        <FolioFooter page={6} note={copy.notFound.kicker} />
      </PageShell>
    </Shell>
  )
}

export default function NotFoundPage() {
  return (
    <LangProvider>
      <NotFoundInner />
    </LangProvider>
  )
}
