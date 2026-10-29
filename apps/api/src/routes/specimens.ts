import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import type { z } from 'zod'
import type { Context } from 'hono'
import { CONFIG, shareUrlFor } from '../config'
import { ApiError } from '../lib/errors'
import { cachedJson } from '../lib/respond'
import { rateLimitMiddleware, collectLimiter, thanksLimiter } from '../lib/limit'
import { clientHash, deleteTokenFor, deleteTokenHash, newSpecimenId, verifyDeleteToken, visitorHash } from '../lib/security'
import { createSpecimenSchema, listQuerySchema, thanksBodySchema } from '../lib/validation'
import { addThanks, deleteSpecimen, getSpecimen, getSpecimenRow, insertSpecimen, listSpecimens, recordCollectTelemetry } from '../db/repo'
import { nowIso } from '../db/index'
import { forgetArt } from '../lib/artcache'

export const specimens = new Hono()

/** Parse a JSON body with a hard size cap; bad JSON becomes a readable 400. */
async function readJson(c: Context): Promise<unknown> {
  const declared = Number(c.req.header('content-length') ?? 0)
  if (declared > CONFIG.limits.payloadBytes) {
    throw new ApiError('payload_too_large', `Payload must be ${CONFIG.limits.payloadBytes} bytes or fewer.`)
  }
  const text = await c.req.text()
  if (text.length > CONFIG.limits.payloadBytes) {
    throw new ApiError('payload_too_large', `Payload must be ${CONFIG.limits.payloadBytes} bytes or fewer.`)
  }
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError('bad_request', 'Request body must be valid JSON.')
  }
}

function parseOrThrow<S extends z.ZodType>(schema: S, value: unknown): z.infer<S> {
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({ path: i.path.join('.') || '(root)', message: i.message }))
    throw new ApiError('validation_error', issues[0]?.message ?? 'Invalid request.', { details: { issues } })
  }
  return parsed.data
}

const ID_RE = /^[0-9a-hjkmnp-tv-z]{12}$/

function idOrThrow(raw: string | undefined): string {
  if (!raw || !ID_RE.test(raw)) {
    throw new ApiError('validation_error', 'Specimen id must be 12 base32 characters.', {
      details: { issues: [{ path: 'id', message: 'invalid id format' }] },
    })
  }
  return raw
}

// ---------------------------------------------------------------- POST /api/specimens
specimens.post(
  '/',
  bodyLimit({
    maxSize: CONFIG.limits.payloadBytes,
    onError: () => {
      throw new ApiError('payload_too_large', `Payload must be ${CONFIG.limits.payloadBytes} bytes or fewer.`)
    },
  }),
  async (c, next) => {
    // Validate the body before consuming a rate-limit slot, so malformed requests
    // get a readable 4xx instead of a misleading 429. Hono caches the body text.
    const input = parseOrThrow(createSpecimenSchema, await readJson(c))
    c.set('collectInput' as never, input as never)
    await next()
  },
  rateLimitMiddleware(collectLimiter, 'collect'),
  async (c) => {
    const input = (c.get('collectInput' as never) as unknown as ReturnType<typeof parseOrThrow<typeof createSpecimenSchema>>)
    const id = newSpecimenId()
    const token = deleteTokenFor(id)
    const specimen = insertSpecimen({
      id,
      mode: input.mode,
      season: input.season,
      seed: input.seed,
      caption: input.caption ?? '',
      lang: input.lang,
      clientHash: input.clientId ? clientHash(input.clientId) : '',
      createdAt: nowIso(),
      deleteTokenHash: deleteTokenHash(token),
    })
    recordCollectTelemetry(input.mode)
    c.header('Cache-Control', 'no-store')
    c.header('Location', `/api/specimens/${id}`)
    return c.json({ specimen, deleteToken: token, shareUrl: shareUrlFor(id) }, 201)
  },
)

// ---------------------------------------------------------------- GET /api/specimens
specimens.get('/', (c) => {
  const params = Object.fromEntries(new URL(c.req.url).searchParams)
  const query = parseOrThrow(listQuerySchema, params)
  const list = listSpecimens(query)
  return cachedJson(c, list, { maxAge: CONFIG.cache.listSeconds, etagSalt: 'list-v1', vary: 'Accept-Encoding' })
})

// ---------------------------------------------------------------- GET /api/specimens/:id
specimens.get('/:id', (c) => {
  const id = idOrThrow(c.req.param('id'))
  const specimen = getSpecimen(id)
  if (!specimen) {
    throw new ApiError('not_found', '这株标本还没有被压进纸里。 / This specimen has not been pressed yet.')
  }
  return cachedJson(c, specimen, { maxAge: CONFIG.cache.detailSeconds, etagSalt: 'detail-v1' })
})

// ---------------------------------------------------------------- DELETE /api/specimens/:id
specimens.delete('/:id', (c) => {
  const id = idOrThrow(c.req.param('id'))
  const row = getSpecimenRow(id)
  if (!row) throw new ApiError('not_found', '这株标本还没有被压进纸里。 / This specimen has not been pressed yet.')
  const auth = (c.req.header('Authorization') ?? '').trim()
  const match = /^Bearer\s+([A-Za-z0-9_-]{20,})$/i.exec(auth)
  if (!match) {
    throw new ApiError('unauthorized', 'Deleting a specimen needs its delete token. / 需要采集时返回的删除令牌。', {
      headers: { 'WWW-Authenticate': 'Bearer realm="hortus-manus"' },
    })
  }
  if (!verifyDeleteToken(match[1]!, row.delete_token_hash)) {
    throw new ApiError('forbidden', 'This token does not belong to that specimen. / 这个令牌不属于这株标本。')
  }
  deleteSpecimen(id)
  forgetArt(id)
  c.header('Cache-Control', 'no-store')
  return c.json({ ok: true, id })
})

// ---------------------------------------------------------------- POST /api/specimens/:id/thanks
specimens.post('/:id/thanks', rateLimitMiddleware(thanksLimiter, 'thanks'), async (c) => {
  const id = idOrThrow(c.req.param('id'))
  const row = getSpecimenRow(id)
  if (!row || row.is_public !== 1) {
    throw new ApiError('not_found', '这株标本还没有被压进纸里。 / This specimen has not been pressed yet.')
  }
  let body: unknown = {}
  try {
    const text = await c.req.text()
    body = text ? JSON.parse(text) : {}
  } catch {
    throw new ApiError('bad_request', 'Request body must be valid JSON.')
  }
  const parsed = thanksBodySchema.safeParse(body)
  const visitorId = parsed.success ? parsed.data.visitorId : undefined
  const day = new Date().toISOString().slice(0, 10)
  const hash = visitorHash([c.req.header('x-forwarded-for') ?? '', visitorId ?? '', id, day])
  const result = addThanks(id, hash)
  if (!result) throw new ApiError('not_found', '这株标本还没有被压进纸里。 / This specimen has not been pressed yet.')
  c.header('Cache-Control', 'no-store')
  return c.json({ ok: result.ok, thanks: result.thanks, duplicate: result.duplicate })
})
