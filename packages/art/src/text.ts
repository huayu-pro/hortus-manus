import type { Ctx } from './types'

/** letterSpacing exists on @napi-rs/canvas and modern browsers, but not in older TS DOM libs. */
export function setTracking(ctx: Ctx, px: number): void {
  try {
    ;(ctx as Ctx & { letterSpacing?: string }).letterSpacing = `${px}px`
  } catch {
    /* older canvas: no tracking support, ignore */
  }
}

export function setFont(ctx: Ctx, font: string, tracking = 0): void {
  ctx.font = font
  setTracking(ctx, tracking)
}

export function textWidth(ctx: Ctx, text: string): number {
  return ctx.measureText(text).width
}

/** Draw tracked text; returns advance width. */
export function drawText(ctx: Ctx, text: string, x: number, y: number, font: string, color: string, tracking = 0): number {
  setFont(ctx, font, tracking)
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
  setTracking(ctx, 0)
  return textWidth(ctx, text)
}

export function rightText(ctx: Ctx, text: string, right: number, y: number, font: string, color: string, tracking = 0): void {
  setFont(ctx, font, tracking)
  ctx.fillStyle = color
  ctx.textAlign = 'right'
  ctx.fillText(text, right, y)
  ctx.textAlign = 'left'
  setTracking(ctx, 0)
}

export function centerText(ctx: Ctx, text: string, cx: number, y: number, font: string, color: string, tracking = 0): void {
  setFont(ctx, font, tracking)
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.fillText(text, cx, y)
  ctx.textAlign = 'left'
  setTracking(ctx, 0)
}

/**
 * Wrap mixed CJK/Latin text. Latin words break at spaces; CJK breaks anywhere.
 * Returns at most maxLines lines, the last one ellipsised when needed.
 */
export function wrapText(ctx: Ctx, text: string, maxWidth: number, font: string, maxLines = 3): string[] {
  setFont(ctx, font, 0)
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return ['']
  const lines: string[] = []
  let line = ''
  const tokens = tokenize(clean)
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]
    const candidate = line + tok
    if (line && textWidth(ctx, candidate) > maxWidth) {
      lines.push(line.trimEnd())
      if (lines.length === maxLines) break
      line = tok.trimStart()
    } else {
      line = candidate
    }
    if (lines.length === maxLines) break
  }
  if (lines.length < maxLines && line.trim()) lines.push(line.trimEnd())
  if (lines.length === maxLines) {
    const joined = lines.join('')
    const rest = clean.slice(joined.length).trim()
    if (rest) {
      let last = lines[maxLines - 1]
      while (last && textWidth(ctx, `${last}…`) > maxWidth) last = last.slice(0, -1)
      lines[maxLines - 1] = `${last}…`
    }
  }
  return lines.length ? lines : ['']
}

function tokenize(text: string): string[] {
  const out: string[] = []
  let buf = ''
  for (const ch of text) {
    if (/\s/.test(ch)) {
      buf += ch
      out.push(buf)
      buf = ''
    } else if (/[\u2E80-\u9FFF\uF900-\uFAFF\u3000-\u303F\uFF00-\uFFEF]/.test(ch)) {
      if (buf) out.push(buf)
      buf = ''
      out.push(ch)
    } else {
      buf += ch
    }
  }
  if (buf) out.push(buf)
  return out
}

/** Fit a font size down until the text fits maxWidth (single line). */
export function fitFont(ctx: Ctx, text: string, family: string, startSize: number, maxWidth: number, minSize = 18): number {
  let size = startSize
  while (size > minSize) {
    setFont(ctx, `${size}px ${family}`, 0)
    if (textWidth(ctx, text) <= maxWidth) break
    size -= 2
  }
  return size
}
