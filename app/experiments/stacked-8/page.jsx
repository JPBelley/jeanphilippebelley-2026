'use client'

import { useRef, useState, useEffect } from 'react'
import ExperimentLayout from '../../components/layouts/ExperimentLayout'
import ExperimentShell from '../../components/layouts/experiment/ExperimentShell'
import ExperimentControls from '../../components/layouts/experiment/ExperimentControls'
import ExperimentStage from '../../components/layouts/experiment/ExperimentStage'

const LAYERS = 10
const BG     = '#160a0e'

function lerpColor(hex1, hex2, t) {
  const a = parseInt(hex1.replace('#', ''), 16)
  const b = parseInt(hex2.replace('#', ''), 16)
  const r = Math.round(((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t)
  const g = Math.round(((a >>  8) & 255) * (1 - t) + ((b >>  8) & 255) * t)
  const c = Math.round( (a        & 255) * (1 - t) +  (b        & 255) * t)
  return `rgb(${r},${g},${c})`
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
  const color2Ref  = useRef('#7C5CFF')
  const opacityRef = useRef(0.95)
  const fluidRef   = useRef(0.65)
  const twistRef   = useRef(0)
  const jitterRef  = useRef(0)
  const gapRef     = useRef(0)

  // Per-layer current positions + rotation for lerp — updated every frame
  const layerPos = useRef(Array.from({ length: LAYERS }, () => ({ ox: 0, oy: 0, rot: 0 })))

  const [tiltX,   setTiltX]   = useState(1.5)
  const [tiltY,   setTiltY]   = useState(0.8)
  const [spread,  setSpread]  = useState(22)
  const [stroke,  setStroke]  = useState(14)
  const [color,   setColor]   = useState('#f2d4dc')
  const [color2,  setColor2]  = useState('#7C5CFF')
  const [opacity, setOpacity] = useState(0.95)
  const [fluid,   setFluid]   = useState(0.65)
  const [twist,   setTwist]   = useState(0)
  const [jitter,  setJitter]  = useState(0)
  const [gap,     setGap]     = useState(0)

  useEffect(() => { tiltXRef.current   = tiltX   }, [tiltX])
  useEffect(() => { tiltYRef.current   = tiltY   }, [tiltY])
  useEffect(() => { spreadRef.current  = spread  }, [spread])
  useEffect(() => { strokeRef.current  = stroke  }, [stroke])
  useEffect(() => { colorRef.current   = color   }, [color])
  useEffect(() => { color2Ref.current  = color2  }, [color2])
  useEffect(() => { opacityRef.current = opacity }, [opacity])
  useEffect(() => { fluidRef.current   = fluid   }, [fluid])
  useEffect(() => { twistRef.current   = twist   }, [twist])
  useEffect(() => { jitterRef.current  = jitter  }, [jitter])
  useEffect(() => { gapRef.current     = gap      }, [gap])

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

    const tX    = tiltXRef.current
    const tY    = tiltYRef.current
    const sp    = spreadRef.current
    const sw    = strokeRef.current
    const base  = opacityRef.current
    const fl    = fluidRef.current
    const tw    = twistRef.current * Math.PI / 180
    const pos   = layerPos.current

    // 8 proportions — two equal circles stacked
    const eightH = Math.min(width, height) * 0.58
    const r      = eightH / 4
    const ri     = r - sw / 2
    const cy0    = r + gapRef.current / 2

    // Draw back-to-front so front layer paints on top
    for (let i = LAYERS - 1; i >= 0; i--) {
      // t: 0 = front (most visible), 1 = back (most faded)
      const t         = i / (LAYERS - 1)
      const frontness = 1 - t

      // Target position — front moves most, back is the anchor
      const targetOx  = tX * sp * frontness
      const targetOy  = tY * sp * frontness
      // Target Z rotation — back layers twist the most
      const targetRot = tw * t

      // Lerp speeds: front = snappy, back = laggy. Collapse to 1 (rigid) as fl → 0.
      const frontSpeed = 1 + (0.35 - 1) * fl
      const backSpeed  = 1 + (0.04 - 1) * fl
      const lerpFactor = frontSpeed + (backSpeed - frontSpeed) * t

      pos[i].ox  += (targetOx  - pos[i].ox)  * lerpFactor
      pos[i].oy  += (targetOy  - pos[i].oy)  * lerpFactor
      pos[i].rot += (targetRot - pos[i].rot) * lerpFactor

      // Opacity falls off toward the back with a gentle power curve
      const alpha = base * (0.08 + 0.92 * Math.pow(frontness, 0.75))

      ctx.globalAlpha = alpha
      ctx.strokeStyle = lerpColor(colorRef.current, color2Ref.current, t)
      ctx.lineWidth   = sw
      ctx.lineCap     = 'round'

      // Translate to this layer's position, rotate around its own centre
      const jAmp = jitterRef.current * t
      const jx   = (Math.random() * 2 - 1) * jAmp
      const jy   = (Math.random() * 2 - 1) * jAmp

      ctx.save()
      ctx.translate(cx + pos[i].ox + jx, cy + pos[i].oy + jy)
      ctx.rotate(pos[i].rot)

      // Top circle of the 8
      ctx.beginPath()
      ctx.arc(0, -cy0, ri, 0, Math.PI * 2)
      ctx.stroke()

      // Bottom circle of the 8
      ctx.beginPath()
      ctx.arc(0, cy0, ri, 0, Math.PI * 2)
      ctx.stroke()

      ctx.restore()
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
      layerPos.current.forEach(p => { p.ox = 0; p.oy = 0; p.rot = 0 })
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
    twistRef.current = 0; setTwist(0)
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
            <SliderRow label="Tilt X" value={tiltX}  min={-8}   max={8}   step={0.1}  format={v => v.toFixed(1)} onChange={setTiltX} />
            <SliderRow label="Tilt Y" value={tiltY}  min={-8}   max={8}   step={0.1}  format={v => v.toFixed(1)} onChange={setTiltY} />
            <SliderRow label="Twist"  value={twist}  min={-90}  max={90}  step={1}    format={v => `${v}°`}      onChange={setTwist} />
            <SliderRow label="Spread" value={spread} min={0}    max={60}  step={1}    onChange={setSpread} />
            <SliderRow label="Fluid"  value={fluid}  min={0}    max={1}   step={0.01} format={v => v.toFixed(2)} onChange={setFluid} />
          </ExperimentControls.Section>

          <ExperimentControls.Section label="Style">
            <SliderRow label="Gap"     value={gap}     min={-40} max={80}  step={1}    format={v => `${v}px`}     onChange={setGap} />
            <SliderRow label="Opacity" value={opacity} min={0.3} max={1}   step={0.01} format={v => v.toFixed(2)} onChange={setOpacity} />
            <SliderRow label="Jitter"  value={jitter}  min={0}   max={12}  step={0.5}  format={v => v.toFixed(1)} onChange={setJitter} />
            <SliderRow label="Stroke"  value={stroke}  min={2}   max={30}  step={1}    onChange={setStroke} />
            <div className="ctrl-row">
              <span className="ctrl-label">Front</span>
              <div className="ctrl-right" style={{ justifyContent: 'flex-end' }}>
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                <span className="ctrl-val" style={{ width: '64px' }}>{color}</span>
              </div>
            </div>
            <div className="ctrl-row">
              <span className="ctrl-label">Back</span>
              <div className="ctrl-right" style={{ justifyContent: 'flex-end' }}>
                <input type="color" value={color2} onChange={e => setColor2(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                <span className="ctrl-val" style={{ width: '64px' }}>{color2}</span>
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
              ↺ reset
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
