import { Hono } from 'hono'
import { CONFIG } from '../config'
import { cachedJson } from '../lib/respond'
import { getTodayEdition, stats } from '../db/repo'
import db from '../db/index'
import { dbFingerprint, dbInfo, integrityCheck, migrationState } from '../db/index'
import { cardCacheCount, fontStatus } from '../lib/artcache'
import { collectLimiter, thanksLimiter } from '../lib/limit'

export const meta = new Hono()

const startedAt = Date.now()

/** /api/stats — real counts from SQLite, cached 60s, ETag/304. */
meta.get('/stats', (c) => {
  const body = stats()
  return cachedJson(c, body, { maxAge: CONFIG.cache.statsSeconds, etagSalt: `stats-v1|${dbFingerprint()}` })
})

/** /api/edition/today — deterministic daily specimen, cached until local midnight. */
meta.get('/edition/today', (c) => {
  const body = getTodayEdition()
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)
  const untilMidnight = Math.max(60, Math.floor((midnight.getTime() - now.getTime()) / 1000))
  const maxAge = Math.min(untilMidnight, CONFIG.cache.editionSeconds)
  return cachedJson(c, body, { maxAge, etagSalt: `edition-v1|${body.date}` })
})

function countOf(table: string): number {
  const row = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }
  return row.n
}

/** /api/health — no-store, db + card counts + uptime. */
meta.get('/health', (c) => {
  let dbOk = true
  const counts = { specimens: 0, thanks: 0, editions: 0, telemetry: 0, cards: 0 }
  let dbMeta = { path: '(unavailable)', sizeBytes: 0, wal: false, version: 0 }
  try {
    counts.specimens = countOf('specimens')
    counts.thanks = countOf('thanks')
    counts.editions = countOf('editions')
    counts.telemetry = countOf('telemetry')
    counts.cards = cardCacheCount()
    dbMeta = dbInfo()
    dbOk = integrityCheck()
  } catch {
    dbOk = false
  }
  const body = {
    ok: dbOk,
    version: CONFIG.version,
    uptimeSec: Math.round((Date.now() - startedAt) / 1000),
    specimens: counts.specimens,
    counts,
    db: { ...dbMeta, ok: dbOk, migration: migrationState.to, migrations: migrationState.applied },
    fonts: fontStatus(),
    limits: { collectPerHour: CONFIG.limits.collectPerHour, thanksPerHour: CONFIG.limits.thanksPerHour },
    rateLimiterBuckets: { collect: collectLimiter.size, thanks: thanksLimiter.size },
    publicOrigin: CONFIG.publicOrigin,
    dataDir: CONFIG.dataDir,
    time: new Date().toISOString(),
  }
  c.header('Cache-Control', 'no-store')
  return c.json(body)
})
