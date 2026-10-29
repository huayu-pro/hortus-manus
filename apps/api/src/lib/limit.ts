import type { Context, Next } from 'hono'
import { getConnInfo } from '@hono/node-server/conninfo'
import { RateLimiter, rateLimitMessage } from './ratelimit'
import { ApiError } from './errors'
import { CONFIG } from '../config'

export const collectLimiter = new RateLimiter(CONFIG.limits.collectPerHour, 60 * 60 * 1000)
export const thanksLimiter = new RateLimiter(CONFIG.limits.thanksPerHour, 60 * 60 * 1000)

/** Remote IP, honouring the local-only setup (no proxies in front). */
export function clientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  try {
    const info = getConnInfo(c)
    return info.remote.address ?? '127.0.0.1'
  } catch {
    return '127.0.0.1'
  }
}

export function rateLimitMiddleware(limiter: RateLimiter, kind: 'collect' | 'thanks') {
  return async (c: Context, next: Next) => {
    const ip = clientIp(c)
    const result = limiter.hit(`${kind}|${ip}`)
    c.header('X-RateLimit-Limit', String(result.limit))
    c.header('X-RateLimit-Remaining', String(result.remaining))
    c.header('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))
    if (!result.ok) {
      throw new ApiError('rate_limited', rateLimitMessage(kind, result.retryAfterSec), {
        headers: {
          'Retry-After': String(result.retryAfterSec),
          'X-RateLimit-Remaining': '0',
        },
        details: { retryAfterSec: result.retryAfterSec, limit: result.limit, window: '1h' },
      })
    }
    await next()
  }
}
