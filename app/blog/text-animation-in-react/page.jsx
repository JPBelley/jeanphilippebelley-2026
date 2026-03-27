'use client'

import { useState, useEffect, useCallback } from 'react'
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
function Slider({ label, value, min, max, step, onChange, fmt }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-[11px]">
        <span className="text-muted">{label}</span>
        <span className="text-foreground font-medium tabular-nums font-mono">{fmt ? fmt(value) : value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-[3px] appearance-none rounded bg-ui outline-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-violet [&::-webkit-slider-thumb]:cursor-pointer"
      />
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

// ─── Demo 1 — The Split ────────────────────────────────────────────────────────

function SplitDemo() {
  const [mode, setMode] = useState('letter')
  const [borders, setBorders] = useState(false)
  const text = 'Hello World'

  const parts =
    mode === 'letter'
      ? text.split('').map(c => ({ char: c === ' ' ? '\u00A0' : c, gap: c === ' ' }))
      : text.split(' ').filter(Boolean).map(w => ({ char: w, gap: false }))

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <TabRow
          options={[{ value: 'letter', label: 'Letter split' }, { value: 'word', label: 'Word split' }]}
          value={mode} onChange={setMode}
        />
        <button
          onClick={() => setBorders(b => !b)}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer border border-ui bg-bg text-muted hover:text-foreground transition-colors"
        >
          {borders ? '✕ Hide spans' : '⬚ Show spans'}
        </button>
      </div>

      <PreviewArea>
        <p className="text-3xl font-bold" style={{ lineHeight: 1.6 }}>
          {parts.map((p, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                ...(p.gap && mode === 'letter' && { marginRight: '0.4em' }),
                ...(mode === 'word' && i < parts.length - 1 && { marginRight: '0.35em' }),
                ...(borders && {
                  outline: '1.5px solid rgba(107,78,230,0.6)',
                  outlineOffset: '3px',
                  borderRadius: '2px',
                }),
              }}
            >
              {p.char}
            </span>
          ))}
        </p>
      </PreviewArea>

      <p className="text-[11px] font-mono text-muted">
        {mode === 'letter'
          ? `${text.length} spans · spaces become &nbsp; so they don't collapse`
          : `${text.split(' ').filter(Boolean).length} spans · gap added via marginRight`}
      </p>
    </>
  )
}

// ─── Demo 2 — Stagger ─────────────────────────────────────────────────────────

function StaggerDemo() {
  const [visible, setVisible] = useState(false)
  const [stagger, setStagger] = useState(55)
  const [duration, setDuration] = useState(480)
  const text = 'Motion design'
  const chars = text.split('')
  const total = (chars.length - 1) * stagger + duration

  const play = useCallback(() => {
    setVisible(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }, [])

  useEffect(() => { play() }, [play])

  return (
    <>
      <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
        <Slider label="Stagger delay" value={stagger} min={0} max={150} step={5} onChange={setStagger} fmt={v => `${v}ms`} />
        <Slider label="Duration" value={duration} min={150} max={800} step={50} onChange={setDuration} fmt={v => `${v}ms`} />
      </div>

      <PreviewArea>
        <p className="text-3xl font-bold" style={{ lineHeight: 1 }}>
          {chars.map((c, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                ...(c === ' ' && { marginRight: '0.35em' }),
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(14px)',
                transition: visible
                  ? `opacity ${duration}ms ease ${i * stagger}ms, transform ${duration}ms ease ${i * stagger}ms`
                  : 'none',
              }}
            >
              {c !== ' ' ? c : null}
            </span>
          ))}
        </p>
      </PreviewArea>

      <div className="flex items-center gap-4 flex-wrap">
        <PlayBtn onClick={play} />
        <span className="text-[11px] font-mono text-muted">
          Total duration: <span className="text-foreground">{(total / 1000).toFixed(2)}s</span>
        </span>
      </div>
    </>
  )
}

// ─── Demo 3 — Wave ────────────────────────────────────────────────────────────

function WaveDemo() {
  const [visible, setVisible] = useState(false)
  const [stagger, setStagger] = useState(50)
  const [freq, setFreq] = useState(0.65)
  const [amp, setAmp] = useState(0.05)
  const text = 'Wave motion'
  const chars = text.split('')

  const getDelay = (i) => Math.max(0, i * stagger + Math.sin(i * freq) * amp * 1000)

  const play = useCallback(() => {
    setVisible(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }, [])

  useEffect(() => { play() }, [play])

  return (
    <>
      <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
        <Slider label="Base stagger" value={stagger} min={20} max={100} step={5} onChange={setStagger} fmt={v => `${v}ms`} />
        <Slider label="Wave frequency" value={freq} min={0.1} max={1.5} step={0.05} onChange={setFreq} fmt={v => v.toFixed(2)} />
        <Slider label="Wave amplitude" value={amp} min={0} max={0.12} step={0.01} onChange={setAmp} fmt={v => v.toFixed(2)} />
      </div>

      <PreviewArea>
        <p className="text-3xl font-bold" style={{ lineHeight: 1 }}>
          {chars.map((c, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                ...(c === ' ' && { marginRight: '0.35em' }),
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(18px)',
                transition: visible
                  ? `opacity 450ms ease ${getDelay(i).toFixed(1)}ms, transform 450ms ease ${getDelay(i).toFixed(1)}ms`
                  : 'none',
              }}
            >
              {c !== ' ' ? c : null}
            </span>
          ))}
        </p>
      </PreviewArea>

      <PlayBtn onClick={play} />
    </>
  )
}

// ─── Demo 4 — Easing ──────────────────────────────────────────────────────────

function EasingDemo() {
  const [key, setKey] = useState(0)
  const [overshoot, setOvershoot] = useState(0.6)

  const rows = [
    { label: 'ease-out', easing: 'ease-out', color: 'var(--color-muted)', text: 'Ease out' },
    { label: 'ease-in-out', easing: 'ease-in-out', color: 'var(--color-violet)', text: 'Ease in-out' },
    { label: `cubic-bezier overshoot`, easing: `cubic-bezier(0.34,${(1 + overshoot).toFixed(2)},0.64,1)`, color: 'var(--color-mint)', text: 'Overshoot' },
  ]

  const kfName = `ed_${key}`
  const kf = `@keyframes ${kfName}{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: kf }} />
      <Slider label="Overshoot amount" value={overshoot} min={0.1} max={1.0} step={0.05} onChange={setOvershoot} fmt={v => v.toFixed(2)} />

      <div className="flex flex-col gap-2">
        {rows.map((row, ri) => (
          <div key={row.label} className="bg-bg rounded-xl border border-ui px-6 py-4 flex items-center gap-4">
            <span className="text-[10px] font-mono w-[100px] shrink-0 leading-tight" style={{ color: row.color }}>
              {row.label}
            </span>
            <p className="text-2xl font-bold flex-1" style={{ lineHeight: 1 }}>
              {row.text.split('').map((c, i) => (
                <span
                  key={`${key}-${ri}-${i}`}
                  style={{
                    display: 'inline-block',
                    ...(c === ' ' && { marginRight: '0.3em' }),
                    ...(key > 0 && {
                      animation: `${kfName} 0.55s ${row.easing} ${i * 40}ms both`,
                    }),
                  }}
                >
                  {c !== ' ' ? c : null}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>

      <PlayBtn onClick={() => setKey(k => k + 1)} />
    </>
  )
}

// ─── The Post ─────────────────────────────────────────────────────────────────

export default function TextAnimationPost() {
  return (
    <Section size="narrow">

        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-[12px] font-mono text-muted hover:text-foreground transition-colors no-underline mb-10">
          ← All posts
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted mb-4">
            <span>March 15, 2026</span>
            <span>·</span>
            <span>8 min read</span>
          </div>
          <h1 className="text-[clamp(28px,5vw,44px)] font-bold leading-[1.15] tracking-[-0.02em] mb-5">
            Building Letter-by-Letter Text Animations in React
          </h1>
          <div className="flex flex-wrap gap-2">
            {['React', 'CSS Animations', 'Motion'].map(tag => (
              <span key={tag} className="font-mono text-[10px] px-2 py-1 rounded border border-ui bg-bg2 text-muted">
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Article */}
        <article>
          <P>
            Letter-by-letter text animation is one of those effects that's simultaneously simple
            and deceptively deep. At its core, it's just a CSS animation applied to a bunch of
            spans with incrementally increasing delays. But the quality of that motion, whether
            it feels mechanical or organic, instant or graceful, comes down to a few key decisions
            about math and timing.
          </P>
          <P>
            This post walks through the mechanics I used to build the{' '}
            <Link href="/experiments/text-animator" className="text-violet hover:underline">
              Text Animator
            </Link>{' '}
            tool on this site. Each concept has a live demo you can tweak.
          </P>

          <Divider />

          {/* ── 1. Splitting ── */}
          <H2 id="splitting">1. Splitting Text into Spans</H2>
          <P>
            The first step is breaking your string into individually animatable units. For
            letter-by-letter animation, that means one <IC>{'<span>'}</IC> per character.
            For word animation, one span per word.
          </P>
          <P>
            There's one gotcha with letter splitting: spaces. When you render a plain space
            inside a <IC>display: inline-block</IC> element, it collapses. The fix is to
            replace spaces with a non-breaking space (<IC>&amp;nbsp;</IC>), or in JSX,
            the unicode equivalent <IC>{`'\\u00A0'`}</IC>.
          </P>

          <Code lang="jsx">{`// Letter split — replace spaces to prevent collapse
const parts = text.split('').map((char, i) => (
  <span
    key={i}
    style={{ display: 'inline-block' }}
  >
    {char === ' ' ? '\\u00A0' : char}
  </span>
))

// Word split — use margin instead
const words = text.split(' ').filter(Boolean)
const parts = words.map((word, i) => (
  <span
    key={i}
    style={{
      display: 'inline-block',
      marginRight: i < words.length - 1 ? '0.35em' : 0,
    }}
  >
    {word}
  </span>
))`}</Code>

          <Callout>
            <strong>Why <IC>display: inline-block</IC>?</strong>
            {' '}Purely inline elements don't respond to <IC>transform</IC> properties like
            <IC>translateY</IC>. Making each span <IC>inline-block</IC> gives it its own
            rendering context while keeping characters flowing in a line.
          </Callout>

          <DemoBox label="Interactive ·The Split">
            <SplitDemo />
          </DemoBox>

          <Divider />

          {/* ── 2. Keyframes ── */}
          <H2 id="keyframes">2. Defining the Animation Keyframe</H2>
          <P>
            The actual motion is a CSS <IC>@keyframes</IC> rule. A simple fade-up looks like this:
          </P>

          <Code lang="css">{`@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`}</Code>

          <P>
            You can combine as many properties as you like: opacity, translateY, scale, rotate,
            blur. The keyframe itself only defines the shape of a single element's motion.
            The stagger comes from the <IC>animation-delay</IC>.
          </P>

          <Divider />

          {/* ── 3. Stagger ── */}
          <H2 id="stagger">3. Stagger: The Heartbeat of Text Animation</H2>
          <P>
            Without stagger, every letter animates simultaneously; you just see a fade, not
            a sequence. Stagger is the offset between each character's start time. It's as
            simple as multiplying the index by a delay value:
          </P>

          <Code lang="jsx">{`const STAGGER = 55 // ms between each character

chars.map((char, i) => (
  <span
    key={\`\${playKey}-\${i}\`}
    style={{
      display: 'inline-block',
      animation: \`fadeUp_\${playKey} 480ms ease forwards both\`,
      animationDelay: \`\${i * STAGGER}ms\`,
    }}
  >
    {char}
  </span>
))`}</Code>

          <P>
            <IC>animation-fill-mode: both</IC> is important here. <IC>backwards</IC> applies the
            <IC>from</IC> keyframe before the animation starts (keeping the element hidden during
            its delay), and <IC>forwards</IC> holds the final frame after it ends. Together,
            they make stagger just work without extra opacity juggling.
          </P>

          <DemoBox label="Interactive ·Stagger">
            <StaggerDemo />
          </DemoBox>

          <P>
            Notice how increasing the stagger delay makes the sequence feel more deliberate and
            dramatic, while a low stagger (close to 0ms) makes it feel like a blur wipe.
            Most satisfying ranges sit between 40–80ms.
          </P>

          <Divider />

          {/* ── 4. Wave ── */}
          <H2 id="wave">4. Wave Stagger with Math.sin</H2>
          <P>
            Linear stagger is predictable. For something that feels more organic, characters
            arriving in a rolling wave, we can modulate each delay using a sine curve.
          </P>

          <Code lang="jsx">{`const getDelay = (i, stagger, waveFreq, waveAmp) => {
  const base  = i * stagger                       // linear ramp (ms)
  const wave  = Math.sin(i * waveFreq) * waveAmp * 1000  // sine offset (ms)
  return Math.max(0, base + wave)                 // clamp to ≥ 0
}

// Usage:
animationDelay: \`\${getDelay(i, 50, 0.65, 0.05)}ms\``}</Code>

          <P>
            The <IC>waveFreq</IC> controls how many oscillations appear across the text; a higher
            frequency creates shorter, tighter waves. The <IC>waveAmp</IC> scales the offset magnitude.
            We <IC>Math.max(0, ...)</IC> the result because <IC>Math.sin</IC> can go negative,
            which would produce a negative delay (treated as 0 by browsers, but causing characters
            to overlap unexpectedly).
          </P>

          <DemoBox label="Interactive ·Wave Stagger">
            <WaveDemo />
          </DemoBox>

          <Divider />

          {/* ── 5. Easing ── */}
          <H2 id="easing">5. Overshoot Easing with cubic-bezier</H2>
          <P>
            The easing function defines the shape of a single element's motion curve.
            Standard easings like <IC>ease-out</IC> decelerate to a stop. For a springy,
            physical-feeling motion, where the element overshoots its target then snaps
            back; we need a custom <IC>cubic-bezier</IC>.
          </P>

          <Code lang="css">{`/* Standard ease-out */
animation-timing-function: ease-out;

/* Overshoot — the 2nd control point y > 1 goes past the target */
animation-timing-function: cubic-bezier(0.34, 1.6, 0.64, 1);
/*                                              ^^^
                                    Raise this above 1.0 to overshoot.
                                    1.0 = no overshoot, 2.0 = strong spring */`}</Code>

          <P>
            In a cubic-bezier, the four values are the x and y coordinates of two control points.
            When the y coordinate of the second control point exceeds 1 (or goes below 0), the
            curve passes outside the [0,1] range, producing values above the target, which creates
            the overshoot. In React you can generate this dynamically:
          </P>

          <Code lang="jsx">{`const overshoot = 0.6 // tweak this value
const easing = \`cubic-bezier(0.34, \${(1 + overshoot).toFixed(2)}, 0.64, 1)\``}</Code>

          <DemoBox label="Interactive ·Easing Comparison">
            <EasingDemo />
          </DemoBox>

          <P>
            Compare <em>ease-out</em> (clean stop), <em>ease-in-out</em> (symmetric curve),
            and overshoot side by side. The overshoot version feels significantly more alive
            even at the same duration; that brief moment of overshooting is what tricks your
            eye into reading it as physical.
          </P>

          <Divider />

          {/* ── 6. Full Component ── */}
          <H2 id="together">6. Putting It Together</H2>
          <P>
            Here's a complete, reusable React component that combines all the techniques above.
            Drop it into any project and pass props to control the behaviour.
          </P>

          <Code lang="jsx">{`'use client'
import { useState } from 'react'

export function TextAnimator({
  text,
  stagger   = 55,     // ms between characters
  duration  = 480,    // ms per character animation
  easing    = 'ease', // CSS easing or cubic-bezier string
  wave      = null,   // { freq: 0.65, amp: 0.05 } or null
}) {
  const [playKey, setPlayKey] = useState(0)

  const getDelay = (i) => {
    const base = i * stagger
    if (!wave) return base
    return Math.max(0, base + Math.sin(i * wave.freq) * wave.amp * 1000)
  }

  const kf = \`
    @keyframes ta_\${playKey} {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  \`

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: kf }} />

      <p>
        {text.split('').map((char, i) => (
          <span
            key={\`\${playKey}-\${i}\`}
            style={{
              display: 'inline-block',
              ...(char === ' ' && { marginRight: '0.35em' }),
              ...(playKey > 0 && {
                animation:
                  \`ta_\${playKey} \${duration}ms \${easing} \${getDelay(i).toFixed(0)}ms both\`,
              }),
            }}
          >
            {char !== ' ' ? char : null}
          </span>
        ))}
      </p>

      <button onClick={() => setPlayKey(k => k + 1)}>
        Animate
      </button>
    </div>
  )
}

// Usage:
// <TextAnimator text="Hello World" stagger={55} />
// <TextAnimator text="Wave effect" wave={{ freq: 0.65, amp: 0.05 }} />
// <TextAnimator text="Spring!" easing="cubic-bezier(0.34,1.6,0.64,1)" />`}</Code>

          <P>
            A few things worth calling out in this component: the <IC>playKey</IC> is included
            in both the keyframe name and the span <IC>key</IC> prop. This double-barrelled
            approach ensures the animation restarts even if React decides to reuse a DOM node.
            The <IC>wave</IC> prop is optional; when omitted, delays are purely linear.
          </P>

          <Divider />

          {/* ── Closing ── */}
          <H2 id="closing">Where to Go from Here</H2>
          <P>
            The techniques here are the foundation, but there's a lot of room to extend them.
            Some directions worth exploring:
          </P>

          <ul className="list-none flex flex-col gap-3 mb-6 pl-0">
            {[
              ['Direction', 'Animate from right-to-left by reversing the delay order: delay(textLength - 1 - i).'],
              ['More properties', 'Add scale, rotateX, or blur to the keyframe. Blur (filter: blur(4px)) especially adds atmosphere.'],
              ['Exit animations', 'Mirror the enter animation with a reversed keyframe and trigger it before unmounting.'],
              ['Scroll triggers', 'Use an IntersectionObserver to set playKey when the element enters the viewport.'],
              ['Spring physics', 'Replace CSS cubic-bezier with a JavaScript spring library (react-spring, motion) for more control over mass and damping.'],
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
            If you want to experiment visually with all these controls at once, the{' '}
            <Link href="/experiments/text-animator" className="text-violet hover:underline">
              Text Animator tool
            </Link>{' '}
            lets you tweak everything in real time: split mode, stagger, wave, easing,
            opacity, scale, blur. Preview the result before writing a single line of code.
          </P>
        </article>

      </Section>
  )
}
