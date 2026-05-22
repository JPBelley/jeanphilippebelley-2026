'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Section from '../../components/Section'
import { P, H2, IC, Code, Callout, MintCallout, Divider, DemoBox } from '../../components/blog/prose'


// ─── Shared easing functions (mirrored from the codepen file) ─────────────────
const eOut     = t => 1 - (1 - t) ** 3
const eIn      = t => t ** 3
const eOutBack = t => { const c = 1.70158 + 1; return 1 + c * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2 }
const eBounce  = t => {
  const n = 7.5625, d = 2.75
  if (t < 1 / d)     return n * t * t
  if (t < 2 / d)     return n * (t -= 1.5 / d)  * t + 0.75
  if (t < 2.5 / d)   return n * (t -= 2.25 / d) * t + 0.9375
  return n * (t -= 2.625 / d) * t + 0.984375
}

// The function the post is about
function cyc(f, offset, enter, hold, exit, pause, eIn_ = eOut, eOut_ = eIn) {
  if (f < offset) return 0
  const total = enter + hold + exit + pause
  const t = (f - offset) % total
  if (t < enter)                return eIn_(t / enter)
  if (t < enter + hold)         return 1
  if (t < enter + hold + exit)  return 1 - eOut_((t - enter - hold) / exit)
  return 0
}


// ─── Demo 1: Cycle visualizer ─────────────────────────────────────────────────

function CycleVisualizerDemo() {
  const [config, setConfig] = useState({ enter: 35, hold: 50, exit: 28, pause: 35 })
  const configRef = useRef(config)
  configRef.current = config

  const [liveP,     setLiveP]     = useState(0)
  const [livePhase, setLivePhase] = useState('pause')
  const rafRef   = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => {
    function tick() {
      frameRef.current++
      const { enter, hold, exit, pause } = configRef.current
      const total = enter + hold + exit + pause
      const t = frameRef.current % total
      let prog, ph
      if (t < enter)                { prog = eOut(t / enter);                       ph = 'enter' }
      else if (t < enter + hold)    { prog = 1;                                     ph = 'hold'  }
      else if (t < enter+hold+exit) { prog = 1 - eIn((t - enter - hold) / exit);   ph = 'exit'  }
      else                          { prog = 0;                                     ph = 'pause' }
      setLiveP(prog)
      setLivePhase(ph)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const { enter, hold, exit, pause } = config
  const total = enter + hold + exit + pause

  const phaseColor = {
    enter: 'rgba(46,230,166,0.9)',
    hold:  'rgba(124,92,255,0.9)',
    exit:  'rgba(230,160,46,0.9)',
    pause: 'rgba(150,150,160,0.6)',
  }

  const sliders = [
    { key: 'enter', label: 'enter',  color: phaseColor.enter, min: 8,  max: 80 },
    { key: 'hold',  label: 'hold',   color: phaseColor.hold,  min: 8,  max: 120 },
    { key: 'exit',  label: 'exit',   color: phaseColor.exit,  min: 8,  max: 80 },
    { key: 'pause', label: 'pause',  color: phaseColor.pause, min: 8,  max: 120 },
  ]

  return (
    <>
      {/* Letter with live animation */}
      <div className="flex items-end justify-center" style={{ height: 88 }}>
        <span style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 64,
          fontStyle: 'italic',
          fontWeight: 400,
          display: 'inline-block',
          transform: `translateY(${(1 - liveP) * 36}px)`,
          opacity: liveP,
          color: 'var(--color-foreground)',
          lineHeight: 1,
        }}>
          A
        </span>
      </div>

      {/* Phase label + p value */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span>
          phase:{' '}
          <span style={{ color: phaseColor[livePhase] }}>{livePhase}</span>
        </span>
        <span className="text-muted">p = {liveP.toFixed(3)}</span>
      </div>

      {/* Timeline proportion bar */}
      <div>
        <div className="flex rounded overflow-hidden" style={{ height: 8 }}>
          <div style={{ flex: enter, background: 'rgba(46,230,166,0.35)' }} />
          <div style={{ flex: hold,  background: 'rgba(124,92,255,0.30)' }} />
          <div style={{ flex: exit,  background: 'rgba(230,160,46,0.35)' }} />
          <div style={{ flex: pause, background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div className="flex mt-1">
          {[
            [enter, phaseColor.enter, 'enter'],
            [hold,  phaseColor.hold,  'hold'],
            [exit,  phaseColor.exit,  'exit'],
            [pause, phaseColor.pause, 'pause'],
          ].map(([flex, color, label]) => (
            <span key={label} className="text-[9px] font-mono text-center"
              style={{ flex, color }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-3">
        {sliders.map(({ key, label, color, min, max }) => (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span style={{ color }}>{label}</span>
              <span className="text-muted">
                {config[key]}f &nbsp;·&nbsp; {Math.round(config[key] / 60 * 1000)}ms
              </span>
            </div>
            <input
              type="range" min={min} max={max} step={1} value={config[key]}
              onChange={e => setConfig(prev => ({ ...prev, [key]: +e.target.value }))}
              className="w-full h-[3px] appearance-none rounded outline-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:cursor-pointer"
              style={{ background: 'var(--color-ui)' }}
            />
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="text-[11px] font-mono text-muted text-right">
        total cycle: {total}f &nbsp;·&nbsp; {(total / 60).toFixed(1)}s at 60 fps
      </div>
    </>
  )
}


// ─── Demo 2: Easing comparison ────────────────────────────────────────────────

function EasingComparisonDemo() {
  const rafRef   = useRef(null)
  const frameRef = useRef(0)
  const [ps, setPs] = useState([0, 0, 0])

  const ENTER = 42, HOLD = 50, EXIT = 30, PAUSE = 38
  const total = ENTER + HOLD + EXIT + PAUSE

  const variants = [
    { label: 'ease.out',     eIn: eOut,     eOut: eIn  },
    { label: 'ease.outBack', eIn: eOutBack, eOut: eIn  },
    { label: 'ease.bounce',  eIn: eBounce,  eOut: eIn  },
  ]

  useEffect(() => {
    function tick() {
      frameRef.current++
      const t = frameRef.current % total
      setPs(variants.map(({ eIn: fn, eOut: fo }) => {
        if (t < ENTER)             return fn(t / ENTER)
        if (t < ENTER + HOLD)      return 1
        if (t < ENTER+HOLD+EXIT)   return 1 - fo((t - ENTER - HOLD) / EXIT)
        return 0
      }))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="flex gap-6 justify-center">
      {variants.map(({ label }, i) => (
        <div key={label} className="flex flex-col items-center gap-3" style={{ flex: 1 }}>
          <div className="flex items-end justify-center" style={{ height: 80 }}>
            <span style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 'clamp(36px, 6vw, 54px)',
              fontStyle: 'italic',
              display: 'inline-block',
              transform: `translateY(${(1 - ps[i]) * 40}px)`,
              opacity: ps[i],
              color: 'var(--color-foreground)',
              lineHeight: 1,
            }}>
              A
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted text-center">{label}</span>
        </div>
      ))}
    </div>
  )
}


// ─── Demo 3: Stagger ──────────────────────────────────────────────────────────

function StaggerDemo() {
  const [stagger, setStagger] = useState(8)
  const staggerRef = useRef(8)

  const containerRef = useRef(null)
  const rafRef       = useRef(null)
  const frameRef     = useRef(0)

  const WORD  = 'Always'
  const ENTER = 36, HOLD = 52, EXIT = 28, PAUSE = 36

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.innerHTML = ''
    const spans = WORD.split('').map(ch => {
      const s = document.createElement('span')
      s.textContent = ch
      s.style.cssText = 'display:inline-block;white-space:pre;opacity:0;'
      el.appendChild(s)
      return s
    })

    function tick() {
      frameRef.current++
      const f  = frameRef.current
      const sg = staggerRef.current
      spans.forEach((sp, i) => {
        const p = cyc(f, i * sg, ENTER, HOLD, EXIT, PAUSE)
        sp.style.opacity   = p
        sp.style.transform = `translateY(${(1 - p) * 30}px)`
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <>
      <div className="flex items-end justify-center" style={{ height: 80 }}>
        <div
          ref={containerRef}
          style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 'clamp(32px, 6vw, 52px)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: 'var(--color-foreground)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-muted">stagger</span>
          <span style={{ color: 'rgba(124,92,255,0.9)' }}>
            {stagger}f &nbsp;·&nbsp; {Math.round(stagger / 60 * 1000)}ms per letter
          </span>
        </div>
        <input
          type="range" min={0} max={20} step={1} value={stagger}
          onChange={e => {
            const v = +e.target.value
            setStagger(v)
            staggerRef.current = v
          }}
          className="w-full h-[3px] appearance-none rounded outline-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-violet [&::-webkit-slider-thumb]:cursor-pointer"
          style={{ background: 'var(--color-ui)' }}
        />
        <div className="flex justify-between text-[9px] font-mono text-muted mt-1">
          <span>0: all together</span>
          <span>20: full cascade</span>
        </div>
      </div>
    </>
  )
}


// ─── Post ─────────────────────────────────────────────────────────────────────

export default function TimelineTextAnimationPost() {
  return (
    <Section size="narrow">

      <Link href="/blog" className="inline-flex items-center gap-2 text-[12px] font-mono text-muted hover:text-foreground transition-colors no-underline mb-10">
        ← All posts
      </Link>

      <header className="mb-12">
        <div className="flex items-center gap-2 text-[11px] font-mono text-muted mb-4">
          <span>May 18, 2026</span>
          <span>·</span>
          <span>6 min read</span>
        </div>
        <h1 className="text-[clamp(28px,5vw,44px)] font-bold leading-[1.15] tracking-[-0.02em] mb-5">
          A Minimal Timeline for Looping Text Animation
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
          CSS animations cover the simple cases. Spring physics covers reactive, cursor-driven
          motion. But there is a third category: a letter that rises into view, pauses, sinks
          back down, waits, and repeats. You want precise control over timing, not forces.
          You want it to loop cleanly, with a stagger that ripples across the word.
        </P>

        <P>
          You do not need a library for this. One function is enough. It maps a frame counter
          to a progress value between 0 and 1. You decide what to do with that value.
        </P>

        <Divider />

        <H2 id="four-phases">The four phases of a loop</H2>

        <P>
          Every looping animation has the same structure, regardless of what it animates.
          A letter starts at a resting state, moves to a target state, holds there, returns,
          waits, then starts over. Four phases, four numbers:
        </P>

        <ul className="list-none flex flex-col gap-4 mb-8 pl-0">
          {[
            ['enter',  'rgba(46,230,166,0.9)',  'The letter moves from its start state to its target. This is where you feel the easing: a smooth arrival, an overshoot, or a bounce.'],
            ['hold',   'rgba(124,92,255,0.9)',  'The letter rests at the target. This is the moment of legibility, emphasis, or pause.'],
            ['exit',   'rgba(230,160,46,0.9)',  'The letter returns to its start state. Often simpler than the entrance: a clean ease-in is enough.'],
            ['pause',  'rgba(150,150,160,0.6)', 'The letter rests at start before the next loop. Without this, the animation feels rushed.'],
          ].map(([label, color, desc]) => (
            <li key={label} className="flex gap-3 text-[14px] leading-relaxed">
              <span style={{ color }} className="mt-[3px] shrink-0 font-mono text-[12px]">→</span>
              <span>
                <strong className="text-foreground font-mono text-[13px]">{label}.</strong>
                {' '}<span className="text-muted">{desc}</span>
              </span>
            </li>
          ))}
        </ul>

        <P>
          Adjust the four sliders below. The bar shows how the cycle divides its time across
          the phases. The letter animates with the current values in real time.
        </P>

        <DemoBox label="Interactive · Cycle visualizer">
          <CycleVisualizerDemo />
        </DemoBox>

        <Divider />

        <H2 id="the-function">One function, one number</H2>

        <P>
          The whole implementation fits in twelve lines. Given a frame counter <IC>f</IC>,
          a per-letter offset, and the four phase durations, it returns a single progress
          value <IC>p</IC> in the range [0, 1].
        </P>

        <Code lang="js">{`function cyc(f, offset, enter, hold, exit, pause, eIn = ease.out, eOut = ease.in) {
  if (f < offset) return 0                     // stagger delay — wait at start
  const total = enter + hold + exit + pause
  const t = (f - offset) % total               // position within current cycle
  if (t < enter)                return eIn(t / enter)
  if (t < enter + hold)         return 1
  if (t < enter + hold + exit)  return 1 - eOut((t - enter - hold) / exit)
  return 0
}`}</Code>

        <P>
          When <IC>f</IC> is before the letter's offset, it returns 0: the stagger delay.
          After that, it computes where in the cycle the current frame falls. The modulo
          operator <IC>% total</IC> makes it loop automatically.
        </P>

        <P>
          The two easing parameters are optional. <IC>eIn</IC> shapes the entrance,{' '}
          <IC>eOut</IC> shapes the exit. They both receive a linear 0–1 value and return
          a curved one. You can pass different functions to give enter and exit completely
          different characters.
        </P>

        <Callout>
          <strong>p is always 0 or 1 at rest.</strong> At the start of the pause phase p = 0,
          at the end of the hold phase p = 1. Your CSS resets cleanly between loops.
          No residual transforms, no invisible fractional values.
        </Callout>

        <Divider />

        <H2 id="mapping-p">Mapping p to any property</H2>

        <P>
          <IC>p</IC> is just a number. You decide what it means for each animation. The
          most common pattern is to interpolate between a start value and a target value:
        </P>

        <Code lang="js">{`// Rise from below
ch.style.opacity   = p
ch.style.transform = \`translateY(\${(1 - p) * 32}px)\`

// Scale from nothing with a quick fade
ch.style.opacity   = Math.min(1, p * 2.5)
ch.style.transform = \`scale(\${Math.max(0, p)})\`

// Variable font weight (requires a variable font)
const wght = 150 + p * 710     // 150 → 860
ch.style.fontVariationSettings = \`'wght' \${wght.toFixed(0)}\`

// 3D flip on the horizontal axis
ch.style.transform = \`perspective(600px) rotateX(\${(1 - p) * -90}deg)\`

// Blur emerge
ch.style.opacity = p
ch.style.filter  = \`blur(\${((1 - p) * 12).toFixed(1)}px)\``}</Code>

        <P>
          The same <IC>p</IC> drives all of them. You are not writing animation logic.
          You are writing a mapping from progress to appearance.
        </P>

        <Divider />

        <H2 id="easing">Easing shapes the character</H2>

        <P>
          The entrance easing is where personality lives. The three most useful variants
          for text are:
        </P>

        <ul className="list-none flex flex-col gap-4 mb-8 pl-0">
          {[
            ['ease.out',     '1 - (1-t)³',    'The default. Fast start, gradual finish. Feels confident and clean.'],
            ['ease.outBack', 'cubic overshoot', 'Overshoots the target then settles back. The letter arrives with a snap and intent.'],
            ['ease.bounce',  'multi-pass decay', 'Simulates a physical bounce on arrival. Use it for drop animations where the letter lands.'],
          ].map(([name, formula, desc]) => (
            <li key={name} className="flex gap-3 text-[14px] leading-relaxed">
              <span className="text-violet mt-[3px] shrink-0">→</span>
              <span>
                <strong className="text-foreground">{name}</strong>{' '}
                <IC>{formula}</IC>
                {'. '}<span className="text-muted">{desc}</span>
              </span>
            </li>
          ))}
        </ul>

        <P>
          Same timing, same properties, different easing. The letter below uses the same
          enter/hold/exit/pause in all three cases. Only the entrance function changes.
        </P>

        <DemoBox label="Demo · Easing comparison on the same timing">
          <EasingComparisonDemo />
        </DemoBox>

        <Divider />

        <H2 id="stagger">Stagger is just an offset</H2>

        <P>
          Stagger is not a separate concept. It is the <IC>offset</IC> parameter.
          Multiply the letter index by a fixed number of frames and each character starts
          its cycle later than the previous one:
        </P>

        <Code lang="js">{`const STAGGER = 8   // frames between each letter's start

loop(() => {
  f++
  chars.forEach((ch, i) => {
    const p = cyc(f, i * STAGGER, ENTER, HOLD, EXIT, PAUSE)
    ch.style.opacity   = p
    ch.style.transform = \`translateY(\${(1 - p) * 32}px)\`
  })
})`}</Code>

        <P>
          At stagger 0, all letters move together. As you increase it, the first letter
          finishes its entrance before the second has even started. The motion reads as
          a wave. Drag the slider to feel the difference.
        </P>

        <DemoBox label="Interactive · Stagger">
          <StaggerDemo />
        </DemoBox>

        <MintCallout>
          <strong>The stagger offset also controls the loop phase.</strong> Letter 0 and
          letter 5 are at different points in their cycle at any given frame. When stagger
          is large enough, the word always has some letters entering, some holding, some
          exiting. The word breathes continuously rather than pulsing as a unit.
        </MintCallout>

        <Divider />

        <H2 id="the-loop">Wiring it to requestAnimationFrame</H2>

        <P>
          The loop itself is minimal. A frame counter increments every tick. The rest
          is handled by <IC>cyc()</IC>:
        </P>

        <Code lang="js">{`function split() {
  const el = document.querySelector('.text')
  const raw = el.textContent
  el.textContent = ''
  return raw.split('').map(ch => {
    const s = document.createElement('span')
    s.className   = 'char'
    s.textContent = ch
    el.appendChild(s)
    return s
  })
}

function anim_01() {
  const chars = split()
  const STAGGER = 7, ENTER = 36, HOLD = 55, EXIT = 28, PAUSE = 38
  let f = 0

  loop(() => {
    f++
    chars.forEach((ch, i) => {
      const p = cyc(f, i * STAGGER, ENTER, HOLD, EXIT, PAUSE)
      ch.style.opacity   = p
      ch.style.transform = \`translateY(\${(1 - p) * 34}px)\`
    })
  })
}`}</Code>

        <P>
          There is no animation state to manage, no event listeners to clean up, no
          interpolation to track. The frame counter is the only mutable variable.
          Every other value, including where each letter is right now, is computed
          directly from <IC>f</IC>.
        </P>

        <Callout>
          <strong>Timeline vs spring: when to use which.</strong> Use a timeline when
          you know exactly how the animation should feel and when it should happen:
          entrance sequences, choreographed reveals, looping ambient motion. Use spring
          physics when the animation needs to respond to unpredictable input: cursor
          position, drag, scroll velocity. Springs react; timelines perform.
        </Callout>

      </article>

    </Section>
  )
}
