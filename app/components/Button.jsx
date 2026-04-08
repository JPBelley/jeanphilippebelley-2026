'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ── Scramble helpers ──────────────────────────────────────────────────────────
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const DIGIT = '0123456789'

function randomChar(original) {
  if (original >= 'a' && original <= 'z') return LOWER[Math.floor(Math.random() * 26)]
  if (original >= '0' && original <= '9') return DIGIT[Math.floor(Math.random() * 10)]
  return UPPER[Math.floor(Math.random() * 26)]
}

function useScramble(text) {
  const [display, setDisplay] = useState(text)
  const timerRef = useRef(null)

  const start = useCallback(() => {
    let tick = 0
    const TICKS = 14  // total animation ticks
    const DELAY = 3   // ticks of full scramble before revealing left→right

    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      tick++
      const revealFraction = Math.max(0, (tick - DELAY) / (TICKS - DELAY))

      setDisplay(
        text.split('').map((char, i) => {
          if (!/[a-zA-Z0-9]/.test(char)) return char          // preserve spaces, →, etc.
          if (i / text.length < revealFraction) return char    // this char is locked in
          return randomChar(char)                              // still scrambling
        }).join('')
      )

      if (tick >= TICKS) {
        clearInterval(timerRef.current)
        setDisplay(text)
      }
    }, 35)
  }, [text])

  const stop = useCallback(() => {
    clearInterval(timerRef.current)
    setDisplay(text)
  }, [text])

  useEffect(() => () => clearInterval(timerRef.current), [])

  return { display, start, stop }
}

// ── Variants ──────────────────────────────────────────────────────────────────
const variants = {
  primary:
    'px-8 py-[13px] bg-violet text-white font-head font-semibold text-[14px] tracking-[0.03em] rounded-md no-underline transition-[background,transform,box-shadow] duration-200 hover:bg-[#9070ff] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(124,92,255,0.35)] max-[640px]:text-center',
  secondary:
    'px-8 py-[13px] bg-transparent text-foreground font-head font-medium text-[14px] border border-ui rounded-md no-underline transition-[border-color,color,transform] duration-200 hover:border-mint hover:text-mint hover:-translate-y-0.5 max-[640px]:text-center',
  link:
    'flex items-center justify-center gap-2 px-7 py-[14px] border border-ui text-muted no-underline font-mono text-[13px] tracking-[0.05em] rounded-md transition-all duration-200 hover:border-mint hover:text-mint hover:-translate-y-0.5',
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Button({ href, variant = 'primary', className = '', children, ...props }) {
  // Only scramble when children is a plain string — leaves JSX children untouched
  const label             = typeof children === 'string' ? children : null
  const { display, start, stop } = useScramble(label ?? '')
  const classes           = `${variants[variant]} ${className}`.trim()
  const content           = label ? display : children
  const handlers          = label ? { onMouseEnter: start, onMouseLeave: stop } : {}

  if (href) {
    return (
      <Link href={href} className={classes} {...handlers} {...props}>
        {content}
      </Link>
    )
  }

  return (
    <button className={classes} {...handlers} {...props}>
      {content}
    </button>
  )
}
