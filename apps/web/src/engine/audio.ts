/**
 * Generative soundscape — WebAudio only, no audio files.
 *
 * · wind      — filtered noise bed whose band moves with the hands
 * · water     — low-passed noise + occasional droplet pings
 * · silk      — plucked pentatonic strings (C D E G A) with a soft filter
 * · drone     — two detuned sines for MYCELIUM's heartbeat
 *
 * Muted by default. The context is only created from a user gesture; when the
 * page hides, everything suspends. `reduced-motion` means we never auto-start.
 */

import type { ModeId } from '@hortus/shared'

const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99]

const MODE_TONE: Record<ModeId, { kind: 'string' | 'water' | 'wind' | 'pulse' | 'breath'; level: number }> = {
  frame: { kind: 'string', level: 0.55 },
  tendril: { kind: 'string', level: 0.7 },
  ripple: { kind: 'water', level: 0.6 },
  spore: { kind: 'wind', level: 0.8 },
  mycelium: { kind: 'pulse', level: 0.6 },
  mist: { kind: 'breath', level: 0.55 },
  phyllotaxis: { kind: 'string', level: 0.65 },
}

export class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private panner: StereoPannerNode | null = null
  private noise: AudioBuffer | null = null
  private windGain: GainNode | null = null
  private windFilter: BiquadFilterNode | null = null
  private waterGain: GainNode | null = null
  private droneGain: GainNode | null = null
  private started = false
  private muted = true
  private mode: ModeId = 'frame'
  private nextEvent = 0
  private pan = 0
  private level = 0.5
  reducedMotion = false

  get available(): boolean {
    return typeof window !== 'undefined' && 'AudioContext' in window
  }

  get isMuted(): boolean {
    return this.muted
  }

  get ready(): boolean {
    return this.started && !!this.ctx
  }

  /** Call from any user gesture. Safe to call repeatedly. */
  async unlock(): Promise<void> {
    if (!this.available) return
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext()
        this.build()
      } catch {
        this.ctx = null
        return
      }
    }
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume()
      } catch {
        /* ignored */
      }
    }
    this.started = true
  }

  private build(): void {
    const ctx = this.ctx
    if (!ctx) return
    const master = ctx.createGain()
    master.gain.value = 0
    const panner = ctx.createStereoPanner()
    panner.pan.value = 0
    master.connect(panner).connect(ctx.destination)
    this.master = master
    this.panner = panner

    // noise buffer (pink-ish)
    const dur = 4
    const buffer = ctx.createBuffer(2, ctx.sampleRate * dur, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      let last = 0
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1
        last = last * 0.985 + white * 0.015
        data[i] = last * 3.2
      }
    }
    this.noise = buffer

    // wind bed
    const wind = ctx.createBufferSource()
    wind.buffer = buffer
    wind.loop = true
    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 620
    windFilter.Q.value = 0.6
    const windGain = ctx.createGain()
    windGain.gain.value = 0.02
    wind.connect(windFilter).connect(windGain).connect(master)
    wind.start()
    this.windFilter = windFilter
    this.windGain = windGain

    // water bed
    const water = ctx.createBufferSource()
    water.buffer = buffer
    water.loop = true
    const waterFilter = ctx.createBiquadFilter()
    waterFilter.type = 'lowpass'
    waterFilter.frequency.value = 780
    const waterGain = ctx.createGain()
    waterGain.gain.value = 0
    water.connect(waterFilter).connect(waterGain).connect(master)
    water.start()
    this.waterGain = waterGain

    // drone (mycelium heartbeat)
    const droneGain = ctx.createGain()
    droneGain.gain.value = 0
    droneGain.connect(master)
    for (const [freq, det] of [
      [55, -4],
      [82.5, 3],
    ] as const) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.detune.value = det
      const g = ctx.createGain()
      g.gain.value = 0.5
      osc.connect(g).connect(droneGain)
      osc.start()
    }
    this.droneGain = droneGain
  }

  setMode(mode: ModeId): void {
    this.mode = mode
    if (!this.ctx || !this.master) return
    const tone = MODE_TONE[mode]
    this.level = tone.level
    this.nextEvent = this.ctx.currentTime + 0.4
    const t = this.ctx.currentTime
    this.ramp(this.windGain?.gain ?? null, tone.kind === 'wind' ? 0.055 : 0.018, t)
    this.ramp(this.waterGain?.gain ?? null, tone.kind === 'water' ? 0.05 : 0, t)
    this.ramp(this.droneGain?.gain ?? null, tone.kind === 'pulse' ? 0.05 : 0, t)
  }

  private ramp(param: AudioParam | null, value: number, t: number): void {
    if (!param) return
    param.cancelScheduledValues(t)
    param.setTargetAtTime(value, t, 0.6)
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    if (!this.ctx || !this.master) return
    const t = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(t)
    this.master.gain.setTargetAtTime(muted ? 0 : 0.16, t, muted ? 0.25 : 0.8)
  }

  /** hand x (0..1) → stereo position */
  setHandX(x: number | null): void {
    this.pan = x === null ? 0 : Math.max(-0.8, Math.min(0.8, (x - 0.5) * 1.6))
    if (this.panner && this.ctx) this.panner.pan.setTargetAtTime(this.pan, this.ctx.currentTime, 0.3)
  }

  /** Call every frame; schedules the next generative event. */
  update(now: number, present: boolean): void {
    const ctx = this.ctx
    if (!ctx || !this.started || this.muted) return
    const t = ctx.currentTime
    if (t < this.nextEvent) return
    const tone = MODE_TONE[this.mode]
    const rnd = Math.random()
    let wait = 3.4
    switch (tone.kind) {
      case 'string': {
        wait = 1.8 + rnd * 2.8
        this.pluck(PENTA[Math.floor(rnd * PENTA.length)] * (this.mode === 'phyllotaxis' ? 1 : 0.5), this.mode === 'tendril' ? 'triangle' : 'sine', 0.05 * this.level, 2.2)
        break
      }
      case 'water': {
        wait = 1.4 + rnd * 2.6
        this.droplet(900 + rnd * 700)
        break
      }
      case 'wind': {
        wait = 2.4 + rnd * 3.2
        if (this.windFilter) this.windFilter.frequency.setTargetAtTime(420 + rnd * 900, t, 0.9)
        break
      }
      case 'pulse': {
        wait = 1.9
        this.heartbeat()
        break
      }
      case 'breath': {
        wait = 3.2 + rnd * 2.4
        this.breath()
        break
      }
    }
    if (!present) wait *= 1.34
    this.nextEvent = t + wait
  }

  private pluck(freq: number, type: OscillatorType, gain: number, dur: number): void {
    const ctx = this.ctx
    if (!ctx || !this.master) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    osc.detune.value = (Math.random() - 0.5) * 8
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(3200, t)
    filter.frequency.exponentialRampToValueAtTime(700, t + dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(gain, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(filter).connect(g).connect(this.master)
    osc.start(t)
    osc.stop(t + dur + 0.05)
  }

  private droplet(freq: number): void {
    const ctx = this.ctx
    if (!ctx || !this.master) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, t)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.55, t + 0.16)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.035 * this.level, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
    osc.connect(g).connect(this.master)
    osc.start(t)
    osc.stop(t + 0.55)
  }

  private heartbeat(): void {
    const ctx = this.ctx
    if (!ctx || !this.master) return
    const t = ctx.currentTime
    for (const [dt, gain] of [
      [0, 0.05],
      [0.24, 0.028],
    ] as const) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = 58
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, t + dt)
      g.gain.linearRampToValueAtTime(gain, t + dt + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.5)
      osc.connect(g).connect(this.master)
      osc.start(t + dt)
      osc.stop(t + dt + 0.55)
    }
  }

  private breath(): void {
    const ctx = this.ctx
    if (!ctx || !this.master || !this.noise) return
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(500, t)
    filter.frequency.linearRampToValueAtTime(1100, t + 0.8)
    filter.Q.value = 0.4
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.03 * this.level, t + 0.6)
    g.gain.linearRampToValueAtTime(0, t + 1.8)
    src.connect(filter).connect(g).connect(this.master)
    src.start(t)
    src.stop(t + 2)
  }

  async suspend(): Promise<void> {
    try {
      await this.ctx?.suspend()
    } catch {
      /* ignored */
    }
  }

  async resume(): Promise<void> {
    if (!this.started) return
    try {
      await this.ctx?.resume()
    } catch {
      /* ignored */
    }
  }

  dispose(): void {
    try {
      void this.ctx?.close()
    } catch {
      /* ignored */
    }
    this.ctx = null
    this.started = false
  }
}
