/* ═══════════════════════════════════════════════════════════════════════════
   PARTICLE TEXT — jeanphilippebelley.com
   ─────────────────────────────────────────────────────────────────────────
   title: Pixel Particle Text Animations
   desc:  10 canvas animations that sample text pixel-by-pixel and treat each
          lit pixel as an independent particle. Spring physics, cursor
          interaction, word morphing, shockwaves, and generative motion —
          no DOM, no libraries, pure canvas.
   tags:  particle-text, canvas, spring-physics, generative, javascript
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
   ═══════════════════════════════════════════════════════════════════════ */


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
const WORD_A = 'CREATE'   // anim_07 source word
const WORD_B = 'DEVOUR'   // anim_07 target word

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

// ─── Loop ──────────────────────────────────────────────────────────────────────
let _raf = null
function loop(tick) {
  cancelAnimationFrame(_raf)
  ;(function frame() { tick(); _raf = requestAnimationFrame(frame) })()
}

function run(fn) { fn(); BTN.onclick = fn }


// ─── ANIMATIONS ───────────────────────────────────────────────────────────────

// ── 01  Scatter Assemble ────────────────────────────────────────────────────
// title: Scatter Assemble
// desc: Every lit pixel of the word starts at a random position scattered
//       across the entire viewport, then each particle springs to its exact
//       letter coordinate. A randomised per-particle delay creates a ripple
//       as the word coalesces from chaos into form.
// tags: particle-text, spring-physics, scatter, assemble, text-animation
function anim_01() {
  const pts = sampleText(WORD)
  const P = pts.map(o => ({
    x: Math.random() * cv.width,
    y: Math.random() * cv.height,
    vx: 0, vy: 0,
    ox: o.x, oy: o.y,
    delay: Math.floor(Math.random() * 50),
  }))
  let f = 0
  loop(() => {
    f++
    ctx.fillStyle = 'rgba(8,10,15,0.18)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    ctx.fillStyle = 'rgba(124,92,255,0.8)'
    P.forEach(p => {
      if (f < p.delay) return
      spring2D(p, p.ox, p.oy, 0.055, 0.80)
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 02  Big Bang ────────────────────────────────────────────────────────────
// title: Big Bang
// desc: All particles begin at the canvas centre in a tight cluster and
//       explode outward with randomised burst velocities. Each particle then
//       springs back to its letter position, tracing a unique arc through
//       the explosion. The fade trail lets you read the trajectories.
// tags: particle-text, explosion, spring-physics, big-bang, text-animation
function anim_02() {
  const pts = sampleText(WORD)
  const cx = cv.width / 2, cy = cv.height / 2
  const P = pts.map(o => {
    const angle = Math.random() * Math.PI * 2
    const speed = 7 + Math.random() * 12
    return {
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      ox: o.x, oy: o.y,
    }
  })
  loop(() => {
    ctx.fillStyle = 'rgba(8,10,15,0.14)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      spring2D(p, p.ox, p.oy, 0.04, 0.88)
      const dist  = Math.hypot(p.x - p.ox, p.y - p.oy)
      const alpha = Math.min(0.85, 0.25 + (1 - Math.min(1, dist / 400)) * 0.6)
      ctx.fillStyle = `rgba(232,234,240,${alpha})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 03  Cursor Repel ────────────────────────────────────────────────────────
// title: Cursor Repel
// desc: Particles rest at their letter positions. Move the cursor near them
//       and they flee with a force proportional to proximity. Release and
//       they spring back. Color shifts from violet to mint as displacement
//       grows — a visual read of the invisible force field.
// tags: particle-text, cursor-interaction, spring-physics, repulsion, generative
function anim_03() {
  const pts = sampleText(WORD)
  const RADIUS = 90, PUSH = 180
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  loop(() => {
    ctx.fillStyle = '#080A0F'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      const dx = p.ox - mouse.x, dy = p.oy - mouse.y
      const dist = Math.hypot(dx, dy)
      let tx = p.ox, ty = p.oy
      if (dist < RADIUS && dist > 0) {
        const force = (RADIUS - dist) / RADIUS
        tx = p.ox + (dx / dist) * force * PUSH
        ty = p.oy + (dy / dist) * force * PUSH
      }
      spring2D(p, tx, ty, 0.10, 0.72)
      // Colour shifts violet → mint with displacement
      const t = Math.min(1, Math.hypot(p.x - p.ox, p.y - p.oy) / 60)
      const r = Math.round(124 + (46  - 124) * t)
      const g = Math.round(92  + (230 - 92)  * t)
      const b = Math.round(255 + (166 - 255) * t)
      ctx.fillStyle = `rgba(${r},${g},${b},0.85)`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 04  Pixel Rain ──────────────────────────────────────────────────────────
// title: Pixel Rain
// desc: Particles fall from high above the canvas at their correct x
//       position. A spring on both axes pulls them into their letter
//       coordinate with a soft bounce on landing. Randomised starting heights
//       create natural stagger — rain assembling into words from the sky.
// tags: particle-text, rain, gravity, spring-physics, text-animation
function anim_04() {
  const pts = sampleText(WORD)
  const P = pts.map(o => ({
    x: o.x + (Math.random() - 0.5) * 6,
    y: o.y - cv.height * (0.5 + Math.random() * 1.0),
    vx: (Math.random() - 0.5) * 1.5, vy: 0,
    ox: o.x, oy: o.y,
  }))
  loop(() => {
    ctx.fillStyle = 'rgba(8,10,15,0.25)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      spring2D(p, p.ox, p.oy, 0.045, 0.84)
      const dist  = Math.hypot(p.x - p.ox, p.y - p.oy)
      const alpha = Math.min(0.85, 0.15 + (1 - Math.min(1, dist / 200)) * 0.7)
      ctx.fillStyle = `rgba(46,230,166,${alpha})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 05  Vortex ──────────────────────────────────────────────────────────────
// title: Vortex
// desc: Particles begin on a large circle around the canvas centre, each
//       given a tangential velocity kick. As the spring pulls them toward
//       their letter position, the combination of initial spin and restoring
//       force creates natural spiral trajectories — no rotation math needed.
// tags: particle-text, vortex, spring-physics, spiral, text-animation
function anim_05() {
  const pts = sampleText(WORD)
  const cx = cv.width / 2, cy = cv.height / 2
  const P = pts.map(o => {
    const angle = Math.random() * Math.PI * 2
    const r     = Math.min(cv.width, cv.height) * (0.28 + Math.random() * 0.18)
    return {
      x:  cx + Math.cos(angle) * r,
      y:  cy + Math.sin(angle) * r,
      vx: -Math.sin(angle) * 3.5,
      vy:  Math.cos(angle) * 3.5,
      ox: o.x, oy: o.y,
    }
  })
  loop(() => {
    ctx.fillStyle = 'rgba(8,10,15,0.18)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      spring2D(p, p.ox, p.oy, 0.045, 0.88)
      const progress = 1 - Math.min(1, Math.hypot(p.x - p.ox, p.y - p.oy) / 300)
      ctx.fillStyle   = `rgba(124,92,255,${0.3 + progress * 0.6})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 06  Sine Ripple ─────────────────────────────────────────────────────────
// title: Sine Ripple
// desc: Particles rest at their letter positions. A continuous radial sine
//       wave propagates outward from the canvas centre, displacing each
//       particle along its radial axis. The word breathes with the wave —
//       form preserved, volume shifting.
// tags: particle-text, sine-wave, generative, continuous, text-animation
function anim_06() {
  const pts = sampleText(WORD)
  const cx = cv.width / 2, cy = cv.height / 2
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  let t = 0
  loop(() => {
    t += 0.045
    ctx.fillStyle = '#080A0F'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      const dx   = p.ox - cx, dy = p.oy - cy
      const dist = Math.hypot(dx, dy) || 1
      const wave = Math.sin(dist * 0.018 - t) * 18
      spring2D(p, p.ox + (dx / dist) * wave, p.oy + (dy / dist) * wave, 0.18, 0.68)
      const disp  = Math.hypot(p.x - p.ox, p.y - p.oy)
      ctx.fillStyle = `rgba(124,92,255,${0.5 + Math.min(0.4, disp / 30)})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 07  Word Morph ──────────────────────────────────────────────────────────
// title: Word Morph
// desc: Two words share a unified particle pool. Each replay springs every
//       particle between the two pixel layouts. Particles without a match in
//       the target word collapse to a nearby occupied position. Colour
//       transitions violet to mint as the word changes.
// tags: particle-text, morph, spring-physics, word-transition, text-animation
function anim_07() {
  // Initialise particle pool once; persist state across replays on the fn.
  if (!anim_07.P) {
    const ptsA = sampleText(WORD_A)
    const ptsB = sampleText(WORD_B)
    const n = Math.max(ptsA.length, ptsB.length)
    const A = padTo(ptsA, n)
    const B = padTo(ptsB, n)
    // Shuffle B so morphing pairs look organic rather than grid-like
    for (let i = B.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [B[i], B[j]] = [B[j], B[i]]
    }
    anim_07.P  = A.map((a, i) => ({ x: a.x, y: a.y, vx: 0, vy: 0, ax: A[i].x, ay: A[i].y, bx: B[i].x, by: B[i].y }))
    anim_07.toB = false
  }
  anim_07.toB = !anim_07.toB
  const P = anim_07.P
  loop(() => {
    ctx.fillStyle = 'rgba(8,10,15,0.2)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      const tx = anim_07.toB ? p.bx : p.ax
      const ty = anim_07.toB ? p.by : p.ay
      spring2D(p, tx, ty, 0.06, 0.80)
      const progress = 1 - Math.min(1, Math.hypot(p.x - tx, p.y - ty) / 200)
      const t = anim_07.toB ? progress : 1 - progress
      const r = Math.round(124 + (46  - 124) * t)
      const g = Math.round(92  + (230 - 92)  * t)
      const b = Math.round(255 + (166 - 255) * t)
      ctx.fillStyle = `rgba(${r},${g},${b},${0.4 + progress * 0.5})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 08  Shockwave ───────────────────────────────────────────────────────────
// title: Shockwave
// desc: Particles rest at their letter positions. Clicking the canvas
//       detonates a radial blast — particles within the radius are flung
//       outward with force proportional to proximity, then spring back.
//       Displacement is mapped to brightness: particles glow white at impact.
// tags: particle-text, shockwave, click-interaction, spring-physics, explosion
function anim_08() {
  // Remove any previous click listener before re-initialising.
  if (anim_08._det) cv.removeEventListener('click', anim_08._det)

  const pts = sampleText(WORD)
  const P   = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  const BLAST_R = 150, FORCE = 24

  anim_08._det = e => {
    const bx = e.clientX, by = e.clientY
    P.forEach(p => {
      const dx = p.ox - bx, dy = p.oy - by
      const dist = Math.hypot(dx, dy)
      if (dist < BLAST_R && dist > 0) {
        const strength = (1 - dist / BLAST_R) * FORCE
        p.vx += (dx / dist) * strength
        p.vy += (dy / dist) * strength
      }
    })
  }
  cv.addEventListener('click', anim_08._det)

  loop(() => {
    ctx.fillStyle = '#080A0F'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      spring2D(p, p.ox, p.oy, 0.06, 0.80)
      const heat = Math.min(1, Math.hypot(p.x - p.ox, p.y - p.oy) / 80)
      const r    = Math.round(124 + (255 - 124) * heat)
      const g    = Math.round(92  + (255 - 92)  * heat)
      ctx.fillStyle = `rgba(${r},${g},255,0.85)`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.2 + heat * 1.8, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 09  Breathing Pulse ─────────────────────────────────────────────────────
// title: Breathing Pulse
// desc: Particles expand and contract in a slow rhythmic cycle — like the
//       word is breathing. Each particle's target oscillates radially from
//       its letter origin using a sine wave, with a phase offset proportional
//       to its distance from the canvas centre, creating a ripple breath.
// tags: particle-text, breathing, oscillation, sine-wave, continuous
function anim_09() {
  const pts = sampleText(WORD)
  const cx = cv.width / 2, cy = cv.height / 2
  const P = pts.map(o => ({
    x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y,
    phase: Math.hypot(o.x - cx, o.y - cy) * 0.012,
  }))
  let t = 0
  loop(() => {
    t += 0.018
    ctx.fillStyle = '#080A0F'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      const breathe = Math.sin(t + p.phase) * 14
      const dx = p.ox - cx, dy = p.oy - cy
      const dist = Math.hypot(dx, dy) || 1
      spring2D(p, p.ox + (dx / dist) * breathe, p.oy + (dy / dist) * breathe, 0.12, 0.72)
      const alpha = 0.45 + Math.abs(Math.sin(t + p.phase)) * 0.4
      ctx.fillStyle = `rgba(46,230,166,${alpha})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 10  Static Noise ────────────────────────────────────────────────────────
// title: Static Noise
// desc: Every particle is hit by a random impulse each frame, then spring-
//       pulled back toward its letter position. The balance between noise
//       amplitude and spring strength creates a living, buzzing texture.
//       The word is always legible — controlled chaos held in letter shapes.
// tags: particle-text, noise, jitter, spring-physics, generative
function anim_10() {
  const pts   = sampleText(WORD)
  const NOISE = 2.6
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  loop(() => {
    ctx.fillStyle = 'rgba(8,10,15,0.35)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      p.vx += (Math.random() - 0.5) * NOISE
      p.vy += (Math.random() - 0.5) * NOISE
      spring2D(p, p.ox, p.oy, 0.08, 0.74)
      const disp  = Math.hypot(p.x - p.ox, p.y - p.oy)
      const alpha = Math.min(0.9, 0.3 + disp / 12)
      ctx.fillStyle = `rgba(232,234,240,${alpha})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}


// ─── Start ─────────────────────────────────────────────────────────────────────
run(anim_01)
