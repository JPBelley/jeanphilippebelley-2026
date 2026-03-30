'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ExperimentLayout   from '../../components/layouts/ExperimentLayout'
import ExperimentShell    from '../../components/layouts/experiment/ExperimentShell'
import ExperimentControls from '../../components/layouts/experiment/ExperimentControls'
import ExperimentStage    from '../../components/layouts/experiment/ExperimentStage'

// ─── Curve geometry ───────────────────────────────────────────────────────────
const SVG_SIZE = 300
const PAD      = 30
const INNER    = SVG_SIZE - PAD * 2
const Y_MIN    = -0.4   // allow overshoot/anticipate below 0
const Y_MAX    = 1.4    // allow overshoot above 1

function toSvg(bx, by) {
  return [
    PAD + bx * INNER,
    PAD + (1 - (by - Y_MIN) / (Y_MAX - Y_MIN)) * INNER,
  ]
}
function toBezier(sx, sy) {
  return [
    (sx - PAD) / INNER,
    Y_MIN + (1 - (sy - PAD) / INNER) * (Y_MAX - Y_MIN),
  ]
}

// ─── Presets ──────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: 'Linear',      p1: [0, 0],        p2: [1, 1]       },
  { label: 'Ease',        p1: [0.25, 0.1],   p2: [0.25, 1]    },
  { label: 'Ease In',     p1: [0.42, 0],     p2: [1, 1]       },
  { label: 'Ease Out',    p1: [0, 0],        p2: [0.58, 1]    },
  { label: 'Ease In Out', p1: [0.42, 0],     p2: [0.58, 1]    },
  { label: 'Overshoot',   p1: [0.34, 1.56],  p2: [0.64, 1]    },
  { label: 'Anticipate',  p1: [0.36, -0.3],  p2: [0.63, 1.3]  },
  { label: 'Snappy',      p1: [0.9, 0],      p2: [0.1, 1]     },
  { label: 'Bounce',      p1: [0.22, 1.8],   p2: [0.64, 1]    },
]

// ─── BezierCanvas ─────────────────────────────────────────────────────────────
function BezierCanvas({ p1, p2, onP1, onP2 }) {
  const svgRef   = useRef(null)
  const dragging = useRef(null)

  const [s0x, s0y] = toSvg(0, 0)
  const [s1x, s1y] = toSvg(1, 1)
  const [p1x, p1y] = toSvg(p1[0], p1[1])
  const [p2x, p2y] = toSvg(p2[0], p2[1])

  const curve = `M ${s0x} ${s0y} C ${p1x} ${p1y} ${p2x} ${p2y} ${s1x} ${s1y}`

  // [0,1] box in SVG space
  const [bx0, by0] = toSvg(0, 0)
  const [bx1, by1] = toSvg(1, 1)
  const boxX = Math.min(bx0, bx1), boxY = Math.min(by0, by1)
  const boxW = Math.abs(bx1 - bx0), boxH = Math.abs(by1 - by0)

  const getPos = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    const cx   = e.touches ? e.touches[0].clientX : e.clientX
    const cy   = e.touches ? e.touches[0].clientY : e.clientY
    return [
      (cx - rect.left) / rect.width  * SVG_SIZE,
      (cy - rect.top)  / rect.height * SVG_SIZE,
    ]
  }

  const onMove = useCallback((e) => {
    if (!dragging.current) return
    const [sx, sy] = getPos(e)
    const [bx, by] = toBezier(sx, sy)
    const x = Math.min(1, Math.max(0, bx))
    const y = Math.min(Y_MAX, Math.max(Y_MIN, by))
    if (dragging.current === 'p1') onP1([x, y])
    else                            onP2([x, y])
  }, [onP1, onP2])

  const onUp = useCallback(() => { dragging.current = null }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend',  onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend',  onUp)
    }
  }, [onMove, onUp])

  const startDrag = (point) => (e) => {
    e.preventDefault()
    dragging.current = point
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className="w-full h-full select-none"
    >
      {/* [0,1] reference box */}
      <rect x={boxX} y={boxY} width={boxW} height={boxH}
        fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />

      {/* Quarter grid */}
      {[0.25, 0.5, 0.75].map(t => {
        const [gx] = toSvg(t, 0)
        const [, gy] = toSvg(0, t)
        return (
          <g key={t}>
            <line x1={gx} y1={boxY} x2={gx} y2={boxY + boxH}
              stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
            <line x1={boxX} y1={gy} x2={boxX + boxW} y2={gy}
              stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          </g>
        )
      })}

      {/* Linear diagonal reference */}
      <line x1={s0x} y1={s0y} x2={s1x} y2={s1y}
        stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="4 4" />

      {/* Handle lines */}
      <line x1={s0x} y1={s0y} x2={p1x} y2={p1y}
        stroke="rgba(124,92,255,0.45)" strokeWidth={1} />
      <line x1={s1x} y1={s1y} x2={p2x} y2={p2y}
        stroke="rgba(46,230,166,0.45)" strokeWidth={1} />

      {/* Curve */}
      <path d={curve} fill="none" stroke="var(--color-foreground)" strokeWidth={2.5} strokeLinecap="round" />

      {/* Anchors */}
      <circle cx={s0x} cy={s0y} r={4} fill="var(--color-muted)" />
      <circle cx={s1x} cy={s1y} r={4} fill="var(--color-muted)" />

      {/* P1 handle (violet) */}
      <circle cx={p1x} cy={p1y} r={10} fill="var(--color-violet)" opacity={0.12} />
      <circle cx={p1x} cy={p1y} r={6}  fill="var(--color-violet)"
        style={{ cursor: 'grab' }}
        onMouseDown={startDrag('p1')}
        onTouchStart={startDrag('p1')} />

      {/* P2 handle (mint) */}
      <circle cx={p2x} cy={p2y} r={10} fill="var(--color-mint)" opacity={0.12} />
      <circle cx={p2x} cy={p2y} r={6}  fill="var(--color-mint)"
        style={{ cursor: 'grab' }}
        onMouseDown={startDrag('p2')}
        onTouchStart={startDrag('p2')} />

      {/* Axis labels */}
      <text x={PAD}           y={SVG_SIZE - 6} fill="rgba(255,255,255,0.2)" fontSize={9} fontFamily="monospace" textAnchor="middle">0</text>
      <text x={PAD + INNER}   y={SVG_SIZE - 6} fill="rgba(255,255,255,0.2)" fontSize={9} fontFamily="monospace" textAnchor="middle">1</text>
      <text x={6}             y={PAD + 3}      fill="rgba(255,255,255,0.2)" fontSize={9} fontFamily="monospace" textAnchor="middle">1</text>
      <text x={6}             y={PAD + INNER}  fill="rgba(255,255,255,0.2)" fontSize={9} fontFamily="monospace" textAnchor="middle">0</text>
    </svg>
  )
}

// ─── NumInput ─────────────────────────────────────────────────────────────────
function NumInput({ label, value, min, max, step, onChange }) {
  return (
    <div className="ctrl-row">
      <span className="ctrl-label">{label}</span>
      <div className="ctrl-right">
        <input
          type="number"
          value={value.toFixed(2)}
          min={min} max={max} step={step}
          onChange={e => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
          }}
          style={{
            width: '64px',
            background: 'var(--color-tool-bg3)',
            border: '1px solid var(--color-tool-border)',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-tool-text)',
            textAlign: 'right',
            outline: 'none',
          }}
        />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BezierEditorPage() {
  const [p1, setP1]         = useState([0.34, 1.56])
  const [p2, setP2]         = useState([0.64, 1])
  const [duration, setDur]  = useState(700)
  const [playing, setPlay]  = useState(false)
  const [copied, setCopied] = useState(false)

  const css = `cubic-bezier(${p1[0].toFixed(2)}, ${p1[1].toFixed(2)}, ${p2[0].toFixed(2)}, ${p2[1].toFixed(2)})`

  const play = useCallback(() => {
    setPlay(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setPlay(true)))
  }, [])

  const copy = () => {
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ExperimentLayout
      label="bezier-editor"
      title="Bezier Editor"
      description={<>Drag the handles to shape your easing curve.&nbsp;<span className="text-violet">Violet = P1</span><span className="text-muted mx-1">·</span><span className="text-mint">Mint = P2</span></>}
    >
        <ExperimentShell>

          {/* ── Controls ── */}
          <ExperimentControls width={200}>
            <ExperimentControls.Section label="Presets" noPad>
              {PRESETS.map(({ label, p1: pp1, p2: pp2 }) => (
                <button
                  key={label}
                  onClick={() => { setP1(pp1); setP2(pp2) }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-tool-text2)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--color-tool-text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--color-tool-text2)'}
                >
                  {label}
                </button>
              ))}
            </ExperimentControls.Section>

            <ExperimentControls.Section label="Handles">
              <NumInput label="X1" value={p1[0]} min={0}  max={1} step={0.01} onChange={v => setP1([v, p1[1]])} />
              <NumInput label="Y1" value={p1[1]} min={-1} max={2} step={0.01} onChange={v => setP1([p1[0], v])} />
              <NumInput label="X2" value={p2[0]} min={0}  max={1} step={0.01} onChange={v => setP2([v, p2[1]])} />
              <NumInput label="Y2" value={p2[1]} min={-1} max={2} step={0.01} onChange={v => setP2([p2[0], v])} />
            </ExperimentControls.Section>

            <ExperimentControls.Section label="CSS">
              <div className="flex flex-col gap-2">
                <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-violet)', lineHeight: '1.6', wordBreak: 'break-all' }}>
                  {css}
                </p>
                <button
                  onClick={copy}
                  style={{
                    padding: '6px 0',
                    background: 'rgba(124,92,255,0.15)',
                    border: '1px solid rgba(124,92,255,0.3)',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-violet)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,92,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,92,255,0.15)'}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </ExperimentControls.Section>
          </ExperimentControls>

          {/* ── Stage: canvas + preview ── */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <ExperimentStage height="auto" center>
              <div style={{ width: '360px', height: '360px', flexShrink: 0, padding: '20px' }}>
                <BezierCanvas p1={p1} p2={p2} onP1={setP1} onP2={setP2} />
              </div>
            </ExperimentStage>

            {/* Preview */}
            <div
              className="w-full rounded-xl"
              style={{
                background: 'var(--color-tool-bg1)',
                border: '1px solid var(--color-tool-border)',
                padding: '16px 20px',
              }}
            >
              <div className="sec-hdr" style={{ padding: '0 0 8px' }}><span>Preview</span></div>
              <div
                className="relative h-12 rounded-lg overflow-hidden mb-4"
                style={{ background: 'var(--color-tool-bg3)', border: '1px solid var(--color-tool-border2)' }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--color-violet)',
                    left: playing ? 'calc(100% - 36px)' : '4px',
                    transform: 'translateY(-50%)',
                    transition: playing ? `left ${duration}ms ${css}` : 'none',
                  }}
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={play}
                  className="inline-flex items-center gap-2 shrink-0"
                  style={{
                    padding: '6px 14px',
                    background: 'rgba(124,92,255,0.15)',
                    border: '1px solid rgba(124,92,255,0.3)',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-violet)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,92,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,92,255,0.15)'}
                >
                  Play
                  <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor" aria-hidden="true">
                    <polygon points="0,0 8,5 0,10" />
                  </svg>
                </button>
                <div className="flex items-center gap-3 flex-1">
                  <span className="tabular-nums" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-tool-text2)', width: '48px' }}>
                    {duration}ms
                  </span>
                  <input
                    type="range" min={200} max={2000} step={100} value={duration}
                    onChange={e => setDur(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

        </ExperimentShell>
    </ExperimentLayout>
  )
}
