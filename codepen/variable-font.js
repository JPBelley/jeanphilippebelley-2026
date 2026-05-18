/* ═══════════════════════════════════════════════════════════════════════════
   VARIABLE FONT — jeanphilippebelley.com
   ─────────────────────────────────────────────────────────────────────────
   title: Variable Font Spring Animations
   desc:  10 animations that spring-animate variable font axes — weight,
          casual, slant, and cursive — directly on each character. No canvas,
          no transforms: the letterforms themselves deform in response to
          physics, mouse, and time. Uses the Recursive variable font (5 axes).
   tags:  variable-fonts, spring-physics, text-animation, typography, javascript
   ─────────────────────────────────────────────────────────────────────────
   HTML — paste in the HTML pane:
   ─────────────────────────────────────────────────────────────────────────

   <link href="https://fonts.googleapis.com/css2?family=Recursive:wght,CASL,MONO,slnt,CRSV@300..1000,0..1,0..1,-15..0,0..1&display=swap" rel="stylesheet">

   <div id="stage">
     <span class="label">variable font</span>
     <h1 class="text">Always</h1>
     <div class="baseline"></div>
     <button id="replay">↺ replay</button>
   </div>

   <a href="https://jeanphilippebelley.com/" target="_blank" id="credit">
     JP<span>.</span>
   </a>

   ─────────────────────────────────────────────────────────────────────────
   CSS — paste in the CSS pane:
   ─────────────────────────────────────────────────────────────────────────

   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

   body {
     background: #F0EAE0;
     display: flex;
     align-items: center;
     justify-content: center;
     min-height: 100vh;
   }

   #stage {
     display: flex;
     flex-direction: column;
     align-items: flex-start;
     padding: 40px 48px;
     position: relative;
   }

   .label {
     font-family: 'Recursive', monospace;
     font-size: 10px;
     letter-spacing: 0.18em;
     text-transform: uppercase;
     color: #B0A090;
     margin-bottom: 20px;
     font-variation-settings: 'wght' 300, 'MONO' 1;
   }

   .text {
     font-family: 'Recursive', sans-serif;
     font-size: clamp(52px, 10vw, 120px);
     font-weight: 400;
     color: #0E0C09;
     letter-spacing: -0.025em;
     line-height: 1;
     display: flex;
     flex-wrap: wrap;
   }

   .char {
     display: inline-block;
     white-space: pre;
   }

   .baseline {
     width: 100%;
     height: 1px;
     background: #0E0C09;
     margin-top: 18px;
     opacity: 0.18;
   }

   #replay {
     margin-top: 28px;
     padding: 0;
     background: none;
     border: none;
     font-family: 'Recursive', monospace;
     font-size: 11px;
     letter-spacing: 0.12em;
     color: #E6100F;
     cursor: pointer;
     text-transform: lowercase;
     transition: opacity 0.2s;
     font-variation-settings: 'wght' 300, 'MONO' 1;
   }
   #replay:hover { opacity: 0.6; }

   #credit {
     position: fixed;
     bottom: 20px;
     right: 24px;
     font-family: 'Recursive', monospace;
     font-size: 11px;
     letter-spacing: 0.1em;
     color: rgba(14,12,9,0.25);
     text-decoration: none;
     transition: color 0.2s;
     font-variation-settings: 'wght' 300, 'MONO' 1;
   }
   #credit span { color: #E6100F; }
   #credit:hover { color: rgba(14,12,9,0.6); }

   ═══════════════════════════════════════════════════════════════════════════
   Axes available in Recursive:
     wght  300 – 1000   weight
     CASL  0 – 1        casual (geometric → handwritten curves)
     MONO  0 – 1        proportional → monospaced
     slnt  -15 – 0      slant (upright → italic lean)
     CRSV  0 – 1        cursive (affects a, f, i glyphs)
   ─────────────────────────────────────────────────────────────────────────
   In the JS pane keep only ONE call at the bottom:
     run(anim_XX)   ← change XX (01–10) to switch
   ═══════════════════════════════════════════════════════════════════════ */


// ─── DOM ──────────────────────────────────────────────────────────────────────
const TEXT = document.querySelector('.text')
const BTN  = document.getElementById('replay')

// ─── Mouse ────────────────────────────────────────────────────────────────────
const mouse = { x: -9999, y: -9999 }
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY })
window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999 })

// ─── Split ────────────────────────────────────────────────────────────────────
function split(el) {
  const raw = el.textContent
  el.textContent = ''
  return raw.split('').map(ch => {
    const s = document.createElement('span')
    s.className = 'char'
    s.textContent = ch
    el.appendChild(s)
    return s
  })
}

function run(fn) { fn(); BTN.onclick = fn }

// ─── Spring ───────────────────────────────────────────────────────────────────
// 1-D spring. Mutates s = { pos, vel }. Returns true when settled.
function spring(s, target, k = 0.08, d = 0.72) {
  s.vel += (target - s.pos) * k
  s.vel *= d
  s.pos += s.vel
  return Math.abs(s.vel) + Math.abs(target - s.pos) < 0.05
}

// ─── Loop ─────────────────────────────────────────────────────────────────────
let _raf = null, _cleanup = () => {}
function loop(onTick, cleanup = () => {}) {
  cancelAnimationFrame(_raf)
  _cleanup(); _cleanup = cleanup
  function tick() { if (!onTick()) _raf = requestAnimationFrame(tick) }
  _raf = requestAnimationFrame(tick)
}

// ─── Axis helper ──────────────────────────────────────────────────────────────
// Applies font-variation-settings to a char from axis state objects.
// s = { wght, casl, slnt, crsv } — each is { pos, vel } or a plain number.
function setAxes(ch, w, c = 0, sl = 0, cr = 0) {
  ch.style.fontVariationSettings =
    `'wght' ${Math.max(300, Math.min(1000, w)).toFixed(0)}, ` +
    `'CASL' ${Math.max(0, Math.min(1, c)).toFixed(3)}, `     +
    `'slnt' ${Math.max(-15, Math.min(0, sl)).toFixed(2)}, `  +
    `'CRSV' ${Math.max(0, Math.min(1, cr)).toFixed(3)}`
}


// ─── ANIMATIONS ───────────────────────────────────────────────────────────────

// ── 01  Weight Tide ───────────────────────────────────────────────────────────
// title: Weight Tide
// desc: A sine wave of weight travels left to right across the word, each
//       character cresting from thin (300) to heavy (820) in sequence. The
//       letterforms swell and thin continuously like a typographic tide.
// tags: variable-fonts, weight, sine-wave, continuous, spring-physics
function anim_01() {
  const chars = split(TEXT)
  const st = chars.map(() => ({ wght: { pos: 500, vel: 0 } }))
  let t = 0
  loop(() => {
    t += 0.022
    chars.forEach((ch, i) => {
      spring(st[i].wght, 500 + Math.sin(t - i * 0.55) * 320, 0.12, 0.72)
      setAxes(ch, st[i].wght.pos)
    })
    return false
  })
}

// ── 02  Cursor Pull ───────────────────────────────────────────────────────────
// title: Cursor Pull
// desc: Characters near the cursor grow thin and casual — as if the mouse
//       is draining the ink from them. Move away and they spring back to
//       their normal weight, casual axis returning to geometric at rest.
// tags: variable-fonts, cursor-interaction, weight, casual, spring-physics
function anim_02() {
  const chars = split(TEXT)
  const rects = chars.map(ch => ch.getBoundingClientRect())
  const st = chars.map(() => ({
    wght: { pos: 500, vel: 0 },
    casl: { pos: 0,   vel: 0 },
  }))
  loop(() => {
    chars.forEach((ch, i) => {
      const r  = rects[i]
      const cx = r.left + r.width / 2
      const cy = r.top  + r.height / 2
      const dist      = Math.hypot(cx - mouse.x, cy - mouse.y)
      const influence = Math.max(0, 1 - dist / 160)
      spring(st[i].wght, 500 - influence * 250, 0.10, 0.72)
      spring(st[i].casl, influence * 0.9,        0.10, 0.72)
      setAxes(ch, st[i].wght.pos, st[i].casl.pos)
    })
    return false
  })
}

// ── 03  Multi-Axis Entrance ───────────────────────────────────────────────────
// title: Multi-Axis Entrance
// desc: Each character enters from an extreme state — heavy, casual, slanted,
//       invisible — and three axes spring to neutral simultaneously with stagger.
//       Watching weight, curve, and lean converge at different rates makes the
//       settlement feel layered and alive.
// tags: variable-fonts, entrance-animation, multi-axis, spring-physics, stagger
function anim_03() {
  const chars = split(TEXT)
  const st = chars.map(() => ({
    wght: { pos: 920, vel: 0 },
    casl: { pos: 1.0, vel: 0 },
    slnt: { pos: -14, vel: 0 },
    op:   0, opv: 0,
  }))
  let f = 0
  loop(() => {
    f++
    let done = true
    chars.forEach((ch, i) => {
      if (f < i * 3) { done = false; return }
      if (!spring(st[i].wght, 420, 0.07, 0.68)) done = false
      if (!spring(st[i].casl, 0,   0.07, 0.68)) done = false
      if (!spring(st[i].slnt, 0,   0.07, 0.68)) done = false
      st[i].opv += (1 - st[i].op) * 0.10; st[i].opv *= 0.72; st[i].op += st[i].opv
      ch.style.opacity = st[i].op
      setAxes(ch, st[i].wght.pos, st[i].casl.pos, st[i].slnt.pos)
    })
    return done
  })
}

// ── 04  Breath ────────────────────────────────────────────────────────────────
// title: Breath
// desc: The word breathes slowly — weight swells and drops on a long sine
//       cycle while the casual axis moves in the opposite phase. Heavy means
//       geometric; light means curved and handwritten. One continuous inhale
//       and exhale through the letterforms.
// tags: variable-fonts, breathing, weight, casual, continuous
function anim_04() {
  const chars = split(TEXT)
  const st = chars.map(() => ({
    wght: { pos: 420, vel: 0 },
    casl: { pos: 0,   vel: 0 },
  }))
  let t = 0
  loop(() => {
    t += 0.008
    const w = 430 + Math.sin(t) * 230
    const c = 0.5 - Math.sin(t) * 0.5  // opposite phase: curvy when light
    chars.forEach((ch, i) => {
      spring(st[i].wght, w, 0.06, 0.80)
      spring(st[i].casl, c, 0.06, 0.80)
      setAxes(ch, st[i].wght.pos, st[i].casl.pos)
    })
    return false
  })
}

// ── 05  Casual Ripple ─────────────────────────────────────────────────────────
// title: Casual Ripple
// desc: Only the CASL axis moves — a wave of handwritten looseness passes
//       through the word from left to right, shifting each glyph from crisp
//       geometric to organic curved forms and back. Weight stays constant:
//       pure letterform deformation, nothing else.
// tags: variable-fonts, casual, wave, glyph-deformation, continuous
function anim_05() {
  const chars = split(TEXT)
  const st = chars.map(() => ({ casl: { pos: 0, vel: 0 } }))
  let t = 0
  loop(() => {
    t += 0.024
    chars.forEach((ch, i) => {
      spring(st[i].casl, 0.5 + Math.sin(t - i * 0.5) * 0.5, 0.12, 0.72)
      setAxes(ch, 430, st[i].casl.pos)
    })
    return false
  })
}

// ── 06  Slant Settle ──────────────────────────────────────────────────────────
// title: Slant Settle
// desc: Characters enter tilted at -14° slant and spring back to upright with
//       stagger. Once settled, a residual oscillation keeps a faint lean alive —
//       as if the word is still exhaling from the effort of standing straight.
//       Weight briefly spikes on entry then returns to normal.
// tags: variable-fonts, slant, entrance-animation, spring-physics, stagger
function anim_06() {
  const chars = split(TEXT)
  const st = chars.map(() => ({
    slnt: { pos: -14, vel: 0 },
    wght: { pos: 700, vel: 0 },
    op:   0, opv: 0,
  }))
  let f = 0, t = 0
  loop(() => {
    f++; t += 0.018
    let done = true
    chars.forEach((ch, i) => {
      if (f < i * 4) { done = false; return }
      // After settling, add a faint residual oscillation
      const residual = Math.sin(t + i * 0.4) * 1.2
      const settled = Math.abs(st[i].slnt.pos) < 1.5
      if (!spring(st[i].slnt, settled ? residual : 0, 0.07, 0.68)) done = false
      if (!spring(st[i].wght, 420, 0.07, 0.70)) done = false
      st[i].opv += (1 - st[i].op) * 0.10; st[i].opv *= 0.72; st[i].op += st[i].opv
      ch.style.opacity = st[i].op
      setAxes(ch, st[i].wght.pos, 0, st[i].slnt.pos)
    })
    return false  // residual keeps running
  })
}

// ── 07  Axis Chaos ────────────────────────────────────────────────────────────
// title: Axis Chaos
// desc: Every 55 frames each character independently draws new random targets
//       for weight and casual, then springs there at its own pace. Characters
//       are never in sync — the word is always in motion, always readable,
//       always different.
// tags: variable-fonts, randomised, weight, casual, spring-physics
function anim_07() {
  const chars = split(TEXT)
  const targets = chars.map(() => ({ wght: 420, casl: 0 }))
  const st = chars.map((_, i) => ({
    wght: { pos: 420, vel: 0 },
    casl: { pos: 0,   vel: 0 },
    k: 0.055 + (i % 3) * 0.022,
  }))
  let f = 0
  loop(() => {
    f++
    if (f % 55 === 0) {
      targets.forEach(t => {
        t.wght = 200 + Math.random() * 680
        t.casl = Math.random()
      })
    }
    chars.forEach((ch, i) => {
      spring(st[i].wght, targets[i].wght, st[i].k, 0.78)
      spring(st[i].casl, targets[i].casl, st[i].k, 0.78)
      setAxes(ch, st[i].wght.pos, st[i].casl.pos)
    })
    return false
  })
}

// ── 08  Shockwave ─────────────────────────────────────────────────────────────
// title: Shockwave
// desc: Click anywhere to send a radial shockwave through the word. Characters
//       near the impact spike to maximum weight and casual before springing
//       back — the blast propagates as a wave of typographic force. Trigger
//       as many times as you like.
// tags: variable-fonts, click-interaction, shockwave, weight, spring-physics
function anim_08() {
  const chars = split(TEXT)
  const rects = chars.map(ch => ch.getBoundingClientRect())
  const st = chars.map(() => ({
    wght: { pos: 420, vel: 0 },
    casl: { pos: 0,   vel: 0 },
  }))

  function shock(e) {
    chars.forEach((ch, i) => {
      const r    = rects[i]
      const cx   = r.left + r.width / 2
      const cy   = r.top  + r.height / 2
      const dist = Math.hypot(cx - e.clientX, cy - e.clientY)
      if (dist < 320) {
        const strength = Math.max(0, 1 - dist / 320)
        st[i].wght.vel += strength * 55
        st[i].casl.vel += strength * 0.10
      }
    })
  }

  document.addEventListener('click', shock)

  loop(() => {
    chars.forEach((ch, i) => {
      spring(st[i].wght, 420, 0.07, 0.70)
      spring(st[i].casl, 0,   0.07, 0.70)
      setAxes(ch, st[i].wght.pos, st[i].casl.pos)
    })
    return false
  }, () => document.removeEventListener('click', shock))
}

// ── 09  Bold Cascade ──────────────────────────────────────────────────────────
// title: Bold Cascade
// desc: Weight rises staggered from left to right — 100 to 700 — then drops
//       back and repeats. A continuously looping cascade that reads like a
//       ticker of thickness: the word is always becoming bold and never quite
//       staying there.
// tags: variable-fonts, weight, cascade, stagger, continuous
function anim_09() {
  const chars = split(TEXT)
  const st = chars.map(() => ({ wght: { pos: 100, vel: 0 } }))
  let f = 0, phase = 'up'

  loop(() => {
    f++
    let allDone = true
    chars.forEach((ch, i) => {
      if (f < i * 5) { allDone = false; return }
      const target = phase === 'up' ? 720 : 100
      if (!spring(st[i].wght, target, 0.08, 0.70)) allDone = false
      setAxes(ch, st[i].wght.pos)
    })
    if (allDone) {
      phase = phase === 'up' ? 'down' : 'up'
      f = -15  // brief pause before next cascade
    }
    return false
  })
}

// ── 10  Axis Dance ────────────────────────────────────────────────────────────
// title: Axis Dance
// desc: All four axes oscillate simultaneously at different frequencies and
//       per-character phase offsets. Weight, casual, slant, and cursive each
//       follow their own sine cycle — the word is a four-dimensional typographic
//       instrument playing a continuous, evolving chord.
// tags: variable-fonts, multi-axis, oscillation, generative, continuous
function anim_10() {
  const chars = split(TEXT)
  const st = chars.map(() => ({
    wght: { pos: 420, vel: 0 },
    casl: { pos: 0,   vel: 0 },
    slnt: { pos: 0,   vel: 0 },
    crsv: { pos: 0,   vel: 0 },
  }))
  let t = 0
  loop(() => {
    t += 0.018
    chars.forEach((ch, i) => {
      const ph = i * 0.45
      const targetWght = 420 + Math.sin(t         + ph) * 290
      const targetCasl = 0.5 + Math.sin(t * 1.3   + ph + Math.PI / 3) * 0.5
      const targetSlnt = Math.sin(t * 0.7 + ph) * (-12)
      const targetCrsv = targetCasl > 0.55 ? 1 : 0  // snap when casual enough

      spring(st[i].wght, targetWght, 0.10, 0.74)
      spring(st[i].casl, targetCasl, 0.10, 0.74)
      spring(st[i].slnt, targetSlnt, 0.10, 0.74)
      spring(st[i].crsv, targetCrsv, 0.06, 0.80)

      setAxes(ch, st[i].wght.pos, st[i].casl.pos, st[i].slnt.pos, st[i].crsv.pos)
    })
    return false
  })
}


// ─── Start ────────────────────────────────────────────────────────────────────
run(anim_01)
