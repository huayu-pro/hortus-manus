import type { Lang, ModeId, Season } from '@hortus/shared'
import { MODE_IDS, SEASONS } from '@hortus/shared'
import { z } from 'zod'

/** Control characters (C0 + DEL + C1) are stripped/rejected in user copy. */
const CONTROL_RE = /[\u0000-\u001F\u007F-\u009F]/

export const modeSchema = z.enum(MODE_IDS as [ModeId, ...ModeId[]])
export const seasonSchema = z.enum(SEASONS.map((s) => s.id) as [Season, ...Season[]])
export const langSchema = z.enum(['zh', 'en'])
export const seedSchema = z.number().int().min(0).max(0xffffffff)
export const clientIdSchema = z
  .string()
  .trim()
  .min(8)
  .max(64)
  .regex(/^[0-9a-fA-F-]{8,64}$/, 'clientId must be a uuid-like hex string')
  .or(z.string().uuid())

/** Caption: ≤80 chars, no control characters, trimmed, empty allowed. */
export const captionSchema = z
  .string()
  .max(80, 'caption must be 80 characters or fewer')
  .refine((v) => !CONTROL_RE.test(v), 'caption must not contain control characters')
  .transform((v) => v.trim())
  .optional()

export const createSpecimenSchema = z.object({
  mode: modeSchema,
  season: seasonSchema,
  seed: seedSchema,
  caption: captionSchema,
  lang: langSchema.default('zh'),
  clientId: clientIdSchema.optional(),
})

export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(60).default(24),
  cursor: z.string().max(120).optional(),
  mode: modeSchema.optional(),
  season: seasonSchema.optional(),
  q: z
    .string()
    .max(40)
    .refine((v) => !CONTROL_RE.test(v), 'q must not contain control characters')
    .optional(),
  sort: z.enum(['new', 'thanks']).default('new'),
})

export const thanksBodySchema = z.object({
  visitorId: z.string().trim().max(64).optional(),
})

export const idParamSchema = z
  .string()
  .regex(/^[0-9a-hjkmnp-tv-z]{12}$/, 'specimen id must be 12 base32 chars')

export const qrQuerySchema = z.object({
  size: z.coerce.number().int().min(120).max(1024).default(320),
})

export type CreateSpecimenInput = z.infer<typeof createSpecimenSchema>
export type ListQuery = z.infer<typeof listQuerySchema>

export function modeMeta(mode: ModeId) {
  return MODE_IDS.includes(mode)
}

export type { Lang }
