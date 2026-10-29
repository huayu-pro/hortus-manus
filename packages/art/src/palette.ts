import { findMode, findSeason } from '@hortus/shared'
import type { ArtPalette, ArtSpec } from './types'

export const COLORS = {
  paper: '#F6F1E7',
  paperDeep: '#EDE5D6',
  paperLight: '#FBF8F1',
  ink: '#1C211A',
  inkSoft: '#5D6658',
  moss: '#4A5A42',
  sage: '#8A9A7B',
  leaf: '#6F875F',
  peony: '#C97F7F',
  blush: '#E8C4BE',
  pollen: '#D8A84E',
  mist: '#C9D8D0',
  pond: '#5E7F78',
  night: '#111A14',
  moon: '#E8E3CF',
} as const

/** Paper + ink + the mode/season accents, all from the contract palette. */
export function paletteFor(spec: Pick<ArtSpec, 'mode' | 'season'>): ArtPalette {
  const mode = findMode(spec.mode)
  const season = findSeason(spec.season)
  return {
    ...COLORS,
    accent: mode.accent,
    accentDeep: mixHex(mode.accent, COLORS.ink, 0.42),
    seasonAccent: season.accent,
  }
}

/** Tiny hex mixer (no deps). t=0 -> a, t=1 -> b. */
export function mixHex(a: string, b: string, t: number): string {
  const pa = hexToRgb(a)
  const pb = hexToRgb(b)
  const k = Math.min(1, Math.max(0, t))
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * k)
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * k)
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * k)
  return rgbToHex(r, g, bl)
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/** rgba() from a hex colour plus alpha. */
export function alpha(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${Math.min(1, Math.max(0, a)).toFixed(3)})`
}
