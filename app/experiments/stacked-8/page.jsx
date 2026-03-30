'use client'

import { useRef, useState, useEffect } from 'react'
import ExperimentLayout from '../../components/layouts/ExperimentLayout'
import ExperimentShell from '../../components/layouts/experiment/ExperimentShell'
import ExperimentControls from '../../components/layouts/experiment/ExperimentControls'
import ExperimentStage from '../../components/layouts/experiment/ExperimentStage'

const LAYERS = 10
const BG     = '#160a0e'

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

// ── Component ───────────────────────────────────────────────────────────────
export default function Stacked8Page() {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const loopRef   = useRef(null)

  // Refs mirror state — always current inside the RAF loop
  const tiltXRef   = useRef(1.5)
  const tiltYRef   = useRef(0.8)
  const spreadRef  = useRef(22)
  const strokeRef  = useRef(14)
  const colorRef   = useRef('#f2d4dc')
  const opacityRef = useRef(0.95)

  const [tiltX,   setTiltX]   = useState(1.5)
  const [tiltY,   setTiltY]   = useState(0.8)
  const [spread,  setSpread]  = useState(22)
  const [stroke,  setStroke]  = useState(14)
  const [color,   setColor]   = useState('#f2d4dc')
  const [opacity, setOpacity] = useState(0.95)

  useEffect(() => { tiltXRef.current   = tiltX   }, [tiltX])
  useEffect(() => { tiltYRef.current   = tiltY   }, [tiltY])
  useEffect(() => { spreadRef.current  = spread  }, [spread])
  useEffect(() => { strokeRef.current  = stroke  }, [stroke])
  useEffect(() => { colorRef.current   = color   }, [color])
  useEffect(() => { opacityRef.current = opacity }, [opacity])

  // ── Draw loop ─────────────────────────────────────────────────────────────
  loopRef.current = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx            = canvas.getContext('2d')
    const { width, height } = canvas
    const cx = width  / 2
    const cy = height / 2

    ctx.fillStyle = BG
    ctx.fillRect(0, 0, width, height)

    const tX   = tiltXRef.current
    const tY   = tiltYRef.current
    const sp   = spreadRef.current
    const sw   = strokeRef.current
    const col  = colorRef.current
    const base = opacityRef.current

    // 8 proportions — two equal circles stacked
    const eightH = Math.min(width, height) * 0.58
    const r      = eightH / 4

    // Draw back-to-front so front layer paints on top
    for (let i = LAYERS - 1; i >= 0; i--) {
      // t: 0 = front (most visible), 1 = back (most faded)
      const t         = i / (LAYERS - 1)
      const frontness = 1 - t

      // Front layers react more to the tilt — back is the anchor
      const ox = tX * sp * frontness
      const oy = tY * sp * frontness

      // Opacity falls off toward the back with a gentle power curve
      const alpha = base * (0.08 + 0.92 * Math.pow(frontness, 0.75))

      ctx.globalAlpha = alpha
      ctx.strokeStyle = col
      ctx.lineWidth   = sw
      ctx.lineCap     = 'round'

      const lx = cx + ox
      const ly = cy + oy
      const ri = r - sw / 2   // shrink arc radius so stroke stays inside r

      // Top circle of the 8
      ctx.beginPath()
      ctx.arc(lx, ly - r, ri, 0, Math.PI * 2)
      ctx.stroke()

      // Bottom circle of the 8
      ctx.beginPath()
      ctx.arc(lx, ly + r, ri, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.globalAlpha = 1
    rafRef.current = requestAnimationFrame(loopRef.current)
  }

  // ── Mount ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function resize() {
      const rect    = canvas.parentElement.getBoundingClientRect()
      canvas.width  = rect.width
      canvas.height = rect.height
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()

    // Drag to tilt
    let dragging  = false
    let startX    = 0, startY    = 0
    let baseTiltX = 0, baseTiltY = 0

    const clientXY = e => ({
      x: e.clientX ?? e.touches?.[0]?.clientX ?? 0,
      y: e.clientY ?? e.touches?.[0]?.clientY ?? 0,
    })

    const onDown = e => {
      dragging  = true
      const { x, y } = clientXY(e)
      startX    = x
      startY    = y
      baseTiltX = tiltXRef.current
      baseTiltY = tiltYRef.current
    }
    const onMove = e => {
      if (!dragging) return
      const { x, y } = clientXY(e)
      const nx = Math.max(-8, Math.min(8, baseTiltX + (x - startX) * 0.025))
      const ny = Math.max(-8, Math.min(8, baseTiltY + (y - startY) * 0.025))
      tiltXRef.current = nx
      tiltYRef.current = ny
      setTiltX(parseFloat(nx.toFixed(2)))
      setTiltY(parseFloat(ny.toFixed(2)))
    }
    const onUp = () => { dragging = false }

    canvas.addEventListener('mousedown',  onDown)
    canvas.addEventListener('touchstart', onDown, { passive: true })
    window.addEventListener('mousemove',  onMove)
    window.addEventListener('touchmove',  onMove, { passive: true })
    window.addEventListener('mouseup',    onUp)
    window.addEventListener('touchend',   onUp)

    rafRef.current = requestAnimationFrame(loopRef.current)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      canvas.removeEventListener('mousedown',  onDown)
      canvas.removeEventListener('touchstart', onDown)
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('touchmove',  onMove)
      window.removeEventListener('mouseup',    onUp)
      window.removeEventListener('touchend',   onUp)
    }
  }, [])

  function reset() {
    tiltXRef.current = 0; setTiltX(0)
    tiltYRef.current = 0; setTiltY(0)
  }

  return (
    <ExperimentLayout
      label="experiment"
      title="Stacked 8"
      description="Ten layered rings create the illusion of a single 8 in 3D space. Front layers react more to the tilt, back is the anchor. Drag to tilt."
    >
      <ExperimentShell>

        {/* ── Controls ────────────────────────────────────────────────────── */}
        <ExperimentControls>
          <ExperimentControls.Section label="Perspective">
            <SliderRow label="Tilt X" value={tiltX}  min={-8} max={8}  step={0.1} format={v => v.toFixed(1)} onChange={setTiltX} />
            <SliderRow label="Tilt Y" value={tiltY}  min={-8} max={8}  step={0.1} format={v => v.toFixed(1)} onChange={setTiltY} />
            <SliderRow label="Spread" value={spread} min={0}  max={60} step={1}   onChange={setSpread} />
          </ExperimentControls.Section>

          <ExperimentControls.Section label="Style">
            <SliderRow label="Opacity" value={opacity} min={0.3} max={1}  step={0.01} format={v => v.toFixed(2)} onChange={setOpacity} />
            <SliderRow label="Stroke"  value={stroke}  min={2}   max={30} step={1}    onChange={setStroke} />
            <div className="ctrl-row">
              <span className="ctrl-label">Color</span>
              <div className="ctrl-right" style={{ justifyContent: 'flex-end' }}>
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                <span className="ctrl-val">{color}</span>
              </div>
            </div>
          </ExperimentControls.Section>

          <ExperimentControls.Section label="Tilt">
            <button
              onClick={reset}
              className="w-full font-mono text-[10px] tracking-widest uppercase py-2 rounded-lg transition-colors duration-150"
              style={{ background: 'var(--color-tool-bg3)', border: '1px solid var(--color-tool-border2)', color: 'var(--color-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-foreground)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}
            >
              ↺ reset tilt
            </button>
          </ExperimentControls.Section>
        </ExperimentControls>

        {/* ── Canvas ──────────────────────────────────────────────────────── */}
        <ExperimentStage height="clamp(420px, 68vh, 780px)" noBg center={false}>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          />
        </ExperimentStage>

      </ExperimentShell>
    </ExperimentLayout>
  )
}
