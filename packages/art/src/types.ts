import type { Lang, ModeId, Season } from '@hortus/shared'

/** Everything the deterministic art needs. Extra Specimen fields are allowed (structural typing). */
export interface ArtSpec {
  id: string
  mode: ModeId
  season: Season
  seed: number
  caption: string
  lang: Lang
  createdAt: string
  thanks?: number
}

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export interface ArtPalette {
  paper: string
  paperDeep: string
  paperLight: string
  ink: string
  inkSoft: string
  accent: string
  accentDeep: string
  seasonAccent: string
  pollen: string
  mist: string
  pond: string
  moss: string
  sage: string
  leaf: string
  peony: string
  blush: string
  night: string
  moon: string
}

/**
 * Canvas 2D context. @napi-rs/canvas' SKRSContext2D is a superset of the browser
 * CanvasRenderingContext2D in practice, but its DOM type omits drawFocusIfNeeded
 * and friends, so we type against the concrete server context and keep every
 * drawing helper duck-typed (browser canvases satisfy the same calls).
 */
export type Ctx = import('@napi-rs/canvas').SKRSContext2D

export interface FontSet {
  display: string
  displayItalic: string
  mono: string
  /** mono first, CJK fallback for mixed labels like “EX HERBARIO · 手之标本馆” */
  monoCjk: string
  serifSC: string
  hand: string
  hasHand: boolean
  hasSerifSC: boolean
}
