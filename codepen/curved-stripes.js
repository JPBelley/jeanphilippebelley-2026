/* ═══════════════════════════════════════════════════════════════════════════════
   CURVED STRIPES — jeanphilippebelley.com
   ───────────────────────────────────────────────────────────────────────────────
   Two sets of concentric rounded rectangles from opposite off-canvas corners
   weave across a warm beige field in a mid-century rainbow palette.
   Move your mouse to push and bulge the surface. Click to send ripples.

   HTML — paste in the HTML pane:
   ───────────────────────────────────────────────────────────────────────────────

   <canvas id="c"></canvas>

   <a href="https://jeanphilippebelley.com/" target="_blank" id="credit">
     JP<span>.</span>
   </a>

   <p id="hint">hover to push &nbsp;·&nbsp; click to ripple</p>

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
   #hint {
     position: fixed;
     bottom: 20px; left: 50%; transform: translateX(-50%);
     font-family: 'Space Grotesk', sans-serif;
     font-size: 12px;
     font-weight: 500;
     letter-spacing: 0.12em;
     text-transform: uppercase;
     color: rgba(255,255,255,0.22);
     pointer-events: none;
     animation: hint-fade 3s ease 1.2s forwards;
     opacity: 0;
   }
   @keyframes hint-fade {
     0%   { opacity: 0; }
     20%  { opacity: 1; }
     70%  { opacity: 1; }
     100% { opacity: 0; }
   }

   ───────────────────────────────────────────────────────────────────────────────
   Description:
   Two sets of concentric rounded rectangles from opposite corners overlap and
   weave across a warm canvas in a vintage mid-century palette — teal, navy,
   magenta, brick red, burnt orange and gold. Hover to push and warp the field,
   click to send expanding ripples through the stripes.

   Tags: webgl, generative, abstract, vintage, stripes
   ═══════════════════════════════════════════════════════════════════════════════ */

// ─── WebGL boilerplate ────────────────────────────────────────────────────────
const canvas = document.getElementById('c')
const gl     = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

const MAX_RIPPLES = 6

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
// Ripple uniforms
uniform vec2  u_rpos[${MAX_RIPPLES}];   // screen-space origin (pixels)
uniform float u_rage[${MAX_RIPPLES}];   // age in seconds (0 = just spawned)
uniform float u_ralive[${MAX_RIPPLES}]; // 1 if active

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
  vec2 uv      = gl_FragCoord.xy / u_res.xy;
  float aspect = u_res.x / u_res.y;

  // ── Mouse bulge displacement ─────────────────────────────────────────────
  vec2  m    = vec2(u_mouse.x / u_res.x, 1.0 - u_mouse.y / u_res.y);
  vec2  d    = uv - m;
  vec2  dA   = d * vec2(aspect, 1.0);
  float dist = length(dA);
  float R    = 0.22;
  float f    = smoothstep(R, 0.0, dist);
  uv        -= normalize(dA) / vec2(aspect, 1.0) * f * f * 0.09 * u_mouse_active;

  // ── Click ripples ────────────────────────────────────────────────────────
  float SPEED    = 0.55;  // UV units per second
  float LIFETIME = 1.6;   // seconds until a ripple fully fades
  float WIDTH    = 0.025; // ring thickness (UV)
  float STRENGTH = 0.06;  // max displacement amount

  for (int k = 0; k < ${MAX_RIPPLES}; k++) {
    if (u_ralive[k] < 0.5) continue;

    float age    = u_rage[k];
    float fade   = 1.0 - smoothstep(LIFETIME * 0.5, LIFETIME, age);
    float radius = age * SPEED;

    // Ripple origin in UV space (y-flip)
    vec2 rUV = vec2(u_rpos[k].x / u_res.x, 1.0 - u_rpos[k].y / u_res.y);
    vec2 rd  = uv - rUV;
    vec2 rdA = rd * vec2(aspect, 1.0); // aspect-correct for distance
    float rdist = length(rdA);

    if (rdist < 0.001) continue;

    // Gaussian ring: peaks at the wavefront
    float ring = exp(-pow((rdist - radius) / WIDTH, 2.0));
    float push = ring * STRENGTH * fade;

    uv += normalize(rdA) / vec2(aspect, 1.0) * push;
  }

  // ── Aspect-correct coordinate space ─────────────────────────────────────
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) / 0.72;

  // Two focal points: top-right and bottom-left corners
  vec2 s1 = vec2( aspect * 0.72, -0.72);
  vec2 s2 = vec2(-aspect * 0.72,  0.72);

  vec3 col = vec3(0.82, 0.75, 0.63);

  for (int i = 21; i >= 0; i--) {
    float fi  = float(i);
    float sz  = 0.14 * (fi + 1.5);
    float rad = sz * 0.30;
    float b   = 1.0 + sin(u_time * 0.55 + fi * 0.22) * 0.007;

    vec2  hb = vec2(sz * b * 0.5);
    float rb = rad * b;

    float d1 = sdRBox(p - s1, hb, rb);
    float d2 = sdRBox(p - s2, hb, rb);

    if (mod(fi, 2.0) < 1.0) {
      if (d2 < 0.0) col = pal(fi + 5.0);
      if (d1 < 0.0) col = pal(fi);
    } else {
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
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    console.error(gl.getShaderInfoLog(s))
  return s
}

const prog = gl.createProgram()
gl.attachShader(prog, compile(gl.VERTEX_SHADER,   VERT))
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
gl.linkProgram(prog)
if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
  console.error(gl.getProgramInfoLog(prog))
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

// Ripple uniform locations
const uRPos   = Array.from({ length: MAX_RIPPLES }, (_, k) => gl.getUniformLocation(prog, `u_rpos[${k}]`))
const uRAge   = Array.from({ length: MAX_RIPPLES }, (_, k) => gl.getUniformLocation(prog, `u_rage[${k}]`))
const uRAlive = Array.from({ length: MAX_RIPPLES }, (_, k) => gl.getUniformLocation(prog, `u_ralive[${k}]`))

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

// ─── Ripples ─────────────────────────────────────────────────────────────────
const RIPPLE_LIFETIME = 1.6 // must match GLSL LIFETIME

const ripples = Array.from({ length: MAX_RIPPLES }, () => ({
  x: 0, y: 0, spawnedAt: -9999, alive: false
}))

let nextSlot = 0

canvas.addEventListener('click', e => {
  const r = ripples[nextSlot]
  r.x        = e.clientX
  r.y        = e.clientY
  r.spawnedAt = performance.now() * 0.001
  r.alive    = true
  nextSlot   = (nextSlot + 1) % MAX_RIPPLES
})

// ─── Render loop ──────────────────────────────────────────────────────────────
function loop(ts) {
  const t = ts * 0.001

  // Smooth mouse lerp
  mouse.x      += (target.x - mouse.x)      * 0.1
  mouse.y      += (target.y - mouse.y)      * 0.1
  mouse.active += (target.active - mouse.active) * 0.08

  // Update and upload ripples
  ripples.forEach((r, k) => {
    const age = t - r.spawnedAt
    if (age > RIPPLE_LIFETIME) r.alive = false

    gl.uniform2f(uRPos[k],   r.x, r.y)
    gl.uniform1f(uRAge[k],   r.alive ? age : 0.0)
    gl.uniform1f(uRAlive[k], r.alive ? 1.0 : 0.0)
  })

  gl.uniform2f(uRes,    canvas.width, canvas.height)
  gl.uniform1f(uTime,   t)
  gl.uniform2f(uMouse,  mouse.x, mouse.y)
  gl.uniform1f(uMouseA, mouse.active)
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)

/* ─── Ideas to improve ────────────────────────────────────────────────────────
   1. ✓ Click ripples — expanding wave that pushes stripes outward and fades.

   2. Shifting focal points — on mousemove, slowly nudge s1 and s2 toward the
      cursor, making the whole composition breathe and follow you.

   3. Hue cycling — add a u_hue_offset uniform that slowly increments, rotating
      the entire palette over time for an ever-changing rainbow drift.

   4. Third source — add a third off-canvas point that activates on click,
      creating a temporary third set of rings that fades in and out.

   5. Scroll to zoom — wheel events scale stripe density (removed per preference).
   ─────────────────────────────────────────────────────────────────────────── */
