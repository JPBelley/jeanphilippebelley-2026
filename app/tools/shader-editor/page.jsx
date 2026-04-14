'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ExperimentLayout from '../../components/layouts/ExperimentLayout'

// ─── Default shaders ──────────────────────────────────────────────────────────

const DEFAULT_VS = `attribute vec2 aPos;
varying vec2 vUv;

void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const DEFAULT_FS = `precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uResolution;

void main() {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 p = (vUv * 2.0 - 1.0) * aspect;

  float dist = length(p);
  float ripple = sin(dist * 8.0 - uTime * 3.0) * 0.5 + 0.5;
  float fade = 1.0 - smoothstep(0.0, 1.2, dist);

  vec3 violet = vec3(0.49, 0.36, 1.00);
  vec3 mint   = vec3(0.18, 0.90, 0.65);
  vec3 col = mix(
    vec3(0.05, 0.05, 0.07),
    mix(violet, mint, ripple),
    ripple * fade
  );

  gl_FragColor = vec4(col, 1.0);
}`

// ─── Presets ──────────────────────────────────────────────────────────────────

const PRESETS = [
  {
    name: 'Ripple',
    vs: DEFAULT_VS,
    fs: DEFAULT_FS,
  },
  {
    name: 'UV gradient',
    vs: DEFAULT_VS,
    fs: `precision mediump float;
varying vec2 vUv;
uniform float uTime;

void main() {
  float shift = sin(uTime * 0.5) * 0.15;
  gl_FragColor = vec4(vUv.x + shift, vUv.y, 0.5, 1.0);
}`,
  },
  {
    name: 'SDF ring',
    vs: DEFAULT_VS,
    fs: `precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uResolution;

void main() {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 p = (vUv * 2.0 - 1.0) * aspect;

  float radius = 0.5 + sin(uTime * 0.8) * 0.1;
  float dist   = length(p);
  float ring   = smoothstep(radius + 0.015, radius, dist)
               - smoothstep(radius * 0.55, radius * 0.55 - 0.015, dist);
  float glow   = smoothstep(radius + 0.3, radius, dist) * 0.3;

  vec3 violet = vec3(0.49, 0.36, 1.00);
  vec3 mint   = vec3(0.18, 0.90, 0.65);
  vec3 bg     = vec3(0.05, 0.05, 0.07);

  vec3 col = bg + violet * glow;
  col = mix(col, mix(violet, mint, dist / radius), ring);

  gl_FragColor = vec4(col, 1.0);
}`,
  },
  {
    name: 'Grid pulse',
    vs: DEFAULT_VS,
    fs: `precision mediump float;
varying vec2 vUv;
uniform float uTime;

void main() {
  vec2 uv = vUv * 12.0;
  vec2 grid = fract(uv);
  float line = step(0.92, max(grid.x, grid.y));

  vec2 cell = floor(uv);
  float d = length(cell - 6.0);
  float pulse = sin(d * 0.8 - uTime * 2.5) * 0.5 + 0.5;

  vec3 violet = vec3(0.49, 0.36, 1.00);
  vec3 mint   = vec3(0.18, 0.90, 0.65);
  vec3 bg     = vec3(0.05, 0.05, 0.07);

  vec3 col = mix(bg, mix(violet, mint, pulse) * line, line);
  gl_FragColor = vec4(col, 1.0);
}`,
  },
  {
    name: 'Polar swirl',
    vs: DEFAULT_VS,
    fs: `precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uResolution;

void main() {
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 p = (vUv * 2.0 - 1.0) * aspect;

  float angle  = atan(p.y, p.x);
  float radius = length(p);

  float swirl  = angle + radius * 3.0 - uTime;
  float bands  = sin(swirl * 4.0) * 0.5 + 0.5;
  float fade   = 1.0 - smoothstep(0.2, 1.2, radius);

  vec3 violet = vec3(0.49, 0.36, 1.00);
  vec3 mint   = vec3(0.18, 0.90, 0.65);
  vec3 bg     = vec3(0.05, 0.05, 0.07);

  gl_FragColor = vec4(mix(bg, mix(violet, mint, bands), fade), 1.0);
}`,
  },
]

// ─── Quad buffer layout ───────────────────────────────────────────────────────
// Interleaved: [x, y, r, g, b] — 5 floats × 4 bytes per vertex
const QUAD_STRIDE  = 5 * 4
const QUAD_POS_OFF = 0          // aPos:   2 floats at byte 0
const QUAD_COL_OFF = 2 * 4      // aColor: 3 floats at byte 8

// ─── WebGL helpers ────────────────────────────────────────────────────────────

function tryCompile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh)
    gl.deleteShader(sh)
    return { shader: null, error: log }
  }
  return { shader: sh, error: null }
}

function tryLink(gl, vs, fs) {
  const prog = gl.createProgram()
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog)
    gl.deleteProgram(prog)
    return { prog: null, error: log }
  }
  return { prog, error: null }
}

// ─── Editor textarea ──────────────────────────────────────────────────────────

function Editor({ label, value, onChange, hasError }) {
  const taRef = useRef(null)

  // Tab key inserts 2 spaces
  function onKeyDown(e) {
    if (e.key !== 'Tab') return
    e.preventDefault()
    const ta  = taRef.current
    const s   = ta.selectionStart
    const end = ta.selectionEnd
    const next = value.slice(0, s) + '  ' + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = s + 2
    })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        className="flex items-center justify-between px-4 py-2 border-b shrink-0"
        style={{ borderColor: hasError ? 'rgba(255,80,80,0.4)' : 'var(--color-ui)' }}
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</span>
        {hasError && (
          <span className="font-mono text-[10px] text-red-400 tracking-wider">error</span>
        )}
      </div>
      <textarea
        ref={taRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        className="flex-1 resize-none font-mono text-[12px] leading-[1.7] outline-none p-4 bg-transparent text-foreground min-h-0"
        style={{
          caretColor: 'var(--color-violet)',
          tabSize: 2,
        }}
      />
    </div>
  )
}

// ─── Main tool ────────────────────────────────────────────────────────────────

export default function ShaderEditor() {
  const canvasRef    = useRef(null)
  const glRef        = useRef(null)
  const progRef      = useRef(null)
  const rafRef       = useRef(null)
  const compileTimer = useRef(null)

  const [vs,         setVs]         = useState(PRESETS[0].vs)
  const [fs,         setFs]         = useState(PRESETS[0].fs)
  const [errors,     setErrors]     = useState({ vs: null, fs: null, link: null })
  const [status,     setStatus]     = useState('ok')  // 'ok' | 'error' | 'compiling'
  const [activePane, setActivePane] = useState('fs')   // which editor is focused on mobile

  // ── Init WebGL once ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width  = canvas.clientWidth
    canvas.height = canvas.clientHeight

    const gl = canvas.getContext('webgl')
    if (!gl) return
    glRef.current = gl
    gl.viewport(0, 0, canvas.width, canvas.height)

    // Full-screen quad — interleaved [x, y, r, g, b] per vertex
    // Corner colors: BL=red, BR=green, TR=blue, TL=yellow
    const verts = new Float32Array([
      -1,-1,  1.0,0.0,0.0,   // BL red
       1,-1,  0.0,1.0,0.0,   // BR green
       1, 1,  0.0,0.0,1.0,   // TR blue
      -1,-1,  1.0,0.0,0.0,   // BL red
       1, 1,  0.0,0.0,1.0,   // TR blue
      -1, 1,  1.0,1.0,0.0,   // TL yellow
    ])
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.clientWidth
      canvas.height = canvas.clientHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    })
    ro.observe(canvas)

    // Initial compile
    compile(vs, fs, gl)

    // Render loop
    let t = 0, last = performance.now()
    function loop(now) {
      t += (now - last) / 1000
      last = now
      const prog = progRef.current
      if (prog && gl) {
        const uTime = gl.getUniformLocation(prog, 'uTime')
        const uRes  = gl.getUniformLocation(prog, 'uResolution')
        if (uTime) gl.uniform1f(uTime, t)
        if (uRes)  gl.uniform2f(uRes, canvas.width, canvas.height)
        gl.clearColor(0.05, 0.05, 0.07, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Compile shaders ──────────────────────────────────────────────────────────
  const compile = useCallback((vsSrc, fsSrc, glInstance) => {
    const gl = glInstance ?? glRef.current
    if (!gl) return

    const vsResult = tryCompile(gl, gl.VERTEX_SHADER,   vsSrc)
    const fsResult = tryCompile(gl, gl.FRAGMENT_SHADER, fsSrc)

    const newErrors = {
      vs:   vsResult.error,
      fs:   fsResult.error,
      link: null,
    }

    if (vsResult.error || fsResult.error) {
      setErrors(newErrors)
      setStatus('error')
      return
    }

    const { prog, error: linkErr } = tryLink(gl, vsResult.shader, fsResult.shader)

    if (linkErr) {
      setErrors({ ...newErrors, link: linkErr })
      setStatus('error')
      return
    }

    // Success — swap program, bind quad attributes
    if (progRef.current) gl.deleteProgram(progRef.current)
    progRef.current = prog
    gl.useProgram(prog)

    const aPos = gl.getAttribLocation(prog, 'aPos')
    if (aPos >= 0) {
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, QUAD_STRIDE, QUAD_POS_OFF)
    }

    const aColor = gl.getAttribLocation(prog, 'aColor')
    if (aColor >= 0) {
      gl.enableVertexAttribArray(aColor)
      gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, QUAD_STRIDE, QUAD_COL_OFF)
    }

    setErrors({ vs: null, fs: null, link: null })
    setStatus('ok')
  }, [])

  // ── Debounced recompile on edit ───────────────────────────────────────────────
  function scheduleCompile(nextVs, nextFs) {
    setStatus('compiling')
    clearTimeout(compileTimer.current)
    compileTimer.current = setTimeout(() => compile(nextVs, nextFs), 600)
  }

  function handleVsChange(val) {
    setVs(val)
    scheduleCompile(val, fs)
  }
  function handleFsChange(val) {
    setFs(val)
    scheduleCompile(vs, val)
  }

  // ── Load preset ───────────────────────────────────────────────────────────────
  function loadPreset(preset) {
    setVs(preset.vs)
    setFs(preset.fs)
    clearTimeout(compileTimer.current)
    compile(preset.vs, preset.fs)
  }

  // ── Error summary ─────────────────────────────────────────────────────────────
  const errorText = [
    errors.vs   ? `[vertex]   ${errors.vs.trim()}`   : null,
    errors.fs   ? `[fragment] ${errors.fs.trim()}`   : null,
    errors.link ? `[link]     ${errors.link.trim()}`  : null,
  ].filter(Boolean).join('\n')

  const hasError = status === 'error'

  return (
    <ExperimentLayout
      label="tools"
      title="Shader Editor"
      description="Write vertex and fragment shaders and see the result in real time. uTime and uResolution are injected automatically."
    >
      {/* Preset bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="font-mono text-[10px] text-muted uppercase tracking-widest mr-1">Presets</span>
        {PRESETS.map(p => (
          <button
            key={p.name}
            onClick={() => loadPreset(p)}
            className="font-mono text-[11px] px-3 py-1.5 rounded border border-ui text-muted hover:border-violet hover:text-violet transition-colors duration-150"
          >
            {p.name}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-200"
            style={{
              background: hasError
                ? '#f05050'
                : status === 'compiling'
                ? 'var(--color-muted)'
                : 'var(--color-mint)',
            }}
          />
          <span className="font-mono text-[10px] text-muted">
            {hasError ? 'error' : status === 'compiling' ? 'compiling…' : 'ok'}
          </span>
        </div>
      </div>

      {/* Mobile pane switcher */}
      <div className="flex gap-0 mb-0 lg:hidden border border-ui rounded-t-lg overflow-hidden">
        {['vs', 'fs', 'canvas'].map(pane => (
          <button
            key={pane}
            onClick={() => setActivePane(pane)}
            className={`flex-1 font-mono text-[10px] uppercase tracking-widest py-2 transition-colors duration-150 ${
              activePane === pane
                ? 'bg-[rgba(124,92,255,0.12)] text-violet border-b border-violet'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {pane === 'vs' ? 'vertex' : pane === 'fs' ? 'fragment' : 'output'}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div
        className="flex border border-ui rounded-b-xl lg:rounded-xl overflow-hidden"
        style={{ height: 'clamp(520px, 70vh, 860px)' }}
      >
        {/* Left: editors — hidden on mobile when canvas pane is active */}
        <div
          className={`flex-col border-r border-ui flex-1 lg:flex-none lg:w-[45%] ${activePane === 'canvas' ? 'hidden lg:flex' : 'flex'}`}
        >
          {/* Vertex editor — hidden on mobile when fs pane is active */}
          <div
            className={`flex-col border-b border-ui ${activePane === 'fs' ? 'hidden lg:flex' : 'flex'}`}
            style={{ flex: 1, minHeight: 0 }}
          >
            <Editor
              label="Vertex shader"
              value={vs}
              onChange={handleVsChange}
              hasError={!!errors.vs}
            />
          </div>

          {/* Fragment editor — hidden on mobile when vs pane is active */}
          <div
            className={`flex-col ${activePane === 'vs' ? 'hidden lg:flex' : 'flex'}`}
            style={{ flex: 1, minHeight: 0 }}
          >
            <Editor
              label="Fragment shader"
              value={fs}
              onChange={handleFsChange}
              hasError={!!errors.fs}
            />
          </div>
        </div>

        {/* Right: canvas + error console — hidden on mobile when an editor pane is active */}
        <div
          className={`flex-col flex-1 ${activePane === 'canvas' ? 'flex' : 'hidden lg:flex'}`}
          style={{ minWidth: 0 }}
        >
          <canvas
            ref={canvasRef}
            className="block"
            style={{ width: '100%', flex: 1, minHeight: 0 }}
          />

          {/* Error console */}
          {hasError && (
            <div
              className="border-t shrink-0 overflow-auto"
              style={{
                borderColor: 'rgba(255,80,80,0.25)',
                background: 'rgba(255,40,40,0.04)',
                maxHeight: 140,
              }}
            >
              <pre
                className="font-mono text-[11px] leading-[1.6] p-4 m-0 whitespace-pre-wrap"
                style={{ color: '#f08080' }}
              >
                {errorText}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Uniforms reference */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
        {[
          ['uTime',       'float', 'seconds elapsed'],
          ['uResolution', 'vec2',  'canvas size in pixels'],
          ['aColor',      'vec3',  'per-vertex color — BL=red, BR=green, TR=blue, TL=yellow'],
          ['vUv',         'vec2',  'UV coordinate 0..1 (from default vertex shader)'],
        ].map(([name, type, desc]) => (
          <div key={name} className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-violet">{name}</span>
            <span className="text-muted">{type}</span>
            <span style={{ color: 'rgba(232,234,240,0.35)' }}>{desc}</span>
          </div>
        ))}
      </div>
    </ExperimentLayout>
  )
}
