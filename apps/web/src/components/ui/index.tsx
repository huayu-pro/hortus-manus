/**
 * HORTUS MANUS — UI primitives (owner: stage).
 * shadcn-style API on top of Radix, but styled entirely with the --hm-* tokens.
 * No new UI library, no Tailwind class soup: each primitive ships its own
 * `ui.css` class so pages stay declarative.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as SliderPrimitive from '@radix-ui/react-slider'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import '@/styles/ui.css'

/* -------------------------------------------------------------------------- */
/* Button                                                                      */
/* -------------------------------------------------------------------------- */

type ButtonVariant = 'solid' | 'outline' | 'quiet' | 'stamp' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** trailing glyph, rendered aria-hidden unless the button has no label */
  glyph?: ReactNode
  /** magnetic pull on fine pointers — D4 */
  magnetic?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'solid', size = 'md', glyph, magnetic = false, children, ...rest },
  ref,
) {
  const localRef = useRef<HTMLButtonElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!magnetic || reducedMotion) return
      const el = localRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const dx = (event.clientX - (r.left + r.width / 2)) / r.width
      const dy = (event.clientY - (r.top + r.height / 2)) / r.height
      el.style.setProperty('--hm-magnet-x', `${(dx * 6).toFixed(2)}px`)
      el.style.setProperty('--hm-magnet-y', `${(dy * 4).toFixed(2)}px`)
    },
    [magnetic, reducedMotion],
  )

  const handleLeave = useCallback(() => {
    const el = localRef.current
    if (!el) return
    el.style.setProperty('--hm-magnet-x', '0px')
    el.style.setProperty('--hm-magnet-y', '0px')
  }, [])

  return (
    <button
      ref={(node) => {
        localRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      type={rest.type ?? 'button'}
      className={cn('hm-btn', `hm-btn--${variant}`, `hm-btn--${size}`, className)}
      data-magnetic={magnetic ? 'true' : undefined}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...rest}
    >
      <span className="hm-btn__label">{children}</span>
      {glyph ? (
        <span className="hm-btn__glyph" aria-hidden="true">
          {glyph}
        </span>
      ) : null}
    </button>
  )
})

/* -------------------------------------------------------------------------- */
/* TextLink — inline editorial link                                            */
/* -------------------------------------------------------------------------- */

export interface TextLinkProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  /** underline by default; nav links opt out with quiet */
  quiet?: boolean
}

/** Used inside <Link> wrappers where the anchor itself is owned by react-router. */
export function TextLink({ children, quiet, className, ...rest }: TextLinkProps) {
  return (
    <span className={cn('hm-textlink', quiet && 'hm-textlink--quiet', className)} {...rest}>
      {children}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Card / Plate                                                                */
/* -------------------------------------------------------------------------- */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** paper-deep ground used for specimen cards */
  tone?: 'paper' | 'deep' | 'ink'
  /** ±2° physical tilt, only for plates */
  tilt?: 'a' | 'b' | 'c' | 'none'
  frame?: boolean
}

export function Card({ className, tone = 'paper', tilt = 'none', frame = false, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'hm-card',
        `hm-card--${tone}`,
        frame && 'hm-card--frame',
        tilt !== 'none' && `hm-card--tilt-${tilt}`,
        className,
      )}
      {...rest}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Label / Readout / Rule                                                      */
/* -------------------------------------------------------------------------- */

export function Label({ className, children, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('hm-label', className)} {...rest}>
      {children}
    </span>
  )
}

export function Rule({ className, ...rest }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('hm-rule', className)} {...rest} />
}

/** A live readout: label + value + unit, always mono, tabular. */
export function Readout({
  label,
  value,
  unit,
  live = false,
  className,
  title,
}: {
  label: string
  value: string | number
  unit?: string
  live?: boolean
  className?: string
  title?: string
}) {
  return (
    <div className={cn('hm-readout', className)} title={title}>
      <span className="hm-readout__label">{label}</span>
      <span className="hm-readout__value" data-live={live ? 'true' : undefined}>
        {value}
        {unit ? <span className="hm-readout__unit">{unit}</span> : null}
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Dialog                                                                      */
/* -------------------------------------------------------------------------- */

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description

export interface DialogContentProps {
  children: ReactNode
  className?: string
  /** paper sheet (default) or dark stage sheet */
  tone?: 'paper' | 'night'
  /** hide the built-in close button when the content provides its own */
  hideClose?: boolean
  closeLabel: string
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onPointerDownOutside?: (event: Event) => void
}

export function DialogContent({
  children,
  className,
  tone = 'paper',
  hideClose = false,
  closeLabel,
  ...rest
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="hm-dialog__overlay" />
      <DialogPrimitive.Content
        className={cn('hm-dialog__content', `hm-dialog__content--${tone}`, className)}
        {...rest}
      >
        {children}
        {hideClose ? null : (
          <DialogPrimitive.Close className="hm-dialog__close" aria-label={closeLabel}>
            <span aria-hidden="true">×</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

/* -------------------------------------------------------------------------- */
/* Tooltip                                                                     */
/* -------------------------------------------------------------------------- */

export const TooltipProvider = TooltipPrimitive.Provider

export function Tooltip({
  children,
  content,
  side = 'bottom',
  delay = 220,
}: {
  children: ReactNode
  content: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}) {
  return (
    <TooltipPrimitive.Root delayDuration={delay}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content className="hm-tooltip" side={side} sideOffset={8}>
          {content}
          <TooltipPrimitive.Arrow className="hm-tooltip__arrow" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

/* -------------------------------------------------------------------------- */
/* Switch                                                                      */
/* -------------------------------------------------------------------------- */

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  /** visible text next to the track */
  text?: string
  disabled?: boolean
  className?: string
  id?: string
}

export function Switch({ checked, onCheckedChange, label, text, disabled, className, id }: SwitchProps) {
  const autoId = useId()
  const switchId = id ?? autoId
  return (
    <label className={cn('hm-switch', className)} htmlFor={switchId}>
      <SwitchPrimitive.Root
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="hm-switch__track"
        aria-label={label}
      >
        <SwitchPrimitive.Thumb className="hm-switch__thumb" />
      </SwitchPrimitive.Root>
      {text ? <span className="hm-switch__text">{text}</span> : null}
    </label>
  )
}

/* -------------------------------------------------------------------------- */
/* Slider                                                                      */
/* -------------------------------------------------------------------------- */

export interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onValueChange: (value: number) => void
  label: string
  showValue?: boolean
  className?: string
  disabled?: boolean
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  label,
  showValue = true,
  className,
  disabled,
}: SliderProps) {
  return (
    <div className={cn('hm-slider', className)}>
      <SliderPrimitive.Root
        className="hm-slider__root"
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={([next]) => onValueChange(next)}
        aria-label={label}
      >
        <SliderPrimitive.Track className="hm-slider__track">
          <SliderPrimitive.Range className="hm-slider__range" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="hm-slider__thumb" />
      </SliderPrimitive.Root>
      {showValue ? <span className="hm-slider__value">{Math.round(value)}</span> : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Tabs                                                                        */
/* -------------------------------------------------------------------------- */

export interface TabItem {
  value: string
  label: string
  /** optional count badge, e.g. specimen count per season */
  badge?: string | number
}

export function Tabs({
  items,
  value,
  onValueChange,
  label,
  className,
}: {
  items: TabItem[]
  value: string
  onValueChange: (value: string) => void
  label: string
  className?: string
}) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange} className={cn('hm-tabs', className)}>
      <TabsPrimitive.List className="hm-tabs__list" aria-label={label}>
        {items.map((item) => (
          <TabsPrimitive.Trigger key={item.value} value={item.value} className="hm-tabs__trigger">
            {item.label}
            {item.badge !== undefined ? <span className="hm-tabs__badge">{item.badge}</span> : null}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  )
}

/* -------------------------------------------------------------------------- */
/* Popover                                                                     */
/* -------------------------------------------------------------------------- */

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export const PopoverClose = PopoverPrimitive.Close

export function PopoverContent({
  children,
  className,
  align = 'start',
  sideOffset = 8,
  ariaLabel,
}: {
  children: ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  ariaLabel?: string
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className={cn('hm-popover', className)}
        align={align}
        sideOffset={sideOffset}
        aria-label={ariaLabel}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

/* -------------------------------------------------------------------------- */
/* Field / Input                                                               */
/* -------------------------------------------------------------------------- */

export interface FieldProps {
  label: string
  hint?: string
  error?: string
  count?: { current: number; max: number }
  children: ReactNode
  htmlFor?: string
  className?: string
}

export function Field({ label, hint, error, count, children, htmlFor, className }: FieldProps) {
  return (
    <div className={cn('hm-field', className)} data-invalid={error ? 'true' : undefined}>
      <div className="hm-field__head">
        <label className="hm-field__label" htmlFor={htmlFor}>
          {label}
        </label>
        {count ? (
          <span className="hm-field__count" aria-hidden="true">
            {count.current}/{count.max}
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p className="hm-field__error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="hm-field__hint">{hint}</p>
      ) : null}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn('hm-input', className)} {...rest} />
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cn('hm-textarea', className)} {...rest} />
  },
)

/* -------------------------------------------------------------------------- */
/* Skeleton — paper, never a shimmer                                           */
/* -------------------------------------------------------------------------- */

export function Skeleton({ className, lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={cn('hm-skeleton', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className="hm-skeleton__line" />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Stamp — specimen stamp with brass rim (D4)                                  */
/* -------------------------------------------------------------------------- */

export function Stamp({
  children,
  className,
  tone = 'peony',
}: {
  children: ReactNode
  className?: string
  tone?: 'peony' | 'moss' | 'pollen' | 'pond'
}) {
  return (
    <span className={cn('hm-stamp', `hm-stamp--${tone}`, className)}>
      <span className="hm-stamp__inner">{children}</span>
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Visually hidden helper                                                      */
/* -------------------------------------------------------------------------- */

export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="hm-visually-hidden">{children}</span>
}

/* -------------------------------------------------------------------------- */
/* useMediaQuery — for motion/pointer decisions                                */
/* -------------------------------------------------------------------------- */

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function useFinePointer(): boolean {
  return useMediaQuery('(pointer: fine)')
}

/* -------------------------------------------------------------------------- */
/* useCopyFeedback — "copied" for 1.8s                                         */
/* -------------------------------------------------------------------------- */

export function useCopyFeedback(timeout = 1800) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)

  const flag = useCallback(() => {
    setCopied(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), timeout)
  }, [timeout])

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  return useMemo(() => ({ copied, flag }), [copied, flag])
}
