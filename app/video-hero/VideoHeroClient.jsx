'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── Chapters ─────────────────────────────────────────────────────────────────
// start/end are scroll progress (0–1). peak = when fully visible.
// position: 'left' | 'center' | 'right'
// size: 'xl' | 'lg' | 'md' | 'sm'
const CHAPTERS = [
  {
    start:    0.0,
    peak:     0.06,
    end:      0.20,
    position: 'center',
    size:     'xl',
    lines:    ['Jean-Philippe', 'Belley'],
    sub:      null,
  },
  {
    start:    0.22,
    peak:     0.28,
    end:      0.42,
    position: 'left',
    size:     'lg',
    lines:    ['Creative', 'Developer.'],
    sub:      'Full Stack · React · Vue · WordPress · Webflow',
  },
  {
    start:    0.44,
    peak:     0.50,
    end:      0.64,
    position: 'right',
    size:     'lg',
    lines:    ['WebGL &', 'Generative Art.'],
    sub:      'Canvas · GLSL · Three.js · Particles',
  },
  {
    start:    0.66,
    peak:     0.73,
    end:      0.84,
    position: 'center',
    size:     'lg',
    lines:    ['Always cooking', 'something new.'],
    sub:      null,
  },
  {
    start:    0.86,
    peak:     0.91,
    end:      1.0,
    position: 'center',
    size:     'md',
    lines:    ['jeanphilippebelley.com'],
    sub:      '→  View my work',
    cta:      true,
  },
]

const FADE_RANGE = 0.04

function chapterOpacity(ch, p) {
  if (p <= ch.start || p >= ch.end) return 0
  if (p < ch.peak) return (p - ch.start) / (ch.peak - ch.start)
  if (p > ch.end - FADE_RANGE) return (ch.end - p) / FADE_RANGE
  return 1
}

function chapterY(ch, p) {
  if (p < ch.peak) return (1 - (p - ch.start) / (ch.peak - ch.start)) * 28
  if (p > ch.end - FADE_RANGE) return ((ch.end - p) / FADE_RANGE - 1) * 20
  return 0
}

const FONT_SIZE = {
  xl: 'clamp(58px, 11vw, 136px)',
  lg: 'clamp(40px, 7.5vw, 96px)',
  md: 'clamp(28px, 4.5vw, 58px)',
  sm: 'clamp(20px, 3vw, 38px)',
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function VideoHeroClient() {
  const videoRef   = useRef(null)
  const sectionRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [ready,    setReady]    = useState(false)
  const rafRef     = useRef(null)
  const targetRef  = useRef(0)

  // Inject Google Fonts for this isolated page
  useEffect(() => {
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400&display=swap'
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [])

  // Seek the video via rAF to avoid thrashing
  const seekVideo = useCallback(() => {
    const video = videoRef.current
    if (video && video.readyState >= 2 && video.duration) {
      video.currentTime = targetRef.current * video.duration
    }
    rafRef.current = null
  }, [])

  useEffect(() => {
    const video   = videoRef.current
    const section = sectionRef.current
    if (!video || !section) return

    video.addEventListener('loadedmetadata', () => setReady(true))

    const onScroll = () => {
      const rect  = section.getBoundingClientRect()
      const total = section.offsetHeight - window.innerHeight
      const p     = Math.min(1, Math.max(0, -rect.top / total))

      targetRef.current = p
      setProgress(p)

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(seekVideo)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [seekVideo])

  return (
    // Tall scroll container — 500vh gives the user comfortable scrubbing room
    <div ref={sectionRef} style={{ height: '500vh', position: 'relative' }}>

      {/* Sticky viewport */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
      }}>

        {/* ── Video ── */}
        <video
          ref={videoRef}
          src="/website-video.mp4"
          preload="auto"
          muted
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: ready ? 'block' : 'none',
          }}
        />

        {/* ── Gradient vignette — darkens edges so text stays readable ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: [
            'linear-gradient(to bottom,',
            '  rgba(0,0,0,0.45) 0%,',
            '  rgba(0,0,0,0.0)  30%,',
            '  rgba(0,0,0,0.0)  65%,',
            '  rgba(0,0,0,0.55) 100%)',
          ].join(''),
          pointerEvents: 'none',
        }} />

        {/* ── Progress bar ── */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 2,
          background: 'rgba(255,255,255,0.08)',
          zIndex: 10,
        }}>
          <div style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: 'rgba(255,255,255,0.45)',
          }} />
        </div>

        {/* ── Text chapters ── */}
        {CHAPTERS.map((ch, i) => {
          const op = chapterOpacity(ch, progress)
          if (op <= 0.005) return null

          const ty  = chapterY(ch, progress)
          const pos = ch.position

          const wrapStyle = {
            position: 'absolute',
            zIndex:   5,
            opacity:  op,
            transform: pos === 'center'
              ? `translate(-50%, ${ty}px)`
              : `translateY(${ty}px)`,
            ...(pos === 'left'   && { left:  'clamp(36px, 7vw, 110px)' }),
            ...(pos === 'right'  && { right: 'clamp(36px, 7vw, 110px)', textAlign: 'right' }),
            ...(pos === 'center' && { left:  '50%', textAlign: 'center' }),
            bottom: 'clamp(60px, 10vh, 110px)',
          }

          return (
            <div key={i} style={wrapStyle}>
              {ch.lines.map((line, li) => (
                <div key={li} style={{
                  fontFamily:    '"Instrument Serif", Georgia, serif',
                  fontSize:      FONT_SIZE[ch.size],
                  fontStyle:     'italic',
                  fontWeight:    400,
                  color:         '#fff',
                  lineHeight:    1.0,
                  letterSpacing: '-0.02em',
                  display:       'block',
                  textShadow:    '0 2px 40px rgba(0,0,0,0.4)',
                }}>
                  {line}
                </div>
              ))}

              {ch.sub && (
                <div style={{
                  fontFamily:    '"DM Mono", "Courier New", monospace',
                  fontSize:      '11px',
                  fontWeight:    300,
                  color:         'rgba(255,255,255,0.5)',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  marginTop:     ch.cta ? 20 : 14,
                  ...(ch.cta && {
                    fontSize:  '14px',
                    color:     'rgba(255,255,255,0.7)',
                    letterSpacing: '0.08em',
                  }),
                }}>
                  {ch.sub}
                </div>
              )}
            </div>
          )
        })}

        {/* ── Scroll hint (only at the very start) ── */}
        {progress < 0.04 && (
          <div style={{
            position:      'absolute',
            bottom:        28,
            left:          '50%',
            transform:     'translateX(-50%)',
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           8,
            opacity:       1 - progress / 0.04,
            zIndex:        5,
            pointerEvents: 'none',
          }}>
            <span style={{
              fontFamily:    '"DM Mono", monospace',
              fontSize:      '10px',
              fontWeight:    300,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color:         'rgba(255,255,255,0.35)',
            }}>
              Scroll to explore
            </span>
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none" style={{ opacity: 0.35 }}>
              <rect x="1" y="1" width="12" height="18" rx="6" stroke="white" strokeWidth="1.5"/>
              <rect x="6" y="4" width="2" height="4" rx="1" fill="white" style={{ animation: 'scrollDot 1.8s ease-in-out infinite' }}/>
            </svg>
          </div>
        )}

        {/* Scroll dot animation */}
        <style>{`
          @keyframes scrollDot {
            0%   { transform: translateY(0);   opacity: 1; }
            80%  { transform: translateY(6px); opacity: 0; }
            100% { transform: translateY(0);   opacity: 0; }
          }
        `}</style>

      </div>
    </div>
  )
}
