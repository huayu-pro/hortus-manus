/**
 * Pointer / touch / keyboard input, upgraded into *synthetic hands*.
 *
 * Every mode therefore consumes the same 21-landmark `HandFrame` whether the
 * hands are real (camera), recorded (ghost) or synthetic (pointer). That is what
 * makes pointer and keyboard genuinely first-class rather than a reduced mode.
 *
 * Gestures:
 *   · hover            → open palm
 *   · mouse down        → fist (hold to close / blow)
 *   · Shift + move      → pinch
 *   · two touch points  → two hands (weave)
 *   · arrow keys        → a keyboard hand you can steer; Space = fist/open
 */

import type { Hand, Vec3 } from '@hortus/shared'
import { synthHand } from './hand-model'
import { clamp } from './landmarks'

interface Pointer {
  id: number
  x: number
  y: number
  down: boolean
  kind: 'mouse' | 'touch' | 'pen'
}

const TREMOR_PHASE = 1.37

function pinchHand(cx: number, cy: number, scale: number, rotation: number, handedness: 'Left' | 'Right'): Hand {
  const hand = synthHand({
    cx,
    cy,
    scale,
    rotation,
    curl: [0.5, 0.35, 0.8, 0.86, 0.9],
    handedness,
    tremor: 0.002,
    phase: TREMOR_PHASE,
  })
  // Pull the thumb + index tips together so the pinch reads at any scale.
  const lm = hand.landmarks
  const tipA = lm[4]
  const tipB = lm[8]
  const meetX = (tipA.x + tipB.x) * 0.5
  const meetY = (tipA.y + tipB.y) * 0.5
  for (const i of [3, 4]) {
    lm[i] = { ...lm[i], x: lm[i].x + (meetX - lm[i].x) * 0.8, y: lm[i].y + (meetY - lm[i].y) * 0.8 }
  }
  for (const i of [7, 8]) {
    lm[i] = { ...lm[i], x: lm[i].x + (meetX - lm[i].x) * 0.8, y: lm[i].y + (meetY - lm[i].y) * 0.8 }
  }
  return hand
}

export class PointerSource {
  readonly source = 'pointer' as const
  private el: HTMLElement | null = null
  private pointers = new Map<number, Pointer>()
  private lastActivity = -Infinity
  private lastMove = -Infinity
  private virtual: { x: number; y: number; activeUntil: number } = { x: 0.5, y: 0.55, activeUntil: 0 }
  private virtualDown = false
  private shift = false
  private bound = false
  /** grace period in ms before pointer hands yield back to the ghost */
  graceMs = 2200

  constructor(private now: () => number = () => performance.now()) {}

  attach(el: HTMLElement): void {
    if (this.bound) return
    this.el = el
    this.bound = true
    el.addEventListener('pointermove', this.onMove)
    el.addEventListener('pointerdown', this.onDown)
    el.addEventListener('pointerup', this.onUp)
    el.addEventListener('pointercancel', this.onUp)
    el.addEventListener('pointerleave', this.onLeave)
    window.addEventListener('keydown', this.onKey)
    window.addEventListener('keyup', this.onKeyUp)
  }

  detach(): void {
    if (!this.bound) return
    this.bound = false
    const el = this.el
    el?.removeEventListener('pointermove', this.onMove)
    el?.removeEventListener('pointerdown', this.onDown)
    el?.removeEventListener('pointerup', this.onUp)
    el?.removeEventListener('pointercancel', this.onUp)
    el?.removeEventListener('pointerleave', this.onLeave)
    window.removeEventListener('keydown', this.onKey)
    window.removeEventListener('keyup', this.onKeyUp)
    this.pointers.clear()
    this.el = null
  }

  private local(e: PointerEvent): { x: number; y: number } {
    const r = this.el?.getBoundingClientRect()
    if (!r || r.width === 0 || r.height === 0) return { x: 0.5, y: 0.5 }
    return { x: clamp((e.clientX - r.left) / r.width), y: clamp((e.clientY - r.top) / r.height) }
  }

  private onMove = (e: PointerEvent): void => {
    const p = this.local(e)
    const now = this.now()
    this.lastActivity = now
    this.lastMove = now
    if (e.pointerType === 'mouse') {
      this.pointers.set(-1, { id: -1, x: p.x, y: p.y, down: e.buttons > 0, kind: 'mouse' })
    } else {
      const prev = this.pointers.get(e.pointerId)
      this.pointers.set(e.pointerId, {
        id: e.pointerId,
        x: p.x,
        y: p.y,
        down: prev?.down ?? true,
        kind: e.pointerType === 'pen' ? 'pen' : 'touch',
      })
    }
    this.shift = e.shiftKey
  }

  private onDown = (e: PointerEvent): void => {
    const p = this.local(e)
    const now = this.now()
    this.lastActivity = now
    this.lastMove = now
    if (e.pointerType === 'mouse') {
      this.pointers.set(-1, { id: -1, x: p.x, y: p.y, down: true, kind: 'mouse' })
    } else {
      // touch: track each finger separately
      this.pointers.set(e.pointerId, { id: e.pointerId, x: p.x, y: p.y, down: true, kind: 'touch' })
    }
  }

  private onUp = (e: PointerEvent): void => {
    const now = this.now()
    this.lastActivity = now
    if (e.pointerType === 'mouse') {
      const hit = this.pointers.get(-1)
      if (hit) hit.down = false
    } else {
      this.pointers.delete(e.pointerId)
    }
  }

  private onLeave = (): void => {
    this.pointers.delete(-1)
  }

  private onKey = (e: KeyboardEvent): void => {
    if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return
    const step = e.shiftKey ? 0.02 : 0.06
    let moved = false
    if (e.key === 'ArrowLeft') {
      this.virtual.x -= step
      moved = true
    } else if (e.key === 'ArrowRight') {
      this.virtual.x += step
      moved = true
    } else if (e.key === 'ArrowUp') {
      this.virtual.y -= step
      moved = true
    } else if (e.key === 'ArrowDown') {
      this.virtual.y += step
      moved = true
    } else if (e.code === 'Space') {
      this.virtualDown = true
      moved = true
    }
    if (!moved) return
    this.virtual.x = clamp(this.virtual.x, 0.05, 0.95)
    this.virtual.y = clamp(this.virtual.y, 0.05, 0.95)
    this.virtual.activeUntil = this.now() + 5000
    this.lastActivity = this.now()
    this.lastMove = this.now()
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    if (e.code === 'Space') this.virtualDown = false
  }

  /** True while pointer/keyboard hands should drive the stage. */
  get active(): boolean {
    return this.now() - this.lastActivity < this.graceMs
  }

  get kindLabel(): 'pointer' | 'keyboard' | 'none' {
    if (!this.active) return 'none'
    if (this.now() - this.lastMove < this.graceMs && this.pointers.size === 0 && this.virtual.activeUntil > this.now()) {
      return 'keyboard'
    }
    return 'pointer'
  }

  /** Move the keyboard hand to a position (used by the Stage's keyboard helpers). */
  setVirtual(x: number, y: number): void {
    this.virtual.x = clamp(x)
    this.virtual.y = clamp(y)
    this.virtual.activeUntil = this.now() + 5000
    this.lastActivity = this.now()
    this.lastMove = this.now()
  }

  sample(now: number): Hand[] {
    if (!this.active) return []
    const pts = [...this.pointers.values()]
    const handScale = 0.1
    if (pts.length >= 2) {
      const [a, b] = pts
      const left = a.x <= b.x ? a : b
      const right = a.x <= b.x ? b : a
      return [
        synthHand({
          cx: left.x,
          cy: left.y,
          scale: handScale,
          rotation: -Math.PI / 2 + 0.15,
          curl: [0.05, 0.04, 0.04, 0.04, 0.04],
          spread: 1.3,
          handedness: 'Left',
          mirror: 1,
          tremor: 0.002,
          phase: 0.7 + now * 0.001,
        }),
        synthHand({
          cx: right.x,
          cy: right.y,
          scale: handScale * 0.97,
          rotation: Math.PI / 2 - 0.15,
          curl: [0.05, 0.04, 0.04, 0.04, 0.04],
          spread: 1.3,
          handedness: 'Right',
          mirror: -1,
          tremor: 0.002,
          phase: 2.1 + now * 0.001,
        }),
      ]
    }
    const p = pts[0]
    const useVirtual = !p && this.virtual.activeUntil > now
    const x = p?.x ?? this.virtual.x
    const y = p?.y ?? this.virtual.y
    const down = p?.down ?? this.virtualDown
    if (!p && !useVirtual) return []
    const scale = 0.105
    if (this.shift) return [pinchHand(x, y, scale, -0.12, 'Right')]
    if (down) {
      return [
        synthHand({
          cx: x,
          cy: y,
          scale,
          rotation: -0.1,
          curl: [0.88, 0.94, 0.98, 0.96, 0.9],
          handedness: 'Right',
          tremor: 0.002,
          phase: 3.1 + now * 0.001,
        }),
      ]
    }
    return [
      synthHand({
        cx: x,
        cy: y,
        scale,
        rotation: -0.06 + Math.sin(now * 0.0007) * 0.02,
        curl: [0.04, 0.02, 0.02, 0.02, 0.02],
        spread: 1.05,
        handedness: 'Right',
        tremor: 0.002,
        phase: 1.9 + now * 0.001,
      }),
    ]
  }
}

export type { Vec3 }
