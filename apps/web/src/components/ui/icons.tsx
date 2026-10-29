/**
 * HORTUS MANUS — engraved line icons (owner: stage).
 * 24×24 grid, 1.25px stroke, square caps, mitre joins, currentColor only.
 * No fills except status dots, no emoji, no duotone. Decorative use is aria-hidden.
 */

import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 24, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.25,
    strokeLinecap: 'square' as const,
    strokeLinejoin: 'miter' as const,
    'aria-hidden': true,
    focusable: 'false' as const,
    ...rest,
  }
}

export function IconSound(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 9v6h3l5 4V5l-5 4H4Z" />
      <path d="M16 8.5c1.4 1.6 1.4 5.4 0 7" />
      <path d="M18.5 6c2.6 3 2.6 9 0 12" />
    </svg>
  )
}

export function IconSoundOff(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 9v6h3l5 4V5l-5 4H4Z" />
      <path d="M16 9l5 6M21 9l-5 6" />
    </svg>
  )
}

export function IconCamera(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 8h4l2-2h6l2 2h4v11H3V8Z" />
      <circle cx="12" cy="13" r="3.5" />
      <circle cx="18.5" cy="10.5" r="0.6" />
    </svg>
  )
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  )
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6l-12 12" />
    </svg>
  )
}

export function IconCommand(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 8h8v8H8V8Z" />
      <path d="M8 8a2.5 2.5 0 1 0-2.5 2.5H8M16 8a2.5 2.5 0 1 1 2.5 2.5H16M8 16a2.5 2.5 0 1 1-2.5-2.5H8M16 16a2.5 2.5 0 1 0 2.5-2.5H16" />
    </svg>
  )
}

export function IconSun(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9l-2.1 2.1M7 17l-2.1 2.1" />
    </svg>
  )
}

export function IconMoon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  )
}

export function IconArrow(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5.5 5.5" />
    </svg>
  )
}

export function IconLeaf(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 4c0 9-6 14-12 14H4C4 9 10 4 20 4Z" />
      <path d="M4 20c2-6 6-10 12-12" />
    </svg>
  )
}

export function IconPress(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 17h16M6 17V9h12v8" />
      <path d="M12 9V3M9 6l3-3 3 3" />
    </svg>
  )
}

export function IconDownload(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v11M8 10l4 4 4-4" />
      <path d="M4 17v4h16v-4" />
    </svg>
  )
}

export function IconLink(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 14a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 1 0-5.7-5.7l-1.4 1.4" />
      <path d="M14 10a4 4 0 0 0-5.7 0L5.7 12.6a4 4 0 1 0 5.7 5.7l1.4-1.4" />
    </svg>
  )
}

export function IconQR(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 3h6v6H3V3ZM15 3h6v6h-6V3ZM3 15h6v6H3V15Z" />
      <path d="M15 15h2v2h-2v-2ZM19 19h2v2h-2v-2ZM19 15h2M15 19v2" />
    </svg>
  )
}

export function IconThanks(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10c0-3 1.5-5 3.5-5s2 4-3.5 5M12 14c0 3-1.5 5-3.5 5s-2-4 3.5-5M10 12c-3 0-5 1.5-5 3.5s4 2 5-3.5M14 12c3 0 5-1.5 5-3.5s-4-2-5 3.5" />
    </svg>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15" />
      <path d="M10 10v7M14 10v7" />
    </svg>
  )
}

export function IconRetry(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 3v5h-5" />
    </svg>
  )
}

export function IconSliders(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  )
}

export function IconSort(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 4v16M4 17l3 3 3-3" />
      <path d="M13 7h7M13 12h5M13 17h3" />
    </svg>
  )
}

export function IconGrid(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 3h7v7H3V3ZM14 3h7v7h-7V3ZM3 14h7v7H3V14ZM14 14h7v7h-7V14Z" />
    </svg>
  )
}

export function IconRail(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 4h5v16H3V4ZM11 4h4v16h-4V4ZM18 4h3v16h-3V4Z" />
    </svg>
  )
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12l5 5L20 6" />
    </svg>
  )
}

export function IconPause(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 5v14M15 5v14" />
    </svg>
  )
}

export function IconPlay(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 4l13 8-13 8V4Z" />
    </svg>
  )
}

export function IconHand(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6.5a1.5 1.5 0 0 1 3 0v7M17 10.5a1.5 1.5 0 0 1 3 0V15c0 4-3 6-6.5 6S7 19 7 15v-4" />
    </svg>
  )
}

export function IconExternal(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v6H4V6h6" />
    </svg>
  )
}

export function IconLanguage(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 5h9M7.5 3v2M10 5c0 4-3 7-7 8M5 8c1 3 3 4 6 5" />
      <path d="M12 21l4-10 4 10M13.4 17h5.2" />
    </svg>
  )
}
