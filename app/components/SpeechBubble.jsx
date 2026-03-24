'use client'

import { useEffect, useState } from 'react'

const MESSAGE = "Hey there! Welcome to my little corner of the web. Feel free to poke around my experiments or catch up on the blog. Hope you find something cool 👋"

export default function SpeechBubble() {
  const [displayed, setDisplayed]   = useState('')
  const [visible,   setVisible]     = useState(true)
  const [fading,    setFading]      = useState(false)
  const [fadeIn,    setFadeIn]      = useState(false)

  useEffect(() => {
    const fadeInTimer = setTimeout(() => setFadeIn(true), 30)
    return () => clearTimeout(fadeInTimer)
  }, [])

  useEffect(() => {
    let i = 0
    // Small delay before starting to type
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        i++
        setDisplayed(MESSAGE.slice(0, i))
        if (i >= MESSAGE.length) {
          clearInterval(interval)
          // Linger for 4s then fade out
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

  if (!visible) return null

  return (
    <div
      className="absolute pointer-events-none max-[768px]:hidden"
      style={{
        bottom: '44%',
        right: '60%',
        width: 190,
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

        <p className="font-mono text-[6px] leading-[1.65] text-foreground">
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
