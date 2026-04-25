/* ═══════════════════════════════════════════════════════════════════════════
   SPRING TEXT — jeanphilippebelley.com
   ─────────────────────────────────────────────────────────────────────────
   HTML — paste in the HTML pane:
   ─────────────────────────────────────────────────────────────────────────

   <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet">

   <div id="stage">
     <span class="label">spring physics</span>
     <h1 class="text">Always cooking</h1>
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
     font-family: 'DM Mono', monospace;
   }

   #stage {
     display: flex;
     flex-direction: column;
     align-items: flex-start;
     padding: 40px 48px;
     position: relative;
   }

   .label {
     font-family: 'DM Mono', monospace;
     font-size: 10px;
     font-weight: 300;
     letter-spacing: 0.18em;
     text-transform: uppercase;
     color: #B0A090;
     margin-bottom: 20px;
   }

   .text {
     font-family: 'Instrument Serif', Georgia, serif;
     font-size: clamp(48px, 9vw, 110px);
     font-weight: 400;
     font-style: italic;
     color: #0E0C09;
     letter-spacing: -0.025em;
     line-height: 1;
     display: flex;
     flex-wrap: wrap;
   }

   .char { display: inline-block; white-space: pre; opacity: 0; }

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
     font-family: 'DM Mono', monospace;
     font-size: 11px;
     font-weight: 300;
     letter-spacing: 0.12em;
     color: #E6100F;
     cursor: pointer;
     text-transform: lowercase;
     transition: opacity 0.2s;
   }
   #replay:hover { opacity: 0.6; }

   #credit {
     position: fixed;
     bottom: 20px;
     right: 24px;
     font-family: 'DM Mono', monospace;
     font-size: 11px;
     font-weight: 300;
     letter-spacing: 0.1em;
     color: rgba(14,12,9,0.25);
     text-decoration: none;
     transition: color 0.2s;
   }
   #credit span { color: #E6100F; }
   #credit:hover { color: rgba(14,12,9,0.6); }

   ═══════════════════════════════════════════════════════════════════════════
   In the JS pane keep only ONE call at the bottom:
     run(anim_XX)   ← change XX (01–20) to switch
   ═══════════════════════════════════════════════════════════════════════ */


// ─── Shared with text-animations.js ──────────────────────────────────────

const TEXT = document.querySelector('.text')
const BTN  = document.getElementById('replay')

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


// ─── Spring engine ────────────────────────────────────────────────────────

/**
 * 1-D spring step. Mutates s = { pos, vel }.
 * Returns true when the spring has settled.
 */
function spring(s, target, k = 0.08, d = 0.72) {
  s.vel += (target - s.pos) * k
  s.vel *= d
  s.pos += s.vel
  return Math.abs(s.vel) + Math.abs(target - s.pos) < 0.05
}

/**
 * 2-D spring step. Mutates s = { x, y, vx, vy }.
 * Returns true when settled.
 */
function spring2D(s, tx, ty, k = 0.08, d = 0.72) {
  s.vx += (tx - s.x) * k;  s.vx *= d;  s.x += s.vx
  s.vy += (ty - s.y) * k;  s.vy *= d;  s.y += s.vy
  return Math.hypot(s.vx, s.vy) + Math.hypot(tx - s.x, ty - s.y) < 0.05
}

let _raf = null, _cleanup = () => {}

/**
 * rAF loop. Calls onTick() every frame until it returns true.
 * cleanup() is invoked when the loop is stopped or restarted.
 */
function loop(onTick, cleanup = () => {}) {
  cancelAnimationFrame(_raf)
  _cleanup(); _cleanup = cleanup
  function tick() { if (!onTick()) _raf = requestAnimationFrame(tick) }
  _raf = requestAnimationFrame(tick)
}


// ─── ENTRANCES ────────────────────────────────────────────────────────────

// ── 01  Drop & Settle — staggered fall from above ─────────────────────────
// desc: Letters drop from above one by one and bounce lightly into place. A staggered entrance built on spring damping — no CSS transitions, pure physics.
// tags: spring-physics, text-animation, entrance-animation, stagger, javascript
function anim_01() {
  const chars = split(TEXT)
  const st = chars.map(() => ({ pos: -100, vel: 0, op: 0, opv: 0 }))
  let f = 0
  loop(() => {
    f++
    let done = true
    chars.forEach((ch, i) => {
      if (f < i * 3) { done = false; return }
      if (!spring(st[i], 0, 0.07, 0.68)) done = false
      st[i].opv += (1 - st[i].op) * 0.09; st[i].opv *= 0.72; st[i].op += st[i].opv
      ch.style.transform = `translateY(${st[i].pos}px)`
      ch.style.opacity   = st[i].op
    })
    return done
  })
}

// ── 02  Rise & Overshoot — pop from below, overshoot, settle ──────────────
// desc: Characters shoot up from below, overshoot their target, and snap back. Classic spring tension — stiff spring, low damping, elastic energy.
// tags: spring-physics, overshoot, text-animation, elastic-animation, javascript
function anim_02() {
  const chars = split(TEXT)
  const st = chars.map(() => ({ pos: 80, vel: 0, op: 0, opv: 0 }))
  let f = 0
  loop(() => {
    f++
    let done = true
    chars.forEach((ch, i) => {
      if (f < i * 3) { done = false; return }
      if (!spring(st[i], 0, 0.11, 0.62)) done = false
      st[i].opv += (1 - st[i].op) * 0.11; st[i].opv *= 0.68; st[i].op += st[i].opv
      ch.style.transform = `translateY(${st[i].pos}px)`
      ch.style.opacity   = st[i].op
    })
    return done
  })
}

// ── 03  Gravity Bounce — fall under gravity, inelastic floor collision ─────
// desc: Real gravity simulation — letters fall, hit an invisible floor, and bounce with energy loss until they rest. No spring formula, pure Newtonian physics.
// tags: gravity-simulation, bounce, physics, text-animation, javascript
function anim_03() {
  const chars = split(TEXT)
  const GRAVITY = 0.9, BOUNCE = 0.42
  const st = chars.map((_, i) => ({ pos: -(60 + i * 12), vel: 0, settled: false, op: 0, opv: 0 }))
  let f = 0
  loop(() => {
    f++
    let done = true
    chars.forEach((ch, i) => {
      if (f < i * 4) { done = false; return }
      const s = st[i]
      if (!s.settled) {
        s.vel += GRAVITY
        s.pos += s.vel
        if (s.pos >= 0) {
          s.pos = 0
          s.vel *= -BOUNCE
          if (Math.abs(s.vel) < 1.0) { s.vel = 0; s.settled = true }
          else done = false
        } else done = false
      }
      s.opv += (1 - s.op) * 0.07; s.opv *= 0.78; s.op += s.opv
      ch.style.transform = `translateY(${s.pos}px)`
      ch.style.opacity   = s.op
    })
    return done
  })
}

// ── 04  Explode → Formation — scattered start, spring to reading position ──
// desc: Characters begin scattered randomly across the viewport and spring simultaneously toward their reading positions, converging into the word.
// tags: spring-physics, formation, scatter, text-animation, javascript
function anim_04() {
  const chars = split(TEXT)
  const st = chars.map(() => ({
    x: (Math.random() - 0.5) * 600,
    y: (Math.random() - 0.5) * 400,
    vx: 0, vy: 0, op: 0, opv: 0,
  }))
  loop(() => chars.every((ch, i) => {
    const done = spring2D(st[i], 0, 0, 0.06, 0.74)
    st[i].opv += (1 - st[i].op) * 0.05; st[i].opv *= 0.80; st[i].op += st[i].opv
    ch.style.transform = `translate(${st[i].x}px, ${st[i].y}px)`
    ch.style.opacity   = st[i].op
    return done
  }))
}

// ── 05  Center Burst — all start at word center, fan out to positions ──────
// desc: All letters start collapsed at the word's center point and fan outward to their natural positions — like a slow explosion unfolding into text.
// tags: spring-physics, burst, entrance-animation, text-animation, javascript
function anim_05() {
  const chars = split(TEXT)
  const textRect = TEXT.getBoundingClientRect()
  const cx = textRect.left + textRect.width / 2
  const offsets = chars.map(ch => {
    const r = ch.getBoundingClientRect()
    return (r.left + r.width / 2) - cx
  })
  const xst = chars.map((_, i) => ({ pos: -offsets[i], vel: 0 }))
  const yst = chars.map(() => ({ pos: (Math.random() - 0.5) * 40, vel: 0 }))
  const ops = chars.map(() => ({ pos: 0, vel: 0 }))
  loop(() => chars.every((ch, i) => {
    const xd = spring(xst[i], 0, 0.07, 0.70)
    const yd = spring(yst[i], 0, 0.09, 0.68)
    spring(ops[i], 1, 0.08, 0.74)
    ch.style.transform = `translate(${xst[i].pos}px, ${yst[i].pos}px)`
    ch.style.opacity   = ops[i].pos
    return xd && yd
  }))
}


// ─── CURSOR INTERACTION ───────────────────────────────────────────────────

// ── 06  Repulsion Field — cursor pushes chars away, spring restores ────────
// desc: Move your cursor through the text to push letters away. Each character springs back to its home position when the force is removed. Letters fade as they're displaced.
// tags: cursor-interaction, repulsion, spring-physics, interactive-animation, javascript
function anim_06() {
  const chars = split(TEXT)
  const rects = chars.map(ch => ch.getBoundingClientRect())
  const st = chars.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, op: 1, opv: 0 }))
  let mx = -9999, my = -9999

  const onMove = e => { mx = e.clientX; my = e.clientY }
  document.addEventListener('mousemove', onMove)

  loop(() => {
    chars.forEach((ch, i) => {
      const r = rects[i]
      const wx = r.left + r.width  / 2 + st[i].x
      const wy = r.top  + r.height / 2 + st[i].y
      const dx = wx - mx, dy = wy - my
      const dist = Math.hypot(dx, dy)
      const RADIUS = 90
      if (dist < RADIUS && dist > 0) {
        const force = ((RADIUS - dist) / RADIUS) * 0.55
        st[i].vx += (dx / dist) * force
        st[i].vy += (dy / dist) * force
      }
      st[i].vx += (0 - st[i].x) * 0.08; st[i].vx *= 0.80; st[i].x += st[i].vx
      st[i].vy += (0 - st[i].y) * 0.08; st[i].vy *= 0.80; st[i].y += st[i].vy
      // Opacity drops based on displacement distance
      const disp = Math.hypot(st[i].x, st[i].y)
      const targetOp = Math.max(0.25, 1 - disp / 80)
      st[i].opv += (targetOp - st[i].op) * 0.1; st[i].opv *= 0.75; st[i].op += st[i].opv
      ch.style.transform = `translate(${st[i].x}px, ${st[i].y}px)`
      ch.style.opacity   = st[i].op
    })
    return false
  }, () => {
    document.removeEventListener('mousemove', onMove)
    chars.forEach(ch => { ch.style.transform = ''; ch.style.opacity = '' })
  })
}

// ── 07  Magnetic Pull — cursor attracts chars toward it ───────────────────
// desc: Letters within range are magnetically drawn toward your cursor, then spring back when you move away. A soft inverse-force field around the pointer.
// tags: cursor-interaction, magnetic, spring-physics, interactive-animation, javascript
function anim_07() {
  const chars = split(TEXT)
  const rects = chars.map(ch => ch.getBoundingClientRect())
  const st = chars.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }))
  let mx = -9999, my = -9999

  const onMove = e => { mx = e.clientX; my = e.clientY }
  const onLeave = () => { mx = -9999; my = -9999 }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseleave', onLeave)

  loop(() => {
    chars.forEach((ch, i) => {
      const r = rects[i]
      const wx = r.left + r.width  / 2 + st[i].x
      const wy = r.top  + r.height / 2 + st[i].y
      const dx = mx - wx, dy = my - wy
      const dist = Math.hypot(dx, dy)
      const RADIUS = 110
      if (dist < RADIUS && dist > 0) {
        const pull = ((RADIUS - dist) / RADIUS) * 0.3
        st[i].vx += (dx / dist) * pull
        st[i].vy += (dy / dist) * pull
      }
      st[i].vx += (0 - st[i].x) * 0.06; st[i].vx *= 0.82; st[i].x += st[i].vx
      st[i].vy += (0 - st[i].y) * 0.06; st[i].vy *= 0.82; st[i].y += st[i].vy
      ch.style.transform = `translate(${st[i].x}px, ${st[i].y}px)`
    })
    return false
  }, () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseleave', onLeave)
    chars.forEach(ch => { ch.style.transform = '' })
  })
}

// ── 08  Spring Kerning — mouse X compresses / expands word spacing ─────────
// desc: Move your mouse horizontally to compress or expand the letter spacing of the word. The kerning follows your cursor with spring inertia — typography as a physical object.
// tags: kerning, typography, cursor-interaction, spring-physics, javascript
function anim_08() {
  const chars = split(TEXT)
  const mid = (chars.length - 1) / 2
  const spread = { pos: 0, vel: 0 }
  let mx = 0
  const W = window.innerWidth

  const onMove = e => { mx = (e.clientX / W - 0.5) * 80 } // maps to ±40 px
  document.addEventListener('mousemove', onMove)

  loop(() => {
    spring(spread, mx, 0.06, 0.80)
    chars.forEach((ch, i) => {
      ch.style.transform = `translateX(${(i - mid) / Math.max(mid, 1) * spread.pos}px)`
    })
    return false
  }, () => {
    document.removeEventListener('mousemove', onMove)
    chars.forEach(ch => { ch.style.transform = '' })
  })
}

// ── 09  Drag & Release — mousedown to drag any char, release springs back ──
// desc: Click and drag any individual letter anywhere on screen. Release it and watch it spring back to its original position with realistic momentum and damping.
// tags: drag-and-drop, spring-physics, interactive-animation, momentum, javascript
function anim_09() {
  const chars = split(TEXT)
  const st = chars.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, held: false }))
  let dragIdx = -1, lx = 0, ly = 0

  const onDown = e => {
    chars.forEach((ch, i) => {
      const r = ch.getBoundingClientRect()
      if (e.clientX >= r.left && e.clientX <= r.right &&
          e.clientY >= r.top  && e.clientY <= r.bottom) {
        dragIdx = i; st[i].held = true
        lx = e.clientX; ly = e.clientY
      }
    })
  }
  const onMove = e => {
    if (dragIdx < 0) return
    const s = st[dragIdx]
    s.vx = e.clientX - lx; s.vy = e.clientY - ly
    s.x += s.vx;           s.y += s.vy
    lx = e.clientX;         ly = e.clientY
    chars[dragIdx].style.transform = `translate(${s.x}px, ${s.y}px)`
  }
  const onUp = () => {
    if (dragIdx >= 0) st[dragIdx].held = false
    dragIdx = -1
  }
  document.addEventListener('mousedown', onDown)
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup',   onUp)

  loop(() => {
    chars.forEach((ch, i) => {
      if (st[i].held) return
      spring2D(st[i], 0, 0, 0.08, 0.70)
      ch.style.transform = `translate(${st[i].x}px, ${st[i].y}px)`
    })
    return false
  }, () => {
    document.removeEventListener('mousedown', onDown)
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup',   onUp)
    chars.forEach(ch => { ch.style.transform = '' })
  })
}

// ── 10  Gravity Well — cursor exerts soft gravity, chars drift and orbit ───
// desc: Your cursor acts as a gravity source with an inverse-square force. Letters drift toward it and begin to orbit, pulled into slow elliptical paths.
// tags: gravity, orbit, cursor-interaction, physics-simulation, javascript
function anim_10() {
  const chars = split(TEXT)
  const rects = chars.map(ch => ch.getBoundingClientRect())
  const st = chars.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }))
  let mx = -9999, my = -9999

  const onMove = e => { mx = e.clientX; my = e.clientY }
  const onLeave = () => { mx = -9999; my = -9999 }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseleave', onLeave)

  loop(() => {
    chars.forEach((ch, i) => {
      const r = rects[i]
      const wx = r.left + r.width  / 2 + st[i].x
      const wy = r.top  + r.height / 2 + st[i].y
      const dx = mx - wx, dy = my - wy
      const dist = Math.hypot(dx, dy)
      if (dist > 10 && dist < 250) {
        const g = Math.min(120 / (dist * dist), 1.5)
        st[i].vx += (dx / dist) * g
        st[i].vy += (dy / dist) * g
      }
      // Weak home spring
      st[i].vx += (0 - st[i].x) * 0.025; st[i].vx *= 0.90; st[i].x += st[i].vx
      st[i].vy += (0 - st[i].y) * 0.025; st[i].vy *= 0.90; st[i].y += st[i].vy
      ch.style.transform = `translate(${st[i].x}px, ${st[i].y}px)`
    })
    return false
  }, () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseleave', onLeave)
    chars.forEach(ch => { ch.style.transform = '' })
  })
}


// ─── AMBIENT / LOOPING ───────────────────────────────────────────────────

// ── 11  Thermal Noise — chars jitter with random micro-targets ────────────
// desc: Letters constantly shift with small random micro-movements, each on its own timer — like particles vibrating with thermal energy. Subtle, restless, alive.
// tags: noise, ambient-animation, spring-physics, generative, javascript
function anim_11() {
  const chars = split(TEXT)
  const st = chars.map(() => ({
    x: 0, y: 0, vx: 0, vy: 0,
    tx: 0, ty: 0, timer: Math.floor(Math.random() * 30),
  }))
  loop(() => {
    chars.forEach((ch, i) => {
      const s = st[i]
      if (--s.timer <= 0) {
        s.tx = (Math.random() - 0.5) * 10
        s.ty = (Math.random() - 0.5) * 7
        s.timer = 20 + Math.floor(Math.random() * 35)
      }
      spring2D(s, s.tx, s.ty, 0.07, 0.76)
      ch.style.transform = `translate(${s.x}px, ${s.y}px)`
    })
    return false
  })
}

// ── 12  Breathing — gentle scale oscillation, staggered phase per char ────
// desc: Each letter breathes in and out with a scale pulse, each on a slightly different phase. A slow organic wave that makes the word feel alive.
// tags: breathing, scale-animation, ambient-animation, spring-physics, javascript
function anim_12() {
  const chars = split(TEXT)
  const st = chars.map(() => ({ pos: 1, vel: 0 }))
  chars.forEach(ch => { ch.style.transformOrigin = '50% 80%' })
  let t = 0
  loop(() => {
    t++
    chars.forEach((ch, i) => {
      const target = 1 + Math.sin(t * 0.04 + i * 0.45) * 0.18
      spring(st[i], target, 0.05, 0.84)
      ch.style.transform = `scale(${st[i].pos})`
    })
    return false
  })
}

// ── 13  Orbital Drift — each char slowly orbits its natural position ───────
// desc: Letters float in slow elliptical orbits around their resting positions, each with a unique radius and phase offset. A meditative, looping ambient animation.
// tags: orbit, ambient-animation, spring-physics, generative, javascript
function anim_13() {
  const chars = split(TEXT)
  const st = chars.map((_, i) => ({ x: 0, y: 0, vx: 0, vy: 0, phase: i * 0.55 }))
  let t = 0
  loop(() => {
    t++
    chars.forEach((ch, i) => {
      const s = st[i]
      const R  = 3 + Math.sin(s.phase * 1.7) * 2   // orbit radius 1–5 px
      const tx = Math.cos(t * 0.022 + s.phase) * R
      const ty = Math.sin(t * 0.022 + s.phase * 0.7) * R * 0.55
      spring2D(s, tx, ty, 0.04, 0.86)
      ch.style.transform = `translate(${s.x}px, ${s.y}px)`
    })
    return false
  })
}

// ── 14  Weight Wave — font-weight oscillates as a wave across the word ─────
// desc: Font weight pulses from thin to bold across the word in a travelling wave. Each letter's weight springs to a sinusoidal target. Requires a variable font with wght axis.
// tags: variable-font, font-weight, wave-animation, typography, javascript
// note: use family=Instrument+Serif or family=Space+Grotesk:wght@300..700 in the font URL
function anim_14() {
  const chars = split(TEXT)
  const st = chars.map(() => ({ pos: 400, vel: 0 }))
  let t = 0
  loop(() => {
    t++
    chars.forEach((ch, i) => {
      const target = 400 + Math.sin(t * 0.055 - i * 0.5) * 290 // 110–690
      spring(st[i], target, 0.05, 0.82)
      ch.style.fontVariationSettings = `'wght' ${st[i].pos}`
    })
    return false
  })
}

// ── 15  Pendulum — chars start at an angle and swing to rest ──────────────
// desc: Letters start tilted at alternating angles and swing like pendulums, each gradually slowing to rest. A loose spring with high damping mimics pendulum physics.
// tags: pendulum, rotation, spring-physics, text-animation, javascript
function anim_15() {
  const chars = split(TEXT)
  const st = chars.map((_, i) => ({
    pos: (i % 2 === 0 ? 1 : -1) * (25 + Math.random() * 25),
    vel: 0,
  }))
  chars.forEach(ch => { ch.style.transformOrigin = '50% 0%' })
  loop(() => chars.every((ch, i) => {
    // Loose spring = pendulum-like damping (low k, high d)
    const done = spring(st[i], 0, 0.025, 0.94)
    ch.style.transform = `rotateZ(${st[i].pos}deg)`
    return done
  }))
}


// ─── PROPAGATION & EVENTS ─────────────────────────────────────────────────

// ── 16  Shockwave — click anywhere to fire a radial impulse ───────────────
// desc: Click anywhere on screen to detonate a shockwave. Letters near the impact are blasted outward with a flash, then spring back. Click again to re-trigger.
// tags: shockwave, click-interaction, spring-physics, impulse, javascript
function anim_16() {
  const chars = split(TEXT)
  const rects = chars.map(ch => ch.getBoundingClientRect())
  const st = chars.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, op: 1, opv: 0 }))

  function shock(ex, ey) {
    chars.forEach((ch, i) => {
      const r  = rects[i]
      const dx = (r.left + r.width  / 2) - ex
      const dy = (r.top  + r.height / 2) - ey
      const dist = Math.hypot(dx, dy)
      if (dist < 220 && dist > 0) {
        const force = ((220 - dist) / 220) * 9
        st[i].vx += (dx / dist) * force
        st[i].vy += (dy / dist) * force
        // Brief flash: kick opacity down, let it spring back
        st[i].op  = Math.max(0.1, st[i].op - ((220 - dist) / 220) * 0.8)
        st[i].opv = 0
      }
    })
  }

  shock(
    TEXT.getBoundingClientRect().left + TEXT.getBoundingClientRect().width / 2,
    TEXT.getBoundingClientRect().top  + TEXT.getBoundingClientRect().height / 2
  )

  const onClick = e => shock(e.clientX, e.clientY)
  document.addEventListener('click', onClick)

  loop(() => {
    chars.forEach((ch, i) => {
      spring2D(st[i], 0, 0, 0.07, 0.74)
      st[i].opv += (1 - st[i].op) * 0.12; st[i].opv *= 0.70; st[i].op += st[i].opv
      ch.style.transform = `translate(${st[i].x}px, ${st[i].y}px)`
      ch.style.opacity   = st[i].op
    })
    return false
  }, () => {
    document.removeEventListener('click', onClick)
    chars.forEach(ch => { ch.style.transform = ''; ch.style.opacity = '' })
  })
}

// ── 17  Wave Cascade — disturbance propagates char-to-char like a chain ───
// desc: A displacement pulse travels from the first letter to the last, each character nudging the next with a fraction of its velocity — a chain reaction in spring form.
// tags: wave, cascade, spring-physics, propagation, javascript
function anim_17() {
  const chars = split(TEXT)
  const st = chars.map(() => ({ pos: 0, vel: 0 }))
  st[0].vel = -14  // initial kick on the first character

  loop(() => {
    chars.forEach((ch, i) => {
      // Each char's spring is nudged by its left neighbor's velocity
      if (i > 0) st[i].vel += st[i - 1].vel * 0.09
      spring(st[i], 0, 0.055, 0.76)
      ch.style.transform = `translateY(${st[i].pos}px)`
    })
    return chars.every(s => Math.abs(s.pos) + Math.abs(s.vel) < 0.05)
  })
}

// ── 18  Jelly Hover — squash + stretch spring on mouseenter ───────────────
// desc: Hover over any letter to trigger a squash-and-stretch jelly deformation. The X and Y scale springs are kicked in opposite directions, then oscillate back.
// tags: squash-and-stretch, hover-effect, spring-physics, jelly, javascript
function anim_18() {
  const chars = split(TEXT)
  const st = chars.map(() => ({ sx: 1, svx: 0, sy: 1, svy: 0 }))
  chars.forEach(ch => { ch.style.transformOrigin = '50% 80%' })

  const onEnter = e => {
    const idx = chars.indexOf(e.target)
    if (idx < 0) return
    st[idx].svx = -0.06   // compress x → squash
    st[idx].svy =  0.06   // stretch y
  }
  TEXT.addEventListener('mouseover', onEnter)

  loop(() => {
    chars.forEach((ch, i) => {
      const s = st[i]
      s.svx += (1 - s.sx) * 0.14; s.svx *= 0.58; s.sx += s.svx
      s.svy += (1 - s.sy) * 0.14; s.svy *= 0.58; s.sy += s.svy
      ch.style.transform = `scaleX(${s.sx}) scaleY(${s.sy})`
    })
    return false
  }, () => {
    TEXT.removeEventListener('mouseover', onEnter)
    chars.forEach(ch => { ch.style.transform = '' })
  })
}

// ── 19  Scatter & Return — hover scatters chars, leave springs them home ──
// desc: Hover over the word to scatter all letters in random directions with a slow, drifting spring. Move away and they spring back home, fading in as they arrive.
// tags: scatter, hover-effect, spring-physics, interactive-animation, javascript
function anim_19() {
  const chars = split(TEXT)
  const randX = chars.map(() => (Math.random() - 0.5) * 420)
  const randY = chars.map(() => (Math.random() - 0.5) * 220)
  const st = chars.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, op: 1, opv: 0 }))
  let hovering = false

  const onEnter = () => { hovering = true  }
  const onLeave = () => { hovering = false }
  TEXT.addEventListener('mouseenter', onEnter)
  TEXT.addEventListener('mouseleave', onLeave)

  loop(() => {
    chars.forEach((ch, i) => {
      const tx = hovering ? randX[i] : 0
      const ty = hovering ? randY[i] : 0
      const k  = hovering ? 0.04 : 0.09
      const d  = hovering ? 0.88 : 0.72
      spring2D(st[i], tx, ty, k, d)
      // Fade out when scattered, fade in when returning home
      const targetOp = hovering ? 0.2 : 1
      st[i].opv += (targetOp - st[i].op) * 0.06; st[i].opv *= 0.82; st[i].op += st[i].opv
      ch.style.transform = `translate(${st[i].x}px, ${st[i].y}px)`
      ch.style.opacity   = st[i].op
    })
    return false
  }, () => {
    TEXT.removeEventListener('mouseenter', onEnter)
    TEXT.removeEventListener('mouseleave', onLeave)
    chars.forEach(ch => { ch.style.transform = ''; ch.style.opacity = '' })
  })
}

// ── 20  Domino Fall — chars fall one by one, each triggering the next ──────
// desc: The first letter tips over and triggers the next, which triggers the next. A slow chain of falling dominoes across the word, each pivoting from its baseline.
// tags: domino, chain-reaction, spring-physics, text-animation, javascript
function anim_20() {
  const chars = split(TEXT)
  chars.forEach(ch => { ch.style.transformOrigin = '50% 100%' })
  const st = chars.map(() => ({ angle: 0, vel: 0, active: false, done: false }))
  st[0].active = true

  loop(() => {
    let allDone = true
    chars.forEach((ch, i) => {
      const s = st[i]
      if (!s.active || s.done) { if (!s.done) allDone = false; return }
      // Spring toward 90° (fallen)
      s.vel += (90 - s.angle) * 0.035
      s.vel *= 0.94
      s.angle += s.vel
      // Trigger next char when this one passes the midpoint
      if (s.angle > 50 && i + 1 < chars.length && !st[i + 1].active) {
        st[i + 1].active = true
      }
      if (s.angle >= 90) { s.angle = 90; s.vel = 0; s.done = true }
      else allDone = false
      ch.style.transform = `rotateZ(${s.angle}deg)`
    })
    return allDone
  })
}


// ─── Launch ───────────────────────────────────────────────────────────────
// Change anim_01 to any anim_01–anim_20 to preview that animation.

run(anim_01)
