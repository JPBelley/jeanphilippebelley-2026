'use client'

import { useEffect, useRef, useState } from 'react'

const MESSAGE = "Hey! Welcome. Click on my face anytime if you have questions about me or the site. I'm around 👋"

export default function SpeechBubble({ headRef }) {
  const [displayed, setDisplayed] = useState('')
  const [visible,   setVisible]   = useState(true)
  const [fading,    setFading]    = useState(false)
  const [fadeIn,    setFadeIn]    = useState(false)
  const wrapRef = useRef(null)

  // Typewriter
  useEffect(() => {
    const fadeInTimer = setTimeout(() => setFadeIn(true), 30)
    return () => clearTimeout(fadeInTimer)
  }, [])

  useEffect(() => {
    let i = 0
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        i++
        setDisplayed(MESSAGE.slice(0, i))
        if (i >= MESSAGE.length) {
          clearInterval(interval)
          setTimeout(() => {
            setFading(true)
            setTimeout(() => setVisible(false), 600)
          }, 2000)
        }
      }, 38)
      return () => clearInterval(interval)
    }, 1200)
    return () => clearTimeout(startDelay)
  }, [])

  // Track head position via getBoundingClientRect every frame
  useEffect(() => {
    if (!headRef) return
    let raf
    function track() {
      raf = requestAnimationFrame(track)
      const el = wrapRef.current
      const head = headRef.current
      if (!el || !head) return
      const rect = head.getBoundingClientRect()
      // Mirror the original absolute placement: right: 60%, bottom: 44% of the head rect
      const right  = window.innerWidth - (rect.right - rect.width * 0.6)
      const bottom = window.innerHeight - (rect.bottom - rect.height * 0.44)
      el.style.right  = right  + 'px'
      el.style.bottom = bottom + 'px'
    }
    raf = requestAnimationFrame(track)
    return () => cancelAnimationFrame(raf)
  }, [headRef])

  if (!visible) return null

  return (
    <div
      ref={wrapRef}
      className="fixed pointer-events-none max-[768px]:hidden"
      style={{
        width: 190,
        zIndex: 11,
        transition: 'opacity 0.6s ease',
        opacity: fading ? 0 : fadeIn ? 1 : 0,
      }}
    >
      <div
        className="relative rounded-2xl px-4 py-3 shadow-xl"
        style={{
          background: 'rgba(26, 21, 48, 0.95)',
          border: '1px solid rgba(124,92,255,0.35)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Tail pointing right toward the head */}
        <div
          style={{
            position: 'absolute',
            right: -8,
            bottom: 12,
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: '8px solid rgba(124,92,255,0.35)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: -6,
            bottom: 13,
            width: 0,
            height: 0,
            borderTop: '7px solid transparent',
            borderBottom: '7px solid transparent',
            borderLeft: '7px solid rgba(26,21,48,0.95)',
          }}
        />

        <p className="font-mono text-[9px] leading-[1.65]" style={{ color: 'rgba(232,234,240,0.9)' }}>
          {displayed}
          {displayed.length < MESSAGE.length && (
            <span
              className="inline-block w-[2px] h-[7px] bg-violet ml-[2px] align-middle"
              style={{ animation: 'blink 0.7s step-end infinite' }}
            />
          )}
        </p>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
