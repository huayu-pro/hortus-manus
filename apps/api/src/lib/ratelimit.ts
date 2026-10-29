/** Small in-memory fixed-window rate limiter. Local-only, resets on restart. */
interface Bucket {
  count: number
  resetAt: number
}

export interface LimitResult {
  ok: boolean
  remaining: number
  limit: number
  retryAfterSec: number
  resetAt: number
}

export class RateLimiter {
  private buckets = new Map<string, Bucket>()
  private sweeper: NodeJS.Timeout | undefined

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {
    this.sweeper = setInterval(() => this.sweep(), 60_000)
    this.sweeper.unref?.()
  }

  hit(key: string, now = Date.now()): LimitResult {
    let bucket = this.buckets.get(key)
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + this.windowMs }
      this.buckets.set(key, bucket)
    }
    bucket.count += 1
    const remaining = Math.max(0, this.limit - bucket.count)
    return {
      ok: bucket.count <= this.limit,
      remaining,
      limit: this.limit,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      resetAt: bucket.resetAt,
    }
  }

  /** Read-only peek (used by health). */
  peek(key: string, now = Date.now()): LimitResult {
    const bucket = this.buckets.get(key)
    const count = bucket && bucket.resetAt > now ? bucket.count : 0
    return {
      ok: count < this.limit,
      remaining: Math.max(0, this.limit - count),
      limit: this.limit,
      retryAfterSec: bucket ? Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) : 0,
      resetAt: bucket?.resetAt ?? 0,
    }
  }

  reset(): void {
    this.buckets.clear()
  }

  get size(): number {
    return this.buckets.size
  }

  private sweep(): void {
    const now = Date.now()
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key)
    }
  }
}

/** Readable 429 copy, zh + en, per contract tone. */
export function rateLimitMessage(kind: 'collect' | 'thanks', retryAfterSec: number): string {
  const mins = Math.max(1, Math.ceil(retryAfterSec / 60))
  const waitZh = retryAfterSec >= 60 ? `${mins} 分钟后` : `${Math.max(1, retryAfterSec)} 秒后`
  const waitEn = retryAfterSec >= 60 ? `in ${mins} min` : `in ${Math.max(1, retryAfterSec)}s`
  if (kind === 'collect') {
    return `温室今天已经接满了，请 ${waitZh}再来采一株。 / The glasshouse is full for now — collect again ${waitEn}.`
  }
  return `谢谢已经收下了，请 ${waitZh}再回来。 / Thanks already noted — come back ${waitEn}.`
}
