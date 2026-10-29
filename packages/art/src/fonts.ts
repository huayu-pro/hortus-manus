import { GlobalFonts } from '@napi-rs/canvas'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { FontSet } from './types'

/**
 * Register the self-hosted TTFs (apps/api/assets/fonts) under private family
 * aliases. Never throws: every family in the returned FontSet is a CSS-ish
 * fallback list, so missing files degrade to system serif / CJK fonts.
 */
const ALIAS = {
  display: 'HM Display',
  displayItalic: 'HM Display Italic',
  mono: 'HM Mono',
  monoMedium: 'HM Mono Medium',
  serifSC: 'HM Serif SC',
  sansSC: 'HM Sans SC',
  hand: 'HM Hand',
} as const

const FILE = {
  display: 'InstrumentSerif-Regular.ttf',
  displayItalic: 'InstrumentSerif-Italic.ttf',
  mono: 'IBMPlexMono-Regular.ttf',
  monoMedium: 'IBMPlexMono-Medium.ttf',
  serifSC: 'NotoSerifSC-var.ttf',
  sansSC: 'NotoSansSC-var.ttf',
  hand: 'MaShanZheng-Regular.ttf',
} as const

type Key = keyof typeof FILE

const registered = new Map<string, boolean>()
let configuredDir: string | undefined
let cached: FontSet | undefined

function candidateDirs(): string[] {
  const dirs: string[] = []
  if (process.env.HORTUS_FONT_DIR) dirs.push(process.env.HORTUS_FONT_DIR)
  if (configuredDir) dirs.push(configuredDir)
  // packages/art/src/fonts.ts -> ../../../ = repository root
  const root = fileURLToPath(new URL('../../../', import.meta.url))
  dirs.push(resolve(root, 'apps/api/assets/fonts'))
  // Fall back to the web build's hosted woff2s if the TTFs ever move.
  dirs.push(resolve(root, 'apps/web/dist/fonts'))
  dirs.push(resolve(root, 'apps/web/public/fonts'))
  return dirs
}

/** The API calls this with its resolved font directory before the first render. */
export function configureFonts(dir?: string): void {
  if (dir && !configuredDir) configuredDir = dir
  cached = undefined
}

function register(key: Key, dir: string): boolean {
  const file = FILE[key]
  const path = resolve(dir, file)
  const cacheKey = `${dir}|${file}`
  if (registered.has(cacheKey)) return registered.get(cacheKey)!
  let ok = false
  try {
    if (existsSync(path)) {
      const alias = ALIAS[key]
      ok = Boolean(GlobalFonts.registerFromPath(path, alias))
      // Noto's variable TTFs register under their real family too; alias is what we draw with.
      registered.set(cacheKey, ok)
    }
  } catch {
    ok = false
  }
  registered.set(cacheKey, ok)
  return ok
}

function anyDir(key: Key): boolean {
  for (const dir of candidateDirs()) {
    if (register(key, dir)) return true
  }
  return false
}

/** Family strings with real fallbacks, so a missing TTF still renders something. */
export function getFonts(): FontSet {
  if (cached) return cached
  const hasDisplay = anyDir('display')
  const hasDisplayItalic = anyDir('displayItalic')
  const hasMono = anyDir('mono')
  // medium weight is registered for completeness; labels use the regular alias
  anyDir('monoMedium')
  const hasSerifSC = anyDir('serifSC')
  const hasSansSC = anyDir('sansSC')
  const hasHand = anyDir('hand')

  const serifFallback = '"P052", "FreeSerif", "DejaVu Serif", "Noto Serif CJK SC", "Noto Serif CJK JP", serif'
  const cjkFallback = '"Noto Serif CJK SC", "Noto Serif CJK JP", "AR PL UMing CN", "Noto Serif SC", serif'
  const monoFallback = '"Nimbus Mono PS", "DejaVu Sans Mono", monospace'
  const handFallback = '"TsangerJinKai02", "AR PL UKai CN", "Noto Serif CJK JP", cursive'

  cached = {
    display: `${hasDisplay ? `"${ALIAS.display}", ` : ''}${serifFallback}`,
    displayItalic: `${hasDisplayItalic ? `"${ALIAS.displayItalic}", ` : ''}${hasDisplay ? `"${ALIAS.display}", ` : ''}${serifFallback}`,
    mono: `${hasMono ? `"${ALIAS.mono}", ` : ''}${monoFallback}`,
    monoCjk: `${hasMono ? `"${ALIAS.mono}", ` : ''}${hasSerifSC ? `"${ALIAS.serifSC}", ` : ''}${hasSansSC ? `"${ALIAS.sansSC}", ` : ''}${monoFallback}, ${cjkFallback}`,
    serifSC: `${hasSerifSC ? `"${ALIAS.serifSC}", ` : ''}${hasSansSC ? `"${ALIAS.sansSC}", ` : ''}${cjkFallback}`,
    hand: `${hasHand ? `"${ALIAS.hand}", ` : ''}${handFallback}`,
    hasHand,
    hasSerifSC,
  }
  return cached
}

/** Diagnostics for /api/health. */
export function fontStatus(): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (const key of Object.keys(FILE) as Key[]) out[key] = anyDir(key)
  return out
}
