'use client'

import { useEffect, useState } from 'react'

const WORD         = 'WELCOME'
const LETTER_DELAY = 85
const LETTER_DUR   = 520
const HOLD         = 380   // pause after last letter

// Curtain in — ease-out: accelerates then decelerates as weight settles
const CURTAIN_IN_DUR    = 900
const CURTAIN_IN_EASE   = 'cubic-bezier(0.16, 1, 0.3, 1)'

// Brief hold while curtain covers screen
const CURTAIN_HOLD      = 160

// Curtain out — ease-in: starts slow then gravity pulls it fast
const CURTAIN_OUT_DUR   = 680
const CURTAIN_OUT_EASE  = 'cubic-bezier(0.7, 0, 1, 1)'

const SKEW = -3  // degrees — angled leading edge

export default function HeroIntro({ onComplete }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [lettersOut,   setLettersOut]   = useState(false)
  const [phase, setPhase] = useState('idle') // idle → in → out → done
  const [done,  setDone]  = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const timers = []

    WORD.split('').forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleCount(i + 1), i * LETTER_DELAY + 60))
    })

    const allDone = (WORD.length - 1) * LETTER_DELAY + 60 + LETTER_DUR

    // Curtain falls in + letters fade out simultaneously
    timers.push(setTimeout(() => {
      setLettersOut(true)
      setPhase('in')
    }, allDone + HOLD))

    // Curtain exits
    timers.push(setTimeout(() => {
      setPhase('out')
    }, allDone + HOLD + CURTAIN_IN_DUR + CURTAIN_HOLD))

    // Done
    timers.push(setTimeout(() => {
      setDone(true)
      document.body.style.overflow = ''
      onComplete?.()
    }, allDone + HOLD + CURTAIN_IN_DUR + CURTAIN_HOLD + CURTAIN_OUT_DUR))

    return () => timers.forEach(clearTimeout)
  }, [])

  if (done) return null

  const curtainTransform =
    phase === 'idle' ? 'translateY(-115vh)'  :
    phase === 'in'   ? 'translateY(0vh)'     :
                       'translateY(115vh)'

  const curtainTransition =
    phase === 'in'  ? `transform ${CURTAIN_IN_DUR}ms ${CURTAIN_IN_EASE}` :
    phase === 'out' ? `transform ${CURTAIN_OUT_DUR}ms ${CURTAIN_OUT_EASE}` :
                      'none'

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      zIndex:         9999,
      background:     'var(--color-bg)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      overflow:       'hidden',
      pointerEvents:  'none',
    }}>

      {/* Letters */}
      <div style={{
        display:    'flex',
        gap:        'clamp(4px, 1.5vw, 18px)',
        position:   'relative',
        zIndex:     1,
        userSelect: 'none',
        opacity:    lettersOut ? 0 : 1,
        transition: lettersOut ? 'opacity 320ms ease' : 'none',
      }}>
        {WORD.split('').map((letter, i) => {
          const visible = i < visibleCount
          return (
            <span key={i} style={{
              fontSize:      'clamp(52px, 11vw, 130px)',
              fontFamily:    'var(--font-head)',
              fontWeight:    700,
              letterSpacing: '-0.04em',
              color:         'var(--color-foreground)',
              opacity:       visible ? 1 : 0,
              transform:     visible ? 'translateY(0px)' : 'translateY(52px)',
              transition:    visible
                ? `opacity ${LETTER_DUR}ms ease, transform ${LETTER_DUR}ms cubic-bezier(0.22,1,0.36,1)`
                : 'none',
              display:       'inline-block',
            }}>
              {letter}
            </span>
          )
        })}
      </div>

      {/* Angled curtain */}
      <div style={{
        position:        'absolute',
        left:            '-8%',
        width:           '116%',
        height:          '130vh',
        background:      'var(--color-violet)',
        transform:       `${curtainTransform} skewY(${SKEW}deg)`,
        transformOrigin: 'left center',
        transition:      curtainTransition,
        zIndex:          2,
        willChange:      'transform',
      }} />

    </div>
  )
}
