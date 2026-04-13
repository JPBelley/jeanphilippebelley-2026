'use client'

import { useEffect, useState } from 'react'
import Button from '../Button'

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
      <div style={{
        display:       'grid',
        gridTemplateColumns: '1fr 1fr',
        gap:           '0',
        alignItems:    'flex-end',
        marginBottom:  'clamp(32px, 5vh, 56px)',
        opacity:       visible ? 1 : 0,
        transform:     visible ? 'translateY(0)' : 'translateY(32px)',
        transition:    'opacity 0.7s ease, transform 0.7s cubic-bezier(0.2,0,0,1)',
      }}>

        {/* Left: thick-bordered frame */}
        <div style={{
          width:    'min(260px, 28vw)',
          aspectRatio: '1',
          border:   '8px solid var(--color-violet)',
          background: 'var(--color-bg2)',
          position: 'relative',
          display:  'flex',
          alignItems:'center',
          justifyContent:'center',
          flexShrink: 0,
        }}>
          {/* monogram */}
          <span style={{
            fontFamily:    'var(--font-head)',
            fontWeight:    900,
            fontSize:      'clamp(48px, 7vw, 96px)',
            color:         'var(--color-violet)',
            letterSpacing: '-0.06em',
            lineHeight:    1,
            userSelect:    'none',
          }}>JP</span>

        </div>

        {/* Right: massive headline */}
        <div style={{ textAlign: 'right' }}>
          <h1 style={{
            fontFamily:    'var(--font-head)',
            fontWeight:    900,
            fontSize:      'clamp(64px, 11vw, 160px)',
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
      }} />

      {/* ── Row 2: Big subtext + Stack card + CTA ── */}
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'flex-start',
        gap:            'clamp(32px, 5vw, 64px)',
        marginTop:      'clamp(28px, 4vh, 48px)',
        flexWrap:       'wrap',
        opacity:        visible ? 1 : 0,
        transform:      visible ? 'translateY(0)' : 'translateY(24px)',
        transition:     'opacity 0.7s ease 0.25s, transform 0.7s cubic-bezier(0.2,0,0,1) 0.25s',
      }}>

        {/* Big manifesto text */}
        <p style={{
          fontFamily:    'var(--font-head)',
          fontWeight:    900,
          fontSize:      'clamp(24px, 3.5vw, 48px)',
          lineHeight:    1.05,
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          color:         'var(--color-foreground)',
          maxWidth:      560,
          margin:        0,
        }}>
          I build fast,<br />
          <span style={{ color: 'var(--color-violet)' }}>beautiful</span> interfaces<br />
          and robust backends.<br />
          <span style={{ color: 'var(--color-muted)', fontSize: '0.75em' }}>React, Vue, WordPress, Drupal,<br />Webflow and whatever it takes.</span>
        </p>

        {/* Right column: stack + CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 260 }}>

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

          {/* CTA — skews on hover */}
          <a
            href="#projects"
            style={{
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'space-between',
              gap:             16,
              background:      'var(--color-violet)',
              padding:         '20px 24px',
              textDecoration:  'none',
              cursor:          'pointer',
              transition:      'transform 0.2s cubic-bezier(0.2,0,0,1)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'skewX(-6deg)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'skewX(0deg)'}
          >
            <span style={{
              fontFamily:    'var(--font-head)',
              fontWeight:    900,
              fontSize:      'clamp(16px, 1.6vw, 20px)',
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              color:         '#fff',
            }}>View my work</span>
            <span style={{ color: '#fff', fontSize: 22 }}>→</span>
          </a>

        </div>
      </div>

    </section>
  )
}
