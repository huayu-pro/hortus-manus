/**
 * HORTUS MANUS — herbarium filter bar (owner: stage).
 * Mode key + season swatches + search + sort. It is an editorial index strip,
 * not a SaaS toolbar: everything is mono labels, hairlines and paper chips.
 */

import type { ModeId, Season } from '@hortus/shared'
import { MODES, SEASONS } from '@hortus/shared'
import { useLang } from '@/lib/i18n'
import { IconSearch, IconSliders, IconSort, IconClose } from '@/components/ui/icons'

export interface HerbariumFilters {
  mode: ModeId | 'all'
  season: Season | 'all'
  q: string
  sort: 'new' | 'thanks'
}

export function FilterBar({
  filters,
  onChange,
  total,
}: {
  filters: HerbariumFilters
  onChange: (patch: Partial<HerbariumFilters>) => void
  total?: number
}) {
  const { copy } = useLang()
  const active =
    filters.mode !== 'all' || filters.season !== 'all' || filters.q.trim().length > 0 || filters.sort !== 'new'

  return (
    <div className="hm-filter">
      <div className="hm-filter__row hm-filter__row--search">
        <div className="hm-filter__search">
          <IconSearch size={17} />
          <input
            type="search"
            className="hm-filter__input"
            value={filters.q}
            placeholder={copy.herbarium.searchPlaceholder}
            aria-label={copy.aria.searchSpecimens}
            onChange={(event) => onChange({ q: event.target.value })}
          />
          {filters.q ? (
            <button
              type="button"
              className="hm-filter__clearq"
              aria-label={copy.common.clear}
              onClick={() => onChange({ q: '' })}
            >
              <IconClose size={14} />
            </button>
          ) : null}
        </div>

        <div className="hm-filter__sort" role="group" aria-label={copy.herbarium.filterSort}>
          <IconSort size={15} />
          <button
            type="button"
            className="hm-filter__sortbtn"
            aria-pressed={filters.sort === 'new'}
            onClick={() => onChange({ sort: 'new' })}
          >
            {copy.herbarium.sortNewest}
          </button>
          <span aria-hidden="true" className="hm-filter__sep" />
          <button
            type="button"
            className="hm-filter__sortbtn"
            aria-pressed={filters.sort === 'thanks'}
            onClick={() => onChange({ sort: 'thanks' })}
          >
            {copy.herbarium.sortThanks}
          </button>
        </div>
      </div>

      <div className="hm-filter__row hm-filter__row--keys">
        <div className="hm-filter__group" role="group" aria-label={copy.herbarium.filterMode}>
          <span className="hm-filter__label">
            <IconSliders size={13} /> {copy.herbarium.filterMode}
          </span>
          <div className="hm-filter__chips">
            <button
              type="button"
              className="hm-filter__chip"
              aria-pressed={filters.mode === 'all'}
              onClick={() => onChange({ mode: 'all' })}
            >
              {copy.common.all}
            </button>
            {MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className="hm-filter__chip hm-filter__chip--mode"
                aria-pressed={filters.mode === mode.id}
                onClick={() => onChange({ mode: filters.mode === mode.id ? 'all' : mode.id })}
                style={{ ['--chip-accent' as string]: mode.accent }}
              >
                <span className="hm-filter__chip-num">{copy.modes[mode.id].index}</span>
                {copy.modes[mode.id].name}
              </button>
            ))}
          </div>
        </div>

        <div className="hm-filter__group" role="group" aria-label={copy.herbarium.filterSeason}>
          <span className="hm-filter__label">{copy.herbarium.filterSeason}</span>
          <div className="hm-filter__chips">
            <button
              type="button"
              className="hm-filter__chip"
              aria-pressed={filters.season === 'all'}
              onClick={() => onChange({ season: 'all' })}
            >
              {copy.common.all}
            </button>
            {SEASONS.map((season) => (
              <button
                key={season.id}
                type="button"
                className="hm-filter__chip hm-filter__chip--season"
                aria-pressed={filters.season === season.id}
                onClick={() => onChange({ season: filters.season === season.id ? 'all' : season.id })}
                style={{ ['--chip-accent' as string]: season.accent }}
              >
                <span className="hm-filter__dot" aria-hidden="true" />
                {copy.seasons[season.id].name}
              </button>
            ))}
          </div>
        </div>

        <div className="hm-filter__result">
          {total !== undefined ? (
            <span className="hm-filter__count">
              {total} {copy.herbarium.countLabel}
            </span>
          ) : null}
          {active ? (
            <button
              type="button"
              className="hm-filter__reset"
              onClick={() => onChange({ mode: 'all', season: 'all', q: '', sort: 'new' })}
            >
              {copy.herbarium.clearFilters}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
