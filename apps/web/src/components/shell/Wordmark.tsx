/**
 * HORTUS MANUS — the vine wordmark (A1, owner: stage).
 *
 * Hand-drawn SVG: each letter is set in the display face, but the connective
 * tissue is a vine drawn as a single path with leaves at every node. The vine is
 * deterministic (fixed coordinates), scales cleanly, and is aria-hidden so the
 * accessible name comes from the surrounding link text.
 *
 * Two modes:
 *  - `full`: the wordmark with the vine under-rule (top bar, colophon)
 *  - `compact`: monogram "HM" with one leaf (mobile top bar)
 */

import type { SVGProps } from 'react'

interface WordmarkProps extends SVGProps<SVGSVGElement> {
  /** height in px; width follows the 3.42 ratio */
  height?: number
  /** show the trailing vine flourish */
  vine?: boolean
  /** monogram for narrow viewports */
  compact?: boolean
}

export function Wordmark({ height = 22, vine = true, compact = false, ...rest }: WordmarkProps) {
  if (compact) {
    const h = height
    return (
      <svg
        viewBox="0 0 64 64"
        width={h}
        height={h}
        role="img"
        aria-label="HORTUS MANUS"
        {...rest}
      >
        {/* H + M ligature, cut as two stems with a shared crossbar */}
        <path d="M14 16v32M14 30h12M26 16v32" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <path d="M38 48V22l12 26V22" stroke="currentColor" strokeWidth="1.6" fill="none" />
        {/* vine curl from the H stem, one leaf */}
        <path
          d="M14 46c-6 4-8-4-2-6 5-2 6 5 1 7"
          stroke="currentColor"
          strokeWidth="1.1"
          fill="none"
        />
        <path
          d="M12 40c-4-2-5-6-2-8 3 2 4 5 2 8Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    )
  }

  // The wordmark is drawn, not typed: letterforms are path outlines so the vine
  // can thread between them without depending on a webfont being loaded.
  const h = height
  const w = Math.round(h * 5.9)
  return (
    <svg
      viewBox="0 0 236 40"
      width={w}
      height={h}
      role="img"
      aria-label="HORTUS MANUS"
      preserveAspectRatio="xMinYMid meet"
      {...rest}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter">
        {/* H */}
        <path d="M4 9v22M4 20h9M13 9v22" />
        {/* O — a bud, slightly open */}
        <path d="M21 20c0-6 3.4-11 7.6-11s7.6 5 7.6 11-3.4 11-7.6 11-7.6-5-7.6-11Z" />
        {/* R */}
        <path d="M43 31V9h5.4c3.6 0 6.2 2.4 6.2 5.6 0 3.3-2.6 5.4-6.2 5.4H43M48.6 20l6.4 11" />
        {/* T */}
        <path d="M60 9h14M67 9v22" />
        {/* U */}
        <path d="M80 9v13c0 5.6 3.2 9 7.6 9s7.6-3.4 7.6-9V9" />
        {/* S */}
        <path d="M106 11c-1.6-1.6-3.8-2.4-5.8-2.4-3 0-5 1.6-5 3.8 0 4.6 10.4 3 10.4 8.2 0 3-2.4 4.8-5.6 4.8-2.4 0-4.6-1-6-2.8" />
        {/* word gap, then MANUS */}
        {/* M */}
        <path d="M121 31V9l6.6 15 6.6-15V31" />
        {/* A */}
        <path d="M140 31l6.4-22 6.4 22M142.6 24h7.6" />
        {/* N */}
        <path d="M158 31V9l10 22V9" />
        {/* U */}
        <path d="M174 9v13c0 5.6 3.2 9 7.6 9s7.6-3.4 7.6-9V9" />
        {/* S */}
        <path d="M200 11c-1.6-1.6-3.8-2.4-5.8-2.4-3 0-5 1.6-5 3.8 0 4.6 10.4 3 10.4 8.2 0 3-2.4 4.8-5.6 4.8-2.4 0-4.6-1-6-2.8" />
      </g>

      {vine ? (
        <g fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.72">
          {/* the vine under-rule: one continuous stem with two leaves */}
          <path d="M4 36c22 6 52-6 74 2 20 7 44-4 64 2 24 7 50-4 86 0" />
          <path d="M52 39c-4-4-9-5-12-3 2 4 8 5 12 3Z" />
          <path d="M150 41c5-4 10-4 13-1-3 3-9 3-13 1Z" />
          <circle cx="228" cy="40" r="1.1" fill="currentColor" />
        </g>
      ) : null}
    </svg>
  )
}
