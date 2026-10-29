import type { Context } from 'hono'
import { etagOf, ifNoneMatch } from './security'

/** Send JSON with a strong ETag, Cache-Control and correct 304 handling. */
export function cachedJson(
  c: Context,
  body: unknown,
  opts: { maxAge: number; immutable?: boolean; private?: boolean; etagSalt?: string; vary?: string } = { maxAge: 0 },
): Response {
  const json = JSON.stringify(body)
  const etag = etagOf(opts.etagSalt ? `${opts.etagSalt}|${json}` : json)
  const cacheControl = opts.immutable
    ? `public, max-age=${opts.maxAge}, immutable`
    : `${opts.private ? 'private' : 'public'}, max-age=${opts.maxAge}, must-revalidate`
  c.header('Cache-Control', cacheControl)
  c.header('ETag', etag)
  if (opts.vary) c.header('Vary', opts.vary)
  if (ifNoneMatch(c.req.header('If-None-Match'), etag)) {
    return c.body(null, 304)
  }
  return c.body(json, 200, { 'Content-Type': 'application/json; charset=utf-8' })
}

/** Send a PNG with immutable caching + ETag/304. */
export function cachedPng(
  c: Context,
  bytes: Buffer,
  etag: string,
  opts: { maxAge: number; immutable?: boolean; width: number; height: number },
): Response {
  c.header('Content-Type', 'image/png')
  c.header('Cache-Control', `public, max-age=${opts.maxAge}${opts.immutable ? ', immutable' : ''}`)
  c.header('ETag', etag)
  c.header('X-Image-Size', `${opts.width}x${opts.height}`)
  if (ifNoneMatch(c.req.header('If-None-Match'), etag)) {
    return c.body(null, 304)
  }
  return new Response(bytes as unknown as BodyInit, { status: 200, headers: c.res.headers })
}
