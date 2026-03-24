'use client'

import { useRef, useState, useEffect } from 'react'
import ExperimentLayout from '../../components/layouts/ExperimentLayout'

// ── Perlin Noise ───────────────────────────────────────────────────────────────
function buildNoise(seed) {
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) p[i] = i
  let s = Math.floor((seed ?? Math.random()) * 0x7fffffff)
  for (let i = 255; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0
    const j = (s >>> 0) % (i + 1)
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  const pm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) pm[i] = p[i & 255]

  const fade = t => t * t * t * (t * (t * 6 - 15) + 10)
  const lerp = (a, b, t) => a + t * (b - a)
  const grad = (h, x, y) => {
    switch (h & 3) {
      case 0: return  x + y
      case 1: return -x + y
      case 2: return  x - y
      default: return -x - y
    }
  }

  return (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255
    const xf = x - Math.floor(x), yf = y - Math.floor(y)
    const u = fade(xf), v = fade(yf)
    const aa = pm[pm[X]     + Y],     ba = pm[pm[X + 1] + Y]
    const ab = pm[pm[X]     + Y + 1], bb = pm[pm[X + 1] + Y + 1]
    return lerp(
      lerp(grad(aa, xf, yf),     grad(ba, xf - 1, yf),     u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v
    )
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const BG     = '#2a2626'
const BG_RGB = '42,38,38'
const N_PARTICLES = 900

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

function SliderRow({ label, value, min, max, step = 0.01, unit = '', format, onChange }) {
  const display = format ? format(value) : `${value}${unit}`
  return (
    <div className="ctrl-row">
      <span className="ctrl-label">{label}</span>
      <div className="ctrl-right">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))} />
        <span className="ctrl-val">{display}</span>
      </div>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function FlowFieldPage() {
  const canvasRef    = useRef(null)
  const rafRef       = useRef(null)
  const noiseRef     = useRef(buildNoise())
  const particlesRef = useRef([])
  const mouseRef     = useRef({ x: -9999, y: -9999 })
  const timeRef      = useRef(0)

  // Refs mirror state so the RAF loop always reads latest values
  const scaleRef   = useRef(0.006)
  const speedRef   = useRef(1.5)
  const trailRef   = useRef(0.06)
  const colorRef   = useRef('#f2c4c4')

  const [scale,  setScale]  = useState(0.006)
  const [speed,  setSpeed]  = useState(1.5)
  const [trail,  setTrail]  = useState(0.06)
  const [color,  setColor]  = useState('#f2c4c4')

  useEffect(() => { scaleRef.current = scale }, [scale])
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { trailRef.current = trail }, [trail])
  useEffect(() => { colorRef.current = color }, [color])

  // ── Field angle at a point ────────────────────────────────────────────────
  function fieldAngle(x, y) {
    const base = noiseRef.current(
      x * scaleRef.current + timeRef.current * 0.35,
      y * scaleRef.current + timeRef.current * 0.12,
    ) * Math.PI * 4

    const dx = x - mouseRef.current.x
    const dy = y - mouseRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist >= 200) return base
    const t = (1 - dist / 200) ** 2 * 1.8
    return base * (1 - t) + (Math.atan2(dy, dx) + Math.PI * 0.5) * t
  }

  // ── Init particles ────────────────────────────────────────────────────────
  function initParticles() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    particlesRef.current = Array.from({ length: N_PARTICLES }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      age: Math.floor(Math.random() * 80),
      maxAge: 80 + Math.random() * 140,
    }))
  }

  // ── RAF loop ──────────────────────────────────────────────────────────────
  const loopRef = useRef(null)
  loopRef.current = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    const rgb = hexToRgb(colorRef.current)

    ctx.fillStyle = `rgba(${BG_RGB},${trailRef.current})`
    ctx.fillRect(0, 0, width, height)

    ctx.lineWidth = 1.2
    ctx.lineCap = 'round'

    for (const p of particlesRef.current) {
      const angle = fieldAngle(p.x, p.y)
      const spd   = speedRef.current
      const nx = p.x + Math.cos(angle) * spd
      const ny = p.y + Math.sin(angle) * spd

      ctx.globalAlpha = Math.sin((p.age / p.maxAge) * Math.PI) * 0.65
      ctx.strokeStyle = `rgb(${rgb})`
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(nx, ny)
      ctx.stroke()

      p.x = nx; p.y = ny; p.age++

      if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.age >= p.maxAge) {
        p.x = Math.random() * width
        p.y = Math.random() * height
        p.age = 0
        p.maxAge = 80 + Math.random() * 140
      }
    }
    ctx.globalAlpha = 1
    timeRef.current += 0.003
    rafRef.current = requestAnimationFrame(loopRef.current)
  }

  // ── Mount ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width  = rect.width
      canvas.height = rect.height
      initParticles()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onMouseLeave() { mouseRef.current = { x: -9999, y: -9999 } }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)
    rafRef.current = requestAnimationFrame(loopRef.current)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  function reseed() {
    noiseRef.current = buildNoise()
    initParticles()
  }

  return (
    <ExperimentLayout
      label="experiment"
      title="Flow Field"
      description="Perlin noise drives 900 particles through organic, fingerprint-like waves. Move your cursor over the canvas to disturb the field."
    >
      <div className="flex gap-6 items-start max-[900px]:flex-col">

        {/* ── Controls ───────────────────────────────────────────────────── */}
        <aside
          className="w-[220px] max-[900px]:w-full shrink-0 rounded-xl overflow-hidden font-mono"
          style={{ background: 'var(--color-tool-bg1)', border: '1px solid var(--color-tool-border)' }}
        >
          <div className="section border-b border-tool-border">
            <div className="sec-hdr"><span>Field</span></div>
            <div className="sec-body">
              <SliderRow label="Noise scale" value={scale} min={0.002} max={0.016} step={0.001} format={v => v.toFixed(3)} onChange={setScale} />
            </div>
          </div>

          <div className="section border-b border-tool-border">
            <div className="sec-hdr"><span>Particles</span></div>
            <div className="sec-body">
              <SliderRow label="Speed"  value={speed} min={0.3} max={4}    step={0.1}   format={v => v.toFixed(1)} onChange={setSpeed} />
              <SliderRow label="Trails" value={trail} min={0.02} max={0.2} step={0.01}  format={v => v.toFixed(2)} onChange={setTrail} />
            </div>
          </div>

          <div className="section border-b border-tool-border">
            <div className="sec-hdr"><span>Color</span></div>
            <div className="sec-body">
              <div className="ctrl-row">
                <span className="ctrl-label">Stroke</span>
                <div className="ctrl-right" style={{ justifyContent: 'flex-end' }}>
                  <input
                    type="color" value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="ctrl-val">{color}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="sec-body" style={{ paddingTop: 10, paddingBottom: 10 }}>
              <button
                onClick={reseed}
                className="w-full font-mono text-[10px] tracking-widest uppercase py-2 rounded-lg transition-colors duration-150"
                style={{
                  background:  'var(--color-tool-bg3)',
                  border:      '1px solid var(--color-tool-border2)',
                  color:       'var(--color-muted)',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-foreground)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}
              >
                ↺ re-seed
              </button>
            </div>
          </div>
        </aside>

        {/* ── Canvas ─────────────────────────────────────────────────────── */}
        <div
          className="relative flex-1 min-w-0 rounded-xl overflow-hidden max-[900px]:w-full cursor-crosshair"
          style={{ height: 'clamp(420px, 68vh, 780px)' }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

      </div>
    </ExperimentLayout>
  )
}
