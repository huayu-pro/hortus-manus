import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}