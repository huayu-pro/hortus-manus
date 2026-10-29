/**
 * HORTUS MANUS — formatting helpers (owner: stage).
 *
 * Everything the UI prints as a number, a date, a coordinate or an herbarium
 * number goes through here so the labels stay honest and consistent:
 *  - no fake figures: functions either receive a real value or return a dash;
 *  - mono readouts use tabular figures (CSS handles that);
 *  - Chinese and English use the same underlying data, different wording.
 */

import type { Lang, Season, Specimen, ModeId } from '@hortus/shared'
import { findSeason } from '@hortus/shared'

/** Fictional greenhouse coordinates (contract §6 / art direction §3). Labelled 虚构 in the colophon. */
export const GREENHOUSE_COORDS = '31°14′N · 121°29′E'
export const GREENHOUSE_LAT = 31.233
export const GREENHOUSE_LON = 121.483

const SEASON_CODE: Record<Season, string> = {
  spring: 'SPR',
  summer: 'SUM',
  autumn: 'AUT',
  winter: 'WIN',
}

const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

/** Roman numeral for folios / plate numbers. 1 → I. */
export function roman(n: number): string {
  if (!Number.isFinite(n) || n < 1) return '0'
  if (n <= 12) return ROMAN[n]
  const pairs: [number, string][] = [
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
  let out = ''
  let rest = Math.floor(n)
  for (const [v, s] of pairs) {
    while (rest >= v) {
      out += s
      rest -= v
    }
  }
  return out
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/** 24-hour clock, seconds optional. Local time only. */
export function formatClock(d: Date, withSeconds = false): string {
  const h = pad2(d.getHours())
  const m = pad2(d.getMinutes())
  return withSeconds ? `${h}:${m}:${pad2(d.getSeconds())}` : `${h}:${m}`
}

const MONTH_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** ISO → "2026 · 秋分" / "30 OCT 2026". Falls back to the raw string. */
export function formatDate(iso: string | undefined, lang: Lang): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const season = seasonOf(d)
  if (lang === 'zh') return `${d.getFullYear()} · ${findSeason(season).zh}季`
  return `${pad2(d.getDate())} ${MONTH_EN[d.getMonth()]} ${d.getFullYear()}`
}

/** Full local timestamp for specimen cards: "2026-10-30 08:41". */
export function formatStamp(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${formatClock(d)}`
}

/** Time-only, for the live glasshouse clock. */
export function formatTimeOnly(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return formatClock(d)
}

function seasonOf(d: Date): Season {
  const m = d.getMonth() + 1
  if (m >= 3 && m <= 5) return 'spring'
  if (m >= 6 && m <= 8) return 'summer'
  if (m >= 9 && m <= 11) return 'autumn'
  return 'winter'
}

/** "第 3 日" / "Day 3" relative to now — used by field notes and specimens. */
export function relativeDay(iso: string | undefined, lang: Lang): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (days <= 0) return lang === 'zh' ? '今日' : 'Today'
  return lang === 'zh' ? `第 ${days} 日` : `Day ${days}`
}

/**
 * Herbarium number: HM-2026-SPR-004.
 * Derived from the real specimen id (last hex pair) and its real season/date.
 * Deterministic: the same specimen always prints the same number.
 */
export function specimenNumber(spec: Pick<Specimen, 'id' | 'season' | 'createdAt'>): string {
  const d = spec.createdAt ? new Date(spec.createdAt) : new Date()
  const year = Number.isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear()
  const code = SEASON_CODE[spec.season] ?? 'GEN'
  const tail = spec.id.replace(/[^a-z0-9]/gi, '').slice(-4).toUpperCase()
  const seq = parseInt(tail || '0', 36) % 1000
  return `HM-${year}-${code}-${String(Number.isNaN(seq) ? 0 : seq).padStart(3, '0')}`
}

export function plateNumber(n: number): string {
  return `PLATE ${roman(n)}`
}

export function folio(page: number, total = 6): string {
  return `${roman(page)} / ${roman(total)}`
}

/** "60 fps" / "18 ms" — unit always small, never italic. */
export function readout(value: number | null | undefined, unit: string, digits = 0): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return `— ${unit}`
  return `${value.toFixed(digits)} ${unit}`
}

export function formatCount(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US')
}

/** Caption cap matches the server contract: 60 characters. */
export const CAPTION_MAX = 60

export function clampCaption(s: string, max = CAPTION_MAX): string {
  return s.length <= max ? s : s.slice(0, max)
}

export function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return `${s.slice(0, Math.max(0, max - 1))}…`
}

/** Seed as an 8-char hex code — the same seed the art pipeline uses. */
export function seedCode(seed: number): string {
  return (seed >>> 0).toString(16).toUpperCase().padStart(8, '0')
}

/** FPS bucket label used by the vitals strip (honest ranges, no fake numbers). */
export function fpsBucket(fps: number): 'good' | 'ok' | 'low' {
  if (fps >= 55) return 'good'
  if (fps >= 40) return 'ok'
  return 'low'
}

/** Local date key for "today's edition" caching. */
export function localDateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** Safe localStorage read/write — never throws in private mode. */
export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* storage may be unavailable; the UI must not break for it */
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/** Client id for the anonymous rate limiter (no PII, random, local only). */
export function getClientId(): string {
  const KEY = 'hm:client'
  const existing = readStorage(KEY)
  if (existing && existing.length >= 8) return existing
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  writeStorage(KEY, id)
  return id
}

/** Delete tokens live in localStorage only, keyed by specimen id. */
const TOKEN_KEY = 'hm:deleteTokens'

export function readDeleteTokens(): Record<string, string> {
  const raw = readStorage(TOKEN_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object') return parsed as Record<string, string>
  } catch {
    /* corrupt entry — start over rather than crash */
  }
  return {}
}

export function rememberDeleteToken(id: string, token: string): void {
  const all = readDeleteTokens()
  all[id] = token
  writeStorage(TOKEN_KEY, JSON.stringify(all))
}

export function forgetDeleteToken(id: string): void {
  const all = readDeleteTokens()
  delete all[id]
  writeStorage(TOKEN_KEY, JSON.stringify(all))
}

export function deleteTokenFor(id: string): string | null {
  return readDeleteTokens()[id] ?? null
}

/** Canonical share URL: prefer the server/static adapter's, else this origin's /s/:id. */
export function shareUrlFor(spec: Pick<Specimen, 'id' | 'shareUrl'>): string {
  if (spec.shareUrl) return spec.shareUrl
  const origin = typeof location !== 'undefined' ? location.origin : 'http://127.0.0.1:8787'
  if (import.meta.env.VITE_STATIC_MODE === 'true' && typeof location !== 'undefined') {
    return `${origin}${location.pathname.replace(/index\.html$/i, '')}#/s/${spec.id}`
  }
  return `${origin}/s/${spec.id}`
}

/** Deterministic card URL, so the archive and the modal agree. */
export function cardUrlFor(id: string): string {
  if (import.meta.env.VITE_STATIC_MODE === 'true') {
    return `${import.meta.env.BASE_URL}api/cards/${encodeURIComponent(id)}.png`
  }
  return `/api/specimens/${encodeURIComponent(id)}/card.png`
}

export function ogUrlFor(id: string): string {
  if (import.meta.env.VITE_STATIC_MODE === 'true') {
    return `${import.meta.env.BASE_URL}api/og/${encodeURIComponent(id)}.png`
  }
  return `/api/specimens/${encodeURIComponent(id)}/og.png`
}

/** Query-param helpers for /touch deep links (mode + season + collect). */
export function modeParam(): ModeId | null {
  if (typeof location === 'undefined') return null
  const v = new URLSearchParams(location.search).get('mode')
  return v ? (v as ModeId) : null
}

/** Copy text to the clipboard with a safe fallback (no throw on http/localhost). */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}
