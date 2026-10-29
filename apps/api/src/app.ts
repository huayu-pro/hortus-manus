import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { compress } from 'hono/compress'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { timing } from 'hono/timing'
import { ApiError, jsonError } from './lib/errors'
import { specimens } from './routes/specimens'
import { media } from './routes/media'
import { meta } from './routes/meta'
import { share } from './routes/share'

const startedAt = Date.now()

/** Local-only CORS: Vite dev (5173) and preview (4173), nothing else. */
const LOCAL_ORIGIN_RE = /^http:\/\/(localhost|127\.0\.0\.1):(5173|4173)$/

export function createApp(): Hono {
  const app = new Hono()

  app.use('*', logger())
  app.use('*', timing())
  app.use(
    '*',
    secureHeaders({
      contentSecurityPolicy: undefined,
      crossOriginEmbedderPolicy: false,
      xFrameOptions: 'SAMEORIGIN',
      referrerPolicy: 'no-referrer',
    }),
  )
  app.use(
    '/api/*',
    cors({
      origin: (origin) => (origin && LOCAL_ORIGIN_RE.test(origin) ? origin : ''),
      allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'If-None-Match'],
      exposeHeaders: ['ETag', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
      maxAge: 600,
      credentials: false,
    }),
  )
  app.use('/api/*', compress())

  app.get('/api', (c) =>
    c.json({
      name: 'hortus-manus',
      version: '1.0.0',
      endpoints: [
        'GET /api/health',
        'GET /api/stats',
        'GET /api/edition/today',
        'GET /api/specimens',
        'POST /api/specimens',
        'GET /api/specimens/:id',
        'DELETE /api/specimens/:id',
        'POST /api/specimens/:id/thanks',
        'GET /api/specimens/:id/card.png',
        'GET /api/specimens/:id/og.png',
        'GET /api/specimens/:id/qr.png',
        'GET /s/:id',
      ],
      docs: 'docs/api.md',
    }),
  )

  app.route('/api/specimens', specimens)
  app.route('/api/specimens', media)
  app.route('/api', meta)
  app.route('/s', share)

  app.notFound((c) => {
    if (c.req.path.startsWith('/api/')) {
      return c.json({ error: 'not_found', message: '这条路径还没有被种下。 / This path has not been planted yet.' }, 404)
    }
    return c.json({ error: 'not_found', message: 'Not found' }, 404)
  })

  app.onError((err, c) => {
    if (err instanceof ApiError) return jsonError(c, err)
    console.error('[hortus] unhandled', err)
    if (c.req.path.startsWith('/api/')) {
      return c.json({ error: 'internal_error', message: '泥土里出了点问题。 / Something went wrong in the soil.' }, 500)
    }
    return c.text('Internal error', 500)
  })

  app.get('/__uptime', (c) => c.json({ uptimeSec: Math.round((Date.now() - startedAt) / 1000) }))

  return app
}
