/* ═══════════════════════════════════════════════════════════════════════════
   TEXT TIMELINE — GHOST RETURN — jeanphilippebelley.com
   ─────────────────────────────────────────────────────────────────────────
   title: Text Timeline Ghost Return Animations
   desc:  10 looping text animations where letters leave their home position
          and return to it. A faded ghost of the word stays fixed in the
          background at all times, so each letter visibly snaps back into
          place. Two DOM layers: ghost (static, 14% opacity) and live
          (absolute, animated opacity + transform). When a live letter fades
          to zero the ghost takes over seamlessly.
   tags:  text-animation, timeline, loop, ghost, typography
   ─────────────────────────────────────────────────────────────────────────
   HTML — paste in the HTML pane:
   ─────────────────────────────────────────────────────────────────────────

   <link href="https://fonts.googleapis.com/css2?family=Recursive:wght,CASL,MONO,slnt,CRSV@300..1000,0..1,0..1,-15..0,0..1&display=swap" rel="stylesheet">

   <div id="stage"></div>

   <button id="replay">↺ replay</button>
   <a href="https://jeanphilippebelley.com/" target="_blank" id="credit">
     JP<span>.</span>
   </a>

   ─────────────────────────────────────────────────────────────────────────
   CSS — paste in the CSS pane:
   ─────────────────────────────────────────────────────────────────────────

   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

   body {
     background: #080710;
     display: flex;
     align-items: center;
     justify-content: center;
     min-height: 100vh;
     overflow: hidden;
   }

   #stage {
     display: flex;
     align-items: center;
     justify-content: center;
   }

   .text {
     font-family: 'Recursive', sans-serif;
     font-size: clamp(52px, 10vw, 116px);
     font-weight: 400;
     color: rgba(232, 234, 240, 0.92);
     letter-spacing: -0.02em;
     line-height: 1;
     display: flex;
   }

   .ghost-layer {
     opacity: 0.14;
     user-select: none;
     pointer-events: none;
   }

   .char {
     display: inline-block;
     white-space: pre;
     will-change: transform, opacity;
   }

   #replay {
     position: fixed;
     bottom: 28px;
     left: 50%;
     transform: translateX(-50%);
     background: none;
     border: none;
     font-family: 'Recursive', monospace;
     font-size: 11px;
     letter-spacing: 0.14em;
     color: rgba(255,255,255,0.18);
     cursor: pointer;
     text-transform: lowercase;
     transition: color 0.2s;
     font-variation-settings: 'wght' 300, 'MONO' 1;
   }
   #replay:hover { color: rgba(255,255,255,0.5); }

   #credit {
     position: fixed;
     bottom: 20px;
     right: 24px;
     font-family: 'Recursive', monospace;
     font-size: 11px;
     letter-spacing: 0.1em;
     color: rgba(255,255,255,0.12);
     text-decoration: none;
     transition: color 0.2s;
     font-variation-settings: 'wght' 300, 'MONO' 1;
   }
   #credit span { color: rgba(124,92,255,0.55); }
   #credit:hover { color: rgba(255,255,255,0.4); }

   ═══════════════════════════════════════════════════════════════════════════
   In the JS pane keep only ONE call at the bottom:
     run(anim_XX)   ← change XX (01–10) to switch
   ═══════════════════════════════════════════════════════════════════════ */


// ─── Config ───────────────────────────────────────────────────────────────────
const WORD  = 'Always'
const STAGE = document.getElementById('stage')
const BTN   = document.getElementById('replay')

// ─── Loop & run ───────────────────────────────────────────────────────────────
let _raf = null
function loop(tick) {
  cancelAnimationFrame(_raf)
  ;(function frame() { tick(); _raf = requestAnimationFrame(frame) })()
}
function run(fn) { fn(); BTN.onclick = fn }

// ─── Easing ───────────────────────────────────────────────────────────────────
const ease = {
  out:     t => 1 - (1 - t) ** 3,
  in:      t => t ** 3,
  inOut:   t => t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2,
  outBack: t => { const c = 1.70158 + 1; return 1 + c * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2 },
  bounce:  t => {
    const n = 7.5625, d = 2.75
    if (t < 1 / d)       return n * t * t
    if (t < 2 / d)       return n * (t -= 1.5 / d) * t + 0.75
    if (t < 2.5 / d)     return n * (t -= 2.25 / d) * t + 0.9375
    return n * (t -= 2.625 / d) * t + 0.984375
  },
}

// ─── Cycle progress ───────────────────────────────────────────────────────────
// Returns 0 (at home) → 1 (at target) → 0 (back home) on a fixed timing loop.
// When p = 0: live letter is invisible — ghost shows the home position.
// When p = 1: live letter is fully visible at its displaced position.
function cyc(f, offset, enter, hold, exit, pause, eIn = ease.out, eOut = ease.in) {
  if (f < offset) return 0
  const total = enter + hold + exit + pause
  const t = (f - offset) % total
  if (t < enter)                return eIn(t / enter)
  if (t < enter + hold)         return 1
  if (t < enter + hold + exit)  return 1 - eOut((t - enter - hold) / exit)
  return 0
}

const lerp = (a, b, t) => a + (b - a) * t

// ─── Ghost setup ──────────────────────────────────────────────────────────────
// Builds two overlapping layers inside #stage:
//
//   .ghost-layer  — static word at 14% opacity, always visible, gives natural
//                   width/height so the wrapper holds its size.
//   .live-layer   — absolutely positioned on top, same chars start at opacity 0.
//                   Animations move these chars and fade them in/out with p.
//
// When p = 0  → live letter invisible, ghost reads as the home position.
// When p = 1  → live letter fully visible at displaced position, ghost faint.
// As p → 0    → live letter fades out, ghost seamlessly takes over.
//
// Returns an array of the live <span> elements (one per character).
function setup(text = WORD) {
  STAGE.innerHTML = ''

  const wrap = document.createElement('div')
  wrap.style.cssText = 'position:relative; display:inline-flex; align-items:center; justify-content:center;'
  STAGE.appendChild(wrap)

  const ghostEl = document.createElement('div')
  ghostEl.className = 'text ghost-layer'
  ghostEl.setAttribute('aria-hidden', 'true')

  const liveEl = document.createElement('div')
  liveEl.className = 'text'
  liveEl.style.cssText = 'position:absolute; top:0; left:0; display:flex; pointer-events:none;'

  const chars = text.split('').map(ch => {
    const gc = ch === ' ' ? '\u00a0' : ch

    const g = document.createElement('span')
    g.className = 'char'
    g.textContent = gc
    ghostEl.appendChild(g)

    const l = document.createElement('span')
    l.className = 'char'
    l.textContent = gc
    l.style.opacity = '1'
    liveEl.appendChild(l)

    return l
  })

  wrap.appendChild(ghostEl)
  wrap.appendChild(liveEl)
  return chars
}


// ─── ANIMATIONS ───────────────────────────────────────────────────────────────

// 01 — Radial Escape
// Letters scatter outward from the word's center at evenly spaced angles,
// then snap back into the ghost with an outBack overshoot on entry.
function anim_01() {
  const chars = setup()
  const N = chars.length
  let f = 0
  loop(() => {
    chars.forEach((ch, i) => {
      const p = cyc(f, i * 5, 44, 35, 38, 45, ease.outBack, ease.in)
      const angle = (i / N) * Math.PI * 2
      const tx = Math.cos(angle) * 120 * p
      const ty = Math.sin(angle) * 120 * p
      ch.style.transform = `translate(${tx}px, ${ty}px)`
    })
    f++
  })
}

// 02 — Vertical Fan
// Letters fan out alternating up/down. Distance from word center determines
// how far each letter travels — outer letters sweep the furthest.
function anim_02() {
  const chars = setup()
  const N = chars.length
  let f = 0
  loop(() => {
    const center = (N - 1) / 2
    chars.forEach((ch, i) => {
      const p = cyc(f, i * 5, 40, 40, 36, 44, ease.out, ease.in)
      const dist = Math.abs(i - center) * 32 + 22
      const dir  = i % 2 === 0 ? -1 : 1
      ch.style.transform = `translateY(${dir * dist * p}px)`
    })
    f++
  })
}

// 03 — Arc Bloom
// All letters arc upward in a sine arch — highest in the middle, lowest at
// the edges. They overshoot on the way up and drift back into the ghost.
function anim_03() {
  const chars = setup()
  const N = chars.length
  let f = 0
  loop(() => {
    chars.forEach((ch, i) => {
      const p = cyc(f, i * 3, 48, 45, 40, 42, ease.outBack, ease.in)
      const archH = Math.sin((i / (N - 1)) * Math.PI) * 110 + 28
      ch.style.transform = `translateY(${-archH * p}px)`
    })
    f++
  })
}

// 04 — Depth Plunge
// Letters shrink and fall as if receding into depth. The ghost holds the
// home plane while the live letters vanish into the floor.
function anim_04() {
  const chars = setup()
  const N = chars.length
  let f = 0
  loop(() => {
    chars.forEach((ch, i) => {
      const p     = cyc(f, i * 6, 42, 35, 38, 46, ease.in, ease.out)
      const scale = lerp(1, 0.25, p)
      ch.style.transform = `translateY(${90 * p}px) scale(${scale})`
    })
    f++
  })
}

// 05 — Cascade Shift
// Letters slide progressively to the right — each one offset a little
// further than the last, like a deck of cards spreading out.
function anim_05() {
  const chars = setup()
  const N = chars.length
  let f = 0
  loop(() => {
    chars.forEach((ch, i) => {
      const p = cyc(f, i * 6, 38, 40, 34, 42, ease.out, ease.in)
      ch.style.transform = `translateX(${(i + 1) * 30 * p}px)`
    })
    f++
  })
}

// 06 — Pendulum Away
// Letters swing out from their top edge like a pendulum, alternating
// direction. Stagger ripples across the word so it swings in a wave.
function anim_06() {
  const chars = setup()
  const N = chars.length
  let f = 0
  loop(() => {
    chars.forEach((ch, i) => {
      const p   = cyc(f, i * 5, 44, 38, 40, 42, ease.outBack, ease.in)
      const dir = i % 2 === 0 ? -1 : 1
      ch.style.transformOrigin = '50% 0%'
      ch.style.transform       = `rotate(${dir * 38 * p}deg)`
    })
    f++
  })
}

// 07 — Wave Lock
// Letters freeze simultaneously into a sine wave and hold the pose, then
// all dissolve back to the ghost at once. No stagger — they move as one.
function anim_07() {
  const chars = setup()
  const N = chars.length
  let f = 0
  loop(() => {
    const p = cyc(f, 0, 50, 55, 44, 45)
    chars.forEach((ch, i) => {
      const waveY = Math.sin((i / (N - 1)) * Math.PI * 2) * 64
      ch.style.transform = `translateY(${waveY * p}px)`
    })
    f++
  })
}

// 08 — Orbit Ring
// Letters fly to evenly spaced positions on an invisible circle, like a
// clock face. They overshoot their orbit slot then return to the ghost.
function anim_08() {
  const chars = setup()
  const N = chars.length
  let f = 0
  loop(() => {
    chars.forEach((ch, i) => {
      const p     = cyc(f, i * 5, 52, 40, 46, 38, ease.outBack, ease.in)
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2
      const tx    = Math.cos(angle) * 140 * p
      const ty    = Math.sin(angle) * 140 * p
      ch.style.transform = `translate(${tx}px, ${ty}px)`
    })
    f++
  })
}

// 09 — Crush Together
// Letters compress toward the word's center — left letters move right,
// right letters move left — piling up in the middle before snapping back.
function anim_09() {
  const chars = setup()
  const N = chars.length
  let f = 0
  loop(() => {
    const center = (N - 1) / 2
    chars.forEach((ch, i) => {
      const p  = cyc(f, i * 4, 40, 38, 36, 44, ease.out, ease.outBack)
      const tx = (center - i) * 22 * p
      ch.style.transform = `translateX(${tx}px)`
    })
    f++
  })
}

// 10 — Fold Away
// Letters fold backward around their top edge as if flipping into a page,
// each one slightly after the last. The ghost makes the snap-back obvious.
function anim_10() {
  const chars = setup()
  const N = chars.length
  let f = 0
  loop(() => {
    chars.forEach((ch, i) => {
      const p  = cyc(f, i * 5, 46, 38, 42, 44, ease.inOut, ease.in)
      const rx = -88 * p
      const ty =  70 * p
      ch.style.transformOrigin = '50% 0%'
      ch.style.transform       = `perspective(500px) rotateX(${rx}deg) translateY(${ty}px)`
    })
    f++
  })
}


// ─── Start ────────────────────────────────────────────────────────────────────
run(anim_01)
