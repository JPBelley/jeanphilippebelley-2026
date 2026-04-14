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

// ─── Shared WebGL helpers ─────────────────────────────────────────────────────

function makeShader(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  return sh
}
function makeProgram(gl, vsSrc, fsSrc) {
  const vs   = makeShader(gl, gl.VERTEX_SHADER,   vsSrc)
  const fs   = makeShader(gl, gl.FRAGMENT_SHADER, fsSrc)
  const prog = gl.createProgram()
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  return prog
}
function initCanvasSize(canvas) {
  canvas.width  = canvas.clientWidth  || 600
  canvas.height = canvas.clientHeight || 220
}
function watchViewport(canvas, gl, onResize) {
  const ro = new ResizeObserver(() => {
    gl.viewport(0, 0, canvas.width, canvas.height)
    if (onResize) onResize()
  })
  ro.observe(canvas)
  return ro
}

// Full-screen quad vertex shader — shared by all demos in this post
const QUAD_VS = `
  attribute vec2 aPos;
  varying vec2 vUv;
  void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`

// Full-screen quad vertices — two triangles covering clip space
const QUAD_VERTS = new Float32Array([
  -1, -1,   1, -1,   1,  1,
  -1, -1,   1,  1,  -1,  1,
])

function setupQuad(gl) {
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTS, gl.STATIC_DRAW)
  return buf
}

// ─── Demo 1: UV coordinates ───────────────────────────────────────────────────

const UV_MODES = [
  { label: 'UV as color',    id: 0 },
  { label: 'UV grid',        id: 1 },
  { label: 'Polar coords',   id: 2 },
]

function UVDemo() {
  const canvasRef    = useRef(null)
  const glRef        = useRef(null)
  const uModeRef     = useRef(null)
  const drawRef      = useRef(null)
  const activeModeRef = useRef(0)
  const [mode, setMode] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    initCanvasSize(canvas)
    const gl = canvas.getContext('webgl')
    glRef.current = gl
    gl.viewport(0, 0, canvas.width, canvas.height)

    const fs = `
      precision mediump float;
      varying vec2 vUv;
      uniform int uMode;

      void main() {
        if (uMode == 0) {
          // Raw UV mapped to R and G channels
          gl_FragColor = vec4(vUv.x, vUv.y, 0.45, 1.0);

        } else if (uMode == 1) {
          // Grid lines using fract
          vec2 grid = fract(vUv * 7.0);
          float line = step(0.93, max(grid.x, grid.y));
          vec3 lineColor = vec3(0.49, 0.36, 1.00);
          vec3 bg        = vec3(0.05, 0.05, 0.07);
          gl_FragColor = vec4(mix(bg, lineColor, line), 1.0);

        } else {
          // Polar: angle → hue, radius → brightness
          vec2 centered = vUv * 2.0 - 1.0;
          float angle  = atan(centered.y, centered.x) / 6.2832 + 0.5;
          float radius = length(centered);
          float ring   = smoothstep(0.02, 0.0, abs(fract(radius * 4.0) - 0.5) - 0.3);
          gl_FragColor = vec4(angle, 1.0 - radius, 0.6 + ring * 0.4, 1.0);
        }
      }
    `
    const prog = makeProgram(gl, QUAD_VS, fs)
    gl.useProgram(prog)

    setupQuad(gl)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    uModeRef.current = gl.getUniformLocation(prog, 'uMode')

    function draw() {
      gl.uniform1i(uModeRef.current, activeModeRef.current)
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    drawRef.current = draw
    draw()

    const ro = watchViewport(canvas, gl, draw)
    return () => ro.disconnect()
  }, [])

  function handleMode(m) {
    setMode(m)
    activeModeRef.current = m
    const gl = glRef.current
    if (!gl) return
    gl.uniform1i(uModeRef.current, m)
    drawRef.current?.()
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ width: '100%', height: '220px', borderRadius: '8px', display: 'block' }} />
      <div className="flex gap-2 flex-wrap">
        {UV_MODES.map(m => (
          <button
            key={m.id}
            onClick={() => handleMode(m.id)}
            className={`font-mono text-[11px] px-3 py-1.5 rounded border transition-colors duration-150 ${
              mode === m.id
                ? 'border-violet text-violet bg-[rgba(124,92,255,0.1)]'
                : 'border-ui text-muted hover:border-violet hover:text-violet'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-[12px] font-mono text-muted">
        The vertex shader converts NDC (-1..1) to UV (0..1) with <IC>aPos * 0.5 + 0.5</IC> and passes it as a varying. The fragment shader uses it as a coordinate system.
      </p>
    </>
  )
}

// ─── Demo 2: SDF circle ────────────────────────────────────────────────────────

function SDFDemo() {
  const canvasRef  = useRef(null)
  const glRef      = useRef(null)
  const drawRef    = useRef(null)
  const uRadiusRef = useRef(null)
  const uSoftRef   = useRef(null)
  const radiusActiveRef = useRef(0.35)
  const softActiveRef   = useRef(0.012)
  const [radius, setRadius] = useState(0.35)
  const [soft,   setSoft]   = useState(0.012)

  useEffect(() => {
    const canvas = canvasRef.current
    initCanvasSize(canvas)
    const gl = canvas.getContext('webgl')
    glRef.current = gl
    gl.viewport(0, 0, canvas.width, canvas.height)

    const fs = `
      precision mediump float;
      varying vec2 vUv;
      uniform float uRadius;
      uniform float uSoft;
      uniform vec2  uResolution;

      void main() {
        // Aspect-correct UV: center is (0,0), edges at ±aspect and ±1
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 p = (vUv * 2.0 - 1.0) * aspect;

        float dist = length(p);

        // Outer filled circle
        float circle = smoothstep(uRadius + uSoft, uRadius - uSoft, dist);

        // Inner ring cutout
        float hole   = smoothstep(uRadius * 0.55 + uSoft, uRadius * 0.55 - uSoft, dist);
        float ring   = circle - hole;

        // Glow: soft halo outside the circle
        float glow   = smoothstep(uRadius + 0.25, uRadius, dist) * 0.4;

        vec3 violet  = vec3(0.49, 0.36, 1.00);
        vec3 mint    = vec3(0.18, 0.90, 0.65);
        vec3 bg      = vec3(0.05, 0.05, 0.07);

        vec3 col = bg;
        col += violet * glow;
        col  = mix(col, mix(violet, mint, dist / uRadius), ring);

        gl_FragColor = vec4(col, 1.0);
      }
    `
    const prog = makeProgram(gl, QUAD_VS, fs)
    gl.useProgram(prog)

    setupQuad(gl)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    uRadiusRef.current = gl.getUniformLocation(prog, 'uRadius')
    uSoftRef.current   = gl.getUniformLocation(prog, 'uSoft')
    const uRes         = gl.getUniformLocation(prog, 'uResolution')

    function draw() {
      gl.uniform1f(uRadiusRef.current, radiusActiveRef.current)
      gl.uniform1f(uSoftRef.current,   softActiveRef.current)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.clearColor(0.05, 0.05, 0.07, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    drawRef.current = draw
    draw()

    const ro = watchViewport(canvas, gl, draw)
    return () => ro.disconnect()
  }, [])

  function update(key, val) {
    if (key === 'radius') { setRadius(val); radiusActiveRef.current = val }
    if (key === 'soft')   { setSoft(val);   softActiveRef.current   = val }
    drawRef.current?.()
  }

  function Slider({ label, value, min, max, step, color, onChange }) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-muted">{label}</span>
          <span style={{ color: `var(--color-${color})` }}>{value.toFixed(3)}</span>
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

  return (
    <>
      <canvas ref={canvasRef} style={{ width: '100%', height: '260px', borderRadius: '8px', display: 'block' }} />
      <Slider label="Radius" value={radius} min={0.05} max={0.75} step={0.01} color="violet"
        onChange={v => update('radius', v)} />
      <Slider label="Edge softness" value={soft} min={0.001} max={0.05} step={0.001} color="mint"
        onChange={v => update('soft', v)} />
      <p className="text-[12px] font-mono text-muted">
        No circle geometry. The shape exists only in math: <IC>length(p)</IC> gives distance from center,
        <IC>smoothstep</IC> converts that to a sharp or soft edge. Drag softness to 0.001 for a hard pixel edge.
      </p>
    </>
  )
}

// ─── Demo 3: Animated ripple pattern ─────────────────────────────────────────

function RippleDemo() {
  const canvasRef  = useRef(null)
  const rafRef     = useRef(null)
  const speedRef   = useRef(1.0)
  const wavesRef   = useRef(5.0)
  const [speed,  setSpeed]  = useState(1.0)
  const [waves,  setWaves]  = useState(5.0)

  useEffect(() => {
    const canvas = canvasRef.current
    initCanvasSize(canvas)
    const gl = canvas.getContext('webgl')
    gl.viewport(0, 0, canvas.width, canvas.height)

    const fs = `
      precision mediump float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uWaves;
      uniform vec2  uResolution;

      void main() {
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 p = (vUv * 2.0 - 1.0) * aspect;

        float dist = length(p);

        // Expanding rings: sin of distance minus time
        float ripple = sin(dist * uWaves * 3.14159 - uTime * 3.0) * 0.5 + 0.5;

        // Fade out toward the edges
        float falloff = 1.0 - smoothstep(0.0, 1.2, dist);
        ripple *= falloff;

        // Secondary interference wave from a slight offset origin
        vec2 p2 = p - vec2(0.3, 0.2) * aspect;
        float dist2   = length(p2);
        float ripple2 = sin(dist2 * uWaves * 3.14159 - uTime * 2.3 + 1.0) * 0.5 + 0.5;
        ripple2 *= (1.0 - smoothstep(0.0, 1.0, dist2));

        float combined = (ripple + ripple2) * 0.5;

        vec3 violet = vec3(0.49, 0.36, 1.00);
        vec3 mint   = vec3(0.18, 0.90, 0.65);
        vec3 bg     = vec3(0.05, 0.05, 0.07);

        vec3 col = mix(bg, mix(violet, mint, combined), combined * 0.85 + 0.05);
        gl_FragColor = vec4(col, 1.0);
      }
    `
    const prog = makeProgram(gl, QUAD_VS, fs)
    gl.useProgram(prog)

    setupQuad(gl)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime  = gl.getUniformLocation(prog, 'uTime')
    const uWaves = gl.getUniformLocation(prog, 'uWaves')
    const uRes   = gl.getUniformLocation(prog, 'uResolution')

    let t = 0, last = performance.now()

    function loop(now) {
      t += ((now - last) / 1000) * speedRef.current
      last = now
      gl.uniform1f(uTime,  t)
      gl.uniform1f(uWaves, wavesRef.current)
      gl.uniform2f(uRes,   canvas.width, canvas.height)
      gl.clearColor(0.05, 0.05, 0.07, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    const ro = watchViewport(canvas, gl, null)
    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  function Slider({ label, value, min, max, step, color, onChange }) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-muted">{label}</span>
          <span style={{ color: `var(--color-${color})` }}>{value.toFixed(1)}</span>
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

  return (
    <>
      <canvas ref={canvasRef} style={{ width: '100%', height: '260px', borderRadius: '8px', display: 'block' }} />
      <Slider label="Speed" value={speed} min={0} max={3} step={0.1} color="violet"
        onChange={v => { setSpeed(v);  speedRef.current  = v }} />
      <Slider label="Waves" value={waves} min={1} max={12} step={0.5} color="mint"
        onChange={v => { setWaves(v);  wavesRef.current  = v }} />
      <p className="text-[12px] font-mono text-muted">
        Two interference patterns: <IC>sin(dist × waves - time)</IC> from different origins.
        No geometry, no textures — every pixel is computed from its UV coordinate and the time uniform.
      </p>
    </>
  )
}

// ─── Post ─────────────────────────────────────────────────────────────────────

export default function FragmentShaderPost() {
  return (
    <Section size="narrow">

      <Link href="/blog" className="inline-flex items-center gap-2 text-[12px] font-mono text-muted hover:text-foreground transition-colors no-underline mb-10">
        ← All posts
      </Link>

      <header className="mb-12">
        <div className="flex items-center gap-2 text-[11px] font-mono text-muted mb-4">
          <span>April 13, 2026</span>
          <span>·</span>
          <span>9 min read</span>
        </div>
        <h1 className="text-[clamp(28px,5vw,44px)] font-bold leading-[1.15] tracking-[-0.02em] mb-5">
          Fragment Shaders: Programming Every Pixel
        </h1>
        <div className="flex flex-wrap gap-2">
          {['WebGL', 'GLSL', 'Creative Coding'].map(tag => (
            <span key={tag} className="font-mono text-[10px] px-2 py-1 rounded border border-ui bg-bg2 text-muted">
              {tag}
            </span>
          ))}
        </div>
      </header>

      <article>
        <P>
          The vertex shader decides where geometry lives in space. The fragment shader decides
          what color each pixel of that geometry should be. That description undersells it.
        </P>
        <P>
          Once you have a full-screen quad — two triangles covering the entire canvas — the
          fragment shader is effectively a function that runs once per pixel and can produce
          anything: gradients, shapes, textures, animations, noise. No additional geometry
          required. This is how most of what you see on{' '}
          <a href="https://shadertoy.com" target="_blank" rel="noopener noreferrer" className="text-violet hover:underline">Shadertoy</a>
          {' '}is built, and it is the foundation of image processing pipelines.
        </P>
        <P>
          This post covers the coordinate system the fragment shader works in, how to draw
          shapes without any vertex geometry using distance functions, and how to combine
          math and time into animated patterns.
        </P>

        <Divider />

        <H2 id="the-full-screen-quad">The full-screen quad</H2>
        <P>
          Before anything else, you need a canvas to paint. Two triangles that cover the entire
          clip space give the fragment shader a pixel for every position on screen.
        </P>

        <Code lang="js">{`// Two triangles forming a rectangle from (-1,-1) to (1,1)
const verts = new Float32Array([
  -1, -1,   1, -1,   1,  1,
  -1, -1,   1,  1,  -1,  1,
])

// Vertex shader just passes position through as a UV coordinate
const vs = \`
  attribute vec2 aPos;
  varying vec2 vUv;
  void main() {
    vUv = aPos * 0.5 + 0.5;  // remap from NDC (-1..1) to UV (0..1)
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
\``}</Code>

        <P>
          The vertex shader converts NDC to UV space by scaling and shifting: <IC>aPos * 0.5 + 0.5</IC>.
          This gives the fragment shader a coordinate where (0, 0) is the bottom-left corner and
          (1, 1) is the top-right. That coordinate is called UV, and it is the fragment shader's
          primary way of knowing where it is on screen.
        </P>

        <Divider />

        <H2 id="uv-coordinates">UV coordinates: the fragment's GPS</H2>
        <P>
          Every fragment shader invocation knows one thing about where it is: its UV coordinate.
          That is a <IC>vec2</IC> between (0, 0) and (1, 1) that identifies the pixel's position
          on the quad. How you use that coordinate to produce a color is the entire art of
          fragment shading.
        </P>
        <P>
          The most direct use: map U to red and V to green. The result is a color gradient that
          makes the coordinate space visible.
        </P>

        <Code lang="glsl">{`precision mediump float;
varying vec2 vUv;

void main() {
  // vUv.x runs 0→1 left to right   → red channel
  // vUv.y runs 0→1 bottom to top   → green channel
  gl_FragColor = vec4(vUv.x, vUv.y, 0.45, 1.0);
}`}</Code>

        <P>
          Switch to the grid mode below to see <IC>fract</IC> in action — it takes the
          fractional part of a number, which repeats the 0..1 range. Multiplying UV by a
          constant sets the grid density.
        </P>

        <DemoBox label="Interactive · UV coordinate space — three views">
          <UVDemo />
        </DemoBox>

        <P>
          The polar view re-centers the coordinate with <IC>vUv * 2.0 - 1.0</IC> so the origin
          is at the center, then uses <IC>atan</IC> and <IC>length</IC> to convert to polar.
          All three modes use the same two triangles and the same vertex shader. Only the
          fragment math changes.
        </P>

        <Callout>
          <strong>Aspect ratio.</strong> UV coordinates are always square (0..1 in both
          axes), but your canvas usually is not. To avoid circles becoming ovals, scale
          the horizontal axis by <IC>resolution.x / resolution.y</IC> after centering:{' '}
          <IC>p.x *= uResolution.x / uResolution.y</IC>. The demos below all do this.
        </Callout>

        <Divider />

        <H2 id="distance-functions">Distance functions: shapes without vertices</H2>
        <P>
          In rasterized 3D graphics, a circle is a polygon with many sides. In a fragment shader,
          a circle is a math expression: every pixel measures its distance from a center point
          and colors itself based on whether that distance is inside or outside a threshold.
        </P>
        <P>
          The key function is <IC>length</IC>, which returns the Euclidean distance from the
          origin to a point. Combine it with <IC>smoothstep</IC> to get a soft edge.
        </P>

        <Code lang="glsl">{`precision mediump float;
varying vec2 vUv;
uniform float uRadius;
uniform float uSoft;    // controls edge sharpness

void main() {
  vec2 p    = vUv * 2.0 - 1.0;  // center origin
  float dist = length(p);         // distance from center

  // smoothstep(edge0, edge1, x):
  //   returns 0 when x < edge0, 1 when x > edge1, smooth in between
  float circle = smoothstep(uRadius + uSoft, uRadius - uSoft, dist);

  gl_FragColor = vec4(vec3(0.49, 0.36, 1.0) * circle, 1.0);
}`}</Code>

        <P>
          Drag the softness slider all the way down and the edge becomes a hard one-pixel line.
          Increase it and you get a glow. The math is the same — only the transition width changes.
        </P>

        <DemoBox label="Interactive · SDF ring — radius + edge softness">
          <SDFDemo />
        </DemoBox>

        <P>
          The demo adds two more ideas: a ring (outer circle minus inner circle) and a glow
          halo (a wider <IC>smoothstep</IC> with low opacity blended on top of the background).
          Neither requires any additional geometry. They are all computed from the same
          <IC>dist</IC> variable.
        </P>

        <Divider />

        <H2 id="composing-shapes">Composing shapes with set operations</H2>
        <P>
          Distance functions compose the same way boolean operations do. Two distances can
          be combined using <IC>min</IC> and <IC>max</IC> to union, intersect, or subtract shapes.
        </P>

        <Code lang="glsl">{`float circleA = length(p - vec2(-0.3, 0.0)) - 0.3;  // signed distance
float circleB = length(p - vec2( 0.3, 0.0)) - 0.3;

// Union: minimum of both distances — inside either circle
float united      = min(circleA, circleB);

// Intersection: maximum — only inside both circles
float intersected = max(circleA, circleB);

// Subtraction: A minus B — inside A, outside B
float subtracted  = max(circleA, -circleB);

// Convert signed distance to color (negative = inside)
float shape = smoothstep(0.01, -0.01, united);`}</Code>

        <P>
          The values returned here are signed distance fields (SDFs): negative inside the shape,
          positive outside, zero exactly on the edge. Signed distances compose perfectly — you
          can add them, blend between them, and animate them smoothly. This is the foundation of
          2D shape rendering in fragment shaders.
        </P>

        <Callout>
          <strong>Signed vs unsigned distance.</strong> The circle demos above use
          <IC>length(p)</IC> (unsigned — always positive) combined with <IC>smoothstep</IC>
          directly. Signed distances subtract the radius: <IC>length(p) - r</IC>. Negative
          means inside, positive means outside, zero is the exact edge. The signed form is
          more composable for set operations.
        </Callout>

        <Divider />

        <H2 id="animation">Animation: time as an input</H2>
        <P>
          The fragment shader is a pure function: given a UV coordinate (and any uniforms),
          it returns a color. Make <IC>uTime</IC> a uniform and the function gains a temporal
          dimension. Every pixel can be a function of both position and time simultaneously.
        </P>
        <P>
          A classic technique: use <IC>sin(distance - time)</IC> to create expanding rings.
          As time increases, the argument to sine shifts, which moves the peaks and troughs
          outward — like dropping a stone in water.
        </P>

        <Code lang="glsl">{`precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform float uWaves;

void main() {
  vec2  p    = vUv * 2.0 - 1.0;
  float dist = length(p);

  // sin(dist × frequency - time) produces outward-moving rings
  float ripple = sin(dist * uWaves * 3.14159 - uTime * 3.0) * 0.5 + 0.5;

  // Fade toward the edge so it does not clip hard
  float fade = 1.0 - smoothstep(0.0, 1.2, dist);
  ripple *= fade;

  vec3 col = mix(vec3(0.05), mix(violet, mint, ripple), ripple);
  gl_FragColor = vec4(col, 1.0);
}`}</Code>

        <P>
          The demo below adds a second source at a slight offset, creating interference where the
          two wave systems overlap. The interference emerges from two independent <IC>sin</IC>
          expressions being averaged — no special handling required.
        </P>

        <DemoBox label="Interactive · ripple interference — two wave sources, composited">
          <RippleDemo />
        </DemoBox>

        <P>
          Set speed to zero and drag the waves slider. The pattern freezes but you can see the
          spatial frequency. Crank speed up and the two sources pulse at different rates,
          producing a beat-like interference pattern.
        </P>

        <Divider />

        <H2 id="what-comes-next">What comes next</H2>
        <P>
          Fragment shaders are where WebGL gets generative. The vertex shader handles where things
          are. The fragment shader handles what they look like — and with only UV coordinates
          and time as inputs, the range of possible outputs is enormous.
        </P>

        <ul className="list-none flex flex-col gap-4 mb-8 pl-0">
          {[
            ['UV coordinates', 'The fragment\'s position on the quad, remapped from NDC (-1..1) to (0..1). Every technique here builds on this.'],
            ['Distance functions', 'length(p) gives distance from any point. Combined with smoothstep, you get shapes with controllable edge softness.'],
            ['Set operations', 'min and max on signed distances union, intersect, and subtract shapes. Compose them arbitrarily.'],
            ['Time as input', 'A uTime uniform makes the shader\'s output a function of both position and time. Shifting the phase of a periodic function produces motion.'],
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

        <Callout>
          Natural next steps from here: noise functions (simplex, value) for organic randomness,
          texture sampling with <IC>sampler2D</IC> uniforms for image effects, and blending
          multiple shader techniques using the alpha channel. The full-screen quad pattern and
          the UV coordinate system carry through all of it.
        </Callout>

      </article>

    </Section>
  )
}
