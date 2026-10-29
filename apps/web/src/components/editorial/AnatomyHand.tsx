/**
 * HORTUS MANUS — 21-landmark anatomy plate (owner: stage).
 *
 * MediaPipe hand order, drawn as an engraving: bones in sage hairlines, joints
 * in pollen. Hover or keyboard-focus any joint (in the drawing or in the list)
 * to read its name. The drawing is decorative; the real interface is the list
 * of buttons, so screen readers get the same 21 names.
 */

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

interface Landmark {
  x: number
  y: number
}

/** Stylised but ordered exactly like MediaPipe: wrist → thumb → index → middle → ring → pinky. */
const LANDMARKS: Landmark[] = [
  { x: 204, y: 466 }, // 0 wrist
  { x: 158, y: 414 }, // 1 thumb CMC
  { x: 126, y: 360 }, // 2 thumb MCP
  { x: 98, y: 316 }, // 3 thumb IP
  { x: 78, y: 274 }, // 4 thumb tip
  { x: 162, y: 316 }, // 5 index MCP
  { x: 154, y: 238 }, // 6 index PIP
  { x: 149, y: 188 }, // 7 index DIP
  { x: 146, y: 150 }, // 8 index tip
  { x: 208, y: 306 }, // 9 middle MCP
  { x: 210, y: 220 }, // 10 middle PIP
  { x: 210, y: 168 }, // 11 middle DIP
  { x: 211, y: 128 }, // 12 middle tip
  { x: 256, y: 316 }, // 13 ring MCP
  { x: 266, y: 240 }, // 14 ring PIP
  { x: 272, y: 190 }, // 15 ring DIP
  { x: 277, y: 152 }, // 16 ring tip
  { x: 300, y: 346 }, // 17 pinky MCP
  { x: 318, y: 288 }, // 18 pinky PIP
  { x: 328, y: 248 }, // 19 pinky DIP
  { x: 336, y: 214 }, // 20 pinky tip
]

const BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
]

/** Thick soft strokes behind the bones create a hand silhouette without a bitmap. */
const SILHOUETTE: { chain: number[]; width: number }[] = [
  { chain: [0, 1, 2, 3, 4], width: 34 },
  { chain: [0, 5, 6, 7, 8], width: 30 },
  { chain: [5, 9, 10, 11, 12], width: 32 },
  { chain: [9, 13, 14, 15, 16], width: 28 },
  { chain: [13, 17, 18, 19, 20], width: 23 },
]

function polyline(chain: number[]): string {
  return chain
    .map((idx, i) => {
      const p = LANDMARKS[idx]
      return `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`
    })
    .join(' ')
}

export interface AnatomyHandProps {
  labels: readonly string[]
  listLabel?: string
  /** smaller version for the home field-note act */
  compact?: boolean
  className?: string
  /** optional extra content pinned into the plate corner */
  aside?: ReactNode
}

export function AnatomyHand({ labels, listLabel = '21 landmarks', compact = false, className, aside }: AnatomyHandProps) {
  const [active, setActive] = useState<number | null>(null)

  const labelRows = useMemo(
    () =>
      labels.map((label, index) => ({
        label,
        index,
        roman: index < 10 ? `0${index}` : String(index),
      })),
    [labels],
  )

  const activeLabel = active !== null ? labels[active] : null

  return (
    <div className={`hm-anatomy${compact ? ' hm-anatomy--compact' : ''}${className ? ` ${className}` : ''}`}>
      <div className="hm-anatomy__plate">
        <svg
          className="hm-anatomy__svg"
          viewBox="0 0 420 520"
          role="group"
          aria-label={labels.join(' · ')}
        >
          {/* soft silhouette */}
          <g stroke="var(--hm-sage)" strokeOpacity="0.12" strokeLinecap="round" fill="none">
            {SILHOUETTE.map(({ chain, width }) => (
              <path key={chain.join('-')} d={polyline(chain)} strokeWidth={width} />
            ))}
            <ellipse cx={228} cy={382} rx={92} ry={80} fill="var(--hm-sage)" fillOpacity={0.1} stroke="none" transform="rotate(-6 228 382)" />
          </g>

          {/* bones */}
          <g stroke="var(--hm-sage)" strokeWidth="0.9" strokeLinecap="square" fill="none" opacity="0.8">
            {BONES.map(([a, b]) => {
              const p = LANDMARKS[a]
              const q = LANDMARKS[b]
              return <line key={`${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} />
            })}
          </g>

          {/* joints */}
          {LANDMARKS.map((point, index) => {
            const isActive = active === index
            return (
              <g
                key={index}
                className="hm-anatomy__joint"
                aria-hidden="true"
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                data-active={isActive ? 'true' : undefined}
              >
                <circle cx={point.x} cy={point.y} r={isActive ? 8 : 4.6} className="hm-anatomy__dot" />
                {!compact ? (
                  <text x={point.x + 9} y={point.y - 7} className="hm-anatomy__num">
                    {index}
                  </text>
                ) : null}
              </g>
            )
          })}

          {activeLabel && !compact ? (
            <g className="hm-anatomy__readout">
              <line x1={26} y1={492} x2={394} y2={492} stroke="var(--hm-hairline-strong)" strokeWidth="1" />
              <text x={26} y={512} className="hm-anatomy__readout-label">
                {String(active).padStart(2, '0')} · {activeLabel}
              </text>
            </g>
          ) : null}
        </svg>
        {aside ? <div className="hm-anatomy__aside">{aside}</div> : null}
      </div>

      <ol className="hm-anatomy__list" aria-label={listLabel}>
        {labelRows.map(({ label, index, roman }) => (
          <li key={index}>
            <button
              type="button"
              className="hm-anatomy__item"
              data-active={active === index ? 'true' : undefined}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
            >
              <span className="hm-anatomy__item-num">{roman}</span>
              <span className="hm-anatomy__item-label">{label}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
