/* ═══════════════════════════════════════════════════════════════════════════
   FOURIER EPICYCLES — jeanphilippebelley.com
   ─────────────────────────────────────────────────────────────────────────
   title: Fourier Epicycles Text Animations
   desc:  10 canvas animations that decompose text outlines into rotating
          circles using the Discrete Fourier Transform. Each circle spins at
          a different frequency; their chained tips trace letterforms. Explore
          harmonic build-up, phase drift, spectral colour, word morphing, and
          slow spirographic accumulation — mathematics made visible.
   tags:  fourier, epicycles, canvas, text-animation, mathematics
   ─────────────────────────────────────────────────────────────────────────
   HTML — paste in the HTML pane:
   ─────────────────────────────────────────────────────────────────────────

   <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300&display=swap" rel="stylesheet">

   <canvas id="cv"></canvas>
   <button id="replay">↺ replay</button>
   <a href="https://jeanphilippebelley.com/" target="_blank" id="credit">
     JP<span>.</span>
   </a>

   ─────────────────────────────────────────────────────────────────────────
   CSS — paste in the CSS pane:
   ─────────────────────────────────────────────────────────────────────────

   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

   body { background: #07070f; overflow: hidden; min-height: 100vh; }

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
   #credit span { color: rgba(100,180,255,0.55); }
   #credit:hover { color: rgba(255,255,255,0.4); }

   ═══════════════════════════════════════════════════════════════════════════
   In the JS pane keep only ONE call at the bottom:
     run(anim_XX)   ← change XX (01–10) to switch
   ═══════════════════════════════════════════════════════════════════════ */


// ─── Canvas ────────────────────────────────────────────────────────────────────
const cv  = document.getElementById('cv')
const ctx = cv.getContext('2d')
const BTN = document.getElementById('replay')
let W, H

function resize() {
  W = cv.width  = window.innerWidth
  H = cv.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

BTN.addEventListener('click', () => run(run.cur))

// ─── Default text ──────────────────────────────────────────────────────────────
const WORD   = 'FORM'    // primary word
const WORD_A = 'FLOW'    // anim_09 source
const WORD_B = 'FORM'    // anim_09 target

// ─── Loop ──────────────────────────────────────────────────────────────────────
// Second argument `cleanup` is called when the loop is restarted.
function loop(tick, cleanup) {
  loop.id && cancelAnimationFrame(loop.id)
  cleanup && cleanup()
  ;(function f() { tick() || (loop.id = requestAnimationFrame(f)) })()
}

function run(fn) {
  run.cur = fn
  ctx.clearRect(0, 0, W, H)
  fn()
}

// ─── Path extraction ───────────────────────────────────────────────────────────
// Renders text onto an offscreen canvas, collects edge pixels (filled pixels
// adjacent to at least one transparent pixel), sorts them by polar angle from
// the centroid — giving an approximately continuous outline — then downsamples
// to nPts and centers at the origin. Points are scaled to fill ~30% of the
// shorter screen dimension so the text is viewport-responsive.
function extractPath(text, nPts = 220) {
  const PW = 800, PH = 300
  const oc = Object.assign(document.createElement('canvas'), { width: PW, height: PH })
  const ox = oc.getContext('2d')
  ox.font          = `900 ${Math.round(PH * 0.70)}px "Arial Black", "Helvetica Neue", sans-serif`
  ox.textAlign     = 'center'
  ox.textBaseline  = 'middle'
  ox.fillText(text, PW / 2, PH / 2)
  const px = ox.getImageData(0, 0, PW, PH).data

  const edge = []
  for (let y = 1; y < PH - 1; y++) {
    for (let x = 1; x < PW - 1; x++) {
      const i = (y * PW + x) * 4
      if (px[i + 3] > 128 && (
        px[((y-1)*PW + x)*4 + 3] < 128 ||
        px[((y+1)*PW + x)*4 + 3] < 128 ||
        px[(y*PW + x-1)*4 + 3]   < 128 ||
        px[(y*PW + x+1)*4 + 3]   < 128
      )) edge.push({ x, y })
    }
  }
  if (!edge.length) return []

  const mx = edge.reduce((s, p) => s + p.x, 0) / edge.length
  const my = edge.reduce((s, p) => s + p.y, 0) / edge.length

  // Sort by polar angle → roughly continuous path around the outline
  edge.sort((a, b) => Math.atan2(a.y - my, a.x - mx) - Math.atan2(b.y - my, b.x - mx))

  // Scale so the farthest edge pixel reaches 30% of the shorter viewport side
  const maxR  = edge.reduce((m, p) => Math.max(m, Math.hypot(p.x - mx, p.y - my)), 0)
  const scale = maxR > 0 ? Math.min(W, H) * 0.30 / maxR : 1

  const step = edge.length / nPts
  return Array.from({ length: nPts }, (_, i) => {
    const p = edge[Math.round(i * step) % edge.length]
    return { x: (p.x - mx) * scale, y: (p.y - my) * scale }
  })
}

// ─── DFT ───────────────────────────────────────────────────────────────────────
// Treats each point as a complex number (x + iy) and computes the full DFT.
// sorted=true  → returns terms ordered by amplitude (largest first).
// sorted=false → returns terms in frequency order (0, 1, 2, …) for morphing.
function dft(pts, sorted = true) {
  const N = pts.length
  const X = Array.from({ length: N }, (_, k) => {
    let re = 0, im = 0
    for (let n = 0; n < N; n++) {
      const phi = 2 * Math.PI * k * n / N
      const c = Math.cos(phi), s = Math.sin(phi)
      re += pts[n].x * c + pts[n].y * s
      im += -pts[n].x * s + pts[n].y * c
    }
    re /= N; im /= N
    return { re, im, freq: k, amp: Math.hypot(re, im), phase: Math.atan2(im, re) }
  })
  return sorted ? X.sort((a, b) => b.amp - a.amp) : X
}

// ─── Epicycles renderer ────────────────────────────────────────────────────────
// Draws nTerms rotating arms chained from (cx, cy) at fractional time t ∈ [0,1).
// Pass null for armCol or circleCol to skip drawing those elements.
// Returns the tip {x, y} of the last arm.
function epicycles(F, t, nTerms, cx, cy, armCol, circleCol) {
  let x = cx, y = cy
  const n = Math.min(nTerms, F.length)
  for (let i = 0; i < n; i++) {
    const { amp, phase, freq } = F[i]
    const angle = 2 * Math.PI * freq * t + phase
    const nx = x + amp * Math.cos(angle)
    const ny = y + amp * Math.sin(angle)
    if (circleCol && amp > 0.5) {
      ctx.beginPath(); ctx.arc(x, y, amp, 0, Math.PI * 2)
      ctx.strokeStyle = circleCol; ctx.lineWidth = 0.5; ctx.stroke()
    }
    if (armCol) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny)
      ctx.strokeStyle = armCol; ctx.lineWidth = 1; ctx.stroke()
    }
    x = nx; y = ny
  }
  return { x, y }
}


// ─── ANIMATIONS ───────────────────────────────────────────────────────────────


// ── 01  Classic Orbit ──────────────────────────────────────────────────────────
// title: Classic Orbit
// desc:  The full Fourier decomposition rendered as a chain of rotating arms.
//        Every harmonic contributes its circle; their combined tip traces the
//        word outline once per period. The canonical epicycle experience — pure
//        mathematics, pure motion.
// tags:  fourier, epicycles, orbit, classic, mathematics
function anim_01() {
  const pts   = extractPath(WORD)
  const F     = dft(pts)
  const N     = F.length
  const trail = []
  let t = 0

  loop(() => {
    ctx.fillStyle = 'rgba(7,7,15,0.22)'
    ctx.fillRect(0, 0, W, H)

    const tip = epicycles(F, t, N, W/2, H/2,
      'rgba(255,255,255,0.50)', 'rgba(255,255,255,0.06)')

    trail.push({ x: tip.x, y: tip.y })
    if (trail.length > N) trail.shift()

    if (trail.length > 1) {
      ctx.beginPath()
      trail.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))
      ctx.closePath()
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'
      ctx.lineWidth   = 1.5
      ctx.stroke()
    }

    ctx.beginPath()
    ctx.arc(tip.x, tip.y, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()

    t = (t + 1 / N) % 1
    return false
  })
}


// ── 02  Harmonic Build ─────────────────────────────────────────────────────────
// title: Harmonic Build
// desc:  Starts with only the single largest-amplitude harmonic and adds one
//        more every few frames. The rough circle gradually sharpens into the
//        word as harmonics accumulate — Fourier's convergence theorem made
//        visible in real time.
// tags:  fourier, harmonics, emergence, convergence, build
function anim_02() {
  const pts   = extractPath(WORD)
  const F     = dft(pts)       // sorted by amplitude
  const N     = F.length
  const trail = []
  let t = 0, terms = 1, f = 0

  loop(() => {
    ctx.fillStyle = 'rgba(7,7,15,0.20)'
    ctx.fillRect(0, 0, W, H)

    // Ghost of the full shape at very low opacity
    epicycles(F, t, N, W/2, H/2, null, 'rgba(255,255,255,0.03)')

    const tip = epicycles(F, t, terms, W/2, H/2,
      'rgba(255,255,255,0.55)', 'rgba(255,255,255,0.08)')

    trail.push({ x: tip.x, y: tip.y })
    if (trail.length > N) trail.shift()

    if (trail.length > 1) {
      ctx.beginPath()
      trail.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))
      ctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.55 * terms / N})`
      ctx.lineWidth   = 1.5
      ctx.stroke()
    }

    f++
    if (f % 7 === 0 && terms < N) { terms++; trail.length = 0 }

    t = (t + 1 / N) % 1
    return false
  })
}


// ── 03  Spectral Arms ──────────────────────────────────────────────────────────
// title: Spectral Arms
// desc:  Each rotating arm is coloured by its frequency index — low harmonics
//        burn red, high harmonics cool to violet. The tip trail is painted with
//        the hue of the dominant arm at each moment, mapping the word's outline
//        as a continuous frequency spectrum.
// tags:  fourier, spectrum, colour, frequency, rainbow
function anim_03() {
  const pts   = extractPath(WORD)
  const F     = dft(pts)
  const N     = F.length
  const trail = []
  let t = 0

  loop(() => {
    ctx.fillStyle = 'rgba(7,7,15,0.20)'
    ctx.fillRect(0, 0, W, H)

    let x = W/2, y = H/2
    for (let i = 0; i < N; i++) {
      const { amp, phase, freq } = F[i]
      const angle = 2 * Math.PI * freq * t + phase
      const nx = x + amp * Math.cos(angle)
      const ny = y + amp * Math.sin(angle)
      const hue = (i / N) * 280 + 20   // red → violet across the harmonic series
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny)
      ctx.strokeStyle = `hsla(${hue},90%,65%,0.55)`
      ctx.lineWidth   = 1
      ctx.stroke()
      x = nx; y = ny
    }

    const hue = ((t * N) / N) * 280 + 20
    trail.push({ x, y, hue })
    if (trail.length > N) trail.shift()

    for (let i = 1; i < trail.length; i++) {
      ctx.beginPath()
      ctx.moveTo(trail[i-1].x, trail[i-1].y)
      ctx.lineTo(trail[i].x,   trail[i].y)
      ctx.strokeStyle = `hsl(${trail[i].hue},90%,72%)`
      ctx.lineWidth   = 2
      ctx.stroke()
    }

    t = (t + 1 / N) % 1
    return false
  })
}


// ── 04  Phase Drift ────────────────────────────────────────────────────────────
// title: Phase Drift
// desc:  Each epicycle has an independent, tiny phase drift applied every frame.
//        The letterform slowly warps and breathes as harmonics wander from their
//        true positions — a quiet, organic hallucination of the word that never
//        fully loses its shape.
// tags:  fourier, phase, drift, organic, deformation
function anim_04() {
  const pts    = extractPath(WORD)
  const F      = dft(pts)
  const N      = F.length
  const drifts = F.map(() => (Math.random() - 0.5) * 0.004)
  const offsets = new Float64Array(N)
  const trail  = []
  let t = 0

  loop(() => {
    ctx.fillStyle = 'rgba(7,7,15,0.16)'
    ctx.fillRect(0, 0, W, H)

    for (let i = 0; i < N; i++) offsets[i] += drifts[i]

    let x = W/2, y = H/2
    for (let i = 0; i < N; i++) {
      const { amp, phase, freq } = F[i]
      const angle = 2 * Math.PI * freq * t + phase + offsets[i]
      const nx = x + amp * Math.cos(angle)
      const ny = y + amp * Math.sin(angle)
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny)
      ctx.strokeStyle = 'rgba(160,195,255,0.30)'
      ctx.lineWidth   = 0.8
      ctx.stroke()
      x = nx; y = ny
    }

    trail.push({ x, y })
    if (trail.length > N) trail.shift()

    if (trail.length > 1) {
      ctx.beginPath()
      trail.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))
      ctx.strokeStyle = 'rgba(190,215,255,0.75)'
      ctx.lineWidth   = 1.6
      ctx.stroke()
    }

    t = (t + 1 / N) % 1
    return false
  })
}


// ── 05  Amplitude Breath ───────────────────────────────────────────────────────
// title: Amplitude Breath
// desc:  All epicycle amplitudes scale together with a slow sine — the word
//        contracts toward a single point then blooms back beyond its natural
//        size, inhaling and exhaling in a continuous rhythm. The circles reveal
//        the underlying orbital structure of the text.
// tags:  fourier, breath, scale, oscillation, organic
function anim_05() {
  const pts   = extractPath(WORD)
  const F     = dft(pts)
  const N     = F.length
  const trail = []
  let t = 0, s = 0

  loop(() => {
    ctx.fillStyle = 'rgba(7,7,15,0.20)'
    ctx.fillRect(0, 0, W, H)

    s += 0.014
    const scale = 1.0 + Math.sin(s) * 0.38

    let x = W/2, y = H/2
    for (let i = 0; i < N; i++) {
      const { amp, phase, freq } = F[i]
      const r     = amp * scale
      const angle = 2 * Math.PI * freq * t + phase
      const nx    = x + r * Math.cos(angle)
      const ny    = y + r * Math.sin(angle)
      if (r > 0.5) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.5; ctx.stroke()
      }
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny)
      ctx.strokeStyle = 'rgba(255,255,255,0.40)'; ctx.lineWidth = 1; ctx.stroke()
      x = nx; y = ny
    }

    trail.push({ x, y })
    if (trail.length > N) trail.shift()

    if (trail.length > 1) {
      ctx.beginPath()
      trail.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'
      ctx.lineWidth   = 1.8
      ctx.stroke()
    }

    t = (t + 1 / N) % 1
    return false
  })
}


// ── 06  Echo Orbit ─────────────────────────────────────────────────────────────
// title: Echo Orbit
// desc:  Three epicycle systems run simultaneously at equal phase offsets —
//        0, ⅓, and ⅔ of the full cycle — each tinted a different colour.
//        Their trails overlap and interfere, building a layered, luminous
//        echo of the word from three perspectives at once.
// tags:  fourier, echo, layered, multiple, interference
function anim_06() {
  const pts    = extractPath(WORD)
  const F      = dft(pts)
  const N      = F.length
  const colors = [
    ['rgba(100,170,255,', 'rgba(100,170,255,'],
    ['rgba(255,110,90,',  'rgba(255,110,90,'],
    ['rgba(100,230,160,', 'rgba(100,230,160,'],
  ]
  const trails = [[], [], []]
  let t = 0

  loop(() => {
    ctx.fillStyle = 'rgba(7,7,15,0.16)'
    ctx.fillRect(0, 0, W, H)

    ;[0, 1/3, 2/3].forEach((off, ci) => {
      const tip = epicycles(F, (t + off) % 1, N, W/2, H/2,
        `${colors[ci][0]}0.30)`, null)
      trails[ci].push({ x: tip.x, y: tip.y })
      if (trails[ci].length > N) trails[ci].shift()

      if (trails[ci].length > 1) {
        ctx.beginPath()
        trails[ci].forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))
        ctx.strokeStyle = `${colors[ci][1]}0.70)`
        ctx.lineWidth   = 1.6
        ctx.stroke()
      }
    })

    t = (t + 1 / N) % 1
    return false
  })
}


// ── 07  Minimal Sketch ─────────────────────────────────────────────────────────
// title: Minimal Sketch
// desc:  Only the 8 largest-amplitude harmonics are active. The tip traces a
//        rough, wobbly approximation — a Fourier sketch that captures the word's
//        gesture without its detail. The complete ghost of all circles glows
//        faintly behind as reference.
// tags:  fourier, minimal, sketch, approximation, low-frequency
function anim_07() {
  const pts   = extractPath(WORD)
  const F     = dft(pts)
  const N     = F.length
  const TERMS = 8
  const trail = []
  let t = 0

  loop(() => {
    ctx.fillStyle = 'rgba(7,7,15,0.18)'
    ctx.fillRect(0, 0, W, H)

    // Faint ghost of full system
    epicycles(F, t, N, W/2, H/2, null, 'rgba(255,255,255,0.025)')

    const tip = epicycles(F, t, TERMS, W/2, H/2,
      'rgba(255,210,70,0.75)', 'rgba(255,210,70,0.12)')

    trail.push({ x: tip.x, y: tip.y })
    if (trail.length > N) trail.shift()

    if (trail.length > 1) {
      ctx.beginPath()
      trail.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))
      ctx.strokeStyle = 'rgba(255,210,70,0.90)'
      ctx.lineWidth   = 2
      ctx.stroke()
    }

    ctx.beginPath()
    ctx.arc(tip.x, tip.y, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#ffd240'
    ctx.fill()

    t = (t + 1 / N) % 1
    return false
  })
}


// ── 08  Velocity Glow ──────────────────────────────────────────────────────────
// title: Velocity Glow
// desc:  The tip trail is coloured by instantaneous speed. Slow sections glow
//        cool blue, fast sections heat to white. Tight corners and serif
//        details run cold; sweeping strokes accelerate to full brightness —
//        the letterforms become their own thermal map.
// tags:  fourier, velocity, thermal, colour, speed
function anim_08() {
  const pts   = extractPath(WORD)
  const F     = dft(pts)
  const N     = F.length
  const trail = []
  let t = 0, prevTip = null

  loop(() => {
    ctx.fillStyle = 'rgba(7,7,15,0.18)'
    ctx.fillRect(0, 0, W, H)

    // Arms only, no circles
    const tip = epicycles(F, t, N, W/2, H/2, 'rgba(255,255,255,0.18)', null)

    let speed = 0
    if (prevTip) speed = Math.hypot(tip.x - prevTip.x, tip.y - prevTip.y)
    prevTip = { x: tip.x, y: tip.y }

    const n = Math.min(speed / 10, 1)       // 0 = slow, 1 = fast
    const hue    = 220 - n * 220            // 220 (blue) → 0 (red)
    const lum    = 45  + n * 40            // 45% → 85%
    trail.push({ x: tip.x, y: tip.y, hue, lum })
    if (trail.length > N) trail.shift()

    for (let i = 1; i < trail.length; i++) {
      const p = trail[i]
      ctx.beginPath()
      ctx.moveTo(trail[i-1].x, trail[i-1].y)
      ctx.lineTo(p.x, p.y)
      ctx.strokeStyle = `hsl(${p.hue},85%,${p.lum}%)`
      ctx.lineWidth   = 2
      ctx.stroke()
    }

    t = (t + 1 / N) % 1
    return false
  })
}


// ── 09  Word Morph ─────────────────────────────────────────────────────────────
// title: Word Morph
// desc:  Two words — FLOW and FORM — are each decomposed by the DFT. Their
//        Fourier coefficients interpolate smoothly at matching frequencies, so
//        the epicycle chain reshapes from one word into the other and back in a
//        seamless loop. The trail shifts from blue to amber as the morph advances.
// tags:  fourier, morph, interpolation, transform, words
function anim_09() {
  // Use frequency-ordered (unsorted) DFT so index k ↔ frequency k in both words
  const FA = dft(extractPath(WORD_A), false)
  const FB = dft(extractPath(WORD_B), false)
  const N  = FA.length

  const trail = []
  let t = 0, blend = 0, dir = 1, hold = 0

  function blended() {
    return FA.map((a, i) => {
      const b = FB[i]
      const re = a.re + (b.re - a.re) * blend
      const im = a.im + (b.im - a.im) * blend
      return { re, im, freq: a.freq, amp: Math.hypot(re, im), phase: Math.atan2(im, re) }
    }).sort((a, b) => b.amp - a.amp)
  }

  loop(() => {
    ctx.fillStyle = 'rgba(7,7,15,0.20)'
    ctx.fillRect(0, 0, W, H)

    if (hold > 0) {
      hold--
    } else {
      blend = Math.max(0, Math.min(1, blend + dir * 0.007))
      if (blend >= 1 || blend <= 0) { dir = -dir; hold = 50 }
    }

    const F   = blended()
    const tip = epicycles(F, t, N, W/2, H/2,
      'rgba(255,255,255,0.40)', 'rgba(255,255,255,0.05)')

    trail.push({ x: tip.x, y: tip.y })
    if (trail.length > N) trail.shift()

    if (trail.length > 1) {
      ctx.beginPath()
      trail.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))
      // Blue (FLOW) → amber (FORM)
      const r = Math.round(90  + blend * 165)
      const g = Math.round(170 - blend * 80)
      const b = Math.round(255 - blend * 165)
      ctx.strokeStyle = `rgba(${r},${g},${b},0.85)`
      ctx.lineWidth   = 1.8
      ctx.stroke()
    }

    t = (t + 1 / N) % 1
    return false
  })
}


// ── 10  Slow Spirograph ────────────────────────────────────────────────────────
// title: Slow Spirograph
// desc:  Rotation runs at 40% speed with near-zero background fade — each
//        cycle's tip trail almost never erases. Over time the paths accumulate
//        into a dense, luminous spirograph that fills in the letterforms through
//        pure repetition. The hue cycles with time, layering colour into the
//        growing figure.
// tags:  fourier, spirograph, accumulation, slow, meditative
function anim_10() {
  const pts = extractPath(WORD)
  const F   = dft(pts)
  const N   = F.length
  let t = 0, prevTip = null, hueBase = 0

  // Don't pre-clear — accumulate on a bare canvas
  ctx.clearRect(0, 0, W, H)

  loop(() => {
    // Very slow fade so paths persist for many cycles
    ctx.fillStyle = 'rgba(7,7,15,0.025)'
    ctx.fillRect(0, 0, W, H)

    // Compute tip without drawing arms
    const tip = epicycles(F, t, N, W/2, H/2, null, null)

    if (prevTip) {
      ctx.beginPath()
      ctx.moveTo(prevTip.x, prevTip.y)
      ctx.lineTo(tip.x, tip.y)
      ctx.strokeStyle = `hsl(${hueBase + t * 360},75%,65%)`
      ctx.lineWidth   = 1.2
      ctx.stroke()
    }
    prevTip = { x: tip.x, y: tip.y }

    t = (t + 0.40 / N) % 1
    if (t < 0.001) hueBase = (hueBase + 35) % 360  // shift hue every cycle
    return false
  })
}


// ─── Start ────────────────────────────────────────────────────────────────────
run(anim_01)
