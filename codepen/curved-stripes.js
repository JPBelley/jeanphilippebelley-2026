/* ═══════════════════════════════════════════════════════════════════════════════
   CURVED STRIPES — jeanphilippebelley.com
   ───────────────────────────────────────────────────────────────────────────────
   Two sets of concentric rounded rectangles from opposite off-canvas corners
   weave across a warm beige field in a mid-century rainbow palette.
   Move your mouse to push and bulge the surface.

   HTML — paste in the HTML pane:
   ───────────────────────────────────────────────────────────────────────────────

   <canvas id="c"></canvas>

   <a href="https://jeanphilippebelley.com/" target="_blank" id="credit">
     JP<span>.</span>
   </a>

   ───────────────────────────────────────────────────────────────────────────────
   CSS — paste in the CSS pane:
   ───────────────────────────────────────────────────────────────────────────────

   * { margin: 0; padding: 0; box-sizing: border-box; }
   body { background: #0e0e12; overflow: hidden; }
   canvas { display: block; width: 100vw; height: 100vh; }
   #credit {
     position: fixed;
     bottom: 20px; right: 24px;
     font-family: 'Space Grotesk', sans-serif;
     font-size: 13px;
     font-weight: 700;
     letter-spacing: 0.06em;
     color: rgba(255,255,255,0.18);
     text-decoration: none;
   }
   #credit span { color: rgba(255,255,255,0.45); }
   #credit:hover { color: rgba(255,255,255,0.55); }

   ───────────────────────────────────────────────────────────────────────────────
   Description:
   Two sets of concentric rounded rectangles from opposite corners overlap and
   weave across a warm canvas in a vintage mid-century palette — teal, navy,
   magenta, brick red, burnt orange and gold. Hover to push and warp the field
   with a smooth WebGL displacement effect.

   Tags: webgl, generative, abstract, vintage, stripes
   ═══════════════════════════════════════════════════════════════════════════════ */

// ─── WebGL boilerplate ────────────────────────────────────────────────────────
const canvas = document.getElementById('c')
const gl     = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform float u_mouse_active;

// ── Rounded-box SDF ──────────────────────────────────────────────────────────
float sdRBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// ── Vintage 10-color palette ─────────────────────────────────────────────────
vec3 pal(float i) {
  float t = mod(i, 10.0);
  if (t < 0.5)  return vec3(0.82, 0.75, 0.63); // warm beige
  if (t < 1.5)  return vec3(0.36, 0.72, 0.68); // teal
  if (t < 2.5)  return vec3(0.42, 0.54, 0.76); // steel blue
  if (t < 3.5)  return vec3(0.10, 0.15, 0.27); // navy
  if (t < 4.5)  return vec3(0.54, 0.10, 0.29); // deep magenta
  if (t < 5.5)  return vec3(0.75, 0.22, 0.15); // brick red
  if (t < 6.5)  return vec3(0.83, 0.41, 0.16); // burnt orange
  if (t < 7.5)  return vec3(0.79, 0.63, 0.19); // golden
  if (t < 8.5)  return vec3(0.42, 0.66, 0.64); // pale teal
  return             vec3(0.88, 0.47, 0.21);    // warm orange
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float aspect = u_res.x / u_res.y;

  // ── Mouse bulge displacement ─────────────────────────────────────────────
  vec2 m     = vec2(u_mouse.x / u_res.x, 1.0 - u_mouse.y / u_res.y);
  vec2 d     = uv - m;
  vec2 dA    = d * vec2(aspect, 1.0);       // aspect-corrected distance
  float dist = length(dA);
  float R    = 0.22;
  float f    = smoothstep(R, 0.0, dist);    // smooth falloff, no hard ring
  uv        -= normalize(dA) / vec2(aspect, 1.0) * f * f * 0.09 * u_mouse_active;

  // ── Aspect-correct coordinate space ─────────────────────────────────────
  // Zoom out by scaling p down (0.72 = zoomed out ~28%)
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) / 0.72;

  // Two focal points: top-right and bottom-left corners (off-screen)
  vec2 s1 = vec2( aspect * 0.72, -0.72);
  vec2 s2 = vec2(-aspect * 0.72,  0.72);

  vec3 col = vec3(0.82, 0.75, 0.63); // background beige

  // Draw 22 layers back-to-front; alternate which source wins at overlaps
  for (int i = 21; i >= 0; i--) {
    float fi  = float(i);
    float sz  = 0.14 * (fi + 1.5);
    float rad = sz * 0.30;
    // Slow organic breathing
    float b   = 1.0 + sin(u_time * 0.55 + fi * 0.22) * 0.007;

    vec2  hb = vec2(sz * b * 0.5);
    float rb = rad * b;

    float d1 = sdRBox(p - s1, hb, rb);
    float d2 = sdRBox(p - s2, hb, rb);

    // Alternate z-order each layer so both sources weave through each other
    if (mod(fi, 2.0) < 1.0) {
      // Even layer: s1 on top
      if (d2 < 0.0) col = pal(fi + 5.0);
      if (d1 < 0.0) col = pal(fi);
    } else {
      // Odd layer: s2 on top
      if (d1 < 0.0) col = pal(fi);
      if (d2 < 0.0) col = pal(fi + 5.0);
    }
  }

  gl_FragColor = vec4(col, 1.0);
}
`

// ─── Shader compilation ───────────────────────────────────────────────────────
function compile(type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return s
}

const prog = gl.createProgram()
gl.attachShader(prog, compile(gl.VERTEX_SHADER,   VERT))
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
gl.linkProgram(prog)
gl.useProgram(prog)

// Full-screen quad
const buf = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, buf)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1,-1,  1,-1,  -1,1,
  -1, 1,  1,-1,   1,1,
]), gl.STATIC_DRAW)

const aPos = gl.getAttribLocation(prog, 'a_pos')
gl.enableVertexAttribArray(aPos)
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

const uRes    = gl.getUniformLocation(prog, 'u_res')
const uTime   = gl.getUniformLocation(prog, 'u_time')
const uMouse  = gl.getUniformLocation(prog, 'u_mouse')
const uMouseA = gl.getUniformLocation(prog, 'u_mouse_active')

// ─── Resize ───────────────────────────────────────────────────────────────────
function resize() {
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight
  gl.viewport(0, 0, canvas.width, canvas.height)
}
window.addEventListener('resize', resize)
resize()

// ─── Mouse ────────────────────────────────────────────────────────────────────
let mouse  = { x: 0, y: 0, active: 0 }
let target = { x: 0, y: 0, active: 0 }

canvas.addEventListener('mousemove', e => {
  target.x = e.clientX
  target.y = e.clientY
  target.active = 1
})
canvas.addEventListener('mouseleave', () => { target.active = 0 })

// ─── Render loop ──────────────────────────────────────────────────────────────
function loop(t) {
  // Smooth mouse lerp
  mouse.x      += (target.x - mouse.x)      * 0.1
  mouse.y      += (target.y - mouse.y)      * 0.1
  mouse.active += (target.active - mouse.active) * 0.08

  gl.uniform2f(uRes,   canvas.width, canvas.height)
  gl.uniform1f(uTime,  t * 0.001)
  gl.uniform2f(uMouse, mouse.x, mouse.y)
  gl.uniform1f(uMouseA, mouse.active)
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)

/* ─── Ideas to improve ────────────────────────────────────────────────────────
   1. Click ripples — on click, spawn a wave (expanding circle) that pushes
      the stripes outward and fades, using a uniform array of ripple positions.

   2. Shifting focal points — on mousemove, slowly nudge s1 and s2 toward the
      cursor, making the whole composition breathe and follow you.

   3. Hue cycling — add a u_hue_offset uniform that slowly increments, rotating
      the entire palette over time for an ever-changing rainbow drift.

   4. Third source — add a third off-canvas point that activates on click,
      creating a temporary third set of rings that fades in and out.

   5. Scroll to zoom — use wheel events to scale the layer step size,
      letting the viewer zoom in/out of the stripe density.
   ─────────────────────────────────────────────────────────────────────────── */
