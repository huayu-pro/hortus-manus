import type { Lang, Season } from './types'

export interface SeasonMeta {
  id: Season
  zh: string
  en: string
  latin: string
  months: number[]
  accent: string
  deep: string
  noteZh: string
  noteEn: string
}

export const SEASONS: SeasonMeta[] = [
  {
    id: 'spring',
    zh: '春',
    en: 'SPRING',
    latin: 'Ver',
    months: [3, 4, 5],
    accent: '#e8c4be',
    deep: '#c97f7f',
    noteZh: '风从南边来，牡丹先醒。',
    noteEn: 'Wind from the south; the peony wakes first.',
  },
  {
    id: 'summer',
    zh: '夏',
    en: 'SUMMER',
    latin: 'Aestas',
    months: [6, 7, 8],
    accent: '#8a9a7b',
    deep: '#4a5a42',
    noteZh: '池水很满，蝉声把午后拉长。',
    noteEn: 'The pond is full; cicadas stretch the afternoon.',
  },
  {
    id: 'autumn',
    zh: '秋',
    en: 'AUTUMN',
    latin: 'Autumnus',
    months: [9, 10, 11],
    accent: '#d8a84e',
    deep: '#8a5a2b',
    noteZh: '种子熟了，风开始有重量。',
    noteEn: 'Seeds ripen; the wind begins to have weight.',
  },
  {
    id: 'winter',
    zh: '冬',
    en: 'WINTER',
    latin: 'Hiems',
    months: [12, 1, 2],
    accent: '#c9d8d0',
    deep: '#5e7f78',
    noteZh: '泥土睡着，玻璃上有一层薄薄的晨雾。',
    noteEn: 'The soil sleeps; a thin morning fog sits on the glass.',
  },
]

export function seasonOfMonth(monthIndex0: number): Season {
  const m = monthIndex0 + 1
  if (m >= 3 && m <= 5) return 'spring'
  if (m >= 6 && m <= 8) return 'summer'
  if (m >= 9 && m <= 11) return 'autumn'
  return 'winter'
}

export function seasonOfDate(d: Date = new Date()): Season {
  return seasonOfMonth(d.getMonth())
}

export function findSeason(id: Season): SeasonMeta {
  const s = SEASONS.find((x) => x.id === id)
  if (!s) throw new Error(`Unknown season: ${id}`)
  return s
}

export type Daypart = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night'

export function daypartOfHour(hour: number): Daypart {
  if (hour >= 5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 14) return 'noon'
  if (hour >= 14 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}

export function seasonLabel(season: Season, lang: Lang): string {
  const s = findSeason(season)
  return lang === 'zh' ? s.zh : s.en
}