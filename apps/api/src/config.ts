import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('../../../', import.meta.url))

export const CONFIG = {
  version: '1.0.0',
  port: Number(process.env.PORT ?? 8787),
  host: process.env.HOST ?? '127.0.0.1',
  dataDir: resolve(process.env.HORTUS_DATA_DIR ?? resolve(root, 'data')),
  webDist: resolve(process.env.HORTUS_WEB_DIST ?? resolve(root, 'apps/web/dist')),
  fontDir: resolve(process.env.HORTUS_FONT_DIR ?? resolve(root, 'apps/api/assets/fonts')),
  /** Public origin used in share links, QR codes and OG meta. Local only by default. */
  publicOrigin: (process.env.HORTUS_PUBLIC_ORIGIN ?? 'http://127.0.0.1:8787').replace(/\/+$/, ''),
  limits: {
    collectPerHour: Number(process.env.HORTUS_RL_COLLECT ?? 10),
    thanksPerHour: Number(process.env.HORTUS_RL_THANKS ?? 60),
    listDefault: 24,
    listMax: 60,
    payloadBytes: 8192,
    captionChars: 80,
    captionBytes: 240,
  },
  cache: {
    listSeconds: 15,
    detailSeconds: 60,
    statsSeconds: 60,
    editionSeconds: 3600,
    immutableSeconds: 31536000,
    lruEntries: 256,
  },
} as const

export const DATA_DIR = CONFIG.dataDir
export const DB_PATH = resolve(CONFIG.dataDir, 'hortus.db')
export const CARDS_DIR = resolve(CONFIG.dataDir, 'cards')
export const SECRET_PATH = resolve(CONFIG.dataDir, '.secret')

mkdirSync(CONFIG.dataDir, { recursive: true })
mkdirSync(CARDS_DIR, { recursive: true })

/** http://127.0.0.1:8787/s/<id> */
export function shareUrlFor(id: string): string {
  return `${CONFIG.publicOrigin}/s/${encodeURIComponent(id)}`
}

export function cardUrlFor(id: string): string {
  return `${CONFIG.publicOrigin}/api/specimens/${encodeURIComponent(id)}/card.png`
}

export function ogUrlFor(id: string): string {
  return `${CONFIG.publicOrigin}/api/specimens/${encodeURIComponent(id)}/og.png`
}

export function qrUrlFor(id: string, size?: number): string {
  const base = `${CONFIG.publicOrigin}/api/specimens/${encodeURIComponent(id)}/qr.png`
  return size ? `${base}?size=${size}` : base
}
