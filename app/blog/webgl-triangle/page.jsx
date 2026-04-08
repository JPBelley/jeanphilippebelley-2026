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

function hexToFloat(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]
}

// Sets canvas.width/height once from its CSS size (call BEFORE getContext),
// then watches for resizes and only calls gl.viewport — never touches canvas dims again.
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

// ─── Demo 1: Triangle + color picker (uniform) ────────────────────────────────

function TriangleDemo() {
  const canvasRef  = useRef(null)
  const glRef      = useRef(null)
  const uColorRef  = useRef(null)
  const [color, setColor] = useState('#7C5CFF')
  const [floats, setFloats] = useState([0.49, 0.36, 1.0])

  useEffect(() => {
    const canvas = canvasRef.current
    initCanvasSize(canvas)
    const gl = canvas.getContext('webgl')
    glRef.current = gl
    gl.viewport(0, 0, canvas.width, canvas.height)

    const vsSrc = `
      attribute vec2 aPos;
      void main() {
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `
    const fsSrc = `
      precision mediump float;
      uniform vec4 uColor;
      void main() {
        gl_FragColor = uColor;
      }
    `

    const prog = makeProgram(gl, vsSrc, fsSrc)
    gl.useProgram(prog)

    const verts = new Float32Array([
       0.0,  0.65,
      -0.6, -0.45,
       0.6, -0.45,
    ])
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    uColorRef.current = gl.getUniformLocation(prog, 'uColor')
    gl.uniform4f(uColorRef.current, 0.49, 0.36, 1.0, 1.0)

    function draw() {
      gl.clearColor(0.05, 0.05, 0.07, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    draw()
    const ro = watchViewport(canvas, gl, draw)
    return () => ro.disconnect()
  }, [])

  function handleColor(hex) {
    setColor(hex)
    const [r, g, b] = hexToFloat(hex)
    setFloats([r, g, b])
    const gl = glRef.current
    if (!gl) return
    gl.uniform4f(uColorRef.current, r, g, b, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '220px', borderRadius: '8px', display: 'block' }}
      />
      <div className="flex items-center gap-3">
        <input type="color" value={color} onChange={e => handleColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent shrink-0" />
        <span className="font-mono text-[12px] text-muted">
          {'gl.uniform4f(uColor, '}
          <span className="text-violet">{floats[0].toFixed(2)}, {floats[1].toFixed(2)}, {floats[2].toFixed(2)}, 1.00</span>
          {')'}
        </span>
      </div>
    </>
  )
}

// ─── Demo 2: Draggable vertices ───────────────────────────────────────────────

const DEFAULT_VERTS = [0.0, 0.65, -0.6, -0.45, 0.6, -0.45]

function VertexDemo() {
  const canvasRef  = useRef(null)
  const glRef      = useRef(null)
  const bufRef     = useRef(null)
  const vertsRef   = useRef([...DEFAULT_VERTS])
  const dragging   = useRef(null)
  const [verts, setVerts] = useState([...DEFAULT_VERTS])

  useEffect(() => {
    const canvas = canvasRef.current
    initCanvasSize(canvas)
    const gl = canvas.getContext('webgl')
    glRef.current = gl
    gl.viewport(0, 0, canvas.width, canvas.height)

    const vsSrc = `
      attribute vec2 aPos;
      void main() {
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `
    const fsSrc = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(0.49, 0.36, 1.0, 0.82);
      }
    `

    const prog = makeProgram(gl, vsSrc, fsSrc)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    bufRef.current = buf
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertsRef.current), gl.DYNAMIC_DRAW)

    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    redraw(gl)
    const ro = watchViewport(canvas, gl, () => redraw(gl))
    return () => ro.disconnect()
  }, [])

  function redraw(gl) {
    gl.clearColor(0.05, 0.05, 0.07, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  function toNDC(e) {
    const canvas = canvasRef.current
    const rect   = canvas.getBoundingClientRect()
    const cx     = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const cy_    = e.clientY ?? e.touches?.[0]?.clientY ?? 0
    const sx     = canvas.width  / rect.width
    const sy_    = canvas.height / rect.height
    const px     = (cx  - rect.left) * sx
    const py     = (cy_ - rect.top)  * sy_
    return [(px / canvas.width) * 2 - 1, 1 - (py / canvas.height) * 2]
  }

  function nearest(nx, ny) {
    const v = vertsRef.current
    let best = null, bestD = 0.22
    for (let i = 0; i < 3; i++) {
      const dx = v[i * 2] - nx, dy = v[i * 2 + 1] - ny
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < bestD) { best = i; bestD = d }
    }
    return best
  }

  function onDown(e) {
    const [nx, ny] = toNDC(e)
    dragging.current = nearest(nx, ny)
  }

  function onMove(e) {
    if (dragging.current === null) return
    const [nx, ny] = toNDC(e)
    const v = vertsRef.current
    v[dragging.current * 2]     = Math.max(-1, Math.min(1, nx))
    v[dragging.current * 2 + 1] = Math.max(-1, Math.min(1, ny))
    setVerts([...v])
    const gl = glRef.current
    gl.bindBuffer(gl.ARRAY_BUFFER, bufRef.current)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.DYNAMIC_DRAW)
    redraw(gl)
  }

  function onUp() { dragging.current = null }

  // Convert NDC → CSS % for overlay handles
  const handles = [0, 1, 2].map(i => ({
    label: ['A', 'B', 'C'][i],
    x: ((verts[i * 2] + 1) / 2) * 100,
    y: ((1 - verts[i * 2 + 1]) / 2) * 100,
  }))

  return (
    <>
      <div style={{ position: 'relative', width: '100%' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '220px', borderRadius: '8px', display: 'block', cursor: 'crosshair' }}
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        />
        {handles.map(h => (
          <div key={h.label} style={{
            position: 'absolute',
            left: `${h.x}%`,
            top:  `${h.y}%`,
            transform: 'translate(-50%, -50%)',
            width: 20, height: 20,
            borderRadius: '50%',
            background: 'var(--color-mint)',
            border: '2px solid #0d0d0e',
            cursor: 'grab',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '8px', fontFamily: 'monospace', color: '#0d0d0e', fontWeight: 700,
            pointerEvents: 'none',
            boxShadow: '0 0 0 3px rgba(46,230,166,0.25)',
          }}>{h.label}</div>
        ))}
      </div>
      <div className="flex gap-6 font-mono text-[11px] text-muted flex-wrap">
        {handles.map(h => (
          <span key={h.label}>
            <span className="text-mint">{h.label}</span>
            {' '}({verts[handles.indexOf(h) * 2].toFixed(2)}, {verts[handles.indexOf(h) * 2 + 1].toFixed(2)})
          </span>
        ))}
      </div>
      <p className="text-[12px] font-mono text-muted">
        Drag the handles. NDC: center is (0, 0), top-right is (1, 1), bottom-left is (-1, -1).
      </p>
    </>
  )
}

// ─── Demo 3: Time uniform, animated ──────────────────────────────────────────

function AnimatedDemo() {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const speedRef  = useRef(1.0)
  const [speed, setSpeed] = useState(1.0)

  useEffect(() => {
    const canvas = canvasRef.current
    initCanvasSize(canvas)
    const gl = canvas.getContext('webgl')
    if (!gl) return
    gl.viewport(0, 0, canvas.width, canvas.height)

    // uTime drives rotation in the vertex shader
    const vsSrc = `
      attribute vec2 aPos;
      uniform float uTime;
      void main() {
        float c = cos(uTime);
        float s = sin(uTime);
        vec2 r = vec2(aPos.x * c - aPos.y * s, aPos.x * s + aPos.y * c);
        gl_Position = vec4(r * 0.65, 0.0, 1.0);
      }
    `
    // uColor is computed in JS from t and passed as a separate uniform
    const fsSrc = `
      precision mediump float;
      uniform vec3 uColor;
      void main() {
        gl_FragColor = vec4(uColor, 0.92);
      }
    `

    const prog = makeProgram(gl, vsSrc, fsSrc)
    gl.useProgram(prog)

    const verts = new Float32Array([
       0.0,  0.65,
      -0.6, -0.45,
       0.6, -0.45,
    ])
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

    const aPos    = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime  = gl.getUniformLocation(prog, 'uTime')
    const uColor = gl.getUniformLocation(prog, 'uColor')

    const ro = watchViewport(canvas, gl, null)

    let t = 0, last = performance.now()

    function loop(now) {
      t += ((now - last) / 1000) * speedRef.current
      last = now
      const r = 0.45 + 0.45 * Math.sin(t * 0.8)
      const g = 0.18 + 0.14 * Math.sin(t * 0.5 + 1.0)
      const b = 0.55 + 0.45 * Math.cos(t * 0.6)
      gl.uniform1f(uTime,  t)
      gl.uniform3f(uColor, r, g, b)
      gl.clearColor(0.05, 0.05, 0.07, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  function handleSpeed(v) {
    setSpeed(v)
    speedRef.current = v
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '220px', display: 'block', borderRadius: '8px' }}
      />
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-muted">Speed</span>
          <span className="text-violet">{speed.toFixed(1)}×</span>
        </div>
        <input
          type="range" min={0} max={4} step={0.1} value={speed}
          onChange={e => handleSpeed(parseFloat(e.target.value))}
          className="w-full h-[3px] appearance-none rounded bg-ui outline-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-violet [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>
      <p className="text-[12px] font-mono text-muted">
        uTime increments every frame. Vertex shader uses it to rotate. Fragment shader uses it for color.
      </p>
    </>
  )
}

// ─── Post ─────────────────────────────────────────────────────────────────────

export default function WebGLTrianglePost() {
  return (
    <Section size="narrow">

      <Link href="/blog" className="inline-flex items-center gap-2 text-[12px] font-mono text-muted hover:text-foreground transition-colors no-underline mb-10">
        ← All posts
      </Link>

      <header className="mb-12">
        <div className="flex items-center gap-2 text-[11px] font-mono text-muted mb-4">
          <span>April 6, 2026</span>
          <span>·</span>
          <span>8 min read</span>
        </div>
        <h1 className="text-[clamp(28px,5vw,44px)] font-bold leading-[1.15] tracking-[-0.02em] mb-5">
          Draw a Triangle: WebGL From Scratch
        </h1>
        <div className="flex flex-wrap gap-2">
          {['WebGL', 'Canvas', 'Creative Coding'].map(tag => (
            <span key={tag} className="font-mono text-[10px] px-2 py-1 rounded border border-ui bg-bg2 text-muted">
              {tag}
            </span>
          ))}
        </div>
      </header>

      <article>
        <P>
          The first time I opened the WebGL documentation I closed it almost immediately. Before you
          see a single pixel, you are creating buffers, compiling shaders, linking programs, binding
          attributes. Sixty lines of boilerplate and nothing on screen.
        </P>
        <P>
          The thing is, every one of those lines exists for a reason. WebGL is not just a fancier
          canvas. It is a completely different mental model: you are not telling the CPU what to
          draw, you are programming the GPU directly. Once that clicks, the boilerplate stops
          feeling arbitrary.
        </P>
        <P>
          This post walks through the minimum to draw a triangle. Not to get through it faster, but
          to explain what each step actually does. By the end you will have something interactive
          and a clear picture of the full pipeline.
        </P>

        <Divider />

        <H2 id="what-webgl-does">What WebGL actually does</H2>
        <P>
          Canvas 2D is a drawing API. You call <IC>fillRect</IC>, <IC>arc</IC>, <IC>drawImage</IC>
          {' '}and the browser figures out the pixels. The CPU does all the work, one call at a time.
        </P>
        <P>
          WebGL is different. You write two small programs in a language called GLSL, compile them,
          upload your geometry as raw numbers, and the GPU executes everything. The GPU runs
          thousands of tiny threads simultaneously: one per vertex, one per pixel. That parallelism
          is why WebGL can handle things canvas 2D cannot.
        </P>
        <P>
          Those two programs are called shaders. You write them once, send them to the GPU at startup,
          and from then on each draw call just points to them.
        </P>

        <Divider />

        <H2 id="vertex-shader">The vertex shader</H2>
        <P>
          The vertex shader runs once per vertex. Its only job is to output a screen position.
          That position lives in clip space: a coordinate system where the center of the canvas
          is (0, 0), the top-right is (1, 1), and the bottom-left is (-1, -1). This range is called
          NDC, Normalized Device Coordinates.
        </P>

        <Code lang="glsl">{`attribute vec2 aPos;   // one vertex position, from your buffer

void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
  //                       z     w
  //            0.0 = no depth, 1.0 = standard perspective divide
}`}</Code>

        <P>
          <IC>attribute</IC> means the value changes per vertex. The GPU feeds in one coordinate pair
          for each vertex in your buffer. <IC>gl_Position</IC> is the built-in output. The <IC>vec4</IC>{' '}
          takes (x, y, z, w): for 2D work, z is 0 and w is 1.
        </P>

        <Divider />

        <H2 id="fragment-shader">The fragment shader</H2>
        <P>
          After the vertex shader places the three corners, the GPU figures out which pixels fall
          inside the triangle. Then it runs the fragment shader once for every one of those pixels.
        </P>

        <Code lang="glsl">{`precision mediump float;   // float precision declaration, always needed
uniform vec4 uColor;       // same value for every fragment in this draw call

void main() {
  gl_FragColor = uColor;   // output this pixel's color as (r, g, b, a)
}`}</Code>

        <P>
          <IC>uniform</IC> means the value is set from JavaScript and stays the same for every
          fragment in a draw call. You set it once before drawing and the whole triangle gets
          that color. Change it and redraw and the whole triangle changes. Pick a color below
          and watch the uniform update in real time.
        </P>

        <DemoBox label="Interactive · Vertex shader + fragment shader">
          <TriangleDemo />
        </DemoBox>

        <P>
          That is the full pipeline output. A vertex shader placing three points, a fragment shader
          coloring every pixel inside them, and a uniform connecting JavaScript to GLSL.
        </P>

        <Divider />

        <H2 id="buffers">Buffers: getting data to the GPU</H2>
        <P>
          The vertex shader needs coordinates to work with. You upload them as a typed array via
          a buffer. JavaScript numbers live on the CPU. This copies them across to GPU memory.
        </P>

        <Code lang="js">{`const verts = new Float32Array([
   0.0,  0.65,   // vertex A (top center)
  -0.6, -0.45,   // vertex B (bottom left)
   0.6, -0.45,   // vertex C (bottom right)
])

const buf = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, buf)
gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)`}</Code>

        <P>
          Then you describe the layout: each attribute is 2 floats, packed tightly, starting at
          offset 0.
        </P>

        <Code lang="js">{`const aPos = gl.getAttribLocation(prog, 'aPos')
gl.enableVertexAttribArray(aPos)
gl.vertexAttribPointer(
  aPos,       // which attribute
  2,          // 2 floats per vertex (x, y)
  gl.FLOAT,   // type
  false,      // normalize? no
  0,          // stride: 0 = tightly packed
  0           // offset: start from the beginning
)`}</Code>

        <P>
          Drag the handles below to move the vertices. The coordinates shown are in NDC, so notice how
          (0, 0) is center, not top-left. That trips everyone up at first.
        </P>

        <DemoBox label="Interactive · Vertex positions in NDC">
          <VertexDemo />
        </DemoBox>

        <Callout>
          <strong>Why Float32Array?</strong> The GPU expects 32-bit floats, not JavaScript's default
          64-bit doubles. Using the wrong type is one of the most common sources of silent WebGL bugs.
          Always use <IC>Float32Array</IC> for vertex data.
        </Callout>

        <Divider />

        <H2 id="draw-call">The draw call</H2>
        <P>
          After all that setup: one line.
        </P>

        <Code lang="js">{`gl.drawArrays(gl.TRIANGLES, 0, 3)
//             ^             ^ ^
//             primitive     | vertex count
//                           start index`}</Code>

        <P>
          <IC>gl.TRIANGLES</IC> means: take vertices in groups of 3 and draw a filled triangle
          for each group. Start at index 0, use 3 vertices. The GPU runs the vertex shader 3 times,
          then the fragment shader for every pixel inside the result.
        </P>
        <P>
          Everything else (compiling shaders, linking the program, uploading the buffer) happens
          once at startup. The draw call itself is cheap. Changing a uniform and calling{' '}
          <IC>drawArrays</IC> again redraws with the new value.
        </P>

        <Divider />

        <H2 id="uniforms">Uniforms: passing data to the GPU</H2>
        <P>
          You have already seen one uniform: <IC>uColor</IC> in the first demo. The pattern always
          looks the same. Get the location once, set the value before each draw.
        </P>

        <Code lang="js">{`// At init
const uColor = gl.getUniformLocation(prog, 'uColor')

// Before each draw (or whenever the value changes)
gl.uniform4f(uColor, r, g, b, 1.0)   // 4 floats: RGBA
gl.uniform1f(uTime,  t)               // 1 float:  a number
gl.uniform2f(uRes,   w, h)            // 2 floats:  vec2`}</Code>

        <P>
          You can pass uniforms to both shaders. Pass <IC>uTime</IC> to the vertex shader and you
          can rotate, scale, or deform. Pass it to the fragment shader and you can shift colors.
          The GPU reads the same value for every vertex and every pixel in that draw call.
        </P>

        <DemoBox label="Interactive · uTime in vertex and fragment shaders">
          <AnimatedDemo />
        </DemoBox>

        <P>
          The vertex shader uses <IC>uTime</IC> to rotate each vertex around the origin. The
          fragment shader receives a separate <IC>uColor</IC> uniform, computed in JavaScript
          from the same <IC>t</IC> value using sine waves and passed via <IC>gl.uniform3f</IC>.
          The GPU gets the result; it never sees the math that produced it.
        </P>

        <Code lang="glsl">{`// Vertex shader: uTime rotates each vertex
uniform float uTime;
void main() {
  float c = cos(uTime);
  float s = sin(uTime);
  vec2 rotated = vec2(
    aPos.x * c - aPos.y * s,
    aPos.x * s + aPos.y * c
  );
  gl_Position = vec4(rotated * 0.65, 0.0, 1.0);
}

// Fragment shader: uColor is computed in JS and passed each frame
uniform vec3 uColor;
void main() {
  gl_FragColor = vec4(uColor, 0.92);
}`}</Code>

        <Divider />

        <H2 id="putting-it-together">The full picture</H2>
        <P>
          The complete setup is about 50 lines, but the structure is always the same:
        </P>

        <ul className="list-none flex flex-col gap-4 mb-8 pl-0">
          {[
            ['Write shaders', 'Two GLSL strings: one vertex, one fragment. Compile and link them into a program.'],
            ['Upload geometry', 'Float32Array into a buffer. Describe the layout to the vertex attribute.'],
            ['Set uniforms', 'Any values the shader needs that do not change per vertex: colors, time, resolution, matrices.'],
            ['Draw', 'gl.clear() then gl.drawArrays(). That is the whole render step.'],
            ['Animate', 'Update your uniforms, call drawArrays again. Everything else persists between frames.'],
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
          Most of what WebGL does beyond the triangle is a variation of this. More triangles share
          a bigger buffer. Textures are uniforms of type <IC>sampler2D</IC>. Transformations are
          <IC>uniform mat4</IC> matrices. The fragment shader gets more complex. But the pipeline
          stays the same: shaders, buffer, uniforms, draw.
        </Callout>

        <P>
          A natural next step is drawing a quad: two triangles that share an edge, forming a
          rectangle. From there it is a short walk to mapping a texture onto it, which is how
          image processing shaders work. If you want to skip ahead,{' '}
          <Link href="/experiments/depth-frames" className="text-violet hover:underline">
            Depth Frames
          </Link>{' '}
          is a canvas 2D experiment that fakes the same depth-layering effect without shaders,
          which makes for an interesting comparison once you know how the GPU version would work.
        </P>

      </article>

    </Section>
  )
}
