/**
 * HORTUS MANUS — stage bus (owner: stage).
 *
 * The chrome (Shell) needs to talk to whichever Stage is mounted: sound toggle,
 * camera request, mode/season switch, collect. The Stage is owned by mechanics
 * and only exposes a StageHandle + StageProps callbacks, so we keep a tiny
 * module-level bus instead of prop-drilling through every page.
 *
 * - a page calls `registerStage(handle)` when the stage mounts (and null on unmount)
 * - a page calls `publishStageState(state)` from `onState`
 * - the Shell reads `useStageState()` and calls `request*()` helpers
 *
 * When no stage is mounted the request is a no-op and the caller decides what to
 * say — we never fake a state change.
 */

import { useCallback, useEffect, useState } from 'react'
import type { ModeId, Season, StageHandle, StageState } from '@hortus/shared'

type Listener = (state: StageState | null) => void

let currentHandle: StageHandle | null = null
let currentState: StageState | null = null
const listeners = new Set<Listener>()

function emit(state: StageState | null) {
  for (const fn of listeners) fn(state)
}

export function registerStage(handle: StageHandle | null): void {
  currentHandle = handle
  if (!handle) {
    currentState = null
    emit(null)
  }
}

export function publishStageState(state: StageState): void {
  currentState = state
  emit(state)
}

export function getStageState(): StageState | null {
  return currentState
}

export function hasStage(): boolean {
  return currentHandle !== null
}

export function subscribeStage(fn: Listener): () => void {
  listeners.add(fn)
  fn(currentState)
  return () => {
    listeners.delete(fn)
  }
}

export function useStageState(): StageState | null {
  const [state, setState] = useState<StageState | null>(() => currentState)
  useEffect(() => subscribeStage(setState), [])
  return state
}

export const stage = {
  setSound(on: boolean): boolean {
    if (!currentHandle) return false
    currentHandle.setSound(on)
    return true
  },
  setCamera(on: boolean): boolean {
    if (!currentHandle) return false
    currentHandle.setCamera(on)
    return true
  },
  setMode(mode: ModeId): boolean {
    if (!currentHandle) return false
    currentHandle.setMode(mode)
    return true
  },
  setSeason(season: Season): boolean {
    if (!currentHandle) return false
    currentHandle.setSeason(season)
    return true
  },
  clear(): boolean {
    if (!currentHandle) return false
    currentHandle.clear()
    return true
  },
  enterQuiet(): boolean {
    if (!currentHandle) return false
    currentHandle.enterQuiet()
    return true
  },
  collect(): boolean {
    if (!currentHandle) return false
    currentHandle.collect()
    return true
  },
}

/** Convenience hook: a stable object + the latest state. */
export function useStage(): {
  state: StageState | null
  available: boolean
  setSound: (on: boolean) => boolean
  setCamera: (on: boolean) => boolean
  setMode: (mode: ModeId) => boolean
  setSeason: (season: Season) => boolean
  clear: () => boolean
  enterQuiet: () => boolean
} {
  const state = useStageState()
  return {
    state,
    available: state !== null,
    setSound: useCallback((on: boolean) => stage.setSound(on), []),
    setCamera: useCallback((on: boolean) => stage.setCamera(on), []),
    setMode: useCallback((mode: ModeId) => stage.setMode(mode), []),
    setSeason: useCallback((season: Season) => stage.setSeason(season), []),
    clear: useCallback(() => stage.clear(), []),
    enterQuiet: useCallback(() => stage.enterQuiet(), []),
  }
}
