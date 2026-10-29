/** Tiny TTL + LRU cache for edition/stats JSON. */
interface Entry<T> {
  value: T
  expiresAt: number
}

export class LruCache<T> {
  private map = new Map<string, Entry<T>>()

  constructor(
    private readonly maxEntries: number,
    private readonly ttlMs: number,
  ) {}

  get(key: string, now = Date.now()): T | undefined {
    const hit = this.map.get(key)
    if (!hit) return undefined
    if (hit.expiresAt <= now) {
      this.map.delete(key)
      return undefined
    }
    // refresh recency
    this.map.delete(key)
    this.map.set(key, hit)
    return hit.value
  }

  set(key: string, value: T, ttlMs = this.ttlMs, now = Date.now()): void {
    if (this.map.size >= this.maxEntries && !this.map.has(key)) {
      const oldest = this.map.keys().next()
      if (!oldest.done) this.map.delete(oldest.value)
    }
    this.map.set(key, { value, expiresAt: now + ttlMs })
  }

  delete(key: string): void {
    this.map.delete(key)
  }

  clear(): void {
    this.map.clear()
  }

  get size(): number {
    return this.map.size
  }
}
