/**
 * HORTUS MANUS — chapter definitions (owner: stage).
 * One list drives the nav, the chapter rail, the command palette and the
 * "current chapter" readout in the condensed top bar. All labels come from
 * copy.ts; nothing is hard-coded bilingual text.
 */

import type { Copy } from '@hortus/shared/copy'

export interface Chapter {
  /** DOM id of the section on the one-page home */
  id: string
  /** 01–06 for the rail */
  number: string
  /** route for the dedicated page, when one exists */
  href: string
  label: (c: Copy) => string
  /** the act numeral as printed in the kicker (I, II, 间奏, IV, 尾幕) */
  act: (c: Copy) => string
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'gate',
    number: '01',
    href: '/',
    label: (c) => c.nav.home,
    act: (c) => c.acts.gate.index,
  },
  {
    id: 'pollination',
    number: '02',
    href: '/touch',
    label: (c) => c.acts.gate.next,
    act: (c) => c.acts.pollination.index,
  },
  {
    id: 'greenhouse',
    number: '03',
    href: '/touch',
    label: (c) => c.acts.pollination.next,
    act: (c) => c.acts.greenhouse.index,
  },
  {
    id: 'field-notes',
    number: '04',
    href: '/field-guide',
    label: (c) => c.acts.greenhouse.next,
    act: (c) => c.acts.fieldNotes.index,
  },
  {
    id: 'herbarium',
    number: '05',
    href: '/herbarium',
    label: (c) => c.nav.herbarium,
    act: (c) => c.acts.herbarium.index,
  },
  {
    id: 'colophon',
    number: '06',
    href: '/#colophon',
    label: (c) => c.nav.colophon,
    act: (c) => c.acts.colophon.index,
  },
]

/** The chrome-level routes (not acts). */
export const PAGE_ROUTES = [
  { href: '/', label: (c: Copy) => c.nav.home },
  { href: '/touch', label: (c: Copy) => c.nav.touch },
  { href: '/field-guide', label: (c: Copy) => c.nav.fieldGuide },
  { href: '/herbarium', label: (c: Copy) => c.nav.herbarium },
] as const
