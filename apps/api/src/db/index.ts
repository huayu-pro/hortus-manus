import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { DB_PATH } from '../config'

const here = fileURLToPath(new URL('.', import.meta.url))

export const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('synchronous = NORMAL')
db.pragma('busy_timeout = 5000')
db.pragma('foreign_keys = ON')

/**
 * Versioned migrations. Each entry runs once, recorded in user_version.
 * Append-only: never edit an applied migration.
 */
const MIGRATIONS: { version: number; name: string; sql: string }[] = [
  {
    version: 1,
    name: 'initial',
    sql: readFileSync(`${here}schema.sql`, 'utf8'),
  },
  {
    version: 2,
    name: 'list-query-indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_specimens_public_created
        ON specimens(is_public, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_specimens_public_thanks
        ON specimens(is_public, thanks DESC, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_thanks_created ON thanks(created_at);
    `,
  },
]

function currentVersion(): number {
  return db.pragma('user_version', { simple: true }) as number
}

export function migrate(): { from: number; to: number; applied: string[] } {
  const from = currentVersion()
  const applied: string[] = []
  for (const m of MIGRATIONS) {
    if (m.version <= from) continue
    db.transaction(() => {
      db.exec(m.sql)
      db.pragma(`user_version = ${m.version}`)
    })()
    applied.push(`${m.version}:${m.name}`)
  }
  return { from, to: currentVersion(), applied }
}

export const migrationState = migrate()

export function nowIso(): string {
  return new Date().toISOString()
}

export function todayLocal(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}

export function dbInfo(): { path: string; sizeBytes: number; wal: boolean; version: number } {
  let sizeBytes = 0
  try {
    const st = db.prepare('PRAGMA page_count').get() as { page_count: number }
    const ps = db.prepare('PRAGMA page_size').get() as { page_size: number }
    sizeBytes = st.page_count * ps.page_size
  } catch {
    /* ignore */
  }
  return { path: DB_PATH, sizeBytes, wal: true, version: currentVersion() }
}

export function integrityCheck(): boolean {
  try {
    const row = db.prepare('PRAGMA quick_check').get() as { quick_check: string }
    return row.quick_check === 'ok'
  } catch {
    return false
  }
}

/** Cheap fingerprint of the whole table used for ETags / stats cache keys. */
export function dbFingerprint(): string {
  const row = db.prepare('SELECT COUNT(*) AS n, MAX(created_at) AS last FROM specimens').get() as {
    n: number
    last: string | null
  }
  const t = db.prepare('SELECT COALESCE(SUM(thanks),0) AS s FROM specimens').get() as { s: number }
  return createHash('sha1').update(`${row.n}|${row.last ?? ''}|${t.s}`).digest('base64url').slice(0, 16)
}

export default db
