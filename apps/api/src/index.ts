import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'
import { serve } from '@hono/node-server'
import type { Context } from 'hono'
import { createApp } from './app'
import { CONFIG } from './config'
import db, { migrationState } from './db/index'

const app = createApp()
const WEB_DIST = CONFIG.webDist

const IMMUTABLE_DIRS = ['/assets', '/fonts', '/plates', '/models', '/wasm', '/fixtures', '/videos']

function contentType(path: string): string {
  const ext = extname(path).toLowerCase()
  return (
    {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.woff2': 'font/woff2',
      '.woff': 'font/woff',
      '.task': 'application/octet-stream',
      '.wasm': 'application/wasm',
      '.mp4': 'video/mp4',
      '.webmanifest': 'application/manifest+json',
      '.txt': 'text/plain; charset=utf-8',
      '.ico': 'image/x-icon',
    }[ext] ?? 'application/octet-stream'
  )
}

/** Serve a real file from the web build if it exists. */
function serveFile(c: Context, rel: string): Response | undefined {
  const raw = decodeURIComponent(rel)
  const safe = normalize(raw).replace(/^(\.\.(\/|\\|$))+/g, '')
  const candidate = join(WEB_DIST, safe)
  if (!resolve(candidate).startsWith(resolve(WEB_DIST))) return undefined
  if (!existsSync(candidate)) return undefined
  const st = statSync(candidate)
  if (!st.isFile()) return undefined
  const immutable = IMMUTABLE_DIRS.some((dir) => safe.startsWith(dir.slice(1)))
  if (immutable) c.header('Cache-Control', 'public, max-age=31536000, immutable')
  else if (safe.endsWith('.html')) c.header('Cache-Control', 'public, max-age=0, must-revalidate')
  c.header('Content-Type', contentType(candidate))
  c.header('Content-Length', String(st.size))
  c.header('Last-Modified', st.mtime.toUTCString())
  return c.body(readFileSync(candidate))
}

// SPA + static assets. /api and /s are matched earlier by their own routes.
app.get('*', (c) => {
  const path = c.req.path
  // Never let the SPA shell swallow an unknown API or share path.
  if (path === '/api' || path.startsWith('/api/')) {
    return c.json({ error: 'not_found', message: '这条路径还没有被种下。 / This path has not been planted yet.' }, 404)
  }
  if (path === '/s' || path.startsWith('/s/')) {
    return c.text('Not found', 404)
  }
  const file = serveFile(c, path)
  if (file) return file

  const index = join(WEB_DIST, 'index.html')
  if (!existsSync(index)) {
    return c.html(
      `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>HORTUS MANUS API</title></head><body style="font-family:ui-monospace,monospace;padding:48px;background:#F6F1E7;color:#1C211A"><h1 style="font-family:Georgia,serif">HORTUS MANUS · 指间花园</h1><p>The web build is not ready yet. Run <code>pnpm build</code> or <code>pnpm dev</code>.</p><p>API health: <a href="/api/health">/api/health</a> · Docs: <code>docs/api.md</code></p></body></html>`,
    )
  }
  c.header('Cache-Control', 'public, max-age=0, must-revalidate')
  c.header('Content-Type', 'text/html; charset=utf-8')
  return c.html(readFileSync(index, 'utf8'))
})

serve({ fetch: app.fetch, port: CONFIG.port, hostname: CONFIG.host }, (info) => {
  console.log(`\n  HORTUS MANUS  ·  指间花园`)
  console.log(`  local:    http://${CONFIG.host}:${info.port}/`)
  console.log(`  health:   http://${CONFIG.host}:${info.port}/api/health`)
  console.log(`  share:    http://${CONFIG.host}:${info.port}/s/:id`)
  console.log(`  web dist: ${WEB_DIST}${existsSync(WEB_DIST) ? '' : ' (missing — build the web app)'}`)
  console.log(`  data:     ${db.name}`)
  console.log(`  schema:   v${migrationState.to}${migrationState.applied.length ? ` (applied ${migrationState.applied.join(', ')})` : ''}\n`)
})

export default app
