'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import Section from '../../components/Section'

// ─── Shared prose components ──────────────────────────────────────────────────

function P({ children }) {
  return <p className="text-[15px] leading-[1.85] text-foreground mb-5">{children}</p>
}
function H2({ id, children }) {
  return <h2 id={id} className="text-[22px] font-bold mt-12 mb-4 scroll-mt-24">{children}</h2>
}
function IC({ children }) {
  return (
    <code className="font-mono text-[12.5px] text-violet bg-bg2 border border-ui rounded px-[5px] py-[2px]">
      {children}
    </code>
  )
}
function Code({ children, lang }) {
  return (
    <div className="relative my-6 rounded-xl overflow-hidden border border-ui">
      {lang && (
        <div className="absolute top-0 right-0 px-3 py-2 text-[10px] font-mono text-muted uppercase tracking-wider">
          {lang}
        </div>
      )}
      <pre className="bg-bg2 p-5 overflow-x-auto text-[13px] font-mono leading-[1.75] text-foreground m-0 [tab-size:2]">
        <code>{children}</code>
      </pre>
    </div>
  )
}
function Callout({ children }) {
  return (
    <div className="my-6 px-5 py-4 rounded-xl border border-[rgba(107,78,230,0.3)] bg-[rgba(107,78,230,0.06)] text-[14px] leading-relaxed text-foreground">
      {children}
    </div>
  )
}
function Divider() {
  return <hr className="border-none border-t border-ui my-12" />
}

// ─── Shared demo components ────────────────────────────────────────────────────

function DemoBox({ label, children }) {
  return (
    <div className="my-8 rounded-xl border border-ui bg-bg2 overflow-hidden">
      <div className="px-5 py-2.5 border-b border-ui flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-violet shrink-0" />
        <span className="text-[10px] font-mono text-muted uppercase tracking-widest">{label}</span>
      </div>
      <div className="p-6 flex flex-col gap-5">{children}</div>
    </div>
  )
}
function PlayBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="self-start inline-flex items-center gap-2 px-5 py-2 rounded-lg text-[12px] font-semibold text-white cursor-pointer hover:opacity-85 transition-opacity"
      style={{ background: 'linear-gradient(135deg, var(--color-violet), var(--color-mint))' }}
    >
      Play
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
        <polygon points="0,0 10,5 0,10" />
      </svg>
    </button>
  )
}
function PreviewArea({ children }) {
  return (
    <div className="bg-bg rounded-xl border border-ui px-7 py-6 min-h-[80px] flex items-center">
      {children}
    </div>
  )
}
function TabRow({ options, value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer border transition-colors
            ${value === o.value ? 'bg-violet text-white border-violet' : 'bg-bg border-ui text-muted hover:text-foreground'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── Mini curve SVG ───────────────────────────────────────────────────────────

const SZ   = 120
const PAD  = 14
const INN  = SZ - PAD * 2
const YMIN = -0.45
const YMAX = 1.45

function bx(v) { return PAD + v * INN }
function by(v) { return PAD + (1 - (v - YMIN) / (YMAX - YMIN)) * INN }

function CurveViz({ p1, p2, accent = 'var(--color-violet)', size = 120 }) {
  const scale = size / SZ
  const vb = `0 0 ${SZ} ${SZ}`
  const s0x = bx(0), s0y = by(0)
  const s1x = bx(1), s1y = by(1)
  const c1x = bx(p1[0]), c1y = by(p1[1])
  const c2x = bx(p2[0]), c2y = by(p2[1])
  const d = `M ${s0x} ${s0y} C ${c1x} ${c1y} ${c2x} ${c2y} ${s1x} ${s1y}`

  // [0,1] box
  const boxX = Math.min(bx(0), bx(1))
  const boxY = Math.min(by(0), by(1))
  const boxW = Math.abs(bx(1) - bx(0))
  const boxH = Math.abs(by(1) - by(0))

  return (
    <svg viewBox={vb} width={size} height={size} style={{ display: 'block' }}>
      <rect x={boxX} y={boxY} width={boxW} height={boxH}
        fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <line x1={s0x} y1={s0y} x2={s1x} y2={s1y}
        stroke="rgba(255,255,255,0.07)" strokeWidth={1} strokeDasharray="3 3" />
      <line x1={s0x} y1={s0y} x2={c1x} y2={c1y}
        stroke="rgba(124,92,255,0.35)" strokeWidth={1} />
      <line x1={s1x} y1={s1y} x2={c2x} y2={c2y}
        stroke="rgba(46,230,166,0.35)" strokeWidth={1} />
      <path d={d} fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" />
      <circle cx={s0x} cy={s0y} r={3} fill="var(--color-muted)" />
      <circle cx={s1x} cy={s1y} r={3} fill="var(--color-muted)" />
      <circle cx={c1x} cy={c1y} r={4} fill="var(--color-violet)" />
      <circle cx={c2x} cy={c2y} r={4} fill="var(--color-mint)" />
    </svg>
  )
}

// ─── Demo 1 — Time vs. Progress ───────────────────────────────────────────────

function TimeProgressDemo() {
  const [active, setActive] = useState('linear')
  const [playing, setPlaying] = useState(false)

  const curves = {
    linear:   { p1: [0.5, 0.5], p2: [0.5, 0.5], css: 'linear' },
    ease:     { p1: [0.25, 0.1], p2: [0.25, 1],  css: 'ease' },
    'ease-out': { p1: [0, 0], p2: [0.58, 1], css: 'ease-out' },
  }

  const play = useCallback(() => {
    setPlaying(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setPlaying(true)))
  }, [])

  useEffect(() => { play() }, [play])

  const cur = curves[active]

  return (
    <>
      <TabRow
        options={[
          { value: 'linear',    label: 'linear' },
          { value: 'ease',      label: 'ease' },
          { value: 'ease-out',  label: 'ease-out' },
        ]}
        value={active}
        onChange={v => { setActive(v); setPlaying(false); requestAnimationFrame(() => requestAnimationFrame(() => setPlaying(true))) }}
      />

      <div className="flex gap-6 items-start flex-wrap">
        <CurveViz p1={cur.p1} p2={cur.p2} size={100} />

        <div className="flex-1 min-w-[180px]">
          <p className="text-[11px] font-mono text-muted mb-3 uppercase tracking-widest">Progress over time</p>
          <div className="relative h-10 rounded-lg overflow-hidden" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-ui)' }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              width: '28px', height: '28px',
              borderRadius: '50%',
              background: 'var(--color-violet)',
              left: playing ? 'calc(100% - 32px)' : '4px',
              transform: 'translateY(-50%)',
              transition: playing ? `left 1200ms ${cur.css}` : 'none',
            }} />
          </div>
          <p className="text-[11px] font-mono text-muted mt-2">
            Same 1200ms. The curve controls <em>how fast</em> it moves at each moment.
          </p>
        </div>
      </div>

      <PlayBtn onClick={play} />
    </>
  )
}

// ─── Demo 2 — Side by side comparison ────────────────────────────────────────

function ComparisonDemo() {
  const [playing, setPlaying] = useState(false)

  const rows = [
    { label: 'linear',                css: 'linear',                             color: 'var(--color-muted)' },
    { label: 'ease-in',               css: 'ease-in',                            color: 'var(--color-muted)' },
    { label: 'ease-out',              css: 'ease-out',                           color: 'var(--color-violet)' },
    { label: 'ease-in-out',           css: 'ease-in-out',                        color: 'var(--color-violet)' },
    { label: 'spring',                css: 'cubic-bezier(0.34, 1.56, 0.64, 1)', color: 'var(--color-mint)' },
  ]

  const play = useCallback(() => {
    setPlaying(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setPlaying(true)))
  }, [])

  useEffect(() => { play() }, [play])

  return (
    <>
      <p className="text-[12px] font-mono text-muted">Same duration (900ms), different curves. Watch where each ball is at the midpoint.</p>
      <div className="flex flex-col gap-2">
        {rows.map(row => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="text-[11px] font-mono w-[112px] shrink-0" style={{ color: row.color }}>
              {row.label}
            </span>
            <div className="flex-1 relative h-8 rounded-lg overflow-hidden" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-ui)' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                width: '22px', height: '22px',
                borderRadius: '50%',
                background: row.color,
                left: playing ? 'calc(100% - 26px)' : '4px',
                transform: 'translateY(-50%)',
                transition: playing ? `left 900ms ${row.css}` : 'none',
              }} />
            </div>
          </div>
        ))}
      </div>
      <PlayBtn onClick={play} />
    </>
  )
}

// ─── Demo 3 — Overshoot slider ────────────────────────────────────────────────

function OvershootDemo() {
  const [y2, setY2] = useState(1.56)
  const [playing, setPlaying] = useState(false)

  const css = `cubic-bezier(0.34, ${y2.toFixed(2)}, 0.64, 1)`

  const play = useCallback(() => {
    setPlaying(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setPlaying(true)))
  }, [])

  useEffect(() => { play() }, [play])

  return (
    <>
      <div className="flex gap-6 items-start flex-wrap">
        <CurveViz p1={[0.34, y2]} p2={[0.64, 1]} size={100} />

        <div className="flex-1 min-w-[180px] flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted">P1 y value (overshoot)</span>
              <span className="text-foreground font-mono tabular-nums">{y2.toFixed(2)}</span>
            </div>
            <input
              type="range" min={1.0} max={2.2} step={0.05} value={y2}
              onChange={e => { setY2(parseFloat(e.target.value)); play() }}
              className="w-full h-[3px] appearance-none rounded bg-ui outline-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-violet [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <p className="text-[11px] font-mono text-muted">
              {y2 <= 1.05 ? 'No overshoot, just deceleration.' : y2 < 1.4 ? 'Subtle spring feel.' : y2 < 1.8 ? 'Clear overshoot: physical and alive.' : 'Strong bounce, use sparingly.'}
            </p>
          </div>

          <div className="relative h-10 rounded-lg overflow-hidden" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-ui)' }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              width: '28px', height: '28px',
              borderRadius: '50%',
              background: 'var(--color-violet)',
              left: playing ? 'calc(100% - 32px)' : '4px',
              transform: 'translateY(-50%)',
              transition: playing ? `left 600ms ${css}` : 'none',
            }} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <PlayBtn onClick={play} />
        <code className="text-[11px] font-mono text-violet bg-bg2 border border-ui rounded px-2 py-1">{css}</code>
      </div>
    </>
  )
}

// ─── Demo 4 — The 5 famous curves ────────────────────────────────────────────

const FAMOUS = [
  {
    name:  'ease',
    label: 'The Default',
    p1:    [0.25, 0.1],
    p2:    [0.25, 1],
    css:   'cubic-bezier(0.25, 0.10, 0.25, 1.00)',
    why:   "The browser default. Starts slightly fast and decelerates smoothly to a stop. Great for elements entering the screen, feels intentional without being dramatic.",
    accent: 'var(--color-muted)',
  },
  {
    name:  'ease-out',
    label: 'The Workhorse',
    p1:    [0, 0],
    p2:    [0.58, 1],
    css:   'cubic-bezier(0.00, 0.00, 0.58, 1.00)',
    why:   "Starts at full speed, decelerates to rest. The most natural-feeling easing for UI elements moving into position, mimicking an object thrown and slowing down.",
    accent: 'var(--color-violet)',
  },
  {
    name:  'spring',
    label: 'The Spring',
    p1:    [0.34, 1.56],
    p2:    [0.64, 1],
    css:   'cubic-bezier(0.34, 1.56, 0.64, 1.00)',
    why:   "Overshoots the target slightly before snapping back. The P1 y-value above 1.0 is what makes it spring. One of the most satisfying curves for interactive UI, card hovers, and scale animations.",
    accent: 'var(--color-mint)',
  },
  {
    name:  'snappy',
    label: 'The Snap',
    p1:    [0.9, 0],
    p2:    [0.1, 1],
    css:   'cubic-bezier(0.90, 0.00, 0.10, 1.00)',
    why:   "Very fast at the start, very slow at the end. Great for UI that needs to feel responsive: a drawer, a tooltip, a dropdown. The element snaps into place and drifts the last few pixels.",
    accent: 'var(--color-violet)',
  },
  {
    name:  'anticipate',
    label: 'The Anticipate',
    p1:    [0.36, -0.3],
    p2:    [0.63, 1.3],
    css:   'cubic-bezier(0.36, -0.30, 0.63, 1.30)',
    why:   "Dips slightly before launching forward, then overshoots at the end. The P1 y-value below 0 creates the anticipation. Playful and expressive, best used for hero elements and deliberate call-to-action animations.",
    accent: 'var(--color-mint)',
  },
]

function CurveShowcase() {
  const [playing, setPlaying] = useState(null)
  const [copied, setCopied] = useState(null)
  const timers = useRef({})

  const play = useCallback((name) => {
    setPlaying(null)
    requestAnimationFrame(() => requestAnimationFrame(() => setPlaying(name)))
  }, [])

  const copy = (css, name) => {
    navigator.clipboard.writeText(css)
    setCopied(name)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="flex flex-col gap-6 my-8">
      {FAMOUS.map(curve => (
        <div key={curve.name} className="rounded-xl border border-ui bg-bg2 overflow-hidden">
          <div className="p-5 flex gap-5 items-start flex-wrap">

            <CurveViz p1={curve.p1} p2={curve.p2} accent={curve.accent} size={96} />

            <div className="flex-1 min-w-[200px] flex flex-col gap-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="text-[16px] font-bold">{curve.label}</h3>
                <span className="text-[11px] font-mono text-muted">{curve.name}</span>
              </div>
              <p className="text-[13px] text-muted leading-relaxed">{curve.why}</p>

              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <button
                  onClick={() => play(curve.name)}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-semibold text-white cursor-pointer hover:opacity-85 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, var(--color-violet), var(--color-mint))' }}
                >
                  Play
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                    <polygon points="0,0 10,5 0,10" />
                  </svg>
                </button>
                <button
                  onClick={() => copy(curve.css, curve.name)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-mono cursor-pointer border border-ui bg-bg hover:border-violet transition-colors"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {copied === curve.name ? '✓ Copied' : 'Copy CSS'}
                </button>
              </div>
            </div>
          </div>

          {/* Track */}
          <div className="px-5 pb-5">
            <div className="relative h-9 rounded-lg overflow-hidden" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-ui)' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                width: '26px', height: '26px',
                borderRadius: '50%',
                background: curve.accent,
                left: playing === curve.name ? 'calc(100% - 30px)' : '4px',
                transform: 'translateY(-50%)',
                transition: playing === curve.name ? `left 700ms ${curve.css}` : 'none',
              }} />
            </div>
            <p className="text-[10px] font-mono text-muted mt-1.5">{curve.css}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── The Post ─────────────────────────────────────────────────────────────────

export default function EasingCurvesPost() {
  return (
    <Section size="narrow">

        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-[12px] font-mono text-muted hover:text-foreground transition-colors no-underline mb-10">
          ← All posts
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted mb-4">
            <span>March 18, 2026</span>
            <span>·</span>
            <span>7 min read</span>
          </div>
          <h1 className="text-[clamp(28px,5vw,44px)] font-bold leading-[1.15] tracking-[-0.02em] mb-5">
            Easing Curves Explained: The Secret Behind Great Animation
          </h1>
          <div className="flex flex-wrap gap-2">
            {['CSS', 'Animation', 'Motion'].map(tag => (
              <span key={tag} className="font-mono text-[10px] px-2 py-1 rounded border border-ui bg-bg2 text-muted">
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Article */}
        <article>
          <P>
            Two animations can have the exact same duration and move between the exact same
            positions, yet one feels mechanical and cheap while the other feels physical and alive.
            The difference is almost always the easing curve.
          </P>
          <P>
            Most developers never give them a second thought. They ship with <IC>ease</IC>, <IC>linear</IC>, or
            <IC>ease-in-out</IC> and call it done. Not because it's a good choice, but because
            it's the path of least resistance. The result is interfaces that technically animate
            but never quite feel alive.
          </P>
          <P>
            In this article we'll go deeper than the defaults. We'll break down how cubic-bezier
            curves actually work, what gives motion its physical quality, and how far you can push
            a single timing function to make an interface feel hand-crafted.
          </P>

          <Divider />

          {/* ── 1. What is a cubic-bezier ── */}
          <H2 id="what-is">1. What Is a cubic-bezier?</H2>
          <P>
            A <IC>cubic-bezier</IC> is a mathematical curve defined by four points: a fixed start
            at <IC>(0, 0)</IC>, a fixed end at <IC>(1, 1)</IC>, and two movable control points
            <IC>P1</IC> and <IC>P2</IC>. In CSS, you only specify the two control points:
          </P>

          <Code lang="css">{`transition-timing-function: cubic-bezier(x1, y1, x2, y2);
/*                                         ──P1──  ──P2──  */`}</Code>

          <P>
            The horizontal axis represents <strong>time</strong> (0 = start, 1 = end of the
            transition). The vertical axis represents <strong>progress</strong> (0 = initial
            value, 1 = final value). The curve maps time to progress; the slope at any point
            on the curve is the speed of the animation at that moment.
          </P>

          <Callout>
            <strong>Steep slope = fast.</strong> A steep part of the curve means a lot of progress
            happens in a short time, meaning the animation is moving quickly. A flat section means
            almost no progress: the animation is nearly still.
          </Callout>

          <DemoBox label="Interactive · Time vs. Progress">
            <TimeProgressDemo />
          </DemoBox>

          <P>
            Notice how <IC>linear</IC> covers equal distance per unit time: predictable, but
            lifeless. <IC>ease</IC> starts a bit faster and decelerates. <IC>ease-out</IC> begins
            at full speed and coasts to a stop, which feels more natural because it mimics
            real-world friction.
          </P>

          <Divider />

          {/* ── 2. The four values ── */}
          <H2 id="four-values">2. Understanding the Four Values</H2>
          <P>
            Each control point has an x and a y coordinate. There's one important constraint:
            the x values must stay in the <IC>[0, 1]</IC> range. The y values, however, can go
            anywhere, and that's where things get interesting.
          </P>

          <Code lang="css">{`cubic-bezier(x1, y1, x2, y2)
/*
  x1, x2 → must be in [0, 1]   (time constraints)
  y1, y2 → can be anything      (progress can overshoot)

  P1 (x1, y1) → influences the start of the curve
  P2 (x2, y2) → influences the end of the curve
*/`}</Code>

          <P>
            P1 is connected to the start point <IC>(0, 0)</IC> with a line, and P2 is
            connected to the end point <IC>(1, 1)</IC>. These lines are the handles.
            Pulling a handle away from the diagonal increases the curve's speed in that
            region. Pushing it toward the diagonal flattens the motion.
          </P>
          <P>
            The five named CSS easings are just shortcuts for specific cubic-bezier values:
          </P>

          <Code lang="css">{`ease         → cubic-bezier(0.25, 0.10, 0.25, 1.00)
ease-in      → cubic-bezier(0.42, 0.00, 1.00, 1.00)
ease-out     → cubic-bezier(0.00, 0.00, 0.58, 1.00)
ease-in-out  → cubic-bezier(0.42, 0.00, 0.58, 1.00)
linear       → cubic-bezier(0.00, 0.00, 1.00, 1.00)`}</Code>

          <DemoBox label="Interactive · Easing Comparison">
            <ComparisonDemo />
          </DemoBox>

          <P>
            The most striking comparison here is <IC>ease-in</IC> vs <IC>ease-out</IC>.
            Ease-in starts slow and accelerates, like an object being pushed
            from rest. For UI elements leaving the screen that can work, but for elements
            entering, it always feels sluggish. Ease-out is almost always the better
            default for entering elements.
          </P>

          <Divider />

          {/* ── 3. Going beyond 1 ── */}
          <H2 id="overshoot">3. Going Beyond [0, 1]: Overshoot and Anticipate</H2>
          <P>
            When a y value exceeds 1.0, the animation briefly surpasses its target before
            coming back. When a y value drops below 0, the animation briefly goes in the
            opposite direction before correcting. These are called <strong>overshoot</strong>{' '}
            and <strong>anticipate</strong>.
          </P>
          <P>
            This is where CSS cubic-bezier gets genuinely expressive. A slight overshoot
            tricks the eye into reading the motion as <em>physical</em>, like a rubber band
            or a spring. Without any overshoot, even a well-crafted ease can feel like a
            computer moving something. With a subtle overshoot, it suddenly feels alive.
          </P>

          <Code lang="css">{`/* Standard ease-out — stops exactly at the target */
transition-timing-function: cubic-bezier(0.00, 0.00, 0.58, 1.00);

/* Spring — overshoots then snaps back */
transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1.00);
/*                                              ^^^^
                             y1 above 1.0 = overshoot */

/* Anticipate — dips before launching */
transition-timing-function: cubic-bezier(0.36, -0.30, 0.63, 1.30);
/*                                              ^^^^^
                             y1 below 0 = moves in reverse briefly */`}</Code>

          <DemoBox label="Interactive · Overshoot Slider">
            <OvershootDemo />
          </DemoBox>

          <P>
            Drag the slider upward past 1.0 and watch the ball briefly fly past its
            destination before snapping back. Around 1.4–1.6 is the sweet spot for most UI.
            Above 1.8, it starts feeling like a bounce and draws too much attention to itself.
          </P>

          <Callout>
            <strong>Overshoot on opacity doesn't work.</strong> If you apply an overshooting
            curve to a property that can't go negative or beyond its range (like{' '}
            <IC>opacity</IC>), the browser clamps the value and the overshoot is invisible.
            Use overshoot on spatial properties: <IC>transform</IC>, <IC>left</IC>,{' '}
            <IC>width</IC>, <IC>scale</IC>.
          </Callout>

          <Divider />

          {/* ── 4. In code ── */}
          <H2 id="in-code">4. Using cubic-bezier in Practice</H2>
          <P>
            You can use cubic-bezier anywhere CSS accepts an easing value: <IC>transition</IC>,
            <IC>animation-timing-function</IC>, or the newer <IC>linear()</IC> function for
            keyframe-based spring interpolation.
          </P>

          <Code lang="css">{`/* On a transition */
.card {
  transform: scale(1);
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.card:hover {
  transform: scale(1.04);
}

/* On a keyframe animation */
.modal {
  animation: slideUp 400ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}`}</Code>

          <P>
            In React with inline styles you can build the string dynamically, which is
            useful for animation tools or for parameterising the spring feeling in a
            design system token:
          </P>

          <Code lang="js">{`// Design token approach
const easings = {
  spring:    'cubic-bezier(0.34, 1.56, 0.64, 1)',
  snappy:    'cubic-bezier(0.77, 0.00, 0.18, 1)',
  anticipate:'cubic-bezier(0.36, -0.30, 0.63, 1.3)',
}

// Dynamic spring strength
const spring = (strength = 1.56) =>
  \`cubic-bezier(0.34, \${strength}, 0.64, 1)\`

// Usage in a component
style={{ transition: \`transform 300ms \${spring(1.8)}\` }}`}</Code>

          <Divider />

          {/* ── 5. The 5 curves ── */}
          <H2 id="five-curves">5. Five Curves Worth Bookmarking</H2>
          <P>
            After building the{' '}
            <Link href="/experiments/bezier-editor" className="text-violet hover:underline">
              Bezier Editor
            </Link>{' '}
            and experimenting with motion for a while, these are the five I keep coming back to.
            Each one has a distinct personality. Hit Play on any of them to feel the difference.
          </P>

          <CurveShowcase />

          <Divider />

          {/* ── Closing ── */}
          <H2 id="closing">Where to Go Next</H2>
          <P>
            The best way to develop an intuition for easing is to experiment visually.
            Adjust a control point and immediately see its effect on a moving element.
            You can do exactly that in the{' '}
            <Link href="/experiments/bezier-editor" className="text-violet hover:underline">
              Bezier Editor
            </Link>{' '}
            Drag the handles, pick a preset, tweak the values numerically, and copy
            the CSS directly into your code.
          </P>
          <ul className="list-none flex flex-col gap-3 mb-6 pl-0">
            {[
              ['Start with ease-out', 'Replace every linear or ease with ease-out on entering elements. The difference is immediate.'],
              ['Add a spring to hover states', 'Use cubic-bezier(0.34, 1.56, 0.64, 1) on scale or translate transitions on interactive cards and buttons.'],
              ['Match duration to distance', 'Longer distances need longer durations. A tooltip 8px away should be 120ms. A modal sliding in from offscreen should be 350–450ms.'],
              ['Avoid ease-in for UI', 'Ease-in feels like a loading animation, not a UI interaction. Keep it for exits.'],
              ['Use overshoot sparingly', 'One spring per interaction is usually enough. Multiple overshooting elements compete for attention.'],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-3 text-[14px] leading-relaxed">
                <span className="text-violet mt-[3px] shrink-0">→</span>
                <span>
                  <strong className="text-foreground">{title}.</strong>
                  {' '}<span className="text-muted">{desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </article>

      </Section>
  )
}
