'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Section from '../../components/Section'
import { P, H2, IC, Code, Callout, Divider, DemoBox } from '../../components/blog/prose'

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

// ─── Demo 1: Varyings - rainbow triangle ─────────────────────────────────────

function VaryingColorDemo() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    initCanvasSize(canvas)
    const gl = canvas.getContext('webgl')
    gl.viewport(0, 0, canvas.width, canvas.height)

    const vs = `
      attribute vec2 aPos;
      attribute vec3 aColor;
      varying vec3 vColor;
      void main() {
        vColor = aColor;
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `
    const fs = `
      precision mediump float;
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(vColor, 1.0);
      }
    `
    const prog = makeProgram(gl, vs, fs)
    gl.useProgram(prog)

    // Interleaved layout: x, y, r, g, b - 5 floats per vertex
    const data = new Float32Array([
       0.0,  0.65,   0.49, 0.36, 1.00,  // top    - violet
      -0.6, -0.45,   0.18, 0.90, 0.65,  // bottom-left  - mint
       0.6, -0.45,   1.00, 0.55, 0.20,  // bottom-right - orange
    ])
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

    const STRIDE = 5 * 4  // 5 floats × 4 bytes each

    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, STRIDE, 0)

    const aColor = gl.getAttribLocation(prog, 'aColor')
    gl.enableVertexAttribArray(aColor)
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, STRIDE, 2 * 4)

    function draw() {
      gl.clearColor(0.05, 0.05, 0.07, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    draw()
    const ro = watchViewport(canvas, gl, draw)
    return () => ro.disconnect()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '220px', borderRadius: '8px', display: 'block' }}
    />
  )
}

// ─── Demo 2: Vertex deformation - sine wave band ──────────────────────────────

function WaveDemo() {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const ampRef    = useRef(0.25)
  const freqRef   = useRef(3.5)
  const [amp,  setAmp]  = useState(0.25)
  const [freq, setFreq] = useState(3.5)

  useEffect(() => {
    const canvas = canvasRef.current
    initCanvasSize(canvas)
    const gl = canvas.getContext('webgl')
    gl.viewport(0, 0, canvas.width, canvas.height)

    const N = 60  // columns in the strip

    const vs = `
      attribute vec2 aPos;
      uniform float uTime;
      uniform float uAmp;
      uniform float uFreq;
      varying float vWave;
      void main() {
        float wave = sin(aPos.x * uFreq + uTime * 2.0) * uAmp;
        vWave = wave / uAmp;
        gl_Position = vec4(aPos.x, aPos.y + wave, 0.0, 1.0);
      }
    `
    const fs = `
      precision mediump float;
      varying float vWave;
      void main() {
        float t = vWave * 0.5 + 0.5;
        vec3 violet = vec3(0.49, 0.36, 1.00);
        vec3 mint   = vec3(0.18, 0.90, 0.65);
        gl_FragColor = vec4(mix(violet, mint, t), 1.0);
      }
    `
    const prog = makeProgram(gl, vs, fs)
    gl.useProgram(prog)

    // Build a horizontal strip of N quads, each as 2 triangles
    const verts = []
    for (let i = 0; i < N; i++) {
      const x0 = -1.0 + (i / N) * 2.0
      const x1 = -1.0 + ((i + 1) / N) * 2.0
      const y0 = -0.35
      const y1 =  0.35
      verts.push(x0, y0,  x1, y0,  x1, y1)
      verts.push(x0, y0,  x1, y1,  x0, y1)
    }

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)

    const aPos  = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uAmp  = gl.getUniformLocation(prog, 'uAmp')
    const uFreq = gl.getUniformLocation(prog, 'uFreq')

    let t = 0, last = performance.now()

    function loop(now) {
      t += (now - last) / 1000
      last = now
      gl.uniform1f(uTime, t)
      gl.uniform1f(uAmp,  ampRef.current)
      gl.uniform1f(uFreq, freqRef.current)
      gl.clearColor(0.05, 0.05, 0.07, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, N * 6)
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
          <span style={{ color: `var(--color-${color})` }}>{value.toFixed(2)}</span>
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
      <canvas ref={canvasRef} style={{ width: '100%', height: '220px', borderRadius: '8px', display: 'block' }} />
      <Slider label="Amplitude" value={amp} min={0} max={0.5} step={0.01} color="violet"
        onChange={v => { setAmp(v);  ampRef.current  = v }} />
      <Slider label="Frequency" value={freq} min={0.5} max={10} step={0.1} color="mint"
        onChange={v => { setFreq(v); freqRef.current = v }} />
      <p className="text-[12px] font-mono text-muted">
        The vertex shader displaces each vertex on the y-axis using <IC>sin(x × freq + time) × amp</IC>. The geometry lives on the GPU - only the two uniforms travel from JavaScript.
      </p>
    </>
  )
}

// ─── Demo 3: Multiple draw calls - orbiting triangles ────────────────────────

function MultiDrawDemo() {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    initCanvasSize(canvas)
    const gl = canvas.getContext('webgl')
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const vs = `
      attribute vec2 aPos;
      uniform float uAngle;
      uniform vec2  uOffset;
      uniform float uScale;
      void main() {
        float c = cos(uAngle);
        float s = sin(uAngle);
        vec2 rotated = vec2(aPos.x * c - aPos.y * s, aPos.x * s + aPos.y * c);
        gl_Position = vec4(rotated * uScale + uOffset, 0.0, 1.0);
      }
    `
    const fs = `
      precision mediump float;
      uniform vec3 uColor;
      void main() {
        gl_FragColor = vec4(uColor, 0.88);
      }
    `
    const prog = makeProgram(gl, vs, fs)
    gl.useProgram(prog)

    const verts = new Float32Array([0.0, 0.7, -0.6, -0.35, 0.6, -0.35])
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uAngle  = gl.getUniformLocation(prog, 'uAngle')
    const uOffset = gl.getUniformLocation(prog, 'uOffset')
    const uScale  = gl.getUniformLocation(prog, 'uScale')
    const uColor  = gl.getUniformLocation(prog, 'uColor')

    const shapes = [
      { spinSpeed: 1.0,  orbit: 0.00, orbitSpeed: 0.0,   phase: 0,              scale: 0.32, color: [0.49, 0.36, 1.00] },
      { spinSpeed: 2.0,  orbit: 0.50, orbitSpeed: 0.7,   phase: 0,              scale: 0.20, color: [0.18, 0.90, 0.65] },
      { spinSpeed: -1.5, orbit: 0.50, orbitSpeed: -0.7,  phase: Math.PI,        scale: 0.20, color: [1.00, 0.55, 0.22] },
      { spinSpeed: 3.5,  orbit: 0.75, orbitSpeed: 0.45,  phase: Math.PI / 2,    scale: 0.13, color: [0.49, 0.36, 1.00] },
      { spinSpeed: -3.0, orbit: 0.75, orbitSpeed: -0.45, phase: -Math.PI / 2,   scale: 0.13, color: [0.18, 0.90, 0.65] },
      { spinSpeed: 4.0,  orbit: 0.75, orbitSpeed: 0.45,  phase: Math.PI * 1.5,  scale: 0.13, color: [1.00, 0.55, 0.22] },
    ]

    let t = 0, last = performance.now()

    function loop(now) {
      t += (now - last) / 1000
      last = now
      gl.clearColor(0.05, 0.05, 0.07, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      for (const sh of shapes) {
        const ox = Math.cos(t * sh.orbitSpeed + sh.phase) * sh.orbit
        const oy = Math.sin(t * sh.orbitSpeed + sh.phase) * sh.orbit * 0.55
        gl.uniform1f(uAngle,  t * sh.spinSpeed)
        gl.uniform2f(uOffset, ox, oy)
        gl.uniform1f(uScale,  sh.scale)
        gl.uniform3f(uColor,  sh.color[0], sh.color[1], sh.color[2])
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      }

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    const ro = watchViewport(canvas, gl, null)
    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} style={{ width: '100%', height: '260px', borderRadius: '8px', display: 'block' }} />
      <p className="text-[12px] font-mono text-muted">
        One buffer. Six draw calls. Each call sets different <IC>uAngle</IC>, <IC>uOffset</IC>, <IC>uScale</IC>, and <IC>uColor</IC> uniforms before drawing the same 3 vertices.
      </p>
    </>
  )
}

// ─── Post ─────────────────────────────────────────────────────────────────────

export default function VertexShaderPost() {
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
          Vertex Shaders: Giving the GPU Your Geometry
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
          In the{' '}
          <Link href="/blog/webgl-triangle" className="text-violet hover:underline">triangle post</Link>
          {' '}the vertex shader had one job: pass coordinates through to the GPU unchanged. That is
          the minimal case. But the vertex shader is the first programmable stage in the pipeline,
          and it runs on the GPU in parallel across every vertex. You can do a lot more than just
          forward positions.
        </P>
        <P>
          This post goes deeper into what the vertex stage can actually do: passing data to the
          fragment stage through varyings, uploading multiple streams of per-vertex data as
          interleaved attributes, deforming geometry with math, and drawing the same geometry
          many times with different uniforms.
        </P>

        <Divider />

        <H2 id="varyings">Varyings: the bridge between stages</H2>
        <P>
          The vertex shader runs once per vertex. The fragment shader runs once per pixel.
          Between them, the GPU interpolates: it figures out all the pixels that fall inside
          the triangle and blends the values from the three corners based on how close each
          pixel is to each vertex.
        </P>
        <P>
          A <IC>varying</IC> is how you tap into that interpolation. You write a value in the
          vertex shader, declare the same variable as <IC>varying</IC> in both shaders, and the
          fragment shader receives the smoothly blended result.
        </P>

        <Code lang="glsl">{`// Vertex shader
attribute vec2 aPos;
attribute vec3 aColor;   // one color per vertex, from the buffer
varying vec3 vColor;     // declare as varying - GPU will interpolate this

void main() {
  vColor = aColor;       // write to the varying
  gl_Position = vec4(aPos, 0.0, 1.0);
}

// Fragment shader
precision mediump float;
varying vec3 vColor;     // same name, same type - receives the interpolated value

void main() {
  gl_FragColor = vec4(vColor, 1.0);
}`}</Code>

        <P>
          The three vertices have three different colors. Every pixel inside the triangle gets
          a blend of all three, weighted by position. You write three values. The GPU produces
          thousands.
        </P>

        <DemoBox label="Interactive · varyings, per-vertex color interpolated by the GPU">
          <VaryingColorDemo />
        </DemoBox>

        <P>
          Nothing in the fragment shader code does the blending. The GPU hardware handles it
          between the two shader stages. The fragment shader just reads the result.
        </P>

        <Divider />

        <H2 id="interleaved-attributes">Interleaved attributes: one buffer, multiple streams</H2>
        <P>
          The previous triangle post used a single attribute: <IC>aPos</IC>, two floats per
          vertex. To add per-vertex color, you need a second attribute. The cleanest way is to
          pack everything into one buffer in an interleaved layout.
        </P>

        <Code lang="js">{`// Interleaved layout: x, y, r, g, b - 5 floats per vertex
const data = new Float32Array([
   0.0,  0.65,   0.49, 0.36, 1.00,   // top vertex:   position + color
  -0.6, -0.45,   0.18, 0.90, 0.65,   // bottom-left:  position + color
   0.6, -0.45,   1.00, 0.55, 0.20,   // bottom-right: position + color
])`}</Code>

        <P>
          Then you describe each attribute with a stride (how many bytes to skip to reach
          the next vertex) and an offset (where this attribute starts within each vertex block).
        </P>

        <Code lang="js">{`const STRIDE = 5 * 4   // 5 floats × 4 bytes = 20 bytes per vertex

// aPos: 2 floats, starts at byte 0
gl.vertexAttribPointer(aPos,   2, gl.FLOAT, false, STRIDE, 0)

// aColor: 3 floats, starts at byte 8 (after 2 floats of position)
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, STRIDE, 2 * 4)`}</Code>

        <Callout>
          <strong>Stride and offset.</strong> Stride is how far apart the same attribute is
          between consecutive vertices. Offset is where within each vertex block that attribute
          begins. Getting either wrong is silent. The shader will read garbage memory with no error.
        </Callout>

        <P>
          Interleaved layouts are the standard for performance. All the data for one vertex
          lives at the same memory address, which is cache-friendly. The alternative is separate
          buffers per attribute (Array of Structures vs Structure of Arrays). For small geometry
          the difference is negligible; for large meshes it matters.
        </P>

        <Divider />

        <H2 id="vertex-deformation">Deforming geometry in the vertex shader</H2>
        <P>
          Because the vertex shader runs on the GPU, it can modify positions before rasterization.
          This is how terrain waves, cloth simulation, morphing shapes, and particle systems work.
          You upload static geometry once and animate it entirely through uniforms.
        </P>
        <P>
          The shader below takes a horizontal strip of triangles and displaces each vertex
          vertically using a sine function. The geometry is fixed. The wave exists purely in math.
        </P>

        <Code lang="glsl">{`attribute vec2 aPos;
uniform float uTime;
uniform float uAmp;    // amplitude: how tall the wave gets
uniform float uFreq;   // frequency: how many cycles across the strip
varying float vWave;   // pass displacement to fragment for coloring

void main() {
  float wave = sin(aPos.x * uFreq + uTime * 2.0) * uAmp;
  vWave = wave / uAmp;  // normalize to -1..1 for the fragment shader
  gl_Position = vec4(aPos.x, aPos.y + wave, 0.0, 1.0);
}`}</Code>

        <P>
          The fragment shader receives the <IC>vWave</IC> varying and uses it to blend between
          two colors, so the color follows the deformation. The wave is visible in both shape
          and color simultaneously.
        </P>

        <DemoBox label="Interactive · vertex deformation, sine wave strip">
          <WaveDemo />
        </DemoBox>

        <P>
          The JavaScript only updates two floats per frame: <IC>uAmp</IC> and <IC>uFreq</IC>. The
          geometry (60 quads = 360 vertices) never changes. Every position calculation happens in
          parallel on the GPU.
        </P>

        <Callout>
          <strong>Why not move vertices in JavaScript?</strong> You could update a buffer
          every frame from the CPU. But that requires reading vertex data from JavaScript memory,
          modifying it, and uploading the entire buffer via <IC>bufferData</IC>, a round trip
          across the CPU-GPU boundary every frame. Doing the math in a vertex shader keeps
          everything on the GPU. For 360 vertices the difference is small. For 360,000 it is not.
        </Callout>

        <Divider />

        <H2 id="multiple-draw-calls">Multiple draw calls: one buffer, many shapes</H2>
        <P>
          You do not need different geometry to draw different shapes. You can draw the same
          geometry multiple times in a row, changing uniforms between each call. Each draw call
          is independent, covering position, rotation, scale, and color.
        </P>

        <Code lang="js">{`// Same 3 vertices, drawn N times with different uniforms each time
for (const shape of shapes) {
  gl.uniform1f(uAngle,  shape.angle)
  gl.uniform2f(uOffset, shape.x, shape.y)
  gl.uniform1f(uScale,  shape.scale)
  gl.uniform3f(uColor,  shape.r, shape.g, shape.b)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}`}</Code>

        <P>
          The vertex shader applies the transform to each vertex using the uniforms:
        </P>

        <Code lang="glsl">{`attribute vec2 aPos;
uniform float uAngle;
uniform vec2  uOffset;
uniform float uScale;

void main() {
  // Rotate in 2D using a standard rotation matrix
  float c = cos(uAngle);
  float s = sin(uAngle);
  vec2 rotated = vec2(
    aPos.x * c - aPos.y * s,
    aPos.x * s + aPos.y * c
  );
  gl_Position = vec4(rotated * uScale + uOffset, 0.0, 1.0);
}`}</Code>

        <DemoBox label="Interactive · multiple draw calls, one buffer and six shapes">
          <MultiDrawDemo />
        </DemoBox>

        <P>
          Six draw calls. Each one sets four uniforms and fires the same three vertices through
          the same shader. The GPU runs 18 vertex shader invocations total, three per call,
          each reading different uniform values.
        </P>
        <P>
          This pattern scales to instanced rendering, where you upload all per-instance data
          into a buffer and draw thousands of copies in a single call. That is a WebGL2 feature
          and a significant optimization for particle systems.
        </P>

        <Divider />

        <H2 id="what-comes-next">What comes next</H2>
        <P>
          The vertex stage handles positions and passes data to the next stage. What the
          fragment shader does with that data is where most of the visual richness in WebGL
          comes from. Distance functions, UV coordinate tricks, animated gradients, and
          procedural textures all live there.
        </P>

        <ul className="list-none flex flex-col gap-4 mb-8 pl-0">
          {[
            ['varyings', 'Pass any per-vertex data to the fragment stage. The GPU interpolates it across the primitive automatically.'],
            ['Interleaved attributes', 'Pack any per-vertex data (position, color, UV, normals) into a single buffer using stride and offset.'],
            ['GPU-side math', 'Deforming geometry via uniforms keeps everything on the GPU. No buffer uploads per frame.'],
            ['Multiple draw calls', 'The same geometry drawn with different uniform sets is the basis of instancing and sprite batching.'],
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
          The next post covers the fragment shader in depth: UV coordinate systems, distance
          functions for drawing shapes without any vertex geometry, and building animated
          full-screen patterns, the kind of thing you see on Shadertoy.
        </Callout>

      </article>

    </Section>
  )
}
