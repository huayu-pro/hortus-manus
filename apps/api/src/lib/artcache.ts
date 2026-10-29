import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { etagOf, ifNoneMatch } from './security'
import { CARDS_DIR } from '../config'
import type { Specimen } from '@hortus/shared'
import { configureFonts, fontStatus, renderCardPng, renderOgPng, renderQrPng } from '@hortus/art'

export type ArtKind = 'card' | 'og' | 'qr'

interface ArtEntry {
  bytes: Buffer
  etag: string
  contentType: string
  width: number
  height: number
}

const memo = new Map<string, ArtEntry>()
const MEMO_MAX = 40

mkdirSync(CARDS_DIR, { recursive: true })
configureFonts(process.env.HORTUS_FONT_DIR)

function fileName(id: string, kind: ArtKind, size?: number): string {
  if (kind === 'card') return `${id}.png`
  if (kind === 'og') return `${id}-og.png`
  return `${id}-qr-${size ?? 320}.png`
}

function dims(kind: ArtKind, size?: number): { width: number; height: number } {
  if (kind === 'card') return { width: 1200, height: 1600 }
  if (kind === 'og') return { width: 1200, height: 630 }
  const s = size ?? 320
  return { width: s, height: s }
}

function render(kind: ArtKind, spec: Specimen, shareUrl: string, size?: number): Buffer {
  if (kind === 'card') return renderCardPng(spec, shareUrl)
  if (kind === 'og') return renderOgPng(spec, shareUrl)
  return renderQrPng(shareUrl, size)
}

function memoPut(key: string, entry: ArtEntry): void {
  if (memo.size >= MEMO_MAX && !memo.has(key)) {
    const oldest = memo.keys().next()
    if (!oldest.done) memo.delete(oldest.value)
  }
  memo.set(key, entry)
}

/** Cached, deterministic art. Disk first, then render once, then memo. */
export function getArt(kind: ArtKind, spec: Specimen, shareUrl: string, size?: number): ArtEntry {
  const key = `${spec.id}|${kind}|${size ?? ''}|${spec.seed}|${spec.mode}|${spec.season}|${(spec.caption ?? '').length}`
  const hit = memo.get(key)
  if (hit) return hit

  const path = resolve(CARDS_DIR, fileName(spec.id, kind, size))
  const { width, height } = dims(kind, size)

  if (existsSync(path)) {
    try {
      const st = statSync(path)
      if (st.size > 0) {
        const bytes = readFileSync(path)
        const entry: ArtEntry = { bytes, etag: etagOf(bytes), contentType: 'image/png', width, height }
        memoPut(key, entry)
        return entry
      }
    } catch {
      /* re-render below */
    }
  }

  const bytes = render(kind, spec, shareUrl, size)
  try {
    writeFileSync(path, bytes)
  } catch {
    /* disk cache is best effort */
  }
  const entry: ArtEntry = { bytes, etag: etagOf(bytes), contentType: 'image/png', width, height }
  memoPut(key, entry)
  return entry
}

/** ETag for an art object without loading bytes twice. */
export function artEtag(kind: ArtKind, spec: Specimen, shareUrl: string, size?: number): string {
  return getArt(kind, spec, shareUrl, size).etag
}

export function isNotModified(header: string | undefined, etag: string): boolean {
  return ifNoneMatch(header, etag)
}

export { fontStatus }

/** Drop memo entries for a deleted specimen (disk files are removed by the repo). */
export function forgetArt(id: string): void {
  for (const key of [...memo.keys()]) {
    if (key.startsWith(`${id}|`)) memo.delete(key)
  }
}

/** Total cached card files (for /api/health). */
export function cardCacheCount(): number {
  try {
    return readdirSync(CARDS_DIR).filter((f) => f.endsWith('.png')).length
  } catch {
    return 0
  }
}
