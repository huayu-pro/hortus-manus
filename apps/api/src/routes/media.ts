import { Hono } from 'hono'
import { CONFIG, shareUrlFor } from '../config'
import { ApiError } from '../lib/errors'
import { cachedPng } from '../lib/respond'
import { getArt } from '../lib/artcache'
import { getSpecimen } from '../db/repo'
import { qrQuerySchema } from '../lib/validation'

export const media = new Hono()

function specimenOrThrow(id: string) {
  if (!/^[0-9a-hjkmnp-tv-z]{12}$/.test(id)) {
    throw new ApiError('validation_error', 'Specimen id must be 12 base32 characters.')
  }
  const specimen = getSpecimen(id)
  if (!specimen) throw new ApiError('not_found', '这株标本还没有被压进纸里。 / This specimen has not been pressed yet.')
  return specimen
}

/** 1200x1600 deterministic specimen card. */
media.get('/:id/card.png', (c) => {
  const specimen = specimenOrThrow(c.req.param('id'))
  const art = getArt('card', specimen, shareUrlFor(specimen.id))
  return cachedPng(c, art.bytes, art.etag, {
    maxAge: CONFIG.cache.immutableSeconds,
    immutable: true,
    width: art.width,
    height: art.height,
  })
})

/** 1200x630 OG image. */
media.get('/:id/og.png', (c) => {
  const specimen = specimenOrThrow(c.req.param('id'))
  const art = getArt('og', specimen, shareUrlFor(specimen.id))
  return cachedPng(c, art.bytes, art.etag, {
    maxAge: CONFIG.cache.immutableSeconds,
    immutable: true,
    width: art.width,
    height: art.height,
  })
})

/** Standalone QR PNG (stage collect modal). ?size=120..1024 */
media.get('/:id/qr.png', (c) => {
  const specimen = specimenOrThrow(c.req.param('id'))
  const parsed = qrQuerySchema.safeParse(Object.fromEntries(new URL(c.req.url).searchParams))
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({ path: i.path.join('.') || '(root)', message: i.message }))
    throw new ApiError('validation_error', issues[0]?.message ?? 'Invalid query.', { details: { issues } })
  }
  const size = parsed.data.size
  const art = getArt('qr', specimen, shareUrlFor(specimen.id), size)
  return cachedPng(c, art.bytes, art.etag, {
    maxAge: CONFIG.cache.immutableSeconds,
    immutable: true,
    width: art.width,
    height: art.height,
  })
})
