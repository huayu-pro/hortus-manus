/**
 * HORTUS MANUS — page background layers (owner: stage).
 *
 * Four generated layers, no bitmaps:
 *  1. paper fibre + grain (from base.css tokens) — strengthened locally
 *  2. a single continuous vine drawn in SVG, deterministic, slowly drifting
 *  3. two soft light pools (radial gradients) that sit behind the type
 *  4. a deckle edge at the top of the sheet
 *
 * All layers are `pointer-events: none`, `aria-hidden` and respect
 * prefers-reduced-motion (they simply do not animate).
 */

import type { ReactNode } from 'react'
import '@/styles/sections.css'
import { useLang } from '@/lib/i18n'

/** The vine: one path per page, fixed coordinates, scales with the viewport. */
export function VineLayer({ opacity = 1 }: { opacity?: number }) {
  return (
    <svg
      className="hm-bg__vine"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      style={{ opacity }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
        {/* main stem sweeping from bottom-left to top-right */}
        <path d="M-20 780C160 720 250 640 320 500c60-120 120-200 240-260 140-70 300-60 430 40 90 70 150 160 240 190 80 26 190 10 270-30" />
        {/* tendril curls */}
        <path d="M320 500c-40-30-90-24-104 14-14 38 40 60 74 40" />
        <path d="M560 240c30-40 86-40 104-6 18 34-30 60-66 44" />
        <path d="M990 280c40 20 70 60 52 96-18 36-70 30-84-8" />
        {/* leaves along the stem */}
        <path d="M240 606c-40-16-72-8-84 22 32 18 70 10 84-22Z" />
        <path d="M420 400c-44-6-72 12-72 44 36 6 68-12 72-44Z" />
        <path d="M700 180c-30-30-66-34-92-6 22 30 62 32 92 6Z" />
        <path d="M880 240c40-24 78-16 92 18-34 22-74 16-92-18Z" />
        <path d="M1180 380c36 22 64 60 40 88-32-16-54-56-40-88Z" />
        <path d="M140 720c-34 20-52 54-28 78 28-18 42-52 28-78Z" />
      </g>
    </svg>
  )
}

/** Two light pools, positioned per page through CSS custom properties. */
export function LightPools() {
  return (
    <div className="hm-bg__light" aria-hidden="true">
      <span className="hm-bg__pool hm-bg__pool--a" />
      <span className="hm-bg__pool hm-bg__pool--b" />
    </div>
  )
}

/** Deckle edge — the torn top of a cotton-paper sheet. */
export function DeckleEdge() {
  return <div className="hm-bg__deckle" aria-hidden="true" />
}

export interface PageShellProps {
  children: ReactNode
  /** extra class for page-specific background tuning */
  className?: string
  /** folio tint for the light pools (seasonal accent) */
  tone?: 'peony' | 'moss' | 'pollen' | 'pond' | 'mist'
  /** hide the vine for dense pages like /herbarium */
  bare?: boolean
  id?: string
}

/**
 * PageShell = background layers + skip link + <main id="main">.
 * It does NOT render the header; the Shell does that so /touch can opt out.
 */
export function PageShell({ children, className, tone = 'peony', bare = false, id }: PageShellProps) {
  const { copy } = useLang()
  return (
    <div className={`hm-page hm-page--${tone}${bare ? ' hm-page--bare' : ''}${className ? ` ${className}` : ''}`} id={id}>
      <a className="hm-skip-link" href="#main">
        {copy.nav.skip}
      </a>
      {bare ? null : (
        <>
          <VineLayer opacity={0.16} />
          <LightPools />
        </>
      )}
      <DeckleEdge />
      <main id="main" className="hm-page__main">
        {children}
      </main>
    </div>
  )
}
