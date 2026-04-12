'use client'

import { useEffect, useState } from 'react'

const WORD1        = 'WELCOME'
const WORD2        = 'TO MY HUB'
const LETTER_DELAY = 85
const LETTER_DUR   = 520
const HOLD         = 380   // pause after WELCOME before curtain

const CURTAIN_IN_DUR  = 900
const CURTAIN_IN_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
const CURTAIN_HOLD    = 160  // pause after curtain lands before WORD2 starts

const WORD2_DELAY  = 80    // stagger between WORD2 letters (slightly faster)
const WORD2_DUR    = 480   // each WORD2 letter animation
const POST_WORD2   = 280   // pause after WORD2 fully written before curtain exits

const CURTAIN_OUT_DUR  = 680
const CURTAIN_OUT_EASE = 'cubic-bezier(0.7, 0, 1, 1)'

const SKEW = -3

// Total duration until word2 last letter is fully visible
function word2Done() {
  return (WORD2.replace(/ /g, '').length - 1) * WORD2_DELAY + WORD2_DUR
}

export default function HeroIntro({ onComplete }) {
  const [count1,     setCount1]     = useState(0)   // WELCOME letters
  const [lettersOut, setLettersOut] = useState(false)
  const [count2,     setCount2]     = useState(0)   // TO MY HUB letters
  const [phase,      setPhase]      = useState('idle')
  const [done,       setDone]       = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const timers = []

    // ── WORD1: WELCOME ────────────────────────────────────────────────────
    WORD1.split('').forEach((_, i) => {
      timers.push(setTimeout(() => setCount1(i + 1), i * LETTER_DELAY + 60))
    })
    const word1Done = (WORD1.length - 1) * LETTER_DELAY + 60 + LETTER_DUR

    // ── Curtain in ────────────────────────────────────────────────────────
    const curtainStart = word1Done + HOLD
    timers.push(setTimeout(() => {
      setLettersOut(true)
      setPhase('in')
    }, curtainStart))

    // ── WORD2: TO MY HUB — starts after curtain has settled ───────────────
    const word2Start = curtainStart + CURTAIN_IN_DUR + CURTAIN_HOLD
    let letterIdx = 0
    WORD2.split('').forEach((char) => {
      if (char === ' ') return
      const idx = letterIdx++
      timers.push(setTimeout(
        () => setCount2(idx + 1),
        word2Start + idx * WORD2_DELAY
      ))
    })

    // ── Curtain out — after WORD2 fully written + small hold ──────────────
    const curtainOutAt = word2Start + word2Done() + POST_WORD2
    timers.push(setTimeout(() => setPhase('out'), curtainOutAt))

    // ── Done ──────────────────────────────────────────────────────────────
    timers.push(setTimeout(() => {
      setDone(true)
      document.body.style.overflow = ''
      onComplete?.()
    }, curtainOutAt + CURTAIN_OUT_DUR))

    return () => timers.forEach(clearTimeout)
  }, [])

  if (done) return null

  const curtainTransform =
    phase === 'idle' ? 'translateY(-115vh)' :
    phase === 'in'   ? 'translateY(0vh)'    :
                       'translateY(115vh)'

  const curtainTransition =
    phase === 'in'  ? `transform ${CURTAIN_IN_DUR}ms ${CURTAIN_IN_EASE}` :
    phase === 'out' ? `transform ${CURTAIN_OUT_DUR}ms ${CURTAIN_OUT_EASE}` :
                      'none'

  // Track letter index separately for rendering (spaces don't consume a slot)
  let renderIdx2 = 0

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

      {/* ── WELCOME ── */}
      <div style={{
        display:    'flex',
        gap:        'clamp(4px, 1.5vw, 18px)',
        position:   'relative',
        zIndex:     1,
        userSelect: 'none',
        opacity:    lettersOut ? 0 : 1,
        transition: lettersOut ? 'opacity 300ms ease' : 'none',
      }}>
        {WORD1.split('').map((letter, i) => {
          const visible = i < count1
          return (
            <span key={i} style={{
              fontSize:      'clamp(52px, 11vw, 130px)',
              fontFamily:    'var(--font-head)',
              fontWeight:    900,
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

      {/* ── Angled curtain ── */}
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
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
      }}>

        {/* ── TO MY HUB — inside the curtain, white letters ── */}
        <div style={{
          display:       'flex',
          gap:           'clamp(3px, 1.2vw, 14px)',
          userSelect:    'none',
          transform:     `skewY(${-SKEW}deg)`, // counter-skew so text stays upright
        }}>
          {WORD2.split('').map((char, i) => {
            if (char === ' ') {
              return (
                <span key={i} style={{
                  display:  'inline-block',
                  width:    'clamp(16px, 3vw, 40px)',
                }} />
              )
            }
            const idx     = renderIdx2++
            const visible = idx < count2
            return (
              <span key={i} style={{
                fontSize:      'clamp(38px, 8vw, 96px)',
                fontFamily:    'var(--font-head)',
                fontWeight:    900,
                letterSpacing: '-0.04em',
                color:         '#ffffff',
                opacity:       visible ? 1 : 0,
                transform:     visible ? 'translateY(0px)' : 'translateY(44px)',
                transition:    visible
                  ? `opacity ${WORD2_DUR}ms ease, transform ${WORD2_DUR}ms cubic-bezier(0.22,1,0.36,1)`
                  : 'none',
                display:       'inline-block',
              }}>
                {char}
              </span>
            )
          })}
        </div>

      </div>

    </div>
  )
}
