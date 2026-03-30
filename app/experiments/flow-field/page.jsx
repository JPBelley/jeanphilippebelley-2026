'use client'

import { useRef, useState, useEffect } from 'react'
import ExperimentLayout from '../../components/layouts/ExperimentLayout'
import ExperimentShell from '../../components/layouts/experiment/ExperimentShell'
import ExperimentControls from '../../components/layouts/experiment/ExperimentControls'
import ExperimentStage from '../../components/layouts/experiment/ExperimentStage'

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

function lerpColor(hex1, hex2, t) {
  const a = parseInt(hex1.replace('#', ''), 16)
  const b = parseInt(hex2.replace('#', ''), 16)
  const r = Math.round(((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t)
  const g = Math.round(((a >> 8)  & 255) * (1 - t) + ((b >> 8)  & 255) * t)
  const c = Math.round( (a        & 255) * (1 - t) +  (b        & 255) * t)
  return `${r},${g},${c}`
}

function SliderRow({ label, value, min, max, step = 0.01, format, onChange }) {
  return (
    <div className="ctrl-row">
      <span className="ctrl-label">{label}</span>
      <div className="ctrl-right">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))} />
        <span className="ctrl-val">{format ? format(value) : value}</span>
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

  // Refs mirror state — always current inside the RAF loop
  const scaleRef         = useRef(0.006)
  const flowSpeedRef     = useRef(0.003)
  const speedRef         = useRef(1.5)
  const trailRef         = useRef(0.06)
  const countRef         = useRef(900)
  const lineWidthRef     = useRef(1.2)
  const colorRef         = useRef('#f2c4c4')
  const color2Ref        = useRef('#7C5CFF')
  const cursorStrRef     = useRef(1.8)
  const cursorRadRef     = useRef(200)

  const [scale,        setScale]        = useState(0.006)
  const [flowSpeed,    setFlowSpeed]    = useState(0.003)
  const [speed,        setSpeed]        = useState(1.5)
  const [trail,        setTrail]        = useState(0.06)
  const [count,        setCount]        = useState(900)
  const [lineWidth,    setLineWidth]    = useState(1.2)
  const [color,        setColor]        = useState('#f2c4c4')
  const [color2,       setColor2]       = useState('#7C5CFF')
  const [cursorStr,    setCursorStr]    = useState(1.8)
  const [cursorRad,    setCursorRad]    = useState(200)

  useEffect(() => { scaleRef.current     = scale     }, [scale])
  useEffect(() => { flowSpeedRef.current = flowSpeed }, [flowSpeed])
  useEffect(() => { speedRef.current     = speed     }, [speed])
  useEffect(() => { trailRef.current     = trail     }, [trail])
  useEffect(() => { lineWidthRef.current = lineWidth }, [lineWidth])
  useEffect(() => { colorRef.current     = color     }, [color])
  useEffect(() => { color2Ref.current    = color2    }, [color2])
  useEffect(() => { cursorStrRef.current = cursorStr }, [cursorStr])
  useEffect(() => { cursorRadRef.current = cursorRad }, [cursorRad])

  // Re-init when count changes
  useEffect(() => {
    countRef.current = count
    initParticles()
  }, [count])

  // ── Field angle ───────────────────────────────────────────────────────────
  function fieldAngle(x, y) {
    const base = noiseRef.current(
      x * scaleRef.current + timeRef.current * 0.35,
      y * scaleRef.current + timeRef.current * 0.12,
    ) * Math.PI * 4

    const dx = x - mouseRef.current.x
    const dy = y - mouseRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const radius = cursorRadRef.current
    if (dist >= radius) return base
    const t = Math.min((1 - dist / radius) ** 2 * cursorStrRef.current, 1)
    return base * (1 - t) + (Math.atan2(dy, dx) + Math.PI * 0.5) * t
  }

  // ── Init particles ────────────────────────────────────────────────────────
  function initParticles() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    particlesRef.current = Array.from({ length: countRef.current }, () => ({
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,
      age:    Math.floor(Math.random() * 80),
      maxAge: 80 + Math.random() * 140,
    }))
  }

  // ── RAF loop ──────────────────────────────────────────────────────────────
  const loopRef = useRef(null)
  loopRef.current = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx    = canvas.getContext('2d')
    const { width, height } = canvas

    ctx.fillStyle = `rgba(${BG_RGB},${trailRef.current})`
    ctx.fillRect(0, 0, width, height)

    ctx.lineWidth = lineWidthRef.current
    ctx.lineCap   = 'round'

    for (const p of particlesRef.current) {
      const angle = fieldAngle(p.x, p.y)
      const spd   = speedRef.current
      const nx    = p.x + Math.cos(angle) * spd
      const ny    = p.y + Math.sin(angle) * spd
      const life  = p.age / p.maxAge

      ctx.globalAlpha  = Math.sin(life * Math.PI) * 0.65
      ctx.strokeStyle  = `rgb(${lerpColor(colorRef.current, color2Ref.current, life)})`
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(nx, ny)
      ctx.stroke()

      p.x = nx; p.y = ny; p.age++

      if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.age >= p.maxAge) {
        p.x      = Math.random() * width
        p.y      = Math.random() * height
        p.age    = 0
        p.maxAge = 80 + Math.random() * 140
      }
    }

    ctx.globalAlpha = 1
    timeRef.current += flowSpeedRef.current
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

    const onMouseMove  = e => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }

    canvas.addEventListener('mousemove',  onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)
    rafRef.current = requestAnimationFrame(loopRef.current)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      canvas.removeEventListener('mousemove',  onMouseMove)
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
      title="Flow Field Particles"
      description="Perlin noise drives particles through organic, fingerprint-like waves. Move your cursor over the canvas to disturb the field."
    >
      <ExperimentShell>

        {/* ── Controls ───────────────────────────────────────────────────── */}
        <ExperimentControls>
          <ExperimentControls.Section label="Field">
            <SliderRow label="Noise scale" value={scale}     min={0.002} max={0.016} step={0.001} format={v => v.toFixed(3)} onChange={setScale} />
            <SliderRow label="Flow speed"  value={flowSpeed} min={0}     max={0.012} step={0.001} format={v => v.toFixed(3)} onChange={setFlowSpeed} />
          </ExperimentControls.Section>

          <ExperimentControls.Section label="Particles">
            <SliderRow label="Count"      value={count}     min={100}  max={2000} step={50}  onChange={setCount} />
            <SliderRow label="Speed"      value={speed}     min={0.3}  max={4}    step={0.1} format={v => v.toFixed(1)} onChange={setSpeed} />
            <SliderRow label="Line width" value={lineWidth} min={0.5}  max={4}    step={0.5} format={v => v.toFixed(1)} onChange={setLineWidth} />
            <SliderRow label="Trails"     value={trail}     min={0.02} max={0.2}  step={0.01} format={v => v.toFixed(2)} onChange={setTrail} />
          </ExperimentControls.Section>

          <ExperimentControls.Section label="Color">
            <div className="ctrl-row">
              <span className="ctrl-label">Young</span>
              <div className="ctrl-right" style={{ justifyContent: 'flex-end' }}>
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                <span className="ctrl-val">{color}</span>
              </div>
            </div>
            <div className="ctrl-row">
              <span className="ctrl-label">Old</span>
              <div className="ctrl-right" style={{ justifyContent: 'flex-end' }}>
                <input type="color" value={color2} onChange={e => setColor2(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                <span className="ctrl-val">{color2}</span>
              </div>
            </div>
          </ExperimentControls.Section>

          <ExperimentControls.Section label="Cursor">
            <SliderRow label="Strength" value={cursorStr} min={0}   max={3}   step={0.1} format={v => v.toFixed(1)} onChange={setCursorStr} />
            <SliderRow label="Radius"   value={cursorRad} min={40}  max={400} step={10}  onChange={setCursorRad} />
          </ExperimentControls.Section>

          <ExperimentControls.Section label="Seed">
            <button
              onClick={reseed}
              className="w-full font-mono text-[10px] tracking-widest uppercase py-2 rounded-lg transition-colors duration-150"
              style={{ background: 'var(--color-tool-bg3)', border: '1px solid var(--color-tool-border2)', color: 'var(--color-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-foreground)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}
            >
              ↺ re-seed
            </button>
          </ExperimentControls.Section>
        </ExperimentControls>

        {/* ── Canvas ─────────────────────────────────────────────────────── */}
        <ExperimentStage height="clamp(420px, 68vh, 780px)" noBg center={false}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        </ExperimentStage>

      </ExperimentShell>
    </ExperimentLayout>
  )
}
