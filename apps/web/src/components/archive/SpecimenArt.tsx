/**
 * HORTUS MANUS — deterministic specimen art (owner: stage).
 *
 * The server draws the final PNG card (`/api/specimens/:id/card.png`). This
 * component draws the *same specimen* locally from its seed before the server
 * has answered, and acts as the fallback thumbnail in the herbarium. Same seed
 * → same flower, every time, on every device.
 *
 * It is deliberately a pressed-flower drawing, not a photo: muted washes, ink
 * line, paper margin. No random values at render time (mulberry32 only).
 */

import { useMemo } from 'react'
import type { ReactNode } from 'react'
import type { ModeId, Season, SpecimenSeed } from '@hortus/shared'
import { MODES, SEASONS } from '@hortus/shared'
import { mulberry32 } from '@hortus/shared'

export interface SpecimenArtProps {
  seed: number
  mode: ModeId
  season: Season
  caption?: string
  className?: string
  /** true when used as a small thumbnail — simplifies the drawing */
  compact?: boolean
  label?: string
}

interface Pt {
  x: number
  y: number
}

const W = 480
const H = 600
const CX = 240
const CY = 258

function petalPath(cx: number, cy: number, rx: number, ry: number, rotation: number): string {
  // a petal as two mirrored cubic curves, rotated around the flower centre
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const p = (x: number, y: number) => {
    const dx = x
    const dy = y
    return `${(cx + dx * cos - dy * sin).toFixed(1)} ${(cy + dx * sin + dy * cos).toFixed(1)}`
  }
  return [
    `M${p(0, 0)}`,
    `C${p(rx * 0.55, -ry * 0.9)} ${p(rx * 1.4, -ry * 0.55)} ${p(rx * 1.45, 0)}`,
    `C${p(rx * 1.4, ry * 0.55)} ${p(rx * 0.55, ry * 0.9)} ${p(0, 0)}`,
    'Z',
  ].join(' ')
}

function FrameMotif({ rand, accent }: { rand: () => number; accent: string }) {
  const rings = [8, 11, 14]
  return (
    <g>
      {rings.map((count, ring) => {
        const radius = 22 + ring * 30
        const petals = Array.from({ length: count }, (_, i) => {
          const rot = (360 / count) * i + rand() * 8
          return (
            <path
              key={`${ring}-${i}`}
              d={petalPath(CX, CY, radius * 0.56, radius * 0.32, rot)}
              fill={accent}
              fillOpacity={0.08 + ring * 0.035}
              stroke={accent}
              strokeOpacity={0.38}
              strokeWidth={0.9}
            />
          )
        })
        return <g key={ring}>{petals}</g>
      })}
      {Array.from({ length: 46 }, (_, i) => {
        const a = rand() * Math.PI * 2
        const r = Math.sqrt(rand()) * 30
        return (
          <circle
            key={i}
            cx={CX + Math.cos(a) * r}
            cy={CY + Math.sin(a) * r}
            r={1.4 + rand() * 1.4}
            fill="var(--hm-pollen)"
            opacity={0.55 + rand() * 0.35}
          />
        )
      })}
    </g>
  )
}

function TendrilMotif({ rand, accent }: { rand: () => number; accent: string }) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 10 + rand() * 0.2
    const r = 70 + rand() * 36
    return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r * 0.9 }
  })
  return (
    <g stroke={accent} fill="none">
      {points.map((p, i) => {
        const q = points[(i * 3 + 4) % points.length]
        return <path key={i} d={`M${p.x} ${p.y} Q${CX + (p.y - CY) * 0.3} ${CY - (p.x - CX) * 0.3} ${q.x} ${q.y}`} strokeWidth={1.1} strokeOpacity={0.55} />
      })}
      {points.map((p, i) => (
        <g key={`d${i}`}>
          <circle cx={p.x} cy={p.y} r={3.4} fill="var(--hm-leaf)" fillOpacity={0.16} stroke={accent} strokeWidth={0.9} />
          <circle cx={p.x} cy={p.y} r={0.9} fill={accent} />
        </g>
      ))}
    </g>
  )
}

function RippleMotif({ rand, accent }: { rand: () => number; accent: string }) {
  return (
    <g>
      {Array.from({ length: 9 }, (_, i) => (
        <ellipse
          key={i}
          cx={CX + (rand() - 0.5) * 14}
          cy={CY + (rand() - 0.5) * 10}
          rx={26 + i * 21}
          ry={(26 + i * 21) * 0.52}
          fill="none"
          stroke={accent}
          strokeOpacity={0.42 - i * 0.03}
          strokeWidth={i % 2 ? 0.8 : 1.2}
        />
      ))}
      <path
        d={`M${CX - 86} ${CY + 26}c22-34 78-40 104-12 16 18 4 34-18 34-26 0-36-20-22-34`}
        fill="var(--hm-pond)"
        fillOpacity={0.14}
        stroke={accent}
        strokeOpacity={0.5}
        strokeWidth={1}
      />
      <g transform={`translate(${CX + 50} ${CY - 34})`}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={petalPath(0, 0, 18, 10, i * 60 + 12)}
            fill="var(--hm-blush)"
            fillOpacity={0.55}
            stroke={accent}
            strokeOpacity={0.6}
            strokeWidth={0.8}
          />
        ))}
        <circle cx="0" cy="0" r="4" fill="var(--hm-pollen)" opacity="0.8" />
      </g>
    </g>
  )
}

function SporeMotif({ rand, accent }: { rand: () => number; accent: string }) {
  const rays = Array.from({ length: 30 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 30 + rand() * 0.08
    const r = 54 + rand() * 40
    const x = CX + Math.cos(a) * r
    const y = CY + Math.sin(a) * r * 0.92
    return (
      <g key={i}>
        <line x1={CX} y1={CY} x2={x} y2={y} stroke={accent} strokeOpacity={0.32} strokeWidth={0.7} />
        <circle cx={x} cy={y} r={2.2} fill="var(--hm-moon)" stroke={accent} strokeWidth={0.7} />
        <line x1={x} y1={y} x2={x + (rand() - 0.5) * 8} y2={y - 6 - rand() * 6} stroke={accent} strokeOpacity={0.4} strokeWidth={0.5} />
      </g>
    )
  })
  return (
    <g>
      {rays}
      <circle cx={CX} cy={CY} r={13} fill="var(--hm-pollen)" fillOpacity={0.22} stroke={accent} strokeWidth={1} />
      <circle cx={CX} cy={CY} r={5} fill={accent} fillOpacity={0.5} />
    </g>
  )
}

function MyceliumMotif({ rand, accent }: { rand: () => number; accent: string }) {
  const branch = (x: number, y: number, angle: number, len: number, depth: number, key: string): ReactNode => {
    if (depth <= 0 || len < 5) return null
    const x2 = x + Math.cos(angle) * len
    const y2 = y + Math.sin(angle) * len
    return (
      <g key={key}>
        <path d={`M${x} ${y}Q${(x + x2) / 2 + (rand() - 0.5) * 10} ${(y + y2) / 2} ${x2} ${y2}`} stroke={accent} strokeOpacity={0.3 + depth * 0.08} strokeWidth={depth * 0.42} fill="none" />
        <circle cx={x2} cy={y2} r={1.2} fill={accent} opacity={0.5} />
        {branch(x2, y2, angle - 0.55 - rand() * 0.25, len * 0.68, depth - 1, `${key}a`)}
        {branch(x2, y2, angle + 0.5 + rand() * 0.3, len * 0.62, depth - 1, `${key}b`)}
      </g>
    )
  }
  return (
    <g>
      {Array.from({ length: 5 }, (_, i) =>
        branch(CX, CY, (Math.PI * 2 * i) / 5 + rand() * 0.3, 46 + rand() * 18, 5, `m${i}`),
      )}
      <circle cx={CX} cy={CY} r={20} fill="var(--hm-leaf)" fillOpacity={0.1} stroke={accent} strokeOpacity={0.4} strokeWidth={0.9} />
    </g>
  )
}

function MistMotif({ rand, accent }: { rand: () => number; accent: string }) {
  const fronds: ReactNode[] = []
  for (let f = 0; f < 3; f += 1) {
    const baseX = CX - 70 + f * 68
    const lean = (rand() - 0.5) * 26
    fronds.push(
      <g key={f}>
        <path d={`M${baseX} ${CY + 150}Q${baseX + lean} ${CY + 20} ${baseX + lean * 1.4} ${CY - 120}`} stroke={accent} strokeOpacity={0.45} strokeWidth={1} fill="none" />
        {Array.from({ length: 11 }, (_, i) => {
          const t = i / 11
          const y = CY + 140 - t * 250
          const x = baseX + lean * (t * 1.3)
          const len = 24 * Math.sin(Math.PI * (0.15 + t * 0.9))
          return (
            <g key={i}>
              <path d={`M${x} ${y}q-${len} -6 -${len * 1.6} 6`} stroke={accent} strokeOpacity={0.36} strokeWidth={0.8} fill="none" />
              <path d={`M${x} ${y}q${len} -6 ${len * 1.6} 6`} stroke={accent} strokeOpacity={0.36} strokeWidth={0.8} fill="none" />
            </g>
          )
        })}
      </g>,
    )
  }
  return <g>{fronds}</g>
}

function PhyllotaxisMotif({ rand, accent }: { rand: () => number; accent: string }) {
  const N = 110
  const golden = 137.508
  const petals = Array.from({ length: N }, (_, i) => {
    const angle = (i * golden * Math.PI) / 180
    const r = 5.2 * Math.sqrt(i)
    const x = CX + Math.cos(angle) * r
    const y = CY + Math.sin(angle) * r
    const size = 1.1 + (i / N) * 5
    return (
      <g key={i}>
        <circle cx={x} cy={y} r={size} fill={i % 3 === 0 ? 'var(--hm-pollen)' : accent} fillOpacity={0.18 + (i / N) * 0.42} />
        {i % 7 === 0 ? <line x1={CX} y1={CY} x2={x} y2={y} stroke={accent} strokeOpacity={0.1} strokeWidth={0.5} /> : null}
      </g>
    )
  })
  return (
    <g>
      {petals}
      <circle cx={CX} cy={CY} r={10} fill="var(--hm-ink)" fillOpacity={0.35} />
      <circle cx={CX} cy={CY} r={3} fill={rand() > 0.5 ? 'var(--hm-pollen)' : accent} />
    </g>
  )
}

export function SpecimenArt({ seed, mode, season, caption, className, compact = false, label }: SpecimenArtProps) {
  const art = useMemo(() => {
    const rand = mulberry32(seed >>> 0)
    const modeMeta = MODES.find((m) => m.id === mode)
    const seasonMeta = SEASONS.find((s) => s.id === season)
    const accent = modeMeta?.accent ?? '#c97f7f'
    const wash = seasonMeta?.accent ?? '#e8c4be'
    const motif =
      mode === 'frame' ? (
        <FrameMotif rand={rand} accent={accent} />
      ) : mode === 'tendril' ? (
        <TendrilMotif rand={rand} accent={accent} />
      ) : mode === 'ripple' ? (
        <RippleMotif rand={rand} accent={accent} />
      ) : mode === 'spore' ? (
        <SporeMotif rand={rand} accent={accent} />
      ) : mode === 'mycelium' ? (
        <MyceliumMotif rand={rand} accent={accent} />
      ) : mode === 'mist' ? (
        <MistMotif rand={rand} accent={accent} />
      ) : (
        <PhyllotaxisMotif rand={rand} accent={accent} />
      )
    const stemLean = (rand() - 0.5) * 40
    return { motif, accent, wash, stemLean }
  }, [seed, mode, season])

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={label ?? `${mode} · ${season}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width={W} height={H} fill="var(--hm-paper)" />
      {/* season wash — a single soft pool, like watercolour on damp paper */}
      <ellipse cx={CX + 20} cy={CY + 30} rx={190} ry={210} fill={art.wash} opacity={compact ? 0.12 : 0.18} />
      <ellipse cx={CX - 60} cy={CY - 70} rx={120} ry={130} fill={art.accent} opacity={0.06} />

      {/* stem and two leaves */}
      <path
        d={`M${CX + art.stemLean * 0.2} ${CY + 10}Q${CX - 18 + art.stemLean} ${CY + 130} ${CX - 30 + art.stemLean} ${H - 66}`}
        fill="none"
        stroke="var(--hm-moss)"
        strokeOpacity={0.55}
        strokeWidth={1.6}
      />
      <path
        d={`M${CX - 22 + art.stemLean * 0.7} ${CY + 170}c-48-14-82 2-96 40 42 12 78-6 96-40Z`}
        fill="var(--hm-leaf)"
        fillOpacity={0.16}
        stroke="var(--hm-moss)"
        strokeOpacity={0.45}
        strokeWidth={1}
      />
      <path
        d={`M${CX - 26 + art.stemLean * 0.85} ${CY + 230}c40-18 74-6 88 28-38 16-72 2-88-28Z`}
        fill="var(--hm-leaf)"
        fillOpacity={0.12}
        stroke="var(--hm-moss)"
        strokeOpacity={0.4}
        strokeWidth={0.9}
      />

      {art.motif}

      {/* plate frame + caption rule, always horizontal */}
      <rect x={20} y={20} width={W - 40} height={H - 40} fill="none" stroke="var(--hm-hairline)" strokeWidth={1} />
      <line x1={40} y1={H - 44} x2={W - 40} y2={H - 44} stroke="var(--hm-hairline)" strokeWidth={1} />
      {!compact && caption ? (
        <text
          x={W / 2}
          y={H - 24}
          textAnchor="middle"
          fontFamily="var(--hm-font-hand)"
          fontSize="15"
          fill="var(--hm-ink-soft)"
          opacity={0.9}
        >
          {caption.length > 26 ? `${caption.slice(0, 25)}…` : caption}
        </text>
      ) : null}
    </svg>
  )
}

/** A small helper for callers that only have a SpecimenSeed. */
export function SpecimenArtFromSeed({ seed, className, label }: { seed: SpecimenSeed; className?: string; label?: string }) {
  return <SpecimenArt seed={seed.seed} mode={seed.mode} season={seed.season} caption={seed.caption} className={className} label={label} />
}
