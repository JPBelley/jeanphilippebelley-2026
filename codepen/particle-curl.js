/* ═══════════════════════════════════════════════════════════════════════════
   CURL NOISE PARTICLE TEXT — jeanphilippebelley.com
   ─────────────────────────────────────────────────────────────────────────
   title: Curl Noise Particle Text Animations
   desc:  10 canvas animations that drive letter particles through a
          divergence-free curl noise vector field. Letter positions act as
          attractors competing with the field — producing swirling, smoky,
          crystallising, and turbulent effects. No DOM, no libraries, pure
          canvas.
   tags:  curl-noise, particle-text, canvas, flow-field, generative, javascript
   ─────────────────────────────────────────────────────────────────────────
   HTML — paste in the HTML pane:
   ─────────────────────────────────────────────────────────────────────────

   <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=DM+Mono:wght@300&display=swap" rel="stylesheet">

   <canvas id="cv"></canvas>
   <button id="replay">↺ replay</button>
   <a href="https://jeanphilippebelley.com/" target="_blank" id="credit">
     JP<span>.</span>
   </a>

   ─────────────────────────────────────────────────────────────────────────
   CSS — paste in the CSS pane:
   ─────────────────────────────────────────────────────────────────────────

   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

   body { background: #080A0F; overflow: hidden; min-height: 100vh; }

   #cv { position: fixed; inset: 0; width: 100%; height: 100%; }

   #replay {
     position: fixed;
     bottom: 28px;
     left: 50%;
     transform: translateX(-50%);
     background: none;
     border: none;
     font-family: 'DM Mono', monospace;
     font-size: 11px;
     font-weight: 300;
     letter-spacing: 0.12em;
     color: rgba(255,255,255,0.2);
     cursor: pointer;
     text-transform: lowercase;
     transition: color 0.2s;
   }
   #replay:hover { color: rgba(255,255,255,0.55); }

   #credit {
     position: fixed;
     bottom: 20px;
     right: 24px;
     font-family: 'DM Mono', monospace;
     font-size: 11px;
     font-weight: 300;
     letter-spacing: 0.1em;
     color: rgba(255,255,255,0.12);
     text-decoration: none;
     transition: color 0.2s;
   }
   #credit span { color: rgba(124,92,255,0.55); }
   #credit:hover { color: rgba(255,255,255,0.4); }

   ═══════════════════════════════════════════════════════════════════════════
   In the JS pane keep only ONE call at the bottom:
     run(anim_XX)   ← change XX (01–10) to switch
   ═══════════════════════════════════════════════════════════════════ */


// ─── Canvas ────────────────────────────────────────────────────────────────────
const cv  = document.getElementById('cv')
const ctx = cv.getContext('2d')
const BTN = document.getElementById('replay')

function resize() { cv.width = window.innerWidth; cv.height = window.innerHeight }
resize()
window.addEventListener('resize', resize)

// ─── Mouse ─────────────────────────────────────────────────────────────────────
const mouse = { x: -9999, y: -9999 }
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY })
window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999 })

// ─── Default text ──────────────────────────────────────────────────────────────
// Change these to use your own text.
const WORD   = 'ALWAYS'
const WORD_A = 'FLOW'    // anim_07 source word
const WORD_B = 'DRIFT'   // anim_07 target word

// ─── Text sampling ─────────────────────────────────────────────────────────────
// Rasterises `text` onto an offscreen canvas and returns [{x, y}] for every
// sampled lit pixel. density = step size in px (lower = more particles).
function sampleText(text, density = 4) {
  const off  = document.createElement('canvas')
  const octx = off.getContext('2d')
  off.width  = cv.width
  off.height = cv.height
  const fs = Math.min(cv.height * 0.42, cv.width / text.length * 1.6, 150)
  octx.font         = `700 ${fs}px "Space Grotesk", sans-serif`
  octx.textAlign    = 'center'
  octx.textBaseline = 'middle'
  octx.fillStyle    = '#fff'
  octx.fillText(text, off.width / 2, off.height / 2)
  const { data } = octx.getImageData(0, 0, off.width, off.height)
  const pts = []
  for (let y = 0; y < off.height; y += density)
    for (let x = 0; x < off.width; x += density)
      if (data[(y * off.width + x) * 4 + 3] > 128) pts.push({ x, y })
  return pts
}

// Pad or trim an array to exactly n elements, repeating randomly to fill.
function padTo(arr, n) {
  const out = arr.slice(0, n)
  while (out.length < n) out.push(arr[Math.floor(Math.random() * arr.length)])
  return out
}

// ─── Spring ────────────────────────────────────────────────────────────────────
function spring2D(s, tx, ty, k = 0.08, d = 0.75) {
  s.vx += (tx - s.x) * k;  s.vx *= d;  s.x += s.vx
  s.vy += (ty - s.y) * k;  s.vy *= d;  s.y += s.vy
}

// ─── Curl noise ────────────────────────────────────────────────────────────────
// φ(x,y,t) is a scalar potential. velocity = (∂φ/∂y, -∂φ/∂x) — always divergence-free.
function phi(x, y, t, s = 0.003) {
  return Math.sin(x * s * 2.1 + y * s * 0.9 + t * 0.50)
       + Math.sin(x * s * 0.7 + y * s * 2.6 + t * 0.37) * 0.62
       + Math.sin(x * s * 3.8 + y * s * 1.5 + t * 0.68) * 0.26
}
function curl(x, y, t, s = 0.003, eps = 0.8) {
  return {
    vx:  (phi(x, y + eps, t, s) - phi(x, y - eps, t, s)) / (2 * eps),
    vy: -(phi(x + eps, y, t, s) - phi(x - eps, y, t, s)) / (2 * eps),
  }
}

// ─── Loop ──────────────────────────────────────────────────────────────────────
let _raf = null
function loop(tick) {
  cancelAnimationFrame(_raf)
  ;(function frame() { tick(); _raf = requestAnimationFrame(frame) })()
}

function run(fn) { fn(); BTN.onclick = fn }


// ─── ANIMATIONS ───────────────────────────────────────────────────────────────

// ── 01  Drift & Settle ─────────────────────────────────────────────────────────
// title: Drift & Settle
// desc: Particles rest at their letter positions while the curl field nudges
//       them each frame. A loose spring pulls them back, creating a shimmering
//       letterform that breathes with the invisible flow — never still, never lost.
// tags: curl-noise, flow-field, spring-physics, shimmer, continuous
function anim_01() {
  const pts = sampleText(WORD)
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  let t = 0
  loop(() => {
    t += 0.018
    ctx.fillStyle = '#080A0F'
    ctx.fillRect(0, 0, cv.width, cv.height)
    ctx.fillStyle = 'rgba(124,92,255,0.82)'
    P.forEach(p => {
      const c = curl(p.x, p.y, t)
      p.vx += c.vx * 0.6
      p.vy += c.vy * 0.6
      spring2D(p, p.ox, p.oy, 0.06, 0.78)
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 02  Free Smoke ─────────────────────────────────────────────────────────────
// title: Free Smoke
// desc: A very weak spring and slow-moving field let particles drift far from
//       their letter positions before lazily drifting back. The long trail
//       records each wisp of motion, making the word look like smoke that
//       keeps remembering its shape.
// tags: curl-noise, smoke, trail, weak-spring, flow-field
function anim_02() {
  const pts = sampleText(WORD)
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  let t = 0
  loop(() => {
    t += 0.008
    ctx.fillStyle = 'rgba(8,10,15,0.04)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    ctx.fillStyle = 'rgba(46,230,166,0.75)'
    P.forEach(p => {
      const c = curl(p.x, p.y, t)
      p.vx += c.vx * 0.9
      p.vy += c.vy * 0.9
      spring2D(p, p.ox, p.oy, 0.012, 0.92)
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 03  Tempest ────────────────────────────────────────────────────────────────
// title: Tempest
// desc: The curl field runs at 5× speed and its output is amplified 3×, flinging
//       particles chaotically around the canvas. A medium spring struggles to
//       keep the word legible — letters shred and reform in the turbulence.
// tags: curl-noise, chaos, fast-field, spring-physics, turbulence
function anim_03() {
  const pts = sampleText(WORD)
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  let t = 0
  loop(() => {
    t += 0.04
    ctx.fillStyle = 'rgba(8,10,15,0.12)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    ctx.fillStyle = 'rgba(232,234,240,0.8)'
    P.forEach(p => {
      const c = curl(p.x, p.y, t)
      p.vx += c.vx * 3.0
      p.vy += c.vy * 3.0
      spring2D(p, p.ox, p.oy, 0.055, 0.80)
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 04  Cursor Warp ────────────────────────────────────────────────────────────
// title: Cursor Warp
// desc: Near the cursor the local time offset for the curl field is increased,
//       creating a vortex wherever the mouse moves. Particles far from the
//       cursor drift gently while those nearby are caught in the disturbance.
//       Color shifts violet→mint with displacement from the letter origin.
// tags: curl-noise, cursor-interaction, local-time-warp, vortex, flow-field
function anim_04() {
  const pts = sampleText(WORD)
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  let t = 0
  loop(() => {
    t += 0.02
    ctx.fillStyle = 'rgba(8,10,15,0.15)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y)
      const lt   = t + (1 - Math.min(1, dist / 180)) * 2.5
      const c    = curl(p.x, p.y, lt)
      p.vx += c.vx * 1.2
      p.vy += c.vy * 1.2
      spring2D(p, p.ox, p.oy, 0.065, 0.79)
      const disp = Math.min(1, Math.hypot(p.x - p.ox, p.y - p.oy) / 60)
      const r = Math.round(124 + (46  - 124) * disp)
      const g = Math.round(92  + (230 - 92)  * disp)
      const b = Math.round(255 + (166 - 255) * disp)
      ctx.fillStyle = `rgba(${r},${g},${b},0.85)`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 05  Spectral Flow ──────────────────────────────────────────────────────────
// title: Spectral Flow
// desc: Each particle is coloured by the direction of the curl velocity at its
//       current position, mapping flow angle to hue. The rainbow pattern makes
//       the invisible field visible — you can read vortices and streamlines
//       directly from the colour gradients in the letterforms.
// tags: curl-noise, spectral, hue-mapping, flow-visualization, generative
function anim_05() {
  const pts = sampleText(WORD)
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  let t = 0
  loop(() => {
    t += 0.016
    ctx.fillStyle = 'rgba(8,10,15,0.14)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      const c   = curl(p.x, p.y, t)
      p.vx += c.vx * 1.0
      p.vy += c.vy * 1.0
      spring2D(p, p.ox, p.oy, 0.03, 0.85)
      const hue = Math.atan2(c.vy, c.vx) * 180 / Math.PI + 180
      ctx.fillStyle = `hsla(${hue},90%,65%,0.85)`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 06  Crystallize ────────────────────────────────────────────────────────────
// title: Crystallize
// desc: Particles begin scattered at random positions riding a pure curl field
//       with no spring force. Over 200 frames the spring strength grows linearly
//       from zero to full. The word precipitates from chaos — swirling particles
//       slowly pulled into letter shapes as if crystallising from solution.
// tags: curl-noise, crystallize, emergent-form, growing-spring, flow-field
function anim_06() {
  const pts = sampleText(WORD)
  const P = pts.map(o => ({
    x: Math.random() * cv.width,
    y: Math.random() * cv.height,
    vx: 0, vy: 0,
    ox: o.x, oy: o.y,
  }))
  let t = 0, frame = 0
  loop(() => {
    t += 0.018
    frame++
    ctx.fillStyle = 'rgba(8,10,15,0.13)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    const k = Math.min(1, frame / 200) * 0.09
    ctx.fillStyle = 'rgba(124,92,255,0.80)'
    P.forEach(p => {
      const c = curl(p.x, p.y, t)
      p.vx += c.vx * 1.1
      p.vy += c.vy * 1.1
      spring2D(p, p.ox, p.oy, k, 0.82)
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 07  Tidal Shift ────────────────────────────────────────────────────────────
// title: Tidal Shift
// desc: The particle target alternates between WORD_A and WORD_B every replay.
//       The curl field adds organic, wave-like motion to every transition so
//       particles don't travel in straight lines. Color drifts violet→mint as
//       the tide turns from one word to the other.
// tags: curl-noise, word-morph, tidal, transition, flow-field
function anim_07() {
  if (!anim_07.P) {
    const ptsA = sampleText(WORD_A)
    const ptsB = sampleText(WORD_B)
    const n = Math.max(ptsA.length, ptsB.length)
    const A = padTo(ptsA, n)
    const B = padTo(ptsB, n)
    for (let i = B.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [B[i], B[j]] = [B[j], B[i]]
    }
    anim_07.P   = A.map((a, i) => ({ x: a.x, y: a.y, vx: 0, vy: 0, ax: A[i].x, ay: A[i].y, bx: B[i].x, by: B[i].y }))
    anim_07.toB = false
    anim_07.t   = 0
  }
  anim_07.toB = !anim_07.toB
  const P = anim_07.P
  loop(() => {
    anim_07.t += 0.018
    const t = anim_07.t
    ctx.fillStyle = 'rgba(8,10,15,0.16)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      const c  = curl(p.x, p.y, t)
      p.vx += c.vx * 0.8
      p.vy += c.vy * 0.8
      const tx = anim_07.toB ? p.bx : p.ax
      const ty = anim_07.toB ? p.by : p.ay
      spring2D(p, tx, ty, 0.06, 0.80)
      const progress = 1 - Math.min(1, Math.hypot(p.x - tx, p.y - ty) / 200)
      const blend = anim_07.toB ? progress : 1 - progress
      const r = Math.round(124 + (46  - 124) * blend)
      const g = Math.round(92  + (230 - 92)  * blend)
      const b = Math.round(255 + (166 - 255) * blend)
      ctx.fillStyle = `rgba(${r},${g},${b},${0.4 + progress * 0.5})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 08  Micro Turbulence ───────────────────────────────────────────────────────
// title: Micro Turbulence
// desc: A fine-scale curl field (s=0.007) produces many small tight vortices
//       instead of large sweeping arcs. A strong spring keeps the letterforms
//       mostly intact but particles spin in compact local eddies — the word
//       vibrates with microscopic turbulent detail.
// tags: curl-noise, micro-scale, turbulence, strong-spring, fine-vortex
function anim_08() {
  const pts = sampleText(WORD)
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  let t = 0
  loop(() => {
    t += 0.022
    ctx.fillStyle = '#080A0F'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      const c = curl(p.x, p.y, t, 0.007)
      p.vx += c.vx * 1.4
      p.vy += c.vy * 1.4
      spring2D(p, p.ox, p.oy, 0.10, 0.74)
      const disp = Math.min(1, Math.hypot(p.x - p.ox, p.y - p.oy) / 20)
      const r = Math.round(232 + (124 - 232) * (1 - disp))
      const g = Math.round(234 + (92  - 234) * (1 - disp))
      const b = 255
      ctx.fillStyle = `rgba(${r},${g},${b},0.85)`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 09  Layered Fields ─────────────────────────────────────────────────────────
// title: Layered Fields
// desc: Two curl fields at different spatial scales and time speeds are summed
//       each frame. The interference pattern between the large slow field and
//       the fine fast field creates complex, never-repeating trajectories —
//       particles trace paths that feel both structured and unpredictable.
// tags: curl-noise, layered-fields, interference, multi-scale, flow-field
function anim_09() {
  const pts = sampleText(WORD)
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  let t = 0
  loop(() => {
    t += 0.016
    ctx.fillStyle = 'rgba(8,10,15,0.13)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    ctx.fillStyle = 'rgba(46,230,166,0.78)'
    P.forEach(p => {
      const c1 = curl(p.x, p.y, t,       0.003)
      const c2 = curl(p.x, p.y, t * 1.7, 0.007)
      const fx  = c1.vx + c2.vx * 0.5
      const fy  = c1.vy + c2.vy * 0.5
      p.vx += fx * 1.0
      p.vy += fy * 1.0
      spring2D(p, p.ox, p.oy, 0.05, 0.82)
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 10  Ember Drift ────────────────────────────────────────────────────────────
// title: Ember Drift
// desc: An extremely slow field and near-infinite trail reduce each particle to
//       a faint warm glow that barely moves. Over many seconds the letter shapes
//       cool into existence like embers settling — still and smouldering,
//       barely above the threshold of motion.
// tags: curl-noise, ember, slow-field, long-trail, meditative
function anim_10() {
  const pts = sampleText(WORD)
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  let t = 0
  loop(() => {
    t += 0.003
    ctx.fillStyle = 'rgba(8,10,15,0.025)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      const c = curl(p.x, p.y, t)
      p.vx += c.vx * 0.5
      p.vy += c.vy * 0.5
      spring2D(p, p.ox, p.oy, 0.018, 0.88)
      const alpha = 0.55 + Math.min(0.35, Math.hypot(p.vx, p.vy) * 0.4)
      ctx.fillStyle = `rgba(255,160,40,${alpha})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}


// ─── Start ─────────────────────────────────────────────────────────────────────
run(anim_01)
