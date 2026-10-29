import { rmSync } from 'node:fs'
import { CARDS_DIR, DATA_DIR, DB_PATH, SECRET_PATH } from '../config'

/**
 * `pnpm db:reset` — wipe the local SQLite database, WAL files and the card cache.
 * The .secret is kept unless HORTUS_RESET_SECRET=1 so existing delete tokens stay
 * valid across a reset of the data only.
 */
const keepSecret = process.env.HORTUS_RESET_SECRET !== '1'
const targets = [DB_PATH, `${DB_PATH}-wal`, `${DB_PATH}-shm`]
if (!keepSecret) targets.push(SECRET_PATH)

let removed = 0
for (const p of targets) {
  try {
    rmSync(p, { force: true })
    removed += 1
  } catch {
    /* ignore */
  }
}
try {
  rmSync(CARDS_DIR, { recursive: true, force: true })
  removed += 1
} catch {
  /* ignore */
}

console.log(`[hortus] reset local data under ${DATA_DIR}`)
console.log(`[hortus] removed ${removed} path(s)${keepSecret ? ' (kept data/.secret)' : ' (rotated secret)'}`)
console.log('[hortus] run `pnpm -F @hortus/api start` or ./start.sh to re-initialise the schema')
