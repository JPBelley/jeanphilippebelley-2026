'use client'

import { useEffect, useRef } from 'react'

export default function AlwaysCooking() {
  const canvasRef = useRef(null)

  // Generate a grayscale marble-like texture via canvas noise
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 800
    const H = 600
    canvas.width  = W
    canvas.height = H

    // Layered noise — approximates a marble texture
    const img = ctx.createImageData(W, H)
    for (let i = 0; i < W * H; i++) {
      const x = i % W
      const y = Math.floor(i / W)
      // Multiple sine waves at different angles = marble-ish streaks
      const v =
        Math.sin(x * 0.012 + y * 0.004 + Math.sin(x * 0.006) * 6) * 0.5 +
        Math.sin(y * 0.015 + x * 0.003 + Math.sin(y * 0.008) * 5) * 0.3 +
        Math.sin((x + y) * 0.009 + Math.sin(x * 0.004 - y * 0.006) * 8) * 0.2
      const b = Math.floor(((v + 1) / 2) * 255 * 0.55) // dark, high contrast
      const idx = i * 4
      img.data[idx]     = b
      img.data[idx + 1] = b
      img.data[idx + 2] = b
      img.data[idx + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
  }, [])

  return (
    <section style={{
      position:       'relative',
      height:         'clamp(380px, 55vw, 680px)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      overflow:       'hidden',
    }}>

      {/* Marble texture — grayscale, low opacity */}
      <canvas
        ref={canvasRef}
        style={{
          position:   'absolute',
          inset:      0,
          width:      '100%',
          height:     '100%',
          objectFit:  'cover',
          opacity:    0.28,
          filter:     'grayscale(1)',
        }}
      />

      {/* Violet overlay — mix-blend-overlay */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: 'var(--color-violet)',
        opacity:    0.10,
        mixBlendMode:'overlay',
        pointerEvents:'none',
      }} />

      {/* Dark vignette edges */}
      <div style={{
        position:     'absolute',
        inset:        0,
        background:   'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, rgba(15,17,21,0.75) 100%)',
        pointerEvents:'none',
      }} />

      {/* Text */}
      <h2 style={{
        position:      'relative',
        zIndex:        1,
        fontFamily:    'var(--font-head)',
        fontWeight:    900,
        fontSize:      'clamp(56px, 10.5vw, 150px)',
        lineHeight:    0.87,
        letterSpacing: '-0.06em',
        textTransform: 'uppercase',
        textAlign:     'center',
        color:         'var(--color-foreground)',
        margin:        0,
        padding:       '0 clamp(24px, 5vw, 80px)',
      }}>
        Always<br />cooking<br />something.
      </h2>

    </section>
  )
}
