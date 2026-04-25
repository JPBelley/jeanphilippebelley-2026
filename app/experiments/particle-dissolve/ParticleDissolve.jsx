'use client'

import { useEffect, useRef } from 'react'
import ExperimentLayout from '../../components/layouts/ExperimentLayout'

// ─── Particle count ───────────────────────────────────────────────────────────
const N = 80_000

// ─── Vertex shader ────────────────────────────────────────────────────────────
// Works in "square space" (equal x/y units) then projects to NDC at the end.
// Each particle has a base position sampled uniformly inside a disk.
// Particles in the lower half of the disk are displaced downward + scattered.
const VS = `
attribute float aTheta; // angle in the disk [0, 2π]
attribute float aRho;   // radius [0, 1]
attribute float aSeed;  // per-particle random

uniform float uTime;
uniform float uAspect;  // canvas width / height
uniform vec2  uMouse;   // NDC mouse position

const float SPHERE_R = 0.38;
const float CENTER_Y = 0.22;

void main() {
  // Base disk position (square space)
  float pulse = 1.0 + sin(uTime * 0.55) * 0.012;
  float bx = aRho * SPHERE_R * pulse * cos(aTheta);
  float by = aRho * SPHERE_R * pulse * sin(aTheta) + CENTER_Y;

  // "Bottomness": 0 for upper half, rises toward bottom edge
  float bottomFactor = max(0.0, -sin(aTheta)) * aRho;

  // Drift amounts
  float breathe  = sin(uTime * 0.35 + aSeed * 1.57) * 0.08 + 1.0;
  float hScatter = pow(bottomFactor, 1.5) * 0.48 * breathe;
  float vDrift   = pow(bottomFactor, 2.1) * 0.82;

  // Per-particle noise
  float s = aSeed * 6.2832;
  float t = uTime * 0.45;
  float nx = sin(s * 5.17 + t * 1.3) * hScatter
           + cos(s * 2.94 + t * 0.7) * hScatter * 0.45;
  float ny = cos(s * 7.63 + t * 0.9) * hScatter * 0.3;

  vec2 pos = vec2(bx + nx, by - vDrift + ny);

  // Mouse repulsion (distance computed in square space)
  vec2 posS   = vec2(pos.x * uAspect, pos.y);
  vec2 mouseS = vec2(uMouse.x * uAspect, uMouse.y);
  vec2 delta  = posS - mouseS;
  float md    = length(delta);
  float repulse = smoothstep(0.24, 0.0, md) * 0.2;
  if (md > 0.001) posS += (delta / md) * repulse;
  pos = vec2(posS.x / uAspect, posS.y);

  // NDC output — divide x by aspect to keep circle round
  gl_Position  = vec4(pos.x / uAspect, pos.y, 0.0, 1.0);

  // Point size: larger in dense sphere, fades in the drip
  gl_PointSize = mix(2.3, 0.7, pow(bottomFactor, 0.55));
}
`

// ─── Fragment shader ──────────────────────────────────────────────────────────
const FS = `
precision mediump float;

void main() {
  vec2 coord = gl_PointCoord - 0.5;
  float r = length(coord) * 2.0;
  if (r > 1.0) discard;
  float a = (1.0 - smoothstep(0.3, 1.0, r)) * 0.88;
  gl_FragColor = vec4(0.90, 0.06, 0.38, a);
}
`

// ─── Helpers ──────────────────────────────────────────────────────────────────
function compileShader(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  return sh
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ParticleDissolve() {
  const canvasRef = useRef(null)
  const mouseRef  = useRef([0, 99]) // off-screen default

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) return

    // ── Resize ──
    const resize = () => {
      canvas.width  = canvas.clientWidth
      canvas.height = canvas.clientHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // ── Program ──
    const prog = gl.createProgram()
    gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER,   VS))
    gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FS))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    // ── Particle buffer — interleaved [theta, rho, seed] ──
    const data = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      data[i * 3 + 0] = Math.random() * Math.PI * 2 // theta
      data[i * 3 + 1] = Math.sqrt(Math.random())    // rho — sqrt for uniform disk
      data[i * 3 + 2] = Math.random()               // seed
    }
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

    const STRIDE = 3 * 4
    ;[['aTheta', 0], ['aRho', 4], ['aSeed', 8]].forEach(([name, offset]) => {
      const loc = gl.getAttribLocation(prog, name)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, STRIDE, offset)
    })

    // ── Uniforms ──
    const uTime   = gl.getUniformLocation(prog, 'uTime')
    const uAspect = gl.getUniformLocation(prog, 'uAspect')
    const uMouse  = gl.getUniformLocation(prog, 'uMouse')

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // ── Render loop ──
    let t = 0, last = performance.now(), raf

    function loop(now) {
      t   += (now - last) / 1000
      last = now

      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.uniform1f(uTime,   t)
      gl.uniform1f(uAspect, canvas.width / canvas.height)
      gl.uniform2fv(uMouse, mouseRef.current)

      gl.drawArrays(gl.POINTS, 0, N)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    // ── Mouse ──
    const onMove = e => {
      const r = canvas.getBoundingClientRect()
      mouseRef.current = [
        ((e.clientX - r.left)  / r.width)  *  2 - 1,
        ((e.clientY - r.top)   / r.height) * -2 + 1,
      ]
    }
    const onLeave = () => { mouseRef.current = [0, 99] }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <ExperimentLayout
      label="experiments"
      title="Particle Dissolve"
      description="80,000 WebGL points form a solid disk that drips and disperses below. Move your cursor over the field to disturb the particles."
    >
      <div
        style={{
          maxWidth:     520,
          margin:       '0 auto',
          aspectRatio:  '3 / 4',
          position:     'relative',
          background:   '#000',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'crosshair', display: 'block' }}
        />
      </div>
    </ExperimentLayout>
  )
}
