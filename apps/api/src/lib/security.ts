import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { SECRET_PATH } from '../config'

let cachedSecret: Buffer | undefined

/**
 * Local HMAC secret. Generated once into data/.secret (0600) and reused across
 * restarts so delete tokens stay valid. HORTUS_SECRET wins if set.
 */
export function secret(): Buffer {
  if (cachedSecret) return cachedSecret
  const fromEnv = process.env.HORTUS_SECRET
  if (fromEnv && fromEnv.length >= 16) {
    cachedSecret = Buffer.from(fromEnv, 'utf8')
    return cachedSecret
  }
  if (existsSync(SECRET_PATH)) {
    const raw = readFileSync(SECRET_PATH, 'utf8').trim()
    if (raw.length >= 16) {
      cachedSecret = Buffer.from(raw, 'utf8')
      return cachedSecret
    }
  }
  const fresh = randomBytes(48).toString('base64url')
  writeFileSync(SECRET_PATH, `${fresh}\n`, { mode: 0o600 })
  try {
    chmodSync(SECRET_PATH, 0o600)
  } catch {
    /* ignore */
  }
  cachedSecret = Buffer.from(fresh, 'utf8')
  return cachedSecret
}

function hmac(data: string): string {
  return createHmac('sha256', secret()).update(data).digest('base64url')
}

/** The token returned once to the collector; never stored. */
export function deleteTokenFor(id: string): string {
  return hmac(`delete|${id}`).slice(0, 43)
}

/** What we persist: sha256 of the token, so a DB leak cannot recover the token. */
export function deleteTokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Constant-time check of a presented token. The stored value is
 * sha256(token); we hash the presented token and compare that to the stored
 * hash, so a token for another id can never validate.
 */
export function verifyDeleteToken(token: string, storedHash: string): boolean {
  if (!token || !storedHash) return false
  const presented = Buffer.from(deleteTokenHash(token), 'hex')
  const stored = Buffer.from(storedHash, 'hex')
  if (presented.length !== stored.length || presented.length === 0) return false
  return timingSafeEqual(presented, stored)
}

/** Anonymous, stable-within-a-day visitor hash (no PII, cannot be reversed). */
export function visitorHash(parts: (string | number | undefined)[]): string {
  return createHmac('sha256', secret()).update(parts.map((p) => String(p ?? '')).join('|')).digest('hex').slice(0, 24)
}

/** Pseudonymous client hash for the collector's clientId. */
export function clientHash(clientId: string): string {
  return createHmac('sha256', secret()).update(`client|${clientId}`).digest('hex').slice(0, 24)
}

/** Short URL-safe id, 12 chars from a fixed alphabet (no ambiguous characters). */
const ID_ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz'
export function newSpecimenId(): string {
  const bytes = randomBytes(12)
  let out = ''
  for (let i = 0; i < 12; i++) out += ID_ALPHABET[bytes[i]! % 32]
  return out
}

/** Strong-ish ETag from a body or buffer. */
export function etagOf(input: string | Buffer): string {
  const hash = createHash('sha1').update(input).digest('base64url').slice(0, 22)
  return `"${hash}"`
}

/** Weak comparison per RFC 7232: W/"x" matches "x". */
export function ifNoneMatch(header: string | undefined, etag: string): boolean {
  if (!header) return false
  const normalize = (v: string) => v.trim().replace(/^W\//, '')
  const target = normalize(etag)
  return header
    .split(',')
    .map((part) => normalize(part))
    .some((part) => part === target || part === '*')
}
