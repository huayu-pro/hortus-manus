/**
 * Fixture synthesiser.
 *
 * These trajectories are *hand-authored curves*, not linear interpolation: every
 * channel rides a slow ease plus breathing, tremor and wrist roll, and the two
 * hands are deliberately out of phase. Run:
 *
 *   ./node_modules/.bin/tsx src/hands/generate-fixtures.ts
 *
 * from apps/web to rewrite public/fixtures/*.json.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Hand } from '@hortus/shared'
import { mulberry32 } from '../../../../packages/shared/src/prng'
import { synthHand } from './hand-model'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../../public/fixtures')

const FPS = 24

type Curl = [number, number, number, number, number]

interface HandSpec {
  cx: number
  cy: number
  scale: number
  rotation: number
  curl: Curl
  spread?: number
  roll?: number
  handedness: 'Left' | 'Right'
  mirror?: 1 | -1
}

interface Frame {
  t: number
  hands: HandSpec[]
}

/* --------------------------------- helpers -------------------------------- */

const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
/** smooth 0→1→0 bump over `width` of the cycle, centred at 0.5 */
const bump = (phase: number, width = 0.4) => {
  const x = phase % 1
  const h = width / 2
  if (x < 0.5 - h || x > 0.5 + h) return 0
  return x < 0.5 ? easeInOut((x - (0.5 - h)) / h) : 1 - easeInOut((x - (0.5 + h)) / h)
}

/** Breathing + tremor: the two things that make a synthetic hand look alive. */
function life(t: number, seed: number, amp = 1) {
  const rnd = mulberry32(seed)
  const p1 = rnd() * Math.PI * 2
  const p2 = rnd() * Math.PI * 2
  const p3 = rnd() * Math.PI * 2
  return {
    breathe: Math.sin(t * Math.PI * 2 * 0.23 + p1) * 0.010 * amp,
    breatheY: Math.sin(t * Math.PI * 2 * 0.19 + p2) * 0.008 * amp,
    sway: Math.sin(t * Math.PI * 2 * 0.11 + p3) * 0.012 * amp,
    tremorPhase: p1 + t * 0.9,
    tremor: 0.0035 * amp,
    roll: Math.sin(t * Math.PI * 2 * 0.17 + p2) * 0.035 * amp,
    phase: p1,
  }
}

function curlLerp(a: Curl, b: Curl, k: number): Curl {
  return [0, 1, 2, 3, 4].map((i) => a[i] + (b[i] - a[i]) * k) as Curl
}

const OPEN: Curl = [0.03, 0.02, 0.02, 0.02, 0.02]
const RELAXED: Curl = [0.18, 0.22, 0.26, 0.3, 0.34]
const FIST: Curl = [0.88, 0.94, 0.98, 0.96, 0.9]
/** thumb + index out, middle/ring/pinky folded — the "frame" pose */
const FRAME: Curl = [0.05, 0.04, 0.92, 0.96, 0.98]
const POINT: Curl = [0.55, 0.04, 0.9, 0.94, 0.96]
const HALF: Curl = [0.2, 0.3, 0.42, 0.5, 0.58]

/** A hand whose fingers point up and whose thumb points toward screen centre. */
function upright(cx: number, cy: number, scale: number, rot: number, side: 'Left' | 'Right'): Omit<HandSpec, 'curl'> {
  return {
    cx,
    cy,
    scale,
    rotation: rot,
    handedness: side,
    // Left hand lives on the left: mirror it so the thumb points right (inward).
    mirror: side === 'Left' ? -1 : 1,
  }
}

function emitHand(spec: HandSpec, t: number, seed: number, amp = 1): Hand {
  const l = life(t, seed, amp)
  return synthHand({
    cx: spec.cx + l.breathe + l.sway * 0.4,
    cy: spec.cy + l.breatheY,
    scale: spec.scale,
    rotation: spec.rotation + l.roll,
    roll: spec.roll ?? 0,
    curl: spec.curl,
    spread: spec.spread ?? 1,
    handedness: spec.handedness,
    mirror: spec.mirror,
    tremor: l.tremor,
    phase: l.tremorPhase,
  })
}

function build(
  name: string,
  durationMs: number,
  fn: (t: number, k: number) => HandSpec[],
): { name: string; fps: number; durationMs: number; frames: Frame[] } {
  const n = Math.round((durationMs / 1000) * FPS)
  const frames: Frame[] = []
  for (let i = 0; i < n; i++) {
    const t = i / FPS
    const k = i / (n - 1)
    frames.push({ t: Math.round(t * 1000) / 1000, hands: fn(t, k) })
  }
  return { name, fps: FPS, durationMs, frames }
}

/* -------------------------------- fixtures -------------------------------- */

/** 双手开合 — two palms, opening and closing like a breath. */
function openClose(_t: number, k: number): HandSpec[] {
  const cyc = (k * 2.0) % 1
  const open = bump(cyc, 0.62) // long hold open, quick close
  const c = curlLerp(OPEN, FIST, 1 - open)
  const gap = 0.17 + 0.045 * Math.sin(k * Math.PI * 2)
  const drop = 0.02 * Math.sin(k * Math.PI * 2 * 0.5)
  const rot = 0.06 * Math.sin(k * Math.PI * 2 * 0.5)
  return [
    { ...upright(0.5 - gap, 0.54 + drop, 0.125, rot - 0.1, 'Left'), curl: c, spread: 1.05 },
    { ...upright(0.5 + gap, 0.54 - drop, 0.122, -rot + 0.1, 'Right'), curl: c, spread: 1.05 },
  ]
}

/** 画框 — two hands making a window, held, then tilted and widened slowly. */
function frame(_t: number, k: number): HandSpec[] {
  const cyc = k % 1
  const hold = 0.74
  const tilt = Math.sin(k * Math.PI * 2 * 0.5) * 0.2
  const widen = 1 + Math.sin(k * Math.PI * 2 * 0.33) * 0.12
  const c = cyc < hold ? FRAME : curlLerp(FRAME, OPEN, easeInOut((cyc - hold) / (1 - hold)))
  return [
    {
      ...upright(0.5 - 0.145 * widen, 0.52 + 0.02, 0.126, tilt - 0.18, 'Left'),
      curl: c,
      spread: 1.2,
    },
    {
      ...upright(0.5 + 0.145 * widen, 0.52 - 0.02, 0.123, tilt + 0.18, 'Right'),
      curl: c,
      spread: 1.2,
    },
  ]
}

/** 握拳吹散 — fist held, then blown open; second hand idles nearby. */
function fistBlow(_t: number, k: number): HandSpec[] {
  const cyc = (k * 2.2) % 1
  const close = cyc < 0.42 ? 1 : 1 - easeInOut(clamp01((cyc - 0.42) / 0.3))
  const c = curlLerp(OPEN, FIST, close)
  const rise = 0.012 * Math.sin(k * Math.PI * 2 * 0.7)
  return [
    { ...upright(0.47, 0.56 + rise, 0.128, 0.14 * Math.sin(k * Math.PI * 2 * 0.6), 'Right'), curl: c },
    {
      ...upright(0.8, 0.63, 0.102, -0.45, 'Left'),
      curl: curlLerp(RELAXED, OPEN, 0.5 + 0.5 * Math.sin(k * Math.PI * 2 * 0.4)),
    },
  ]
}

/** 双掌相对 — palms facing each other, approaching to weave, then parting. */
function palmsFacing(_t: number, k: number): HandSpec[] {
  const cyc = (k * 1.6) % 1
  const near = bump(cyc, 0.7)
  const gap = 0.27 - 0.18 * near
  const c = curlLerp(OPEN, [0.12, 0.2, 0.26, 0.3, 0.36], 1 - near)
  // Fingers point toward each other: left hand points +x, right hand points -x.
  return [
    { ...upright(0.5 - gap, 0.5, 0.122, -Math.PI / 2 - 0.1, 'Left'), curl: c, spread: 1.25, mirror: 1 },
    { ...upright(0.5 + gap, 0.5, 0.119, Math.PI / 2 + 0.1, 'Right'), curl: c, spread: 1.25, mirror: -1 },
  ]
}

/** 指点 — one pointing hand tracing a slow curve; the other rests low. */
function pointDraw(_t: number, k: number): HandSpec[] {
  const cyc = k * 2
  const a = cyc * Math.PI * 2
  const cx = 0.5 + 0.22 * Math.cos(a) * (0.92 + 0.08 * Math.sin(cyc * 3))
  const cy = 0.5 + 0.16 * Math.sin(a * 1.3)
  const rot = -a * 0.28 + 0.15
  const c = curlLerp(POINT, HALF, 0.08 + 0.08 * Math.sin(k * Math.PI * 2 * 2))
  return [
    { ...upright(cx, cy, 0.12, rot, 'Right'), curl: c, spread: 0.95 },
    {
      ...upright(0.24 + 0.04 * Math.sin(k * Math.PI * 2 * 0.5), 0.76, 0.09, -0.7, 'Left'),
      curl: RELAXED,
      spread: 0.9,
    },
  ]
}

const FIXTURES = [
  { name: 'open-close', durationMs: 7200, fn: openClose },
  { name: 'frame', durationMs: 6800, fn: frame },
  { name: 'fist', durationMs: 5600, fn: fistBlow },
  { name: 'palms-facing', durationMs: 6400, fn: palmsFacing },
  { name: 'point', durationMs: 6000, fn: pointDraw },
]

/* --------------------------------- write ---------------------------------- */

interface CompactFrame {
  t: number
  hands: { h: 'Left' | 'Right'; s: number; p: number[] }[]
}

function compact(hand: Hand): CompactFrame['hands'][number] {
  const p: number[] = []
  for (const lm of hand.landmarks) {
    p.push(Math.round(lm.x * 1000) / 1000, Math.round(lm.y * 1000) / 1000, Math.round(lm.z * 1000) / 1000)
  }
  return { h: hand.handedness === 'Left' ? 'Left' : 'Right', s: Math.round(hand.score * 100) / 100, p }
}

mkdirSync(OUT, { recursive: true })

for (const spec of FIXTURES) {
  const raw = build(spec.name, spec.durationMs, spec.fn)
  const frames: CompactFrame[] = raw.frames.map((f, i) => ({
    t: f.t,
    hands: f.hands.map((h) =>
      compact(emitHand(h, f.t, 1000 + i * 7 + (h.handedness === 'Left' ? 11 : 23), 1)),
    ),
  }))
  const out = { name: spec.name, fps: raw.fps, durationMs: raw.durationMs, frames }
  const file = resolve(OUT, `${spec.name}.json`)
  const json = JSON.stringify(out)
  writeFileSync(file, json)
  console.log(`${spec.name}: ${frames.length} frames · ${(json.length / 1024).toFixed(0)} KB`)
}
