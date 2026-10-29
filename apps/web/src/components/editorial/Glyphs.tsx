/**
 * HORTUS MANUS — line glyphs for the five gestures and seven modes (owner: stage).
 * 24×24 engraving grid; strokes only, currentColor; never the only label.
 */

import type { Gesture, ModeId } from '@hortus/shared'
import type { SVGProps } from 'react'

type GlyphProps = SVGProps<SVGSVGElement> & { size?: number }

function shell({ size = 32, ...rest }: GlyphProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.1,
    strokeLinecap: 'square' as const,
    strokeLinejoin: 'miter' as const,
    'aria-hidden': true,
    focusable: 'false' as const,
    ...rest,
  }
}

export function GestureGlyph({ gesture, ...rest }: GlyphProps & { gesture: Gesture }) {
  switch (gesture) {
    case 'frame':
      return (
        <svg {...shell(rest)}>
          <path d="M4 12V6h6M28 12V6h-6M4 20v6h6M28 20v6h-6" />
          <path d="M12 16c0-3 2-5 4-5s4 2 4 5-2 5-4 5-4-2-4-5Z" />
        </svg>
      )
    case 'open':
      return (
        <svg {...shell(rest)}>
          <path d="M16 29V15M16 15L10 6M16 15l-4-9M16 15V4M16 15l4-9M16 15l6-9" />
          <path d="M7 24c3 3 6 4 9 4s6-1 9-4" />
        </svg>
      )
    case 'pinch':
      return (
        <svg {...shell(rest)}>
          <path d="M9 25c-1-8 2-16 5-17 2 0 3 2 3 5 0 4-2 7-4 9" />
          <path d="M23 25c1-8-2-16-5-17-2 0-3 2-3 5" />
          <circle cx="16" cy="13" r="1.5" />
        </svg>
      )
    case 'fist':
      return (
        <svg {...shell(rest)}>
          <path d="M8 13c0-3 2-5 4-5h8c2 0 4 2 4 5v8c0 4-3 6-6 6h-4c-3 0-6-2-6-6v-8Z" />
          <path d="M12 8v6M16 8v6M20 8v6M8 15h16" />
        </svg>
      )
    case 'weave':
      return (
        <svg {...shell(rest)}>
          <path d="M4 10c6 0 8 6 14 6s8-6 10-6" />
          <path d="M4 22c6 0 8-6 14-6s8 6 10 6" />
          <circle cx="11" cy="16" r="1" fill="currentColor" />
          <circle cx="21" cy="16" r="1" fill="currentColor" />
        </svg>
      )
    default:
      return (
        <svg {...shell(rest)}>
          <circle cx="16" cy="16" r="9" />
        </svg>
      )
  }
}

export function ModeGlyph({ mode, ...rest }: GlyphProps & { mode: ModeId }) {
  switch (mode) {
    case 'frame':
      return (
        <svg {...shell(rest)}>
          <path d="M4 10V4h6M28 10V4h-6M4 22v6h6M28 22v6h-6" />
          <path d="M16 10c2.5 1 4 3 4 6s-1.5 5-4 6c-2.5-1-4-3-4-6s1.5-5 4-6Z" />
          <path d="M16 12v8" />
        </svg>
      )
    case 'tendril':
      return (
        <svg {...shell(rest)}>
          <path d="M6 8c4 6 8 2 10 8s8 2 10 8" />
          <path d="M6 24c4-6 8-2 10-8s8-2 10-8" />
          <circle cx="6" cy="8" r="1" fill="currentColor" />
          <circle cx="26" cy="24" r="1" fill="currentColor" />
          <circle cx="16" cy="16" r="1" fill="currentColor" />
        </svg>
      )
    case 'ripple':
      return (
        <svg {...shell(rest)}>
          <ellipse cx="16" cy="18" rx="11" ry="5" />
          <ellipse cx="16" cy="18" rx="6" ry="2.8" />
          <path d="M16 6v6M14 9l2-3 2 3" />
        </svg>
      )
    case 'spore':
      return (
        <svg {...shell(rest)}>
          <circle cx="16" cy="18" r="3" />
          <path d="M16 15V5M12 16l-5-7M20 16l5-7M9 19l-6 1M23 19l6 1M11 21l-3 5M21 21l3 5" />
          <circle cx="16" cy="4" r="1" fill="currentColor" />
        </svg>
      )
    case 'mycelium':
      return (
        <svg {...shell(rest)}>
          <path d="M8 26V12c0-3 2-5 4-5M24 26V12c0-3-2-5-4-5" />
          <path d="M12 16h8M12 20h5M17 20l3 3M16 16v6" />
          <circle cx="8" cy="26" r="1" fill="currentColor" />
          <circle cx="24" cy="26" r="1" fill="currentColor" />
        </svg>
      )
    case 'mist':
      return (
        <svg {...shell(rest)}>
          <rect x="5" y="5" width="22" height="22" />
          <path d="M8 22c4-6 7-2 8-7s4 1 8-4" />
          <path d="M8 11h4M18 8h4" opacity="0.5" />
        </svg>
      )
    case 'phyllotaxis':
      return (
        <svg {...shell(rest)}>
          <path d="M16 16c0-2 2-2 3 0s0 4-3 4-6-3-4-7 8-4 10 1 0 10-7 11-12-4-10-11" />
          <circle cx="16" cy="16" r="1" fill="currentColor" />
        </svg>
      )
    default:
      return (
        <svg {...shell(rest)}>
          <circle cx="16" cy="16" r="8" />
        </svg>
      )
  }
}
