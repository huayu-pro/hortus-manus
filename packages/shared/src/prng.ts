/** Deterministic, small, dependency-free RNG helpers shared by web + API + art. */

export function hashString(input: string): number {
  // FNV-1a 32-bit
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Mulberry32. Same seed => same sequence in browser and Node. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function rand() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomSeed(): number {
  const cryptoObj = globalThis.crypto
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const buf = new Uint32Array(1)
    cryptoObj.getRandomValues(buf)
    return buf[0] >>> 0
  }
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0
}

export function seedFromParts(...parts: (string | number)[]): number {
  return hashString(parts.join('|'))
}

export function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

export function range(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min)
}

export function intRange(rand: () => number, min: number, max: number): number {
  return Math.floor(range(rand, min, max + 1))
}

export function shuffle<T>(rand: () => number, arr: readonly T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function formatSeed(seed: number): string {
  return seed.toString(16).toUpperCase().padStart(8, '0')
}

export function shortId(seed: number, salt = ''): string {
  const h = hashString(`${seed}:${salt}`)
  const alphabet = '0123456789abcdefghjkmnpqrstvwxyz'
  let n = h
  let out = ''
  for (let i = 0; i < 12; i++) {
    out += alphabet[n % alphabet.length]
    n = Math.floor(n / alphabet.length) ^ (h >>> (i + 1))
  }
  return out
}