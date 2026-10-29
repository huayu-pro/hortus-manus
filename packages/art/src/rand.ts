import { mulberry32, seedFromParts } from '@hortus/shared'
import type { ArtSpec } from './types'

export interface Rng {
  (): number
  range(min: number, max: number): number
  int(min: number, max: number): number
  pick<T>(arr: readonly T[]): T
  chance(p: number): boolean
  sign(): number
}

/** The one and only art seed: mulberry32(seedFromParts(id, mode, season, seed)). */
export function artRng(spec: Pick<ArtSpec, 'id' | 'mode' | 'season' | 'seed'>): Rng {
  const base = mulberry32(seedFromParts(spec.id, spec.mode, spec.season, spec.seed))
  const r = base as Rng
  r.range = (min, max) => min + base() * (max - min)
  r.int = (min, max) => Math.floor(min + base() * (max - min + 1))
  r.pick = (arr) => arr[Math.floor(base() * arr.length)]
  r.chance = (p) => base() < p
  r.sign = () => (base() < 0.5 ? -1 : 1)
  return r
}

/** Sub-stream: same parent seed, different salt, so one part of the card does not shift another. */
export function subRng(spec: Pick<ArtSpec, 'id' | 'mode' | 'season' | 'seed'>, salt: string): Rng {
  return artRng({ ...spec, seed: seedFromParts(spec.id, spec.mode, spec.season, spec.seed, salt) >>> 0 })
}

const ROMAN: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

export function roman(n: number): string {
  let out = ''
  let left = Math.max(1, Math.round(n))
  for (const [v, s] of ROMAN) {
    while (left >= v) {
      out += s
      left -= v
    }
  }
  return out
}

export function seedHex(seed: number): string {
  return (seed >>> 0).toString(16).toUpperCase().padStart(8, '0')
}

/** 2026-10-30T01:20:00.000Z -> {date:'2026-10-30', time:'01:20', day:'30', month:'X', year:'MMXXVI'} in server local time. */
export function stamp(iso: string): { date: string; time: string; month: string; year: string } {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return { date: '---- -- --', time: '--:--', month: 'X', year: 'MMXXVI' }
  }
  const p = (n: number) => String(n).padStart(2, '0')
  return {
    date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}`,
    month: roman(d.getMonth() + 1),
    year: roman(d.getFullYear()),
  }
}

/** Short stable digest for labels / barcodes. */
export function digest(input: string, len = 8): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  let x = h >>> 0
  let out = ''
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
  for (let i = 0; i < len; i++) {
    out += alphabet[x % 32]
    x = Math.floor(x / 32) ^ (h >>> (i + 3))
  }
  return out
}
