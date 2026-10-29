/**
 * HORTUS MANUS — language context + helpers (owner: stage).
 *
 * Source of truth is `packages/shared/src/copy.ts` (atelier, 594 parity-checked
 * keys). There is deliberately NO local dictionary here: any missing string is a
 * copy-deck bug, not something this file should paper over. If a key is missing
 * the UI shows a visible, harmless placeholder rather than lorem.
 *
 * Usage:
 *   const { lang, setLang, t, copy, other, isZh } = useLang()
 *   <h1>{t((c) => c.acts.gate.title)}</h1>
 *   <p>{other.acts.gate.title}</p>   // the same line in the other language
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Lang } from '@hortus/shared'
import { copy as COPY, getCopy, isLang, type Copy } from '@hortus/shared/copy'

const STORAGE_KEY = 'hm:lang'

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  /** the whole deck for the active language */
  copy: Copy
  /** the whole deck for the other language — for bilingual pairing */
  other: Copy
  isZh: boolean
  /** tiny accessor so call sites stay short and typed */
  t: <T>(read: (deck: Copy) => T) => T
  /** same accessor for the other language */
  tOther: <T>(read: (deck: Copy) => T) => T
}

const LangContext = createContext<LangContextValue | null>(null)

function detectLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isLang(stored)) return stored
  } catch {
    /* storage may be blocked; fall through to the navigator hint */
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
  }
  return 'zh'
}

export function LangProvider({
  children,
  initial,
}: {
  children: ReactNode
  initial?: Lang
}) {
  const [lang, setLangState] = useState<Lang>(() => initial ?? detectLang())

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en'
    try {
      window.localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore */
    }
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
  }, [])

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === 'zh' ? 'en' : 'zh'))
  }, [])

  const value = useMemo<LangContextValue>(() => {
    const active = getCopy(lang)
    const counterpart = getCopy(lang === 'zh' ? 'en' : 'zh')
    return {
      lang,
      setLang,
      toggleLang,
      copy: active,
      other: counterpart,
      isZh: lang === 'zh',
      t: (read) => read(active),
      tOther: (read) => read(counterpart),
    }
  }, [lang, setLang, toggleLang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) {
    throw new Error('useLang() must be used inside <LangProvider>')
  }
  return ctx
}

/** Read a string by key path when the caller prefers strings over accessors. */
export function copyPath(deck: Copy, path: string): string {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key]
    return undefined
  }, deck)
  return typeof value === 'string' ? value : ''
}

export { COPY as copyDecks, getCopy, isLang }
export type { Copy, Lang }
