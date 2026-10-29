/** HORTUS MANUS palette — contract §6 hexes + the seasonal accent swap (A4). */

import type { Season } from '@hortus/shared'
import { findSeason } from '@hortus/shared'

export interface Palette {
  paper: string
  paperDeep: string
  ink: string
  inkSoft: string
  moss: string
  sage: string
  leaf: string
  peony: string
  blush: string
  pollen: string
  mist: string
  pond: string
  night: string
  moon: string
  brass: string
  seasonAccent: string
  seasonDeep: string
  /** season-specific water/haze tint used by the shader modes */
  water: string
  haze: string
}

const BASE = {
  paper: '#f6f1e7',
  paperDeep: '#ede5d6',
  ink: '#1c211a',
  inkSoft: '#5d6658',
  moss: '#4a5a42',
  sage: '#8a9a7b',
  leaf: '#6f875f',
  peony: '#c97f7f',
  blush: '#e8c4be',
  pollen: '#d8a84e',
  mist: '#c9d8d0',
  pond: '#5e7f78',
  night: '#111a14',
  moon: '#e8e3cf',
  brass: '#a8833f',
}

const SEASON_WATER: Record<Season, { water: string; haze: string }> = {
  spring: { water: '#7d9a8e', haze: '#e8c4be' },
  summer: { water: '#5e7f78', haze: '#c9d8d0' },
  autumn: { water: '#8b8a66', haze: '#d8a84e' },
  winter: { water: '#7e9494', haze: '#c9d8d0' },
}

export function paletteFor(season: Season): Palette {
  const s = findSeason(season)
  const extra = SEASON_WATER[season]
  return {
    ...BASE,
    seasonAccent: s.accent,
    seasonDeep: s.deep,
    water: extra.water,
    haze: extra.haze,
  }
}

/** hex -> [r,g,b] in 0..1 (used by Canvas2D and THREE.Color alike). */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${alpha})`
}

export function mixHex(a: string, b: string, k: number): string {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  const c = A.map((v, i) => Math.round((v + (B[i] - v) * k) * 255))
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}
