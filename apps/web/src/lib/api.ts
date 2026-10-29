import type {
  DailyEdition,
  Lang,
  ModeId,
  Season,
  Specimen,
  SpecimenList,
  SpecimenSeed,
  Stats,
} from '@hortus/shared'
import { staticApi } from './staticApi'

const STATIC = import.meta.env.VITE_STATIC_MODE === 'true'
const BASE = ''

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    let message = res.statusText
    try {
      const body = (await res.json()) as { message?: string }
      message = body.message ?? message
    } catch {
      /* ignore */
    }
    throw new Error(message || `Request failed: ${res.status}`)
  }
  return (await res.json()) as T
}

export interface CreateSpecimenInput extends SpecimenSeed {
  lang: Lang
  clientId: string
}

export interface CreateSpecimenResult {
  specimen: Specimen
  deleteToken: string
}

const serverApi = {
  listSpecimens(params: {
    limit?: number
    cursor?: string
    mode?: ModeId
    season?: Season
    q?: string
    sort?: 'new' | 'thanks'
  } = {}): Promise<SpecimenList> {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') qs.set(k, String(v))
    }
    const tail = qs.toString()
    return req<SpecimenList>(`/api/specimens${tail ? `?${tail}` : ''}`)
  },

  getSpecimen(id: string): Promise<Specimen> {
    return req<Specimen>(`/api/specimens/${encodeURIComponent(id)}`)
  },

  createSpecimen(input: CreateSpecimenInput): Promise<CreateSpecimenResult> {
    return req<CreateSpecimenResult>('/api/specimens', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  deleteSpecimen(id: string, token: string): Promise<{ ok: boolean }> {
    return req<{ ok: boolean }>(`/api/specimens/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  thankSpecimen(id: string): Promise<{ thanks: number }> {
    return req<{ thanks: number }>(`/api/specimens/${encodeURIComponent(id)}/thanks`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  getEdition(): Promise<DailyEdition> {
    return req<DailyEdition>('/api/edition/today')
  },

  getStats(): Promise<Stats> {
    return req<Stats>('/api/stats')
  },

  getHealth(): Promise<{ ok: boolean; version: string; specimens: number }> {
    return req<{ ok: boolean; version: string; specimens: number }>('/api/health')
  },
}

export const api = STATIC ? staticApi : serverApi
