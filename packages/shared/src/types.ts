/** HORTUS MANUS — shared types. Signatures are frozen: engine, pages and API all import these. */

export type Lang = 'zh' | 'en'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type ModeId = 'frame' | 'tendril' | 'ripple' | 'spore' | 'mycelium' | 'mist' | 'phyllotaxis'
export type InputSource = 'camera' | 'pointer' | 'ghost' | 'none'
export type CameraState = 'off' | 'requesting' | 'on' | 'denied' | 'unavailable'
export type Gesture = 'none' | 'open' | 'pinch' | 'fist' | 'frame' | 'weave'

export interface Vec3 {
  /** normalized 0..1, mirrored for selfie view at the tracker boundary */
  x: number
  y: number
  z: number
}

export interface Hand {
  handedness: 'Left' | 'Right' | 'Unknown'
  score: number
  /** exactly 21 landmarks, MediaPipe order */
  landmarks: Vec3[]
}

export interface PortalShape {
  points: { x: number; y: number }[]
  area: number
  center: { x: number; y: number }
  rotation: number
}

export interface GestureState {
  gesture: Gesture
  confidence: number
  /** 0, 1 or 2 */
  hands: number
  portal?: PortalShape
}

export interface HandFrame {
  hands: Hand[]
  /** performance.now() */
  t: number
  source: InputSource
  fps: number
  latencyMs: number
  gesture: GestureState
  /** true while the tracker is warming up / no hand has been seen for < grace */
  present: boolean
}

export interface ModeMeta {
  id: ModeId
  zh: string
  en: string
  latin: string
  family: string
  motif: string
  accent: string
  glyph: string
  gestureZh: string
  gestureEn: string
  blurbZh: string
  blurbEn: string
}

export interface SpecimenSeed {
  mode: ModeId
  season: Season
  seed: number
  caption?: string
  /** ISO local timestamp; server overrides on insert */
  createdAt?: string
}

export interface Specimen extends SpecimenSeed {
  id: string
  lang: Lang
  thanks: number
  createdAt: string
  cardUrl: string
  ogUrl: string
  shareUrl: string
}

export interface SpecimenList {
  items: Specimen[]
  nextCursor: string | null
  total: number
}

export interface DailyEdition {
  date: string
  seed: number
  mode: ModeId
  season: Season
  noteZh: string
  noteEn: string
}

export interface Stats {
  total: number
  byMode: Record<ModeId, number>
  bySeason: Record<Season, number>
  thanks: number
}

export interface ApiErrorBody {
  error: string
  message: string
}

export interface StageState {
  mode: ModeId
  season: Season
  camera: CameraState
  source: InputSource
  fps: number
  latencyMs: number
  gesture: Gesture
  hands: number
  quiet: boolean
  sound: boolean
  seasonLabel: string
}

export interface StageProps {
  initialMode?: ModeId
  initialSeason?: Season
  /** full-bleed /touch vs framed home stage */
  immersive?: boolean
  onState?: (state: StageState) => void
  onCollect?: (seed: SpecimenSeed) => void
  className?: string
}

export interface StageHandle {
  setMode: (mode: ModeId) => void
  setSeason: (season: Season) => void
  setCamera: (on: boolean) => void
  setSound: (on: boolean) => void
  clear: () => void
  enterQuiet: () => void
  collect: () => SpecimenSeed
  getState: () => StageState
}

export interface HandFixtureFrame {
  t: number
  hands: Hand[]
}

export interface HandFixture {
  name: string
  fps: number
  durationMs: number
  frames: HandFixtureFrame[]
}

export interface DeleteResponse {
  ok: boolean
}