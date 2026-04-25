'use client'

import { useEffect, useRef } from 'react'

export default function AlwaysCooking() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let t = 0

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const LINE_COUNT = 22

      for (let i = 0; i < LINE_COUNT; i++) {
        const yBase   = (H / LINE_COUNT) * i + H / LINE_COUNT / 2
        // Lines near the center pulse slightly brighter
        const center  = Math.abs(i / LINE_COUNT - 0.5) * 2        // 0 at center, 1 at edges
        const opacity = 0.04 + (1 - center) * 0.10 + Math.sin(i * 0.7 + t * 0.4) * 0.03

        ctx.beginPath()
        ctx.strokeStyle = i % 5 === 0
          ? `rgba(46, 230, 166, ${opacity * 0.7})`   // occasional mint accent line
          : `rgba(124, 92, 255, ${opacity})`          // violet for the rest
        ctx.lineWidth = i % 5 === 0 ? 1.5 : 1

        for (let x = 0; x <= W; x += 3) {
          const y = yBase
            + Math.sin(x * 0.007  + t        + i * 0.55) * 20
            + Math.sin(x * 0.014  - t * 0.6  + i * 0.3)  * 10
            + Math.sin(x * 0.003  + t * 0.25 + i * 0.9)  * 8

          if (x === 0) ctx.moveTo(x, y)
          else         ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      t  += 0.006
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section style={{
      position:       'relative',
      height:         'clamp(380px, 55vw, 680px)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      overflow:       'hidden',
      background:     'var(--color-bg)',
    }}>

      {/* Animated contour lines */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset:    0,
          width:    '100%',
          height:   '100%',
        }}
      />

      {/* Soft vignette so edges fade into the page */}
      <div style={{
        position:      'absolute',
        inset:         0,
        background:    'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 20%, var(--color-bg) 100%)',
        pointerEvents: 'none',
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
