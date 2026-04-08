'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import ExperimentLayout from '../../components/layouts/ExperimentLayout'
import ExperimentShell from '../../components/layouts/experiment/ExperimentShell'
import ExperimentControls from '../../components/layouts/experiment/ExperimentControls'
import ExperimentStage from '../../components/layouts/experiment/ExperimentStage'

// ── WebGL helpers ──────────────────────────────────────────────────────────────

function compileShader(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  return sh
}

function buildProgram(gl, vsSrc, fsSrc) {
  const prog = gl.createProgram()
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER,   vsSrc))
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, fsSrc))
  gl.linkProgram(prog)
  return prog
}

function hexToVec4(hex, alpha) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, alpha]
}

// ── Draw modes ─────────────────────────────────────────────────────────────────

const MODES = [
  { key: 'TRIANGLES',      label: 'Triangles',      min: 3, hint: 'Every 3 vertices = 1 triangle. Add multiples of 3.' },
  { key: 'TRIANGLE_FAN',   label: 'Triangle Fan',   min: 3, hint: 'First vertex is the anchor. Each new vertex fans out.' },
  { key: 'TRIANGLE_STRIP', label: 'Triangle Strip', min: 3, hint: 'Each new vertex creates a triangle with the previous two.' },
  { key: 'LINE_LOOP',      label: 'Line Loop',      min: 2, hint: 'Vertices connected as a closed polygon outline.' },
  { key: 'POINTS',         label: 'Points',         min: 1, hint: 'Each vertex rendered as a point. Adjust Point Size.' },
]

const DEFAULT_VERTS = [
  [  0.0,  0.55 ],
  [ -0.5, -0.38 ],
  [  0.5, -0.38 ],
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function VertexPlayground() {
  const canvasRef   = useRef(null)
  const glRef       = useRef(null)
  const progRef     = useRef(null)
  const bufRef      = useRef(null)
  const uColorRef   = useRef(null)
  const uPtSizeRef  = useRef(null)
  const rafRef      = useRef(null)
  const loopRef     = useRef(null)

  // Mutable state in refs (read by RAF loop)
  const vertsRef    = useRef(DEFAULT_VERTS.map(v => [...v]))
  const modeRef     = useRef('TRIANGLES')
  const colorRef    = useRef('#7C5CFF')
  const alphaRef    = useRef(0.82)
  const ptSizeRef   = useRef(12)
  const dirtyRef    = useRef(true)   // buffer needs re-upload
  const draggingRef = useRef(null)   // index of dragged vertex

  // React state (drives controls UI + overlay handles)
  const [verts,   setVerts]   = useState(DEFAULT_VERTS.map(v => [...v]))
  const [mode,    setMode]    = useState('TRIANGLES')
  const [color,   setColor]   = useState('#7C5CFF')
  const [alpha,   setAlpha]   = useState(0.82)
  const [ptSize,  setPtSize]  = useState(12)

  const currentMode = MODES.find(m => m.key === mode)

  // ── WebGL init ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    glRef.current = gl

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const vsSrc = `
      attribute vec2 aPos;
      uniform float uPtSize;
      void main() {
        gl_Position  = vec4(aPos, 0.0, 1.0);
        gl_PointSize = uPtSize;
      }
    `
    const fsSrc = `
      precision mediump float;
      uniform vec4 uColor;
      void main() {
        gl_FragColor = uColor;
      }
    `

    const prog = buildProgram(gl, vsSrc, fsSrc)
    gl.useProgram(prog)
    progRef.current = prog

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    bufRef.current = buf

    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    uColorRef.current  = gl.getUniformLocation(prog, 'uColor')
    uPtSizeRef.current = gl.getUniformLocation(prog, 'uPtSize')

    const [r, g, b, a] = hexToVec4(colorRef.current, alphaRef.current)
    gl.uniform4f(uColorRef.current, r, g, b, a)
    gl.uniform1f(uPtSizeRef.current, ptSizeRef.current)

    // Resize
    function resize() {
      const rect   = canvas.parentElement.getBoundingClientRect()
      canvas.width  = rect.width
      canvas.height = rect.height
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()

    // RAF loop
    loopRef.current = () => {
      const v = vertsRef.current
      if (v.length === 0) {
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        rafRef.current = requestAnimationFrame(loopRef.current)
        return
      }

      if (dirtyRef.current) {
        const flat = new Float32Array(v.flat())
        gl.bindBuffer(gl.ARRAY_BUFFER, bufRef.current)
        gl.bufferData(gl.ARRAY_BUFFER, flat, gl.DYNAMIC_DRAW)
        dirtyRef.current = false
      }

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      const glMode = gl[modeRef.current]
      const n      = v.length

      // For TRIANGLES: only draw complete groups of 3
      const drawN = modeRef.current === 'TRIANGLES'
        ? Math.floor(n / 3) * 3
        : n

      if (drawN >= (currentModeMin(modeRef.current))) {
        gl.drawArrays(glMode, 0, drawN)
      }

      rafRef.current = requestAnimationFrame(loopRef.current)
    }
    rafRef.current = requestAnimationFrame(loopRef.current)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  function currentModeMin(key) {
    return MODES.find(m => m.key === key)?.min ?? 1
  }

  // ── Sync state → refs ────────────────────────────────────────────────────────
  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => {
    colorRef.current = color
    alphaRef.current = alpha
    const gl = glRef.current
    if (!gl) return
    const [r, g, b, a] = hexToVec4(color, alpha)
    gl.uniform4f(uColorRef.current, r, g, b, a)
  }, [color, alpha])
  useEffect(() => {
    ptSizeRef.current = ptSize
    const gl = glRef.current
    if (!gl) return
    gl.uniform1f(uPtSizeRef.current, ptSize)
  }, [ptSize])

  // ── Mouse coords → NDC ───────────────────────────────────────────────────────
  function toNDC(e) {
    const canvas = canvasRef.current
    const rect   = canvas.getBoundingClientRect()
    const cx     = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const cy_    = e.clientY ?? e.touches?.[0]?.clientY ?? 0
    const px     = (cx  - rect.left) * (canvas.width  / rect.width)
    const py     = (cy_ - rect.top)  * (canvas.height / rect.height)
    return [
      (px / canvas.width)  * 2 - 1,
      1 - (py / canvas.height) * 2,
    ]
  }

  function nearestVertex(nx, ny) {
    const v    = vertsRef.current
    const DIST = 0.12
    let best = null, bestD = DIST
    for (let i = 0; i < v.length; i++) {
      const dx = v[i][0] - nx, dy = v[i][1] - ny
      const d  = Math.sqrt(dx * dx + dy * dy)
      if (d < bestD) { best = i; bestD = d }
    }
    return best
  }

  function onPointerDown(e) {
    if (e.button === 2) return  // right-click handled separately
    const [nx, ny] = toNDC(e)
    const hit = nearestVertex(nx, ny)
    if (hit !== null) {
      draggingRef.current = hit
    } else {
      // Add new vertex
      const next = [...vertsRef.current, [nx, ny]]
      vertsRef.current = next
      dirtyRef.current = true
      setVerts(next.map(v => [...v]))
      draggingRef.current = next.length - 1
    }
  }

  function onPointerMove(e) {
    if (draggingRef.current === null) return
    const [nx, ny] = toNDC(e)
    const v = [...vertsRef.current]
    v[draggingRef.current] = [
      Math.max(-1, Math.min(1, nx)),
      Math.max(-1, Math.min(1, ny)),
    ]
    vertsRef.current = v
    dirtyRef.current = true
    setVerts(v.map(p => [...p]))
  }

  function onPointerUp() {
    draggingRef.current = null
  }

  function onContextMenu(e) {
    e.preventDefault()
    const [nx, ny] = toNDC(e)
    const hit = nearestVertex(nx, ny)
    if (hit === null) return
    const next = vertsRef.current.filter((_, i) => i !== hit)
    vertsRef.current = next
    dirtyRef.current = true
    setVerts(next.map(v => [...v]))
  }

  function reset() {
    vertsRef.current = DEFAULT_VERTS.map(v => [...v])
    dirtyRef.current = true
    setVerts(DEFAULT_VERTS.map(v => [...v]))
    setMode('TRIANGLES')
    modeRef.current = 'TRIANGLES'
  }

  function clearAll() {
    vertsRef.current = []
    dirtyRef.current = true
    setVerts([])
  }

  // ── NDC → CSS % for overlay handles ─────────────────────────────────────────
  function ndcToPercent(nx, ny) {
    return {
      left: `${((nx + 1) / 2) * 100}%`,
      top:  `${((1 - ny) / 2) * 100}%`,
    }
  }

  const insufficientVerts = verts.length < currentMode.min
    || (mode === 'TRIANGLES' && verts.length % 3 !== 0 && verts.length >= 3)

  return (
    <ExperimentLayout
      label="experiment"
      title="Vertex Playground"
      description="Click to place vertices, drag to move, right-click to remove. Switch draw modes to see how WebGL interprets the same points differently."
    >
      <ExperimentShell>

        <ExperimentControls>

          <ExperimentControls.Section label="Draw Mode">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {MODES.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.04em',
                    border: mode === m.key
                      ? '1px solid var(--color-violet)'
                      : '1px solid var(--color-tool-border)',
                    background: mode === m.key
                      ? 'rgba(124,92,255,0.12)'
                      : 'var(--color-tool-bg3)',
                    color: mode === m.key
                      ? 'var(--color-violet)'
                      : 'var(--color-tool-text2)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', lineHeight: 1.5, marginTop: 6 }}>
              {currentMode.hint}
            </p>
          </ExperimentControls.Section>

          <ExperimentControls.Section label="Appearance">
            <div className="ctrl-row">
              <span className="ctrl-label">Color</span>
              <div className="ctrl-right" style={{ justifyContent: 'flex-end' }}>
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                <span className="ctrl-val" style={{ width: 64 }}>{color}</span>
              </div>
            </div>
            <div className="ctrl-row">
              <span className="ctrl-label">Opacity</span>
              <div className="ctrl-right">
                <input type="range" min={0.1} max={1} step={0.01} value={alpha}
                  onChange={e => setAlpha(parseFloat(e.target.value))} />
                <span className="ctrl-val">{alpha.toFixed(2)}</span>
              </div>
            </div>
            {mode === 'POINTS' && (
              <div className="ctrl-row">
                <span className="ctrl-label">Point size</span>
                <div className="ctrl-right">
                  <input type="range" min={2} max={48} step={1} value={ptSize}
                    onChange={e => setPtSize(parseFloat(e.target.value))} />
                  <span className="ctrl-val">{ptSize}px</span>
                </div>
              </div>
            )}
          </ExperimentControls.Section>

          <ExperimentControls.Section label="Vertices">
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-tool-text3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              maxHeight: 160,
              overflowY: 'auto',
            }}>
              {verts.length === 0
                ? <span style={{ color: 'var(--color-muted)' }}>No vertices. Click the canvas.</span>
                : verts.map((v, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ color: 'var(--color-muted)' }}>V{i}</span>
                    <span style={{ color: 'var(--color-tool-text)' }}>
                      ({v[0].toFixed(2)}, {v[1].toFixed(2)})
                    </span>
                  </div>
                ))
              }
            </div>

            {insufficientVerts && verts.length > 0 && (
              <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#f59e0b', lineHeight: 1.5, marginTop: 4 }}>
                {mode === 'TRIANGLES'
                  ? `${verts.length % 3 === 0 ? '' : `Add ${3 - (verts.length % 3)} more vertex${3 - (verts.length % 3) > 1 ? 'es' : ''} to complete the triangle.`}`
                  : `Need at least ${currentMode.min} vertices.`}
              </p>
            )}

            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <button
                onClick={reset}
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '6px 0',
                  borderRadius: 6,
                  border: '1px solid var(--color-tool-border2)',
                  background: 'var(--color-tool-bg3)',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-foreground)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}
              >
                ↺ Reset
              </button>
              <button
                onClick={clearAll}
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '6px 0',
                  borderRadius: 6,
                  border: '1px solid var(--color-tool-border2)',
                  background: 'var(--color-tool-bg3)',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-foreground)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}
              >
                ✕ Clear
              </button>
            </div>
          </ExperimentControls.Section>

        </ExperimentControls>

        <ExperimentStage height="clamp(420px, 68vh, 780px)" noBg center={false}>

          {/* Grid backdrop */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: [
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            ].join(','),
            backgroundSize: '60px 60px',
          }} />

          {/* Axis lines */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ position: 'absolute', bottom: '50%', left: '50%', transform: 'translate(4px, -4px)', fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.18)' }}>
              (0,0)
            </span>
          </div>

          {/* WebGL canvas */}
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'crosshair' }}
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onContextMenu={onContextMenu}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
          />

          {/* Vertex handle overlays */}
          {verts.map((v, i) => {
            const { left, top } = ndcToPercent(v[0], v[1])
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left, top,
                  width: 18, height: 18,
                  borderRadius: '50%',
                  background: 'var(--color-mint)',
                  border: '2px solid #0a0a0c',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  boxShadow: '0 0 0 3px rgba(46,230,166,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 7, fontFamily: 'monospace', fontWeight: 700, color: '#0a0a0c',
                  zIndex: 10,
                }}
              >
                {i}
              </div>
            )
          })}

          {/* Instruction badge */}
          <div style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em',
            color: 'rgba(255,255,255,0.3)',
            display: 'flex', gap: 16, whiteSpace: 'nowrap',
          }}>
            <span>Click → add</span>
            <span>Drag → move</span>
            <span>Right-click → remove</span>
          </div>

          {/* Vertex count badge */}
          <div style={{
            position: 'absolute', top: 14, right: 14,
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'rgba(255,255,255,0.25)',
          }}>
            {verts.length} {verts.length === 1 ? 'vertex' : 'vertices'}
          </div>

        </ExperimentStage>

      </ExperimentShell>
    </ExperimentLayout>
  )
}
