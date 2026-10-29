import type { DailyEdition, ModeId, Season, Specimen, SpecimenList, Stats } from '@hortus/shared'
import { MODE_IDS, SEASONS, findMode, findSeason, mulberry32, seedFromParts, seasonOfDate, shortId } from '@hortus/shared'
import { readdirSync, rmSync } from 'node:fs'
import { db, nowIso, todayLocal } from './index'
import { emptyStats, toSpecimen, type EditionRow, type SpecimenRow } from './types'
import { resolve } from 'node:path'
import { CARDS_DIR, cardUrlFor, ogUrlFor, shareUrlFor } from '../config'

const urls = { card: cardUrlFor, og: ogUrlFor, share: shareUrlFor }

// ---------------------------------------------------------------- statements
const stmts = {
  insert: db.prepare(`
    INSERT INTO specimens (id, mode, season, seed, caption, lang, client_hash, thanks, created_at, is_public, delete_token_hash)
    VALUES (@id, @mode, @season, @seed, @caption, @lang, @client_hash, 0, @created_at, 1, @delete_token_hash)
  `),
  get: db.prepare(`SELECT * FROM specimens WHERE id = ? AND is_public = 1`),
  getAny: db.prepare(`SELECT * FROM specimens WHERE id = ?`),
  del: db.prepare(`DELETE FROM specimens WHERE id = ?`),
  thanksRow: db.prepare(`SELECT thanks FROM specimens WHERE id = ? AND is_public = 1`),
  insertThanks: db.prepare(`INSERT OR IGNORE INTO thanks (specimen_id, visitor_hash, created_at) VALUES (?, ?, ?)`),
  bumpThanks: db.prepare(`UPDATE specimens SET thanks = thanks + 1 WHERE id = ?`),
  countPublic: db.prepare(`SELECT COUNT(*) AS n FROM specimens WHERE is_public = 1`),
  sumThanks: db.prepare(`SELECT COALESCE(SUM(thanks), 0) AS n FROM specimens WHERE is_public = 1`),
  byMode: db.prepare(`SELECT mode, COUNT(*) AS n FROM specimens WHERE is_public = 1 GROUP BY mode`),
  bySeason: db.prepare(`SELECT season, COUNT(*) AS n FROM specimens WHERE is_public = 1 GROUP BY season`),
  insertTelemetry: db.prepare(`
    INSERT INTO telemetry (day, mode, event, count) VALUES (?, ?, ?, 1)
    ON CONFLICT(day, mode, event) DO UPDATE SET count = count + 1
  `),
  getEdition: db.prepare(`SELECT * FROM editions WHERE date = ?`),
  insertEdition: db.prepare(`
    INSERT INTO editions (date, seed, mode, season, note_zh, note_en)
    VALUES (@date, @seed, @mode, @season, @note_zh, @note_en)
  `),
  telemetryDay: db.prepare(`SELECT mode, event, count FROM telemetry WHERE day = ? ORDER BY count DESC`),
}

export interface CreateRow {
  id: string
  mode: ModeId
  season: Season
  seed: number
  caption: string
  lang: 'zh' | 'en'
  clientHash: string
  createdAt: string
  deleteTokenHash: string
}

export function insertSpecimen(row: CreateRow): Specimen {
  stmts.insert.run({
    id: row.id,
    mode: row.mode,
    season: row.season,
    seed: row.seed,
    caption: row.caption,
    lang: row.lang,
    client_hash: row.clientHash,
    created_at: row.createdAt,
    delete_token_hash: row.deleteTokenHash,
  })
  const saved = stmts.get.get(row.id) as SpecimenRow | undefined
  if (!saved) throw new Error('specimen insert failed')
  return toSpecimen(saved, urls)
}

export function getSpecimen(id: string): Specimen | undefined {
  const row = stmts.get.get(id) as SpecimenRow | undefined
  return row ? toSpecimen(row, urls) : undefined
}

export function getSpecimenRow(id: string): SpecimenRow | undefined {
  return stmts.getAny.get(id) as SpecimenRow | undefined
}

export function deleteSpecimen(id: string): boolean {
  const info = stmts.del.run(id)
  if (info.changes > 0) {
    // Drop the cached art too, so a deleted specimen leaves nothing behind.
    try {
      for (const file of readdirSync(CARDS_DIR)) {
        if (file.startsWith(`${id}.png`) || file.startsWith(`${id}-`)) rmSync(resolve(CARDS_DIR, file), { force: true })
      }
    } catch {
      /* cache cleanup is best effort */
    }
  }
  return info.changes > 0
}

export interface ThanksResult {
  ok: boolean
  thanks: number
  duplicate: boolean
}

/** Idempotent per (specimen, visitor-day): thanks can only be given once per visitor per day. */
export function addThanks(id: string, visitorHash: string): ThanksResult | undefined {
  const row = stmts.thanksRow.get(id) as { thanks: number } | undefined
  if (!row) return undefined
  const created = nowIso()
  const tx = db.transaction(() => {
    const info = stmts.insertThanks.run(id, visitorHash, created)
    if (info.changes > 0) stmts.bumpThanks.run(id)
    return info.changes > 0
  })
  const inserted = tx()
  const fresh = stmts.thanksRow.get(id) as { thanks: number }
  return { ok: true, thanks: fresh.thanks, duplicate: !inserted }
}

export interface ListParams {
  limit: number
  cursor?: string
  mode?: ModeId
  season?: Season
  q?: string
  sort: 'new' | 'thanks'
}

interface CursorPayload {
  v: number
  t: string
  id: string
  n?: number
}

function encodeCursor(p: CursorPayload): string {
  return Buffer.from(JSON.stringify(p), 'utf8').toString('base64url')
}

function decodeCursor(cursor: string): CursorPayload | undefined {
  try {
    const raw = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as CursorPayload
    if (typeof raw.t !== 'string' || typeof raw.id !== 'string') return undefined
    return raw
  } catch {
    return undefined
  }
}

/** Keyset pagination on (created_at, id) or (thanks, created_at, id). */
export function listSpecimens(params: ListParams): SpecimenList {
  const where: string[] = ['is_public = 1']
  const args: (string | number)[] = []
  if (params.mode) {
    where.push('mode = ?')
    args.push(params.mode)
  }
  if (params.season) {
    where.push('season = ?')
    args.push(params.season)
  }
  if (params.q) {
    where.push('caption LIKE ?')
    args.push(`%${params.q.replace(/[%_]/g, '')}%`)
  }

  const cur = params.cursor ? decodeCursor(params.cursor) : undefined
  if (params.cursor && !cur) {
    // invalid cursor -> empty page, never a 500
    return { items: [], nextCursor: null, total: countSpecimens(params) }
  }

  if (params.sort === 'thanks') {
    if (cur) {
      where.push('(thanks < ? OR (thanks = ? AND (created_at < ? OR (created_at = ? AND id < ?))))')
      args.push(cur.n ?? 0, cur.n ?? 0, cur.t, cur.t, cur.id)
    }
  } else if (cur) {
    where.push('(created_at < ? OR (created_at = ? AND id < ?))')
    args.push(cur.t, cur.t, cur.id)
  }

  const order = params.sort === 'thanks' ? 'thanks DESC, created_at DESC, id DESC' : 'created_at DESC, id DESC'
  const sql = `SELECT * FROM specimens WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT ?`
  const rows = db.prepare(sql).all(...args, params.limit + 1) as SpecimenRow[]

  const page = rows.slice(0, params.limit)
  const items = page.map((r) => toSpecimen(r, urls))
  const last = page[page.length - 1]
  const more = rows.length > params.limit
  const nextCursor =
    more && last
      ? encodeCursor({
          v: 1,
          t: last.created_at,
          id: last.id,
          n: params.sort === 'thanks' ? last.thanks : undefined,
        })
      : null

  return { items, nextCursor, total: countSpecimens(params) }
}

function countSpecimens(params: Pick<ListParams, 'mode' | 'season' | 'q'>): number {
  const where: string[] = ['is_public = 1']
  const args: string[] = []
  if (params.mode) {
    where.push('mode = ?')
    args.push(params.mode)
  }
  if (params.season) {
    where.push('season = ?')
    args.push(params.season)
  }
  if (params.q) {
    where.push('caption LIKE ?')
    args.push(`%${params.q.replace(/[%_]/g, '')}%`)
  }
  const row = db.prepare(`SELECT COUNT(*) AS n FROM specimens WHERE ${where.join(' AND ')}`).get(...args) as { n: number }
  return row.n
}

export function stats(): Stats {
  const total = (stmts.countPublic.get() as { n: number }).n
  const out = emptyStats()
  out.total = total
  out.thanks = (stmts.sumThanks.get() as { n: number }).n
  for (const row of stmts.byMode.all() as { mode: string; n: number }[]) {
    if (row.mode in out.byMode) out.byMode[row.mode as ModeId] = row.n
  }
  for (const row of stmts.bySeason.all() as { season: string; n: number }[]) {
    if (row.season in out.bySeason) out.bySeason[row.season as Season] = row.n
  }
  return out
}

/** Aggregated, PII-free telemetry: one row per (day, mode, event). */
export function recordCollectTelemetry(mode: ModeId, event = 'collect'): void {
  try {
    stmts.insertTelemetry.run(todayLocal(), mode, event)
  } catch {
    /* telemetry must never break a collect */
  }
}

export function telemetryFor(day = todayLocal()): { mode: string; event: string; count: number }[] {
  return stmts.telemetryDay.all(day) as { mode: string; event: string; count: number }[]
}

// ----------------------------------------------------------------- edition
const EDITION_NOTES: Record<ModeId, { zh: string; en: string }> = {
  frame: { zh: '今天的窗朝南，牡丹先开一半。', en: 'Today the window faces south; the peony opens halfway first.' },
  tendril: { zh: '一根绳在指间醒来，打了个结。', en: 'A string wakes between the fingers and ties itself.' },
  ripple: { zh: '池面很静，等第一滴雨。', en: 'The pond is still, waiting for the first drop.' },
  spore: { zh: '风向东北，蒲公英排好了队。', en: 'Wind to the north-east; the dandelions are queued.' },
  mycelium: { zh: '地下的网比地上的树更早醒来。', en: 'The underground web wakes before the trees above.' },
  mist: { zh: '玻璃上有雾，蕨叶压在里面。', en: 'Fog on the glass, a fern pressed inside.' },
  phyllotaxis: { zh: '花冠按黄金角，转到今天这一侧。', en: 'The crown turns by the golden angle to face today.' },
}

function editionFor(date: string): DailyEdition {
  const seed = seedFromParts('edition', date) >>> 0
  const rand = mulberry32(seed)
  const mode = MODE_IDS[Math.floor(rand() * MODE_IDS.length)] ?? 'frame'
  const season = seasonOfDate(new Date(`${date}T12:00:00`))
  const note = EDITION_NOTES[mode]
  return { date, seed, mode, season, noteZh: note.zh, noteEn: note.en }
}

export function getTodayEdition(): DailyEdition {
  const date = todayLocal()
  const row = stmts.getEdition.get(date) as EditionRow | undefined
  if (row) {
    return {
      date: row.date,
      seed: row.seed,
      mode: row.mode as ModeId,
      season: row.season as Season,
      noteZh: row.note_zh,
      noteEn: row.note_en,
    }
  }
  const fresh = editionFor(date)
  try {
    stmts.insertEdition.run({
      date: fresh.date,
      seed: fresh.seed,
      mode: fresh.mode,
      season: fresh.season,
      note_zh: fresh.noteZh,
      note_en: fresh.noteEn,
    })
  } catch {
    /* concurrent insert: fall through and return the computed edition */
  }
  return fresh
}

/** Deterministic demo id used by the empty-state and SSR 404 design. */
export function sampleId(seed = 0x8a2f41c7): string {
  return shortId(seed, 'hortus')
}

export function ensureEditionFor(date: string): DailyEdition {
  const row = stmts.getEdition.get(date) as EditionRow | undefined
  if (row) {
    return {
      date: row.date,
      seed: row.seed,
      mode: row.mode as ModeId,
      season: row.season as Season,
      noteZh: row.note_zh,
      noteEn: row.note_en,
    }
  }
  return editionFor(date)
}

export { findMode, findSeason, SEASONS }
