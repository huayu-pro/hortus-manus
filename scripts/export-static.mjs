#!/usr/bin/env node
/** Export the local API's public specimens into static data for GitHub Pages. */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const API = process.env.HORTUS_API ?? 'http://127.0.0.1:8787'
const out = new URL('../apps/web/public/api/', import.meta.url)
const dirs = ['cards', 'og', 'qr']
for (const d of dirs) mkdirSync(new URL(`${d}/`, out), { recursive: true })

async function json(path) {
  const res = await fetch(API + path)
  if (!res.ok) throw new Error(`${path} -> ${res.status}`)
  return res.json()
}
async function bytes(path, dest) {
  const res = await fetch(API + path)
  if (!res.ok) throw new Error(`${path} -> ${res.status}`)
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
}

const list = await json('/api/specimens?limit=60&sort=new')
const items = []
for (const s of list.items) {
  const id = s.id
  const rel = (dir, ext) => `./api/${dir}/${id}.${ext}`
  await bytes(`/api/specimens/${id}/card.png`, new URL(`cards/${id}.png`, out))
  await bytes(`/api/specimens/${id}/og.png`, new URL(`og/${id}.png`, out))
  await bytes(`/api/specimens/${id}/qr.png?size=320`, new URL(`qr/${id}.png`, out))
  items.push({
    ...s,
    cardUrl: rel('cards', 'png'),
    ogUrl: rel('og', 'png'),
    qrUrl: rel('qr', 'png'),
    shareUrl: '',
  })
}
writeFileSync(new URL('specimens.json', out), JSON.stringify({ items, exportedAt: new Date().toISOString() }, null, 2))
writeFileSync(new URL('edition.json', out), JSON.stringify(await json('/api/edition/today'), null, 2))
writeFileSync(new URL('stats.json', out), JSON.stringify(await json('/api/stats'), null, 2))
console.log(`static export: ${items.length} specimens, cards/og/qr copied to apps/web/public/api/`)
