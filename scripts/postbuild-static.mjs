#!/usr/bin/env node
/** Post-process the Vite static build for GitHub Pages. */
import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const dist = process.argv[2] ?? 'apps/web/dist'
const index = join(dist, 'index.html')
if (!existsSync(index)) throw new Error(`missing ${index}`)
// HashRouter means no rewrite needed, but a friendly 404 helps direct links.
copyFileSync(index, join(dist, '404.html'))
writeFileSync(join(dist, '.nojekyll'), '')
console.log('postbuild-static: 404.html + .nojekyll written')
