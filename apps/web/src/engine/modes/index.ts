/** Seven-mode registry. */

import type { ModeId } from '@hortus/shared'
import type { GardenMode } from './types'
import { FrameMode } from './frame'
import { TendrilMode } from './tendril'
import { RippleMode } from './ripple'
import { SporeMode } from './spore'
import { MyceliumMode } from './mycelium'
import { MistMode } from './mist'
import { PhyllotaxisMode } from './phyllotaxis'

const FACTORIES: Record<ModeId, () => GardenMode> = {
  frame: () => new FrameMode(),
  tendril: () => new TendrilMode(),
  ripple: () => new RippleMode(),
  spore: () => new SporeMode(),
  mycelium: () => new MyceliumMode(),
  mist: () => new MistMode(),
  phyllotaxis: () => new PhyllotaxisMode(),
}

export function createMode(id: ModeId): GardenMode {
  return FACTORIES[id]()
}

export type { GardenMode, ModeEnv, ModeFrame, EngineAssets } from './types'
