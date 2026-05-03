'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Section from '../../components/Section'
import { P, H2, IC, Code, Callout, Divider, DemoBox } from '../../components/blog/prose'

// ─── Demo 1: Spring playground ────────────────────────────────────────────────

function SpringPlaygroundDemo() {
  const [k, setK] = useState(0.08)
  const [d, setD] = useState(0.72)
  const kRef = useRef(0.08)
  const dRef = useRef(0.72)
  const rafRef     = useRef(null)
  const containerRef = useRef(null)
  const targetRef  = useRef(0.7)
  const stateRef   = useRef({ pos: 0.7, vel: 0 })
  const [dotTarget,  setDotTarget]  = useState(0.7)
  const [dotCurrent, setDotCurrent] = useState(0.7)

  kRef.current = k
  dRef.current = d

  useEffect(() => {
    function tick() {
      const s = stateRef.current
      s.vel += (targetRef.current - s.pos) * kRef.current
      s.vel *= dRef.current
      s.pos += s.vel
      setDotCurrent(s.pos)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const setTarget = e => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const v = Math.max(0.05, Math.min(0.95, (clientX - rect.left) / rect.width))
    targetRef.current = v
    setDotTarget(v)
  }

  const pctT = dotTarget  * 100
  const pctC = Math.max(0, Math.min(100, dotCurrent * 100))

  const stiffLabel = k < 0.04 ? 'Very soft' : k < 0.09 ? 'Soft' : k < 0.18 ? 'Medium' : k < 0.35 ? 'Stiff' : 'Rigid'
  const dampLabel  = d < 0.55 ? 'Bouncy' : d < 0.70 ? 'Elastic' : d < 0.82 ? 'Balanced' : d < 0.92 ? 'Smooth' : 'Overdamped'

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-muted">k (stiffness): <span className="text-foreground">{stiffLabel}</span></span>
            <span className="text-violet">{k.toFixed(3)}</span>
          </div>
          <input
            type="range" min={0.01} max={0.5} step={0.005} value={k}
            onChange={e => setK(parseFloat(e.target.value))}
            className="w-full h-[3px] appearance-none rounded bg-ui outline-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-violet [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-muted">d (damping): <span className="text-foreground">{dampLabel}</span></span>
            <span className="text-violet">{d.toFixed(2)}</span>
          </div>
          <input
            type="range" min={0.4} max={0.99} step={0.01} value={d}
            onChange={e => setD(parseFloat(e.target.value))}
            className="w-full h-[3px] appearance-none rounded bg-ui outline-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-violet [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      </div>

      <div
        ref={containerRef}
        onClick={setTarget}
        onTouchStart={setTarget}
        className="relative h-14 rounded-lg cursor-crosshair select-none"
        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-ui)' }}
      >
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-muted pointer-events-none">
          Click to move the target
        </span>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${pctT}%`,
          width: 12, height: 12,
          borderRadius: '50%',
          background: 'var(--color-mint)',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 0 4px rgba(46,230,166,0.2)',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${pctC}%`,
          width: 18, height: 18,
          borderRadius: '50%',
          background: 'var(--color-violet)',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 0 4px rgba(124,92,255,0.2)',
          transition: 'none',
        }} />
      </div>

      <div className="flex gap-5 text-[11px] font-mono">
        <span style={{ color: 'var(--color-mint)' }}>● target</span>
        <span style={{ color: 'var(--color-violet)' }}>● spring</span>
      </div>
    </>
  )
}

// ─── Demo 2: Damping comparison ───────────────────────────────────────────────

function DampingComparisonDemo() {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width  = W * window.devicePixelRatio
    canvas.height = H * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const configs = [
      { label: 'Bouncy  d=0.52', d: 0.52, color: 'rgba(46,230,166,0.85)' },
      { label: 'Balanced  d=0.72', d: 0.72, color: 'rgba(124,92,255,0.85)' },
      { label: 'Overdamped  d=0.94', d: 0.94, color: 'rgba(230,130,46,0.8)' },
    ]
    const STEPS = 120
    const K = 0.09

    function simulate(d) {
      let pos = 1, vel = 0
      const pts = [pos]
      for (let i = 0; i < STEPS; i++) {
        vel += (0 - pos) * K
        vel *= d
        pos += vel
        pts.push(pos)
      }
      return pts
    }

    ctx.clearRect(0, 0, W, H)

    // Grid line at 0
    const midY = H * 0.5
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke()

    configs.forEach(({ d, color }) => {
      const pts = simulate(d)
      const scaleX = W / (STEPS - 1)
      const scaleY = H * 0.36

      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      pts.forEach((p, i) => {
        const x = i * scaleX
        const y = midY - p * scaleY
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
    })

    // Legend
    const legendY = H - 14
    configs.forEach(({ label, color }, i) => {
      ctx.fillStyle = color
      ctx.font = `300 10px "DM Mono", monospace`
      ctx.letterSpacing = '0.06em'
      ctx.fillText(label, 8 + i * (W / 3), legendY)
    })

    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: 180,
        display: 'block',
        borderRadius: 8,
        background: 'var(--color-bg)',
        border: '1px solid var(--color-ui)',
      }}
    />
  )
}

// ─── Demo 3: Spring text entrance ─────────────────────────────────────────────

function SpringTextDemo() {
  const containerRef = useRef(null)
  const rafRef       = useRef(null)
  const [key, setKey] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    cancelAnimationFrame(rafRef.current)

    const raw = 'Always cooking.'
    el.innerHTML = ''
    const spans = raw.split('').map(ch => {
      const s = document.createElement('span')
      s.textContent = ch
      s.style.cssText = 'display:inline-block;white-space:pre;opacity:0;'
      el.appendChild(s)
      return s
    })

    const st = spans.map((_, i) => ({ pos: -60, vel: 0, op: 0, opv: 0 }))
    let frame = 0

    function tick() {
      frame++
      let allDone = true
      spans.forEach((sp, i) => {
        if (frame < i * 3) { allDone = false; return }
        const s = st[i]
        s.vel += (0 - s.pos) * 0.07; s.vel *= 0.68; s.pos += s.vel
        s.opv += (1 - s.op) * 0.09; s.opv *= 0.72; s.op += s.opv
        const settled = Math.abs(s.vel) + Math.abs(s.pos) < 0.05
        if (!settled) allDone = false
        sp.style.transform = `translateY(${s.pos}px)`
        sp.style.opacity   = s.op
      })
      if (!allDone) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [key])

  return (
    <>
      <div className="flex justify-center items-center" style={{ minHeight: 80 }}>
        <div
          ref={containerRef}
          style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: 'var(--color-foreground)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        />
      </div>
      <button
        onClick={() => setKey(k => k + 1)}
        className="text-[11px] font-mono text-muted hover:text-foreground transition-colors cursor-pointer"
        style={{ letterSpacing: '0.1em', background: 'none', border: 'none', padding: 0 }}
      >
        ↺ replay
      </button>
    </>
  )
}

// ─── Post ─────────────────────────────────────────────────────────────────────

export default function SpringPhysicsPost() {
  return (
    <Section size="narrow">

      <Link href="/blog" className="inline-flex items-center gap-2 text-[12px] font-mono text-muted hover:text-foreground transition-colors no-underline mb-10">
        ← All posts
      </Link>

      <header className="mb-12">
        <div className="flex items-center gap-2 text-[11px] font-mono text-muted mb-4">
          <span>May 3, 2026</span>
          <span>·</span>
          <span>7 min read</span>
        </div>
        <h1 className="text-[clamp(28px,5vw,44px)] font-bold leading-[1.15] tracking-[-0.02em] mb-5">
          Spring Physics for Text Animation
        </h1>
        <div className="flex flex-wrap gap-2">
          {['Canvas', 'Animation', 'Creative Coding'].map(tag => (
            <span key={tag} className="font-mono text-[10px] px-2 py-1 rounded border border-ui bg-bg2 text-muted">
              {tag}
            </span>
          ))}
        </div>
      </header>

      <article>
        <P>
          CSS transitions are fine. They get you from A to B with a curve you can describe
          as a cubic-bezier. But there is a class of motion that feels different: overshooting
          its target, oscillating, settling with weight. Cubic-bezier cannot express it.
          That is where spring physics comes in.
        </P>
        <P>
          A spring simulation takes three lines of math. You can wire it to any numeric
          property: position, scale, opacity, rotation, color. Once it is running, the motion
          it produces feels physical in a way that curves alone never quite achieve, because
          it is actually simulating inertia and energy loss.
        </P>
        <P>
          Here is the engine at the core of inkmotion, a library I built for this, stripped down
          to its smallest working form.
        </P>

        <Divider />

        <H2 id="the-formula">The three-line formula</H2>
        <P>
          A spring has a position, a velocity, and a target. Every frame, it does three things:
          accelerate toward the target, bleed off some energy, and move.
        </P>

        <Code lang="js">{`function spring(s, target, k = 0.08, d = 0.72) {
  s.vel += (target - s.pos) * k   // pull toward target
  s.vel *= d                       // drain energy (damping)
  s.pos += s.vel                   // move
}`}</Code>

        <P>
          <IC>s</IC> is a plain object with <IC>pos</IC> and <IC>vel</IC>. You create one per
          thing you want to animate and call this once per animation frame. That is the whole engine.
        </P>
        <P>
          Two parameters control everything:
        </P>

        <ul className="list-none flex flex-col gap-4 mb-8 pl-0">
          {[
            ['k: stiffness', 'How hard the spring pulls toward the target each frame. Low values (0.03–0.06) feel heavy and dreamy. High values (0.3+) feel snappy and rigid. Think of it as the tension in the spring.'],
            ['d: damping', 'How much velocity survives each frame. Close to 1.0 means almost all velocity is preserved, so the spring keeps oscillating. Pull it down toward 0.5 and the motion becomes bouncy, then overdamped if you go too low. Around 0.7–0.8 is the sweet spot for UI.'],
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

        <P>
          Drag both sliders and click anywhere to set a new target. Feel the difference
          between a rigid snap and a lazy float.
        </P>

        <DemoBox label="Interactive · Spring playground">
          <SpringPlaygroundDemo />
        </DemoBox>

        <Callout>
          <strong>The spring never lands exactly on target.</strong> Each frame it closes a
          fraction of the remaining gap, using the same geometric decay as running lerp. To stop
          the loop when it is close enough, check the combined rest condition:{' '}
          <IC>Math.abs(vel) + Math.abs(target - pos) &lt; 0.05</IC>. When that is true,
          the motion is invisible and you can cancel the animation frame.
        </Callout>

        <Divider />

        <H2 id="damping-regimes">The three damping regimes</H2>
        <P>
          Damping has three qualitatively distinct zones, and each one produces a completely
          different character of motion. The chart below simulates the same spring starting
          at 1.0 and moving toward 0 under three different damping values.
        </P>

        <DemoBox label="Simulation · Damping comparison">
          <DampingComparisonDemo />
        </DemoBox>

        <ul className="list-none flex flex-col gap-4 mb-8 pl-0">
          {[
            ['Underdamped (d ≈ 0.5)', 'Bouncy. The spring overshoots zero, swings back past it on the other side, and oscillates until it runs out of energy. Good for playful, expressive motion. The classic "jelly" feel.'],
            ['Critically damped (d ≈ 0.72)', 'The spring reaches the target in the minimum time without oscillating. This is the sweet spot for most UI. Feels physical without being distracting.'],
            ['Overdamped (d ≈ 0.94)', 'The spring creeps toward the target without ever overshooting. Slow and viscous. Useful for very subtle motions or when you want the animation to feel deliberate rather than snappy.'],
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

        <Divider />

        <H2 id="2d-spring">Extending to 2D</H2>
        <P>
          For effects where you need to move something in two dimensions (like a character
          being pushed away by the cursor, or a floating element following a mouse), you run
          two independent springs and let them share state:
        </P>

        <Code lang="js">{`// s = { x, y, vx, vy }
function spring2D(s, tx, ty, k = 0.08, d = 0.72) {
  s.vx += (tx - s.x) * k;  s.vx *= d;  s.x += s.vx
  s.vy += (ty - s.y) * k;  s.vy *= d;  s.y += s.vy
}`}</Code>

        <P>
          Each axis is fully independent. The x spring knows nothing about y. But because
          they share the same <IC>k</IC> and <IC>d</IC>, they settle at the same rate, which
          makes the resulting motion feel natural rather than mechanical.
        </P>
        <P>
          Each character has a <IC>{`{ x, y, vx, vy }`}</IC> state object. On every frame the
          spring pulls it back toward origin, while the cursor proximity calculation pushes it
          outward. The two forces balance and you get smooth, springy repulsion with no
          additional code.
        </P>

        <Divider />

        <H2 id="text-splitting">Wiring it to text: split, stagger, loop</H2>
        <P>
          The spring engine only moves numbers. To animate text, you need to split the string
          into individual DOM elements and give each one its own spring state.
        </P>

        <Code lang="js">{`// 1. Split text into one <span> per character
function split(el) {
  const raw = el.textContent
  el.textContent = ''
  return raw.split('').map(ch => {
    const span = document.createElement('span')
    span.className = 'char'
    span.textContent = ch
    el.appendChild(span)
    return span
  })
}

// 2. Create spring state for each character
const chars = split(textEl)
const st = chars.map(() => ({ pos: -80, vel: 0 }))

// 3. Run the loop with a stagger delay
let frame = 0
function tick() {
  frame++
  chars.forEach((span, i) => {
    if (frame < i * 3) return  // stagger: delay by 3 frames per char
    spring(st[i], 0, 0.07, 0.68)
    span.style.transform = \`translateY(\${st[i].pos}px)\`
  })
  requestAnimationFrame(tick)
}`}</Code>

        <P>
          The stagger is the key to the wave-like feel. Each character waits <IC>i * 3</IC> frames
          before its spring starts, so the animation ripples left to right. Change
          that multiplier and the wave moves faster or slower. Set it to zero and all letters
          move in unison.
        </P>
        <P>
          The entrance animation here starts every letter at <IC>pos: -80</IC> (80px above its
          natural position) and springs toward 0. It runs the opacity the same way: a second
          spring starting at 0 pulling toward 1. The letter fades in as it drops.
        </P>

        <DemoBox label="Interactive · Spring entrance animation">
          <SpringTextDemo />
        </DemoBox>

        <P>
          Notice the slight bounce at the end of each character. That is the spring
          overshooting zero for a frame or two before settling. It is not choreographed.
          It is just physics. The <IC>k = 0.07, d = 0.68</IC> combination leaves just enough
          energy in the system to produce a gentle landing without wild oscillation.
        </P>

        <Divider />

        <H2 id="the-loop">Managing the rAF loop</H2>
        <P>
          One detail worth getting right: the loop should stop when all springs have settled.
          Leaving a <IC>requestAnimationFrame</IC> running forever wastes CPU and can cause
          issues when the animation replays. The spring function can return a settled flag:
        </P>

        <Code lang="js">{`function spring(s, target, k = 0.08, d = 0.72) {
  s.vel += (target - s.pos) * k
  s.vel *= d
  s.pos += s.vel
  return Math.abs(s.vel) + Math.abs(target - s.pos) < 0.05
  //     ↑ returns true when motion is imperceptible
}

// In the loop: only continue if any spring is still moving
function tick() {
  let allSettled = true
  chars.forEach((span, i) => {
    const settled = spring(st[i], 0, 0.07, 0.68)
    if (!settled) allSettled = false
    span.style.transform = \`translateY(\${st[i].pos}px)\`
  })
  if (!allSettled) requestAnimationFrame(tick)
}`}</Code>

        <P>
          For interactive effects that need to stay alive (cursor repulsion, continuous
          hover response), keep the loop running. For entrance animations that play once,
          stopping on settle keeps things clean.
        </P>

        <Callout>
          <strong>Always cancel the previous loop before starting a new one.</strong>{' '}
          If the animation can be replayed, keep a reference with{' '}
          <IC>let raf = requestAnimationFrame(tick)</IC> and call{' '}
          <IC>cancelAnimationFrame(raf)</IC> at the top of the replay function.
          Otherwise stacked loops compound and the motion accelerates on each replay.
        </Callout>

        <Divider />

        <H2 id="quick-reference">Quick reference</H2>

        <ul className="list-none flex flex-col gap-4 mb-6 pl-0">
          {[
            ['k 0.04–0.06 / d 0.80–0.88', 'Heavy, floating, dreamlike. Like something underwater.'],
            ['k 0.07–0.09 / d 0.68–0.74', 'The sweet spot. Physical and responsive without being bouncy.'],
            ['k 0.10–0.14 / d 0.58–0.65', 'Energetic and elastic. Good for playful interactions.'],
            ['k 0.20–0.40 / d 0.75–0.85', 'Snappy and decisive. Almost instant, slight settle.'],
            ['Stagger multiplier 2–4', 'Fast wave that reads as responsive. Good for short words.'],
            ['Stagger multiplier 5–8', 'Slow wave with visible sequencing. Good for long phrases.'],
          ].map(([title, desc]) => (
            <li key={title} className="flex gap-3 text-[14px] leading-relaxed">
              <span className="text-violet mt-[3px] shrink-0">→</span>
              <span>
                <strong className="text-foreground font-mono text-[12px]">{title}.</strong>
                {' '}<span className="text-muted">{desc}</span>
              </span>
            </li>
          ))}
        </ul>

      </article>

    </Section>
  )
}
