/* ═══════════════════════════════════════════════════════════════════════════
   PARTICLE CONNECTIONS — jeanphilippebelley.com
   ─────────────────────────────────────────────────────────────────────────
   title: Particle Connection Animations
   desc:  10 canvas animations that render letter shapes as living constellation
          maps and neural networks. Particles spring into letter positions while
          lines connect nearby nodes — O(n²) kept tractable with density=6.
   tags:  particle-text, canvas, spring-physics, connections, constellation
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
const WORD_A = 'CREATE'   // anim_09 source word
const WORD_B = 'DEVOUR'   // anim_09 target word

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

// ─── Connection drawing ────────────────────────────────────────────────────────
// Draws lines between particles within maxDist. Max maxLinks connections per particle.
// colorFn(pi, pj, dist, alpha) → CSS color string. If null, uses default violet.
function drawLines(P, maxDist, maxLinks, colorFn) {
  ctx.lineWidth = 0.6
  for (let i = 0; i < P.length; i++) {
    let links = 0
    for (let j = i + 1; j < P.length; j++) {
      if (links >= maxLinks) break
      const dx = P[i].x - P[j].x
      const dy = P[i].y - P[j].y
      const dist = Math.hypot(dx, dy)
      if (dist < maxDist) {
        links++
        const alpha = (1 - dist / maxDist) * 0.45
        ctx.strokeStyle = colorFn
          ? colorFn(P[i], P[j], dist, alpha)
          : `rgba(124,92,255,${alpha})`
        ctx.beginPath()
        ctx.moveTo(P[i].x, P[i].y)
        ctx.lineTo(P[j].x, P[j].y)
        ctx.stroke()
      }
    }
  }
}


// ─── ANIMATIONS ───────────────────────────────────────────────────────────────

// ── 01  Constellation Rest ────────────────────────────────────────────────────
// title: Constellation Rest
// desc: Particles spring from scatter to letter positions, then settle into a
//       living constellation map. Each particle breathes with a subtle sine
//       oscillation while violet lines trace the network between near neighbors.
// tags: constellation, spring-physics, connections, breathing, particle-text
function anim_01() {
  const pts = sampleText(WORD, 6)
  const P = pts.map((o, i) => ({
    x: Math.random() * cv.width,
    y: Math.random() * cv.height,
    vx: 0, vy: 0,
    ox: o.x, oy: o.y,
    phase: i * 0.3,
  }))
  let t = 0
  loop(() => {
    t += 0.016
    ctx.fillStyle = 'rgba(8,10,15,0.18)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      const breathe = Math.sin(t * 0.8 + p.phase) * 4
      const dx = p.ox - cv.width / 2, dy = p.oy - cv.height / 2
      const dist = Math.hypot(dx, dy) || 1
      spring2D(p, p.ox + (dx / dist) * breathe, p.oy + (dy / dist) * breathe, 0.055, 0.80)
    })
    drawLines(P, 55, 4, null)
    ctx.fillStyle = 'rgba(124,92,255,0.82)'
    P.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 02  Web Build ─────────────────────────────────────────────────────────────
// title: Web Build
// desc: Particles scatter then assemble into letter positions. Connections
//       appear only between particles that have already arrived, fading in as
//       each endpoint settles — the web knits itself together progressively.
// tags: assembly, connections, spring-physics, reveal, particle-text
function anim_02() {
  const pts = sampleText(WORD, 6)
  const P = pts.map(o => ({
    x: Math.random() * cv.width,
    y: Math.random() * cv.height,
    vx: 0, vy: 0,
    ox: o.x, oy: o.y,
    arrived: false,
  }))
  loop(() => {
    ctx.fillStyle = 'rgba(8,10,15,0.20)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      spring2D(p, p.ox, p.oy, 0.055, 0.80)
      p.arrived = Math.hypot(p.x - p.ox, p.y - p.oy) < 8
    })
    // Draw connections only between arrived particles
    ctx.lineWidth = 0.6
    for (let i = 0; i < P.length; i++) {
      if (!P[i].arrived) continue
      let links = 0
      for (let j = i + 1; j < P.length; j++) {
        if (links >= 4) break
        if (!P[j].arrived) continue
        const dx = P[i].x - P[j].x
        const dy = P[i].y - P[j].y
        const dist = Math.hypot(dx, dy)
        if (dist < 55) {
          links++
          const alpha = (1 - dist / 55) * 0.45
          ctx.strokeStyle = `rgba(124,92,255,${alpha})`
          ctx.beginPath()
          ctx.moveTo(P[i].x, P[i].y)
          ctx.lineTo(P[j].x, P[j].y)
          ctx.stroke()
        }
      }
    }
    P.forEach(p => {
      const alpha = p.arrived ? 0.85 : 0.3 + Math.random() * 0.2
      ctx.fillStyle = `rgba(124,92,255,${alpha})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 03  Pulse Network ─────────────────────────────────────────────────────────
// title: Pulse Network
// desc: Particles rest at letter positions while traveling pulses animate along
//       every connection. Brightness waves propagate across the network and
//       each particle pulses in size in sync with the wave passing through it.
// tags: pulse, network, connections, mint, particle-text
function anim_03() {
  const pts = sampleText(WORD, 6)
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  let t = 0
  loop(() => {
    t += 0.016
    ctx.fillStyle = '#080A0F'
    ctx.fillRect(0, 0, cv.width, cv.height)
    // Draw pulsing connections
    ctx.lineWidth = 0.6
    for (let i = 0; i < P.length; i++) {
      let links = 0
      for (let j = i + 1; j < P.length; j++) {
        if (links >= 4) break
        const dx = P[i].x - P[j].x
        const dy = P[i].y - P[j].y
        const dist = Math.hypot(dx, dy)
        if (dist < 55) {
          links++
          const phase = (P[i].ox + P[j].ox) * 0.005 - t * 2
          const brightness = 0.2 + Math.max(0, Math.sin(phase)) * 0.6
          const alpha = (1 - dist / 55) * brightness
          ctx.strokeStyle = `rgba(46,230,166,${alpha})`
          ctx.beginPath()
          ctx.moveTo(P[i].x, P[i].y)
          ctx.lineTo(P[j].x, P[j].y)
          ctx.stroke()
        }
      }
    }
    // Draw particles — pulse radius with wave
    P.forEach(p => {
      const phase = p.ox * 0.005 - t * 2
      const pulse = 0.2 + Math.max(0, Math.sin(phase)) * 0.6
      const r = 1.0 + pulse * 0.8
      ctx.fillStyle = `rgba(46,230,166,${0.5 + pulse * 0.4})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 04  Cursor Illuminate ─────────────────────────────────────────────────────
// title: Cursor Illuminate
// desc: Particles rest quietly with no connections visible. Moving the cursor
//       illuminates connections whose midpoint falls within 120px — the web
//       is revealed only where you look. Nearby particles also glow brighter.
// tags: cursor-interaction, connections, reveal, hover, particle-text
function anim_04() {
  const pts = sampleText(WORD, 6)
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  const REVEAL_R = 120
  loop(() => {
    ctx.fillStyle = '#080A0F'
    ctx.fillRect(0, 0, cv.width, cv.height)
    // Draw connections only near cursor
    ctx.lineWidth = 0.6
    for (let i = 0; i < P.length; i++) {
      let links = 0
      for (let j = i + 1; j < P.length; j++) {
        if (links >= 4) break
        const dx = P[i].x - P[j].x
        const dy = P[i].y - P[j].y
        const dist = Math.hypot(dx, dy)
        if (dist < 55) {
          const mx2 = (P[i].x + P[j].x) / 2
          const my2 = (P[i].y + P[j].y) / 2
          const cdist = Math.hypot(mx2 - mouse.x, my2 - mouse.y)
          if (cdist < REVEAL_R) {
            links++
            const proximityAlpha = (1 - cdist / REVEAL_R)
            const distAlpha = (1 - dist / 55) * 0.55
            ctx.strokeStyle = `rgba(124,92,255,${distAlpha * proximityAlpha})`
            ctx.beginPath()
            ctx.moveTo(P[i].x, P[i].y)
            ctx.lineTo(P[j].x, P[j].y)
            ctx.stroke()
          }
        }
      }
    }
    // Draw particles — glow near cursor
    P.forEach(p => {
      const cdist = Math.hypot(p.x - mouse.x, p.y - mouse.y)
      const glow = Math.max(0, 1 - cdist / REVEAL_R)
      const alpha = 0.25 + glow * 0.7
      const r = 1.2 + glow * 1.0
      ctx.fillStyle = `rgba(124,92,255,${alpha})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 05  Radial Graph ──────────────────────────────────────────────────────────
// title: Radial Graph
// desc: Connection color encodes the angle of each line — hue is computed from
//       the line's direction, mapping all 360 degrees to the full color wheel.
//       The word becomes a stained-glass constellation map of angular geometry.
// tags: color-encoding, angle, hsl, connections, constellation
function anim_05() {
  const pts = sampleText(WORD, 6)
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  loop(() => {
    ctx.fillStyle = '#080A0F'
    ctx.fillRect(0, 0, cv.width, cv.height)
    // Draw angle-encoded connections
    ctx.lineWidth = 0.6
    for (let i = 0; i < P.length; i++) {
      let links = 0
      for (let j = i + 1; j < P.length; j++) {
        if (links >= 4) break
        const dx = P[j].x - P[i].x
        const dy = P[j].y - P[i].y
        const dist = Math.hypot(dx, dy)
        if (dist < 55) {
          links++
          const angle = Math.atan2(dy, dx)
          const hue = (angle * 180 / Math.PI + 180) % 360
          const alpha = (1 - dist / 55) * 0.55
          ctx.strokeStyle = `hsla(${hue},70%,60%,${alpha})`
          ctx.beginPath()
          ctx.moveTo(P[i].x, P[i].y)
          ctx.lineTo(P[j].x, P[j].y)
          ctx.stroke()
        }
      }
    }
    // White particles
    ctx.fillStyle = 'rgba(232,234,240,0.85)'
    P.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 06  Long Reach ────────────────────────────────────────────────────────────
// title: Long Reach
// desc: A large connection radius (120px) with only 2 links per particle creates
//       sparse, dramatic long-range connections that span the entire word like
//       distant stars in a map. Slow breathing adds subtle life to the star field.
// tags: star-map, long-range, sparse, breathing, connections
function anim_06() {
  const pts = sampleText(WORD, 6)
  const P = pts.map((o, i) => ({
    x: o.x, y: o.y, vx: 0, vy: 0,
    ox: o.x, oy: o.y,
    phase: i * 0.3,
  }))
  let t = 0
  loop(() => {
    t += 0.016
    ctx.fillStyle = 'rgba(8,10,15,0.22)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      const breathe = Math.sin(t * 0.5 + p.phase) * 6
      const dx = p.ox - cv.width / 2, dy = p.oy - cv.height / 2
      const dist = Math.hypot(dx, dy) || 1
      spring2D(p, p.ox + (dx / dist) * breathe, p.oy + (dy / dist) * breathe, 0.055, 0.80)
    })
    // Thin long-reach lines
    ctx.lineWidth = 0.4
    for (let i = 0; i < P.length; i++) {
      let links = 0
      for (let j = i + 1; j < P.length; j++) {
        if (links >= 2) break
        const dx = P[i].x - P[j].x
        const dy = P[i].y - P[j].y
        const dist = Math.hypot(dx, dy)
        if (dist < 120) {
          links++
          const alpha = (1 - dist / 120) * 0.35
          ctx.strokeStyle = `rgba(124,92,255,${alpha})`
          ctx.beginPath()
          ctx.moveTo(P[i].x, P[i].y)
          ctx.lineTo(P[j].x, P[j].y)
          ctx.stroke()
        }
      }
    }
    ctx.fillStyle = 'rgba(124,92,255,0.75)'
    P.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.0, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 07  Dense Weave ───────────────────────────────────────────────────────────
// title: Dense Weave
// desc: A tiny connection radius (22px) with 6 links per particle connects every
//       particle to its immediate neighbors, weaving a dense mesh that reads
//       like fabric or circuit board traces forming the letter shapes.
// tags: dense, fabric, mesh, mint, connections
function anim_07() {
  const pts = sampleText(WORD, 6)
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  loop(() => {
    ctx.fillStyle = '#080A0F'
    ctx.fillRect(0, 0, cv.width, cv.height)
    ctx.lineWidth = 0.6
    for (let i = 0; i < P.length; i++) {
      let links = 0
      for (let j = i + 1; j < P.length; j++) {
        if (links >= 6) break
        const dx = P[i].x - P[j].x
        const dy = P[i].y - P[j].y
        const dist = Math.hypot(dx, dy)
        if (dist < 22) {
          links++
          const alpha = (1 - dist / 22) * 0.45 * 0.6
          ctx.strokeStyle = `rgba(46,230,166,${alpha})`
          ctx.beginPath()
          ctx.moveTo(P[i].x, P[i].y)
          ctx.lineTo(P[j].x, P[j].y)
          ctx.stroke()
        }
      }
    }
    ctx.fillStyle = 'rgba(46,230,166,0.7)'
    P.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 0.9, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 08  Flow Network ──────────────────────────────────────────────────────────
// title: Flow Network
// desc: A slow curl noise field drifts particles away from their letter origins
//       while a loose spring pulls them back. Connections wiggle and shift in
//       real time, making the word look like a living neural network in flow.
// tags: curl-noise, flow, connections, drift, spring-physics
function anim_08() {
  function phi(x, y, t, s = 0.003) {
    return Math.sin(x * s * 2.1 + y * s * 0.9 + t * 0.5) + Math.sin(x * s * 0.7 + y * s * 2.6 + t * 0.37) * 0.62
  }
  function curlF(x, y, t, eps = 0.8) {
    return {
      vx:  (phi(x, y + eps, t) - phi(x, y - eps, t)) / (2 * eps),
      vy: -(phi(x + eps, y, t) - phi(x - eps, y, t)) / (2 * eps),
    }
  }

  const pts = sampleText(WORD, 6)
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  let t = 0
  loop(() => {
    t += 0.015
    ctx.fillStyle = 'rgba(8,10,15,0.20)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      const c = curlF(p.x, p.y, t)
      p.vx += c.vx * 0.55
      p.vy += c.vy * 0.55
      spring2D(p, p.ox, p.oy, 0.04, 0.88)
    })
    drawLines(P, 55, 4, (pi, pj, dist, alpha) => `rgba(124,92,255,${alpha})`)
    ctx.fillStyle = 'rgba(46,230,166,0.80)'
    P.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 09  Morph Rewire ──────────────────────────────────────────────────────────
// title: Morph Rewire
// desc: The word morphs between CREATE and DEVOUR. As particles spring between
//       layouts the connections rewire in real time — near mid-transition both
//       endpoints are in flight and the web nearly dissolves, then reforms.
// tags: morph, word-transition, connections, rewire, spring-physics
function anim_09() {
  if (!anim_09.P) {
    const ptsA = sampleText(WORD_A, 6)
    const ptsB = sampleText(WORD_B, 6)
    const n = Math.max(ptsA.length, ptsB.length)
    const A = padTo(ptsA, n)
    const B = padTo(ptsB, n)
    for (let i = B.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [B[i], B[j]] = [B[j], B[i]]
    }
    anim_09.P   = A.map((a, i) => ({ x: a.x, y: a.y, vx: 0, vy: 0, ax: A[i].x, ay: A[i].y, bx: B[i].x, by: B[i].y }))
    anim_09.toB = false
  }
  anim_09.toB = !anim_09.toB
  const P = anim_09.P
  loop(() => {
    ctx.fillStyle = 'rgba(8,10,15,0.20)'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      const tx = anim_09.toB ? p.bx : p.ax
      const ty = anim_09.toB ? p.by : p.ay
      spring2D(p, tx, ty, 0.06, 0.80)
    })
    // Connections: alpha scales with how settled both endpoints are
    ctx.lineWidth = 0.6
    for (let i = 0; i < P.length; i++) {
      let links = 0
      for (let j = i + 1; j < P.length; j++) {
        if (links >= 4) break
        const dx = P[i].x - P[j].x
        const dy = P[i].y - P[j].y
        const dist = Math.hypot(dx, dy)
        if (dist < 55) {
          links++
          const tiTx = anim_09.toB ? P[i].bx : P[i].ax
          const tiTy = anim_09.toB ? P[i].by : P[i].ay
          const tjTx = anim_09.toB ? P[j].bx : P[j].ax
          const tjTy = anim_09.toB ? P[j].by : P[j].ay
          const settledI = Math.max(0, 1 - Math.hypot(P[i].x - tiTx, P[i].y - tiTy) / 120)
          const settledJ = Math.max(0, 1 - Math.hypot(P[j].x - tjTx, P[j].y - tjTy) / 120)
          const settled = settledI * settledJ
          const alpha = (1 - dist / 55) * 0.45 * settled
          const r = Math.round(124 + (46  - 124) * (anim_09.toB ? settled : 1 - settled))
          const g = Math.round(92  + (230 - 92)  * (anim_09.toB ? settled : 1 - settled))
          const b = Math.round(255 + (166 - 255) * (anim_09.toB ? settled : 1 - settled))
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`
          ctx.beginPath()
          ctx.moveTo(P[i].x, P[i].y)
          ctx.lineTo(P[j].x, P[j].y)
          ctx.stroke()
        }
      }
    }
    P.forEach(p => {
      const tx = anim_09.toB ? p.bx : p.ax
      const ty = anim_09.toB ? p.by : p.ay
      const progress = 1 - Math.min(1, Math.hypot(p.x - tx, p.y - ty) / 200)
      const tColor = anim_09.toB ? progress : 1 - progress
      const r = Math.round(124 + (46  - 124) * tColor)
      const g = Math.round(92  + (230 - 92)  * tColor)
      const b = Math.round(255 + (166 - 255) * tColor)
      ctx.fillStyle = `rgba(${r},${g},${b},${0.4 + progress * 0.5})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

// ── 10  Shockwave Web ─────────────────────────────────────────────────────────
// title: Shockwave Web
// desc: Particles rest with connections drawn. Clicking detonates a shockwave
//       that flings nearby particles outward. The connection radius locally
//       stretches near the blast point — the web tears dramatically then knits
//       back together as particles spring home.
// tags: shockwave, click-interaction, connections, explosion, spring-physics
function anim_10() {
  if (anim_10._det) cv.removeEventListener('click', anim_10._det)

  const pts = sampleText(WORD, 6)
  const P = pts.map(o => ({ x: o.x, y: o.y, vx: 0, vy: 0, ox: o.x, oy: o.y }))
  const BLAST_R = 140, FORCE = 20
  const BASE_DIST = 55

  anim_10._blastX = -9999
  anim_10._blastY = -9999
  anim_10._blastT = -9999

  anim_10._det = e => {
    const bx = e.clientX, by = e.clientY
    anim_10._blastX = bx
    anim_10._blastY = by
    anim_10._blastT = performance.now()
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
  cv.addEventListener('click', anim_10._det)

  loop(() => {
    ctx.fillStyle = '#080A0F'
    ctx.fillRect(0, 0, cv.width, cv.height)
    P.forEach(p => {
      spring2D(p, p.ox, p.oy, 0.06, 0.80)
    })
    // Stretched connection web near blast
    ctx.lineWidth = 0.6
    const blastAge = (performance.now() - anim_10._blastT) / 1000
    const blastDecay = Math.max(0, 1 - blastAge * 0.8)
    for (let i = 0; i < P.length; i++) {
      let links = 0
      for (let j = i + 1; j < P.length; j++) {
        if (links >= 4) break
        const dx = P[i].x - P[j].x
        const dy = P[i].y - P[j].y
        const dist = Math.hypot(dx, dy)
        const midX = (P[i].x + P[j].x) / 2
        const midY = (P[i].y + P[j].y) / 2
        const blastDist = Math.hypot(midX - anim_10._blastX, midY - anim_10._blastY)
        const localMax = BASE_DIST + Math.max(0, (140 - blastDist) / 140) * 80 * blastDecay
        if (dist < localMax) {
          links++
          const alpha = (1 - dist / localMax) * 0.45
          const heat = Math.max(0, (1 - blastDist / 140)) * blastDecay
          const r = Math.round(124 + (255 - 124) * heat)
          const g = Math.round(92  + (180 - 92)  * heat)
          ctx.strokeStyle = `rgba(${r},${g},255,${alpha})`
          ctx.beginPath()
          ctx.moveTo(P[i].x, P[i].y)
          ctx.lineTo(P[j].x, P[j].y)
          ctx.stroke()
        }
      }
    }
    // Particles
    P.forEach(p => {
      const heat = Math.min(1, Math.hypot(p.x - p.ox, p.y - p.oy) / 80)
      const r = Math.round(124 + (255 - 124) * heat)
      const g = Math.round(92  + (255 - 92)  * heat)
      ctx.fillStyle = `rgba(${r},${g},255,0.85)`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.2 + heat * 1.2, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}


// ─── Start ─────────────────────────────────────────────────────────────────────
run(anim_01)
