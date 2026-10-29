#!/usr/bin/env node
/** HORTUS MANUS research hard-metric validator. Run: node research/check.mjs */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const has = (p) => existsSync(join(root, p))
const files = (p) => (has(p) ? readdirSync(join(root, p)) : [])
const rows = (p) => {
  if (!has(p)) return 0
  return readFileSync(join(root, p), 'utf8').split('\n').filter((l) => l.trim().startsWith('|')).length
}
const csvRows = (p) => {
  if (!has(p)) return 0
  const lines = readFileSync(join(root, p), 'utf8').trim().split('\n')
  return Math.max(0, lines.length - 1)
}
const checks = []
const add = (name, ok, detail) => checks.push({ name, ok, detail })

const videos = files('videos').filter((f) => f.endsWith('.mp4'))
let frameCount = 0
for (const f of files('videos/frames')) {
  try { frameCount += files(`videos/frames/${f}`).filter((n) => /\.jpe?g$/i.test(n)).length } catch {}
}
add('3 downloaded videos', videos.length === 3, `${videos.length}`)
add('all frames decoded (>=3000)', frameCount >= 3000, `${frameCount} frames`)
add('video teardown doc', has('video-teardown/finger-doodle.md'), 'video-teardown/finger-doodle.md')
add('gif 154 frames', files('botanica-gif').filter((n) => /^f_\d+\.png$/.test(n)).length === 154, `${files('botanica-gif').filter((n) => /^f_\d+\.png$/.test(n)).length}`)
add('gif teardown doc', has('botanica-gif/teardown.md'), 'botanica-gif/teardown.md')
add('cats-cradle source extracted', has('cats-cradle/cats_cradle/index.html'), 'cats-cradle source')
add('cats-cradle teardown doc', has('cats-cradle/teardown.md'), 'cats-cradle/teardown.md')
add('ONE PAGE LOVE atlas >=50', csvRows('references/atlas.csv') >= 50, `${csvRows('references/atlas.csv')} rows`)
add('site screenshots >=50', files('references/screens').length >= 50, `${files('references/screens').length} sites`)
const reaDirs = (() => {
  try {
    return readdirSync(join(root, 'rea'), { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('_')).length
  } catch { return 0 }
})()
add('REA evidence >=10', reaDirs >= 10, `${reaDirs} site dirs`)
add('techniques >=50', rows('techniques.md') >= 50, `${rows('techniques.md')} table rows`)
add('research assets >=12', (() => { try { return JSON.parse(readFileSync(join(root, 'assets/assets.json'))).count >= 12 } catch { return false } })(), 'assets/assets.json count')
add('ASSET-LICENSES exists', has('../ASSET-LICENSES.md'), 'ASSET-LICENSES.md')
add('research README exists', has('README.md'), 'research/README.md')

const pass = checks.filter((c) => c.ok).length
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name} — ${c.detail}`)
console.log(`\n${pass}/${checks.length} checks passed`)
process.exit(pass === checks.length ? 0 : 1)
