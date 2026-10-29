/** Engine ↔ mode contract. */

import type * as THREE from 'three'
import type { HandFrame, ModeId, Season, SpecimenSeed } from '@hortus/shared'
import type { Palette } from '../palette'
import type { Ink2D } from '../Ink2D'

export interface EngineAssets {
  paper: THREE.Texture
  watercolor: THREE.Texture
  moss: THREE.Texture
  dew: THREE.Texture
  fluff: THREE.Texture
  /** painted fallbacks, always present */
  pond: THREE.Texture
  fernPlate: THREE.Texture
  /** optional public-domain plates, may arrive after boot */
  platePeony: THREE.Texture | null
  plateRed: THREE.Texture | null
  plateAndrews: THREE.Texture | null
  plateBotmag: THREE.Texture | null
  plateMonet: THREE.Texture | null
}

export interface ModeEnv {
  width: number
  height: number
  /** device pixel ratio actually used for the drawing buffer */
  dpr: number
  season: Season
  palette: Palette
  /** 0..1 particle/detail budget from the quality governor */
  quality: number
  reducedMotion: boolean
  assets: EngineAssets
  /** live video texture while the camera is on (null otherwise) */
  video?: THREE.Texture | null
}

export interface ModeFrame {
  hands: HandFrame
  dt: number
  /** seconds since engine start */
  time: number
  season: Season
  quality: number
  reducedMotion: boolean
}

export interface GardenMode {
  readonly id: ModeId
  readonly scene: THREE.Scene
  readonly camera: THREE.Camera
  init(env: ModeEnv): void
  resize(env: ModeEnv): void
  update(frame: ModeFrame): void
  render(renderer: THREE.WebGLRenderer): void
  drawOverlay(ink: Ink2D): void
  dispose(): void
  collect(): SpecimenSeed
  collectSeed(): number
  a11ySummary(): string
  clear?(): void
  setSeason?(season: Season): void
  refreshAssets?(): void
}

export type ModeFactory = () => GardenMode
