import type { Lang, ModeId, Season, Specimen, SpecimenList, Stats } from '@hortus/shared'
import { MODE_IDS } from '@hortus/shared'

/** Row shape exactly as stored in SQLite. */
export interface SpecimenRow {
  id: string
  mode: string
  season: string
  seed: number
  caption: string
  lang: string
  client_hash: string
  thanks: number
  created_at: string
  is_public: number
  delete_token_hash: string
}

export interface EditionRow {
  date: string
  seed: number
  mode: string
  season: string
  note_zh: string
  note_en: string
}

export interface SpecimenListItem extends Specimen {
  /** true when the specimen has a non-empty caption (used for the herbarium filter chips) */
  hasCaption: boolean
}

export function toSpecimen(row: SpecimenRow, urls: { card: (id: string) => string; og: (id: string) => string; share: (id: string) => string }): Specimen {
  return {
    id: row.id,
    mode: row.mode as ModeId,
    season: row.season as Season,
    seed: row.seed,
    caption: row.caption,
    lang: row.lang as Lang,
    thanks: row.thanks,
    createdAt: row.created_at,
    cardUrl: urls.card(row.id),
    ogUrl: urls.og(row.id),
    shareUrl: urls.share(row.id),
  }
}

export function emptyStats(): Stats {
  const byMode = {} as Record<ModeId, number>
  for (const id of MODE_IDS) byMode[id] = 0
  return { total: 0, byMode, bySeason: { spring: 0, summer: 0, autumn: 0, winter: 0 }, thanks: 0 }
}

export type { SpecimenList }
