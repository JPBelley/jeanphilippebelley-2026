'use client'

import { useEffect, useState } from 'react'

const STACK = ['REACT', 'NEXT.JS', 'WEBGL', 'NODE.JS']

export default function HeroBrutalist({ introComplete }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (introComplete) {
      const t = setTimeout(() => setVisible(true), 80)
      return () => clearTimeout(t)
    }
  }, [introComplete])

  return (
    <section style={{
      minHeight:     '100vh',
      display:       'flex',
      flexDirection: 'column',
      justifyContent:'center',
      position:      'relative',
      overflow:      'hidden',
      padding:       'clamp(80px, 10vh, 140px) clamp(24px, 5vw, 72px) clamp(48px, 6vh, 80px)',
      boxSizing:     'border-box',
    }}>

      {/* ── Glow blobs ── */}
      <div style={{
        position: 'absolute', top: '20%', right: '-5%',
        width: '35vw', height: '35vw',
        background: 'var(--color-violet)',
        borderRadius: '50%',
        filter: 'blur(140px)',
        opacity: 0.07,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: '25vw', height: '25vw',
        background: 'var(--color-mint)',
        borderRadius: '50%',
        filter: 'blur(160px)',
        opacity: 0.05,
        pointerEvents: 'none',
      }} />

      {/* ── Row 1: Frame + Headline ── */}
      <div
        className="flex flex-col-reverse items-start gap-6 sm:grid sm:grid-cols-2 sm:gap-0 sm:items-end"
        style={{
          marginBottom:  'clamp(32px, 5vh, 56px)',
          opacity:       visible ? 1 : 0,
          transform:     visible ? 'translateY(0)' : 'translateY(32px)',
          transition:    'opacity 0.7s ease, transform 0.7s cubic-bezier(0.2,0,0,1)',
        }}
      >

        {/* Left: thick-bordered frame */}
        <div style={{
          width:       'clamp(80px, 22vw, 260px)',
          aspectRatio: '1',
          border:      '8px solid var(--color-violet)',
          background:  'var(--color-bg2)',
          position:    'relative',
          display:     'flex',
          alignItems:  'center',
          justifyContent: 'center',
          flexShrink:  0,
        }}>
          <span style={{
            fontFamily:    'var(--font-head)',
            fontWeight:    900,
            fontSize:      'clamp(28px, 6vw, 96px)',
            color:         'var(--color-violet)',
            letterSpacing: '-0.06em',
            lineHeight:    1,
            userSelect:    'none',
          }}>JP</span>
        </div>

        {/* Right: massive headline */}
        <div className="sm:text-right">
          <h1 style={{
            fontFamily:    'var(--font-head)',
            fontWeight:    900,
            fontSize:      'clamp(52px, 11vw, 160px)',
            lineHeight:    0.85,
            letterSpacing: '-0.06em',
            textTransform: 'uppercase',
            color:         'var(--color-foreground)',
            margin:        0,
          }}>
            DIGITAL<br />
            <span style={{ color: 'var(--color-violet)' }}>BUILDER</span>
          </h1>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{
        width:      '100%',
        height:     2,
        background: 'var(--color-ui)',
        opacity:    visible ? 1 : 0,
        transition: 'opacity 0.5s ease 0.2s',
        flexShrink: 0,
      }} />

      {/* ── Row 2: Big subtext + Stack card + CTA ── */}
      <div
        className="flex flex-col gap-8 sm:flex-row sm:justify-between sm:items-start"
        style={{
          marginTop:  'clamp(28px, 4vh, 48px)',
          opacity:    visible ? 1 : 0,
          transform:  visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease 0.25s, transform 0.7s cubic-bezier(0.2,0,0,1) 0.25s',
        }}
      >

        {/* Big manifesto text */}
        <p style={{
          fontFamily:    'var(--font-head)',
          fontWeight:    900,
          fontSize:      'clamp(20px, 3.5vw, 48px)',
          lineHeight:    1.05,
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          color:         'var(--color-foreground)',
          margin:        0,
        }}>
          I build fast,<br />
          <span style={{ color: 'var(--color-violet)' }}>beautiful</span> interfaces<br />
          and robust backends.<br />
          <span style={{ color: 'var(--color-muted)', fontSize: '0.75em' }}>React, Vue, WordPress, Drupal,<br />Webflow and whatever it takes.</span>
        </p>

        {/* Right column: stack + CTA */}
        <div className="flex flex-col gap-4 w-full sm:w-auto sm:min-w-[260px] sm:max-w-[320px]">

          {/* Stack card */}
          <div style={{
            background: 'var(--color-bg2)',
            border:     '1px solid var(--color-ui)',
            padding:    '28px 28px 24px',
          }}>
            <div style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              marginBottom:   16,
            }}>
              <span style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      11,
                fontWeight:    700,
                color:         'var(--color-violet)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}>CORE_STACK</span>
              <span style={{ color: 'var(--color-violet)', fontSize: 18 }}>◫</span>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {STACK.map(item => (
                <li key={item} style={{
                  fontFamily:    'var(--font-head)',
                  fontWeight:    700,
                  fontSize:      'clamp(16px, 1.8vw, 22px)',
                  letterSpacing: '-0.02em',
                  color:         'var(--color-foreground)',
                  textTransform: 'uppercase',
                }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </section>
  )
}
