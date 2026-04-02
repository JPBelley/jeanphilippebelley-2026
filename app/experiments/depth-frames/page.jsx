'use client'

import { useRef, useState, useEffect } from 'react'
import ExperimentLayout from '../../components/layouts/ExperimentLayout'
import ExperimentShell from '../../components/layouts/experiment/ExperimentShell'
import ExperimentControls from '../../components/layouts/experiment/ExperimentControls'
import ExperimentStage from '../../components/layouts/experiment/ExperimentStage'

const BG = '#0d0b0c'

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

// ── XY Pad ──────────────────────────────────────────────────────────────────
function XYPad({ x, y, min = -8, max = 8, onChange }) {
  const padRef    = useRef(null)
  const dragging  = useRef(false)
  const handleRef = useRef(null)

  handleRef.current = (e) => {
    const pad = padRef.current
    if (!pad) return
    const rect    = pad.getBoundingClientRect()
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0
    const nx = parseFloat(Math.max(min, Math.min(max, min + ((clientX - rect.left) / rect.width)  * (max - min))).toFixed(2))
    const ny = parseFloat(Math.max(min, Math.min(max, min + ((clientY - rect.top)  / rect.height) * (max - min))).toFixed(2))
    onChange(nx, ny)
  }

  useEffect(() => {
    const onMove = e => { if (dragging.current) handleRef.current(e) }
    const onUp   = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('touchend',  onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('touchend',  onUp)
    }
  }, [])

  const dotX = ((x - min) / (max - min)) * 100
  const dotY = ((y - min) / (max - min)) * 100

  return (
    <div
      ref={padRef}
      onMouseDown={e => { dragging.current = true; handleRef.current(e) }}
      onTouchStart={e => { dragging.current = true; handleRef.current(e) }}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        background: 'var(--color-tool-bg3)',
        border: '1px solid var(--color-tool-border)',
        borderRadius: '8px',
        cursor: 'crosshair',
        marginBottom: '6px',
        userSelect: 'none',
      }}
    >
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'var(--color-tool-border)', opacity: 0.5, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--color-tool-border)', opacity: 0.5, pointerEvents: 'none' }} />
      <div style={{
        position: 'absolute',
        left:   `${dotX}%`,
        top:    `${dotY}%`,
        width:  10,
        height: 10,
        borderRadius: '50%',
        background: 'var(--color-foreground)',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        boxShadow: '0 0 0 2px var(--color-tool-bg3)',
      }} />
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────
export default function DepthFramesPage() {
  const canvasRef   = useRef(null)
  const rafRef      = useRef(null)
  const loopRef     = useRef(null)
  const grainRef    = useRef(null)  // offscreen grain canvas

  const tiltXRef   = useRef(3.5)
  const tiltYRef   = useRef(-2)
  const spreadRef  = useRef(28)
  const fluidRef   = useRef(0.7)
  const opacityRef = useRef(0.9)
  const grainAmpRef = useRef(0.35)
  const layersRef  = useRef(12)
  const colorRef   = useRef('#e8707a')
  const color2Ref  = useRef('#253252')

  const layerPos = useRef([])

  const [tiltX,    setTiltX]    = useState(3.5)
  const [tiltY,    setTiltY]    = useState(-2)
  const [spread,   setSpread]   = useState(28)
  const [fluid,    setFluid]    = useState(0.7)
  const [opacity,  setOpacity]  = useState(0.9)
  const [grainAmp, setGrainAmp] = useState(0.35)
  const [layers,   setLayers]   = useState(12)
  const [color,    setColor]    = useState('#e8707a')
  const [color2,   setColor2]   = useState('#253252')

  useEffect(() => { tiltXRef.current    = tiltX    }, [tiltX])
  useEffect(() => { tiltYRef.current    = tiltY    }, [tiltY])
  useEffect(() => { spreadRef.current   = spread   }, [spread])
  useEffect(() => { fluidRef.current    = fluid    }, [fluid])
  useEffect(() => { opacityRef.current  = opacity  }, [opacity])
  useEffect(() => { grainAmpRef.current = grainAmp }, [grainAmp])
  useEffect(() => { colorRef.current    = color    }, [color])
  useEffect(() => { color2Ref.current   = color2   }, [color2])

  useEffect(() => {
    const n = layers
    layersRef.current = n
    const prev = layerPos.current
    layerPos.current = Array.from({ length: n }, (_, i) =>
      prev[i] ?? { ox: 0, oy: 0 }
    )
  }, [layers])

  // ── Draw loop ───────────────────────────────────────────────────────────────
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
    const fl   = fluidRef.current
    const base = opacityRef.current
    const n    = layersRef.current
    const pos  = layerPos.current
    const size = Math.min(width, height) * 0.48
    const hw   = size / 2

    for (let i = n - 1; i >= 0; i--) {
      const t         = i / (n - 1)
      const frontness = 1 - t

      const targetOx = tX * sp * frontness
      const targetOy = tY * sp * frontness

      const frontSpeed = 1 + (0.35 - 1) * fl
      const backSpeed  = 1 + (0.04 - 1) * fl
      const lf         = frontSpeed + (backSpeed - frontSpeed) * t

      if (!pos[i]) pos[i] = { ox: 0, oy: 0 }
      pos[i].ox += (targetOx - pos[i].ox) * lf
      pos[i].oy += (targetOy - pos[i].oy) * lf

      const alpha = base * (0.04 + 0.2 * Math.pow(frontness, 0.55))

      ctx.globalAlpha = alpha
      ctx.fillStyle   = lerpColor(color2Ref.current, colorRef.current, frontness)

      ctx.save()
      ctx.translate(cx + pos[i].ox, cy + pos[i].oy)
      ctx.fillRect(-hw, -hw, size, size)
      ctx.restore()
    }

    // ── Radial glow from front layer ──────────────────────────────────────
    const fp  = pos[0] ?? { ox: 0, oy: 0 }
    const gx  = cx + fp.ox
    const gy  = cy + fp.oy
    const grd = ctx.createRadialGradient(gx, gy, 0, gx, gy, size * 0.85)
    const [r, g, b] = (() => {
      const n = parseInt(colorRef.current.replace('#', ''), 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    })()
    grd.addColorStop(0,   `rgba(${r},${g},${b},0.18)`)
    grd.addColorStop(0.5, `rgba(${r},${g},${b},0.06)`)
    grd.addColorStop(1,   `rgba(${r},${g},${b},0)`)
    ctx.globalAlpha = 1
    ctx.fillStyle   = grd
    ctx.fillRect(0, 0, width, height)

    // ── Film grain (clipped to frames only) ──────────────────────────────
    const amp = grainAmpRef.current
    if (amp > 0) {
      const SCALE = 3
      const gw = Math.ceil(width  / SCALE)
      const gh = Math.ceil(height / SCALE)
      let gc = grainRef.current
      if (!gc) {
        gc = document.createElement('canvas')
        grainRef.current = gc
      }
      gc.width  = gw
      gc.height = gh
      const gctx    = gc.getContext('2d')
      const imgData = gctx.createImageData(gw, gh)
      const d       = imgData.data
      for (let i = 0; i < d.length; i += 4) {
        const v   = (Math.random() * 255) | 0
        d[i]      = v
        d[i + 1]  = v
        d[i + 2]  = v
        d[i + 3]  = (Math.random() * amp * 90) | 0
      }
      gctx.putImageData(imgData, 0, 0)

      // clip to the union of all frame rects before drawing grain
      ctx.save()
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        if (!pos[i]) continue
        ctx.rect(cx + pos[i].ox - hw, cy + pos[i].oy - hw, size, size)
      }
      ctx.clip()
      ctx.globalAlpha = 1
      ctx.drawImage(gc, 0, 0, width, height)
      ctx.restore()
    }

    ctx.globalAlpha = 1
    rafRef.current = requestAnimationFrame(loopRef.current)
  }

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    layerPos.current = Array.from({ length: layersRef.current }, () => ({ ox: 0, oy: 0 }))

    function resize() {
      const rect    = canvas.parentElement.getBoundingClientRect()
      canvas.width  = rect.width
      canvas.height = rect.height
      layerPos.current.forEach(p => { p.ox = 0; p.oy = 0 })
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()

    let dragging  = false
    let startX = 0, startY = 0, bx = tiltXRef.current, by = tiltYRef.current

    const pt = e => ({
      x: e.clientX ?? e.touches?.[0]?.clientX ?? 0,
      y: e.clientY ?? e.touches?.[0]?.clientY ?? 0,
    })

    const onDown = e => {
      dragging = true
      const p = pt(e); startX = p.x; startY = p.y
      bx = tiltXRef.current; by = tiltYRef.current
    }
    const onMove = e => {
      if (!dragging) return
      const p = pt(e)
      const nx = Math.max(-8, Math.min(8, bx + (p.x - startX) * 0.025))
      const ny = Math.max(-8, Math.min(8, by + (p.y - startY) * 0.025))
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

  function handleTilt(nx, ny) {
    tiltXRef.current = nx; setTiltX(nx)
    tiltYRef.current = ny; setTiltY(ny)
  }

  function reset() {
    tiltXRef.current = 0; setTiltX(0)
    tiltYRef.current = 0; setTiltY(0)
  }

  return (
    <ExperimentLayout
      label="experiment"
      title="Depth Frames"
      description="Stacked semi-transparent rectangles with a front-to-back color gradient and radial glow, creating the illusion of depth through layered light. Drag to tilt."
    >
      <ExperimentShell>

        <ExperimentControls>
          <ExperimentControls.Section label="Perspective">
            <XYPad x={tiltX} y={tiltY} onChange={handleTilt} />
            <SliderRow label="Tilt X" value={tiltX}  min={-8}  max={8}   step={0.1}  format={v => v.toFixed(1)} onChange={nx => handleTilt(nx, tiltY)} />
            <SliderRow label="Tilt Y" value={tiltY}  min={-8}  max={8}   step={0.1}  format={v => v.toFixed(1)} onChange={ny => handleTilt(tiltX, ny)} />
            <SliderRow label="Spread" value={spread} min={0}   max={60}  step={1}    onChange={setSpread} />
            <SliderRow label="Fluid"  value={fluid}  min={0}   max={1}   step={0.01} format={v => v.toFixed(2)} onChange={setFluid} />
          </ExperimentControls.Section>

          <ExperimentControls.Section label="Style">
            <SliderRow label="Layers"  value={layers}   min={4}   max={20}  step={1}    onChange={setLayers} />
            <SliderRow label="Opacity" value={opacity}  min={0.3} max={1}   step={0.01} format={v => v.toFixed(2)} onChange={setOpacity} />
            <SliderRow label="Grain"   value={grainAmp} min={0}   max={1}   step={0.05} format={v => v.toFixed(2)} onChange={setGrainAmp} />
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
