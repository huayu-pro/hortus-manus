/**
 * HORTUS MANUS — /herbarium, the archive (owner: stage).
 *
 * Real API only: api.listSpecimens with mode/season/q/sort/cursor. Includes
 * skeleton sheets, a readable error with retry, empty and filtered-empty states,
 * cursor pagination, a grid/rail switch, thanks and remove-your-own actions.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { DailyEdition, Season, Specimen, ModeId } from '@hortus/shared'
import { LangProvider, useLang } from '@/lib/i18n'
import { api } from '@/lib/api'
import { apiErrorMessage } from '@/components/archive/errors'
import { toast } from 'sonner'
import { FilterBar, type HerbariumFilters } from '@/components/archive/FilterBar'
import { SpecimenCard } from '@/components/archive/SpecimenCard'
import { SpecimenArt } from '@/components/archive/SpecimenArt'
import { Shell, FolioFooter, SectionHead } from '@/components/shell/Shell'
import { PageShell } from '@/components/shell/PageShell'
import { Button, Skeleton } from '@/components/ui'
import { IconArrow, IconGrid, IconRail, IconRetry, IconSearch } from '@/components/ui/icons'
import { formatDate, formatCount } from '@/lib/format'

type Status = 'loading' | 'ok' | 'error'

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms)
    return () => window.clearTimeout(id)
  }, [value, ms])
  return debounced
}

function HerbariumInner() {
  const { copy, lang } = useLang()
  const [filters, setFilters] = useState<HerbariumFilters>({
    mode: 'all',
    season: 'all',
    q: '',
    sort: 'new',
  })
  const [view, setView] = useState<'grid' | 'rail'>('grid')
  const [items, setItems] = useState<Specimen[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [total, setTotal] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState<Status>('loading')
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [daily, setDaily] = useState<DailyEdition | null>(null)

  const debouncedQ = useDebounced(filters.q.trim(), 320)
  const requestRef = useRef(0)

  const queryParams = useMemo(
    () => ({
      mode: filters.mode === 'all' ? undefined : (filters.mode as ModeId),
      season: filters.season === 'all' ? undefined : (filters.season as Season),
      q: debouncedQ || undefined,
      sort: filters.sort,
    }),
    [filters.mode, filters.season, debouncedQ, filters.sort],
  )

  const load = useCallback(
    async (append = false) => {
      const requestId = ++requestRef.current
      if (append) setLoadingMore(true)
      else {
        setStatus('loading')
        setError(null)
      }
      try {
        const result = await api.listSpecimens({
          ...queryParams,
          limit: 12,
          cursor: append ? (nextCursor ?? undefined) : undefined,
        })
        if (requestRef.current !== requestId) return
        setItems((prev) => (append ? [...prev, ...result.items] : result.items))
        setNextCursor(result.nextCursor)
        setTotal(result.total)
        setStatus('ok')
      } catch (err) {
        if (requestRef.current !== requestId) return
        if (append) {
          toast.error(apiErrorMessage(err))
        } else {
          setError(apiErrorMessage(err))
          setStatus('error')
        }
      } finally {
        if (requestRef.current === requestId) setLoadingMore(false)
      }
    },
    [queryParams, nextCursor],
  )

  // first page whenever the query changes
  useEffect(() => {
    void load(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams])

  // today's edition — optional, never required for the page to work
  useEffect(() => {
    let alive = true
    api
      .getEdition()
      .then((edition) => {
        if (alive) setDaily(edition)
      })
      .catch(() => {
        /* the edition is an extra; the archive does not depend on it */
      })
    return () => {
      alive = false
    }
  }, [])

  const patchFilters = useCallback((patch: Partial<HerbariumFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }, [])

  const removeFromList = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setTotal((prev) => (prev === undefined ? prev : Math.max(0, prev - 1)))
  }, [])

  const isFiltered =
    filters.mode !== 'all' || filters.season !== 'all' || debouncedQ.length > 0 || filters.sort !== 'new'

  return (
    <Shell route="/herbarium">
      <PageShell tone="moss">
        <div className="hm-herb">
          <header className="hm-herb__hero">
            <div className="hm-herb__hero-copy">
              <SectionHead
                as="h1"
                kicker={copy.herbarium.kicker}
                index={copy.acts.herbarium.index}
                title={copy.herbarium.title}
                lead={copy.herbarium.lead}
              />
              <div className="hm-herb__hero-meta">
                <span className="hm-label">{copy.herbarium.note}</span>
              </div>
            </div>

            <figure className="hm-herb__hero-plate">
              <img src="plates/peony-botmag.webp" alt="" aria-hidden="true" loading="lazy" />
              <figcaption>
                <span className="hm-label">PLATE V</span>
                <span>Paeonia suffruticosa · 牡丹</span>
                <span className="hm-micro">Curtis&apos;s Botanical Magazine · 1809 · PD</span>
              </figcaption>
            </figure>
          </header>

          <FilterBar filters={filters} onChange={patchFilters} total={total} />

          <div className="hm-herb__toolbar">
            <p className="hm-herb__results" aria-live="polite">
              {status === 'loading' ? copy.loading.archive : status === 'error' ? copy.herbarium.errorTitle : ''}
            </p>
            <div className="hm-herb__view" role="group" aria-label={copy.herbarium.preview}>
              <button
                type="button"
                className="hm-herb__viewbtn"
                aria-pressed={view === 'grid'}
                onClick={() => setView('grid')}
                aria-label={copy.herbarium.preview}
              >
                <IconGrid size={16} />
              </button>
              <button
                type="button"
                className="hm-herb__viewbtn"
                aria-pressed={view === 'rail'}
                onClick={() => setView('rail')}
                aria-label={copy.herbarium.preview}
              >
                <IconRail size={16} />
              </button>
            </div>
          </div>

          {status === 'loading' ? (
            <div className={`hm-herb__grid${view === 'rail' ? ' hm-herb__grid--rail' : ''}`} aria-busy="true">
              {Array.from({ length: 6 }, (_, i) => (
                <div className="hm-spec hm-spec--skeleton" key={i}>
                  <div className="hm-spec__plate hm-spec__plate--skeleton" />
                  <Skeleton lines={3} />
                </div>
              ))}
            </div>
          ) : status === 'error' ? (
            <div className="hm-herb__state">
              <span className="hm-herb__state-mark" aria-hidden="true">
                <IconSearch size={30} />
              </span>
              <h2 className="hm-h3">{copy.herbarium.errorTitle}</h2>
              <p className="hm-body-s">{copy.herbarium.errorBody}</p>
              {error ? <p className="hm-micro">{error}</p> : null}
              <Button variant="outline" onClick={() => void load(false)} glyph={<IconRetry size={16} />}>
                {copy.herbarium.retry}
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="hm-herb__state">
              <span className="hm-herb__state-mark" aria-hidden="true">
                <IconSearch size={30} />
              </span>
              <h2 className="hm-h3">{isFiltered ? copy.herbarium.filteredEmpty : copy.herbarium.emptyTitle}</h2>
              <p className="hm-body-s">{isFiltered ? copy.herbarium.clearFilters : copy.herbarium.emptyBody}</p>
              {isFiltered ? (
                <Button
                  variant="outline"
                  onClick={() => patchFilters({ mode: 'all', season: 'all', q: '', sort: 'new' })}
                >
                  {copy.herbarium.clearFilters}
                </Button>
              ) : (
                <Link to="/touch" className="hm-btn hm-btn--solid hm-btn--md">
                  {copy.herbarium.emptyCta}
                  <IconArrow size={16} />
                </Link>
              )}
            </div>
          ) : (
            <>
              <div
                className={`hm-herb__grid${view === 'rail' ? ' hm-herb__grid--rail' : ''}`}
                data-count={items.length}
              >
                {items.map((specimen, index) => (
                  <SpecimenCard
                    key={specimen.id}
                    specimen={specimen}
                    variant={view === 'rail' ? 'rail' : 'grid'}
                    feature={index === 0 && view === 'grid'}
                    index={index}
                    onDeleted={removeFromList}
                  />
                ))}
              </div>

              <div className="hm-herb__more">
                {nextCursor ? (
                  <Button
                    variant="outline"
                    onClick={() => void load(true)}
                    disabled={loadingMore}
                    glyph={<IconArrow size={16} />}
                  >
                    {loadingMore ? copy.herbarium.loading : copy.common.more}
                  </Button>
                ) : (
                  <span className="hm-micro">
                    {copy.herbarium.countLabel} · {formatCount(total ?? items.length)}
                  </span>
                )}
              </div>
            </>
          )}

          {daily ? (
            <aside className="hm-daily">
              <div className="hm-daily__art">
                <SpecimenArt
                  seed={daily.seed}
                  mode={daily.mode}
                  season={daily.season}
                  className="hm-daily__svg"
                  label={copy.daily.title}
                />
              </div>
              <div className="hm-daily__copy">
                <span className="hm-label">{copy.daily.kicker}</span>
                <h2 className="hm-h3">{copy.daily.title}</h2>
                <p className="hm-body-s">
                  {lang === 'zh' ? daily.noteZh : daily.noteEn}
                </p>
                <p className="hm-micro">{copy.daily.note} · {formatDate(daily.date, lang)}</p>
              </div>
            </aside>
          ) : null}
        </div>
        <FolioFooter page={5} note={copy.herbarium.note} />
      </PageShell>
    </Shell>
  )
}

export default function HerbariumPage() {
  return (
    <LangProvider>
      <HerbariumInner />
    </LangProvider>
  )
}
