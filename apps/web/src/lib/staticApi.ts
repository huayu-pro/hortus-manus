/**
 * GitHub Pages static adapter.
 *
 * The full local app talks to the Hono API. On GitHub Pages there is no server,
 * so this adapter serves the same public specimen list from `public/api/*` and
 * keeps user-created specimens in localStorage. It deliberately mirrors the
 * server API surface so pages/components do not branch.
 */
import type {
  DailyEdition,
  Lang,
  ModeId,
  Season,
  Specimen,
  SpecimenList,
  SpecimenSeed,
  Stats,
} from '@hortus/shared'

const BASE = import.meta.env.BASE_URL || '/'
const CREATED_KEY = 'hm:static:created'
const HIDDEN_KEY = 'hm:static:hidden'
const THANKS_KEY = 'hm:static:thanks'

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage may be blocked */
  }
}
function basePath(): string {
  return BASE.endsWith('/') ? BASE : `${BASE}/`
}
function absolute(rel: string): string {
  try {
    return new URL(rel, document.baseURI).toString()
  } catch {
    return rel
  }
}
function shareUrlForId(id: string): string {
  const origin = location.origin
  const path = location.pathname.replace(/index\.html$/i, '')
  return `${origin}${path}#/s/${encodeURIComponent(id)}`
}
function hydrate(raw: Specimen): Specimen {
  const id = raw.id
  return {
    ...raw,
    cardUrl: raw.cardUrl ? absolute(raw.cardUrl) : '',
    ogUrl: raw.ogUrl ? absolute(raw.ogUrl) : '',
    shareUrl: shareUrlForId(id),
  }
}

let seeds: Specimen[] | null = null
let seedPromise: Promise<Specimen[]> | null = null

async function loadSeeds(): Promise<Specimen[]> {
  if (seeds) return seeds
  if (!seedPromise) {
    seedPromise = (async () => {
      const res = await fetch(`${basePath()}api/specimens.json`, { cache: 'no-cache' })
      if (!res.ok) throw new Error(`Static specimens unavailable (${res.status})`)
      const data = (await res.json()) as { items: Specimen[] }
      seeds = data.items.map(hydrate)
      return seeds
    })()
  }
  return seedPromise
}

function created(): Specimen[] {
  return readJSON<Specimen[]>(CREATED_KEY, []).map(hydrate)
}
function hidden(): Set<string> {
  return new Set(readJSON<string[]>(HIDDEN_KEY, []))
}
function allLocal(): Specimen[] {
  const ids = hidden()
  return [...created(), ...(seeds ?? [])].filter((s) => !ids.has(s.id))
}
function thanksMap(): Record<string, number> {
  return readJSON<Record<string, number>>(THANKS_KEY, {})
}

async function listSpecimens(params: {
  limit?: number
  cursor?: string
  mode?: ModeId
  season?: Season
  q?: string
  sort?: 'new' | 'thanks'
} = {}): Promise<SpecimenList> {
  await loadSeeds()
  let items = allLocal()
  if (params.mode) items = items.filter((s) => s.mode === params.mode)
  if (params.season) items = items.filter((s) => s.season === params.season)
  if (params.q) {
    const q = params.q.toLowerCase()
    items = items.filter((s) => `${s.caption ?? ''} ${s.mode} ${s.season} ${s.id}`.toLowerCase().includes(q))
  }
  if (params.sort === 'thanks') items.sort((a, b) => b.thanks - a.thanks)
  else if (params.sort === 'oldest') items.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  else items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const total = items.length
  const limit = Math.min(params.limit ?? 12, 60)
  const offset = Number(params.cursor ?? 0) || 0
  const page = items.slice(offset, offset + limit)
  return { items: page, nextCursor: offset + limit < total ? String(offset + limit) : null, total }
}

async function getSpecimen(id: string): Promise<Specimen> {
  await loadSeeds()
  const found = allLocal().find((s) => s.id === id)
  if (!found) throw new Error('This specimen is no longer pressed in paper.')
  return found
}

async function createSpecimen(input: SpecimenSeed & { lang: Lang; clientId: string }): Promise<{ specimen: Specimen; deleteToken: string }> {
  await loadSeeds()
  const id = `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  const specimen: Specimen = {
    id,
    mode: input.mode,
    season: input.season,
    seed: input.seed,
    caption: input.caption ?? '',
    lang: input.lang,
    thanks: 0,
    createdAt: new Date().toISOString(),
    cardUrl: '',
    ogUrl: '',
    shareUrl: shareUrlForId(id),
  }
  const list = readJSON<Specimen[]>(CREATED_KEY, [])
  writeJSON(CREATED_KEY, [...list, specimen])
  return { specimen, deleteToken: 'static-local-token' }
}

async function deleteSpecimen(id: string): Promise<{ ok: boolean }> {
  const list = readJSON<Specimen[]>(CREATED_KEY, [])
  const next = list.filter((s) => s.id !== id)
  if (next.length !== list.length) {
    writeJSON(CREATED_KEY, next)
  } else {
    const ids = readJSON<string[]>(HIDDEN_KEY, [])
    if (!ids.includes(id)) writeJSON(HIDDEN_KEY, [...ids, id])
  }
  return { ok: true }
}

async function thankSpecimen(id: string): Promise<{ thanks: number }> {
  const map = thanksMap()
  map[id] = (map[id] ?? 0) + 1
  writeJSON(THANKS_KEY, map)
  try {
    const s = await getSpecimen(id)
    return { thanks: s.thanks + map[id] }
  } catch {
    return { thanks: map[id] }
  }
}

async function getEdition(): Promise<DailyEdition> {
  try {
    const res = await fetch(`${basePath()}api/edition.json`, { cache: 'no-cache' })
    if (res.ok) return (await res.json()) as DailyEdition
  } catch {
    /* fall through */
  }
  const d = new Date()
  return {
    date: d.toISOString().slice(0, 10),
    seed: d.getTime() % 0xffffffff,
    mode: 'frame',
    season: 'spring',
    noteZh: '今日花园在本地醒来。',
    noteEn: 'The garden wakes locally today.',
  }
}

async function getStats(): Promise<Stats> {
  await loadSeeds()
  const items = allLocal()
  const byMode = Object.fromEntries(['frame', 'tendril', 'ripple', 'spore', 'mycelium', 'mist', 'phyllotaxis'].map((m) => [m, 0])) as Record<ModeId, number>
  const bySeason = Object.fromEntries(['spring', 'summer', 'autumn', 'winter'].map((s) => [s, 0])) as Record<Season, number>
  for (const s of items) {
    byMode[s.mode] = (byMode[s.mode] ?? 0) + 1
    bySeason[s.season] = (bySeason[s.season] ?? 0) + 1
  }
  return { total: items.length, byMode, bySeason, thanks: items.reduce((n, s) => n + s.thanks, 0) }
}

async function getHealth(): Promise<{ ok: boolean; version: string; specimens: number }> {
  await loadSeeds().catch(() => [])
  return { ok: true, version: 'static-pages', specimens: (seeds?.length ?? 0) + created().length }
}

export const staticApi = {
  listSpecimens,
  getSpecimen,
  createSpecimen,
  deleteSpecimen,
  thankSpecimen,
  getEdition,
  getStats,
  getHealth,
}
