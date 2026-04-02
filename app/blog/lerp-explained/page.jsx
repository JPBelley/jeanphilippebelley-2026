'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Section from '../../components/Section'

// ─── Prose components ─────────────────────────────────────────────────────────

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

// ─── Demo 1: Static lerp ──────────────────────────────────────────────────────

function StaticLerpDemo() {
  const [t, setT] = useState(0.35)
  const result = t  // lerp(0, 1, t) = t
  const pct    = 5 + result * 90

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-muted">t</span>
          <span>
            <span className="text-muted">lerp(0, 1, {t.toFixed(2)}) = </span>
            <span className="text-violet font-semibold">{result.toFixed(2)}</span>
          </span>
        </div>
        <input
          type="range" min={0} max={1} step={0.01} value={t}
          onChange={e => setT(parseFloat(e.target.value))}
          className="w-full h-[3px] appearance-none rounded bg-ui outline-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-violet [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      <div className="relative h-12 rounded-lg select-none" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-ui)' }}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted">A</span>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted">B</span>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${pct}%`,
          width: 16, height: 16,
          borderRadius: '50%',
          background: 'var(--color-violet)',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 0 4px rgba(124,92,255,0.2)',
        }} />
      </div>

      <p className="text-[12px] font-mono text-muted">
        t = 0 → lands on A. t = 1 → lands on B. t = 0.5 → halfway. Always a straight blend.
      </p>
    </>
  )
}

// ─── Demo 2: Running lerp (follower) ──────────────────────────────────────────

function RunningLerpDemo() {
  const [factor, setFactor] = useState(0.08)
  const factorRef   = useRef(0.08)
  const containerRef = useRef(null)
  const rafRef       = useRef(null)
  const targetRef    = useRef(0.7)
  const currentRef   = useRef(0.7)
  const [dotTarget,  setDotTarget]  = useState(0.7)
  const [dotCurrent, setDotCurrent] = useState(0.7)

  factorRef.current = factor

  useEffect(() => {
    function tick() {
      currentRef.current += (targetRef.current - currentRef.current) * factorRef.current
      setDotCurrent(currentRef.current)
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
    const v = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    targetRef.current = v
    setDotTarget(v)
  }

  const pctT = 5 + dotTarget  * 90
  const pctC = 5 + dotCurrent * 90

  const factorLabel = factor < 0.05
    ? 'Very laggy'
    : factor < 0.15
    ? 'Smooth follow'
    : factor < 0.4
    ? 'Snappy'
    : 'Near-instant'

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-muted">Factor: <span className="text-foreground">{factorLabel}</span></span>
          <span className="text-violet">{factor.toFixed(2)}</span>
        </div>
        <input
          type="range" min={0.01} max={1} step={0.01} value={factor}
          onChange={e => setFactor(parseFloat(e.target.value))}
          className="w-full h-[3px] appearance-none rounded bg-ui outline-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-violet [&::-webkit-slider-thumb]:cursor-pointer"
        />
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
        {/* target */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${pctT}%`,
          width: 14, height: 14,
          borderRadius: '50%',
          background: 'var(--color-mint)',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 0 4px rgba(46,230,166,0.2)',
          transition: 'left 0ms',
        }} />
        {/* follower */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${pctC}%`,
          width: 18, height: 18,
          borderRadius: '50%',
          background: 'var(--color-violet)',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 0 4px rgba(124,92,255,0.2)',
          transition: 'left 0ms',
        }} />
      </div>

      <div className="flex gap-5 text-[11px] font-mono">
        <span style={{ color: 'var(--color-mint)' }}>● target</span>
        <span style={{ color: 'var(--color-violet)' }}>● follower (running lerp)</span>
      </div>
    </>
  )
}

// ─── Demo 3: Color lerp ───────────────────────────────────────────────────────

function ColorLerpDemo() {
  const [c1, setC1] = useState('#f2d4dc')
  const [c2, setC2] = useState('#7C5CFF')
  const [t,  setT]  = useState(0.5)

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }

  const [r1, g1, b1] = hexToRgb(c1)
  const [r2, g2, b2] = hexToRgb(c2)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  const mixed = `rgb(${r},${g},${b})`

  return (
    <>
      <div className="flex gap-3 items-center">
        <input type="color" value={c1} onChange={e => setC1(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent shrink-0" />
        <div className="flex-1 h-8 rounded-lg" style={{ background: `linear-gradient(to right, ${c1}, ${c2})`, border: '1px solid var(--color-ui)' }} />
        <input type="color" value={c2} onChange={e => setC2(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent shrink-0" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[11px] font-mono text-muted">
          <span>t = {t.toFixed(2)}</span>
          <span style={{ color: mixed }}>■ {mixed}</span>
        </div>
        <input
          type="range" min={0} max={1} step={0.01} value={t}
          onChange={e => setT(parseFloat(e.target.value))}
          className="w-full h-[3px] appearance-none rounded bg-ui outline-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-violet [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      <div className="h-16 rounded-xl border border-ui transition-none" style={{ background: mixed }} />

      <p className="text-[12px] font-mono text-muted">
        The same formula applied independently to R, G, and B. Change either color above.
      </p>
    </>
  )
}

// ─── Post ─────────────────────────────────────────────────────────────────────

export default function LerpExplainedPost() {
  return (
    <Section size="narrow">

      <Link href="/blog" className="inline-flex items-center gap-2 text-[12px] font-mono text-muted hover:text-foreground transition-colors no-underline mb-10">
        ← All posts
      </Link>

      <header className="mb-12">
        <div className="flex items-center gap-2 text-[11px] font-mono text-muted mb-4">
          <span>March 31, 2026</span>
          <span>·</span>
          <span>6 min read</span>
        </div>
        <h1 className="text-[clamp(28px,5vw,44px)] font-bold leading-[1.15] tracking-[-0.02em] mb-5">
          What Is Lerp, and Why Should You Care
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
          Lerp is short for <em>linear interpolation</em>. It is a four-token formula that shows up in
          game cameras, cursor trails, color gradients, UI springs, shaders, and audio crossfades.
          Once you know what it looks like, you start seeing it in everything.
        </P>
        <P>
          The ring following your cursor on this site right now is running lerp. Every frame it
          closes 12% of the gap between itself and the real pointer position. That trailing
          feel comes entirely from one line of math.
        </P>
        <P>
          I use it constantly. It is probably the piece of math I reach for most in creative
          development, not because it is clever, but because it is exactly the right tool for
          a surprisingly large number of problems.
        </P>

        <Divider />

        <H2 id="the-formula">The formula</H2>
        <P>
          Give it a start value <IC>a</IC>, an end value <IC>b</IC>, and a blend factor <IC>t</IC> between
          0 and 1. It gives back something in between.
        </P>

        <Code lang="js">{`lerp(a, b, t) = a + (b - a) * t`}</Code>

        <P>
          <IC>t = 0</IC> gives you <IC>a</IC>. <IC>t = 1</IC> gives you <IC>b</IC>. Everything
          in between is a straight, proportional blend. Drag the slider below and watch the dot.
        </P>

        <DemoBox label="Interactive · The lerp formula">
          <StaticLerpDemo />
        </DemoBox>

        <P>
          In code it is a one-liner. Most languages have it built in; in JavaScript I just write
          it myself:
        </P>

        <Code lang="js">{`// JavaScript
const lerp = (a, b, t) => a + (b - a) * t

// GLSL (built-in)
float result = mix(a, b, t);

// Python / numpy
import numpy as np
result = np.interp(t, [0, 1], [a, b])`}</Code>

        <Callout>
          <strong>Why <IC>a + (b - a) * t</IC> and not <IC>a * (1 - t) + b * t</IC>?</strong>{' '}
          They are mathematically the same. But the first form is more numerically stable.
          At <IC>t = 1</IC> it guarantees you land exactly on <IC>b</IC> rather than landing
          somewhere just beside it due to floating-point drift. Small thing, worth knowing.
        </Callout>

        <Divider />

        <H2 id="running-lerp">The running lerp: this is the good part</H2>
        <P>
          Static lerp blends between two known values. Useful. But the version I actually use
          every day is different: you call it on every animation frame, feeding the current
          value back in as the new start. The target stays where it is; the value just keeps
          creeping toward it.
        </P>

        <Code lang="js">{`// Called once per animation frame
current = lerp(current, target, factor)

// Or written out:
current += (target - current) * factor`}</Code>

        <P>
          Each frame it closes a fraction of the remaining gap. Never quite arrives, but always
          getting closer. Crank the factor up and it snaps. Pull it down and it floats.
        </P>

        <DemoBox label="Interactive · Running lerp follow">
          <RunningLerpDemo />
        </DemoBox>

        <P>
          Pull the factor down to 0.05 or 0.08 and the follower starts to feel like it has
          mass, like it is being dragged through something. That is exactly what I used in the{' '}
          <Link href="/experiments/stacked-8" className="text-violet hover:underline">
            Stacked 8
          </Link>{' '}
          experiment: each ring gets a different factor, so the front layer snaps and the back
          ones drift. The depth illusion comes entirely from timing, not geometry.
        </P>

        <Callout>
          <strong>Running lerp is frame-rate dependent.</strong> The same factor at 120fps moves
          twice as fast as at 60fps. For most creative experiments that is fine. If it matters,
          compensate with delta time:{' '}
          <IC>current += (target - current) * (1 - Math.pow(1 - factor, deltaTime / 16.67))</IC>.
        </Callout>

        <Divider />

        <H2 id="color-lerp">Colors are just three numbers</H2>
        <P>
          Apply lerp to R, G, and B independently and you get a smooth blend between any two
          colors. Same formula, three times. This is the math behind CSS gradients, the color
          mixer in the{' '}
          <Link href="/experiments/blob-editor" className="text-violet hover:underline">
            Blob Editor
          </Link>
          , and the front-to-back gradient on the Stacked 8 rings.
        </P>

        <Code lang="js">{`function lerpColor(hex1, hex2, t) {
  const a = parseInt(hex1.slice(1), 16)
  const b = parseInt(hex2.slice(1), 16)
  const r = Math.round(((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t)
  const g = Math.round(((a >>  8) & 255) * (1 - t) + ((b >>  8) & 255) * t)
  const c = Math.round( (a        & 255) * (1 - t) +  (b        & 255) * t)
  return \`rgb(\${r},\${g},\${c})\`
}`}</Code>

        <DemoBox label="Interactive · Color lerp">
          <ColorLerpDemo />
        </DemoBox>

        <P>
          One real caveat here. sRGB values are gamma-encoded, which means they do not map
          linearly to how our eyes perceive brightness. Lerping directly in sRGB skips through
          perceptually dark territory in the middle, which is why gradients between certain
          colors look muddy or dim at the halfway point. You can see it clearly if you try
          blending between two complementary hues above.
        </P>
        <P>
          For cleaner results, lerp in linear light instead: square the sRGB values before
          blending, then square-root the result. That is a rough gamma correction and already
          much better. For the best gradients, interpolate in OKLab, which is designed to be
          perceptually uniform. HSL is another common option but has its own quirk: hue lerp
          can take the long way around the color wheel if you are not careful.
        </P>
        <P>
          For quick creative work, RGB is fine. For anything where color quality matters,
          it is worth the extra step.
        </P>

        <Divider />

        <H2 id="where-you-see-it">Where you'll spot it</H2>
        <P>
          Once you know the shape of it, it is hard to unsee:
        </P>

        <ul className="list-none flex flex-col gap-4 mb-8 pl-0">
          {[
            ['Game cameras', 'The camera lerps toward the player each frame. Low factor feels cinematic. High factor feels tight. Most games live somewhere around 0.1.'],
            ['UI animations', 'A modal lerping its translateY toward 0. A tooltip fading in. A drawer sliding out. Running lerp handles all of it with one line.'],
            ['Scroll-linked effects', 'scrollProgress goes from 0 to 1 as the user scrolls past a section. Feed that into lerp and you have a parallax, a fade, a progress bar.'],
            ['Procedural animation', 'Joints lerp toward target angles each frame. No keyframes needed. The motion emerges from the math.'],
            ['Audio crossfades', 'Volume from 1 to 0 on the outgoing track, 0 to 1 on the incoming one. Same duration, smooth transition.'],
            ['Shaders', 'GLSL\'s built-in mix() is lerp. Blending textures, layering noise, interpolating normals. It is everywhere.'],
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

        <H2 id="quick-tips">A few things worth knowing</H2>

        <ul className="list-none flex flex-col gap-4 mb-6 pl-0">
          {[
            ['Clamp t', 'Outside [0, 1], lerp extrapolates past A or B. Sometimes intentional. Usually a bug.'],
            ['Tune factor by feel', '0.05–0.1 for dreamy. 0.15–0.2 for fluid. 0.3–0.5 for snappy. These assume ~60fps.'],
            ['Running lerp for anything that chases', 'Mouse, scroll position, camera, audio level. If something needs to follow something else smoothly, this is the tool.'],
            ['Lerp the factor itself', 'You can lerp the lerp factor to create acceleration and deceleration in the follow. This is how a lot of polished UI ends up feeling hand-tuned.'],
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
