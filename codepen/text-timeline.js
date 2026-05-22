/* ═══════════════════════════════════════════════════════════════════════════
   TEXT TIMELINE — jeanphilippebelley.com
   ─────────────────────────────────────────────────────────────────────────
   title: Text Timeline Loop Animations
   desc:  10 looping text animations built on a single cycle function: each
          letter travels from a start state to a target state, pauses, then
          returns. No spring physics — pure easing with fixed timing. Tweak
          enter/hold/exit/pause and the stagger offset to reshape every loop.
   tags:  text-animation, timeline, loop, easing, typography
   ─────────────────────────────────────────────────────────────────────────
   HTML — paste in the HTML pane:
   ─────────────────────────────────────────────────────────────────────────

   <link href="https://fonts.googleapis.com/css2?family=Recursive:wght,CASL,MONO,slnt,CRSV@300..1000,0..1,0..1,-15..0,0..1&display=swap" rel="stylesheet">

   <div id="stage">
     <h1 class="text">Always</h1>
   </div>

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


// ─── DOM ──────────────────────────────────────────────────────────────────────
const TEXT_EL = document.querySelector('.text')
const BTN     = document.getElementById('replay')

// ─── Split ────────────────────────────────────────────────────────────────────
function split() {
  const raw = TEXT_EL.textContent
  TEXT_EL.textContent = ''
  return raw.split('').map(ch => {
    const s = document.createElement('span')
    s.className   = 'char'
    s.textContent = ch
    TEXT_EL.appendChild(s)
    return s
  })
}

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
// Core timeline primitive. Returns a single progress value:
//   0 = letter is at its START state
//   1 = letter is at its TARGET state
//
// Parameters (all in frames):
//   f      – current frame counter
//   offset – per-letter stagger delay (i * STAGGER)
//   enter  – frames to move from start → target
//   hold   – frames to pause at target
//   exit   – frames to move from target → start
//   pause  – frames to pause at start before the next loop
//   eIn    – easing function applied to the enter phase (default: ease.out)
//   eOut   – easing function applied to the exit phase  (default: ease.in)
//
// Usage: const p = cyc(f, i * 8, 35, 50, 28, 35)
//        ch.style.opacity   = p
//        ch.style.transform = `translateY(${(1 - p) * 30}px)`
function cyc(f, offset, enter, hold, exit, pause, eIn = ease.out, eOut = ease.in) {
  if (f < offset) return 0                          // stagger delay: wait at start
  const total = enter + hold + exit + pause
  const t = (f - offset) % total
  if (t < enter)                return eIn(t / enter)
  if (t < enter + hold)         return 1
  if (t < enter + hold + exit)  return 1 - eOut((t - enter - hold) / exit)
  return 0
}

// Linear interpolation helper
const lerp = (a, b, t) => a + (b - a) * t


// ─── ANIMATIONS ───────────────────────────────────────────────────────────────


// ── 01  Rise & Fall ───────────────────────────────────────────────────────────
// title: Rise & Fall
// desc:  Each letter climbs from below the baseline with a fade, settles at
//        its natural position, then sinks back down and disappears. A gentle
//        stagger ripples through the word, making each loop feel like a soft
//        breath rather than a mechanical repeat.
// tags:  text-animation, translateY, fade, stagger, loop
// function anim_01() {
//   const chars = split()
//   const STAGGER = 7, ENTER = 36, HOLD = 55, EXIT = 28, PAUSE = 38
//   let f = 0
//   loop(() => {
//     f++
//     chars.forEach((ch, i) => {
//       const p = cyc(f, i * STAGGER, ENTER, HOLD, EXIT, PAUSE)
//       ch.style.opacity   = p
//       ch.style.transform = `translateY(${(1 - p) * 34}px)`
//     })
//   })
// }


// ── 02  Scale Bloom ───────────────────────────────────────────────────────────
// title: Scale Bloom
// desc:  Letters grow from an invisible pinpoint with a slight overshoot on
//        arrival — the back-ease makes each letter feel like it snaps into
//        place. After the hold they contract back to nothing. The stagger
//        creates a blooming wave from left to right.
// tags:  text-animation, scale, overshoot, bloom, loop
function anim_02() {
  const chars = split()
  const STAGGER = 9, ENTER = 42, HOLD = 52, EXIT = 30, PAUSE = 32
  let f = 0
  loop(() => {
    f++
    chars.forEach((ch, i) => {
      const p = cyc(f, i * STAGGER, ENTER, HOLD, EXIT, PAUSE, ease.outBack, ease.in)
      ch.style.opacity   = Math.min(1, p * 2.5)   // fade in quickly at start of scale
      ch.style.transform = `scale(${Math.max(0, p)})`
    })
  })
}


// ── 03  Tilt Wave ─────────────────────────────────────────────────────────────
// title: Tilt Wave
// desc:  Letters begin tilted at 15° and rotate to upright, hold, then lean
//        back. The stagger makes the correction travel across the word as a
//        visible wave — like a row of dominoes slowly standing up and lying
//        back down in sequence.
// tags:  text-animation, rotate, wave, stagger, loop
function anim_03() {
  const chars = split()
  const STAGGER = 8, ENTER = 38, HOLD = 50, EXIT = 32, PAUSE = 36
  let f = 0
  loop(() => {
    f++
    chars.forEach((ch, i) => {
      ch.style.transformOrigin = '50% 100%'
      const p = cyc(f, i * STAGGER, ENTER, HOLD, EXIT, PAUSE)
      ch.style.opacity   = 0.15 + p * 0.85
      ch.style.transform = `rotateZ(${(1 - p) * 15}deg)`
    })
  })
}


// ── 04  Blur Emerge ───────────────────────────────────────────────────────────
// title: Blur Emerge
// desc:  Each letter materialises out of a 12px blur — as if condensing from
//        haze into sharp form. After the hold, it dissolves back into soft
//        focus. The staggered timing means the word sharpens and blurs like
//        a slow wave of focus sweeping across the text.
// tags:  text-animation, blur, filter, emerge, loop
function anim_04() {
  const chars = split()
  const STAGGER = 9, ENTER = 44, HOLD = 55, EXIT = 34, PAUSE = 34
  let f = 0
  loop(() => {
    f++
    chars.forEach((ch, i) => {
      const p  = cyc(f, i * STAGGER, ENTER, HOLD, EXIT, PAUSE)
      const bl = (1 - p) * 12
      ch.style.opacity = p
      ch.style.filter  = `blur(${bl.toFixed(2)}px)`
    })
  })
}


// ── 05  Flip Through ──────────────────────────────────────────────────────────
// title: Flip Through
// desc:  Letters fold in from behind the plane on a horizontal axis — arriving
//        from -90° and rotating to face forward. After the hold they fold
//        away forward to +90°, as if the word is a sequence of cards being
//        turned over one by one.
// tags:  text-animation, 3d, rotateX, flip, perspective
function anim_05() {
  const chars = split()
  const STAGGER = 8, ENTER = 40, HOLD = 52, EXIT = 32, PAUSE = 34
  let f = 0
  loop(() => {
    f++
    chars.forEach((ch, i) => {
      const p = cyc(f, i * STAGGER, ENTER, HOLD, EXIT, PAUSE)
      // p: 0→1 (enter from -90°) then 1→0 (exit toward +90°)
      // Map p to angle: 0→-90° at rest, 1→0° at target, exit mirrors entry
      const angle = (1 - p) * -90
      ch.style.opacity   = p < 0.15 ? p / 0.15 : p > 0.85 ? (1 - p) / 0.15 : 1
      ch.style.transform = `perspective(600px) rotateX(${angle}deg)`
    })
  })
}


// ── 06  Weight Bloom ──────────────────────────────────────────────────────────
// title: Weight Bloom
// desc:  Each letter's weight springs from hairline (wght 150) to heavy
//        (wght 860) using the Recursive variable font, holds at bold, then
//        thins back out. The letterforms physically fatten and slim — no
//        transforms, just the typeface's own axes responding to the timeline.
// tags:  variable-fonts, weight, bloom, recursive, loop
function anim_06() {
  const chars = split()
  const STAGGER = 7, ENTER = 40, HOLD = 55, EXIT = 35, PAUSE = 36
  let f = 0
  loop(() => {
    f++
    chars.forEach((ch, i) => {
      const p = cyc(f, i * STAGGER, ENTER, HOLD, EXIT, PAUSE, ease.inOut, ease.inOut)
      const wght = lerp(150, 860, p)
      const casl = lerp(0, 0.6, p)
      ch.style.fontVariationSettings = `'wght' ${wght.toFixed(0)}, 'CASL' ${casl.toFixed(3)}`
    })
  })
}


// ── 07  Float ─────────────────────────────────────────────────────────────────
// title: Float
// desc:  Letters drift upward from their resting position, hover at the peak,
//        then settle back down to baseline. The stagger creates a gentle
//        Mexican wave — letters lifting and falling in a slow, continuous
//        ripple that never fully stops.
// tags:  text-animation, float, translateY, wave, loop
function anim_07() {
  const chars = split()
  const STAGGER = 8, ENTER = 45, HOLD = 45, EXIT = 38, PAUSE = 30
  let f = 0
  loop(() => {
    f++
    chars.forEach((ch, i) => {
      const p = cyc(f, i * STAGGER, ENTER, HOLD, EXIT, PAUSE, ease.inOut, ease.inOut)
      ch.style.transform = `translateY(${-28 * p}px)`
    })
  })
}


// ── 08  Neon Pulse ────────────────────────────────────────────────────────────
// title: Neon Pulse
// desc:  Letters shift from dim white to violet with a growing glow — as if
//        each character momentarily charges with electricity. The colour and
//        halo build to a peak, hold, then drain back to rest. The stagger
//        sends the pulse travelling left to right across the word.
// tags:  text-animation, colour, glow, neon, loop
function anim_08() {
  const chars = split()
  const STAGGER = 7, ENTER = 38, HOLD = 52, EXIT = 30, PAUSE = 36
  let f = 0
  loop(() => {
    f++
    chars.forEach((ch, i) => {
      const p = cyc(f, i * STAGGER, ENTER, HOLD, EXIT, PAUSE, ease.inOut, ease.in)
      const r = lerp(232, 124, p) | 0
      const g = lerp(234,  92, p) | 0
      const b = lerp(240, 255, p) | 0
      const glow = p * 18
      ch.style.color      = `rgb(${r},${g},${b})`
      ch.style.textShadow = `0 0 ${glow}px rgba(124,92,255,${(p * 0.85).toFixed(3)}), ` +
                            `0 0 ${glow * 2.5}px rgba(100,60,255,${(p * 0.4).toFixed(3)})`
    })
  })
}


// ── 09  Squeeze Pop ───────────────────────────────────────────────────────────
// title: Squeeze Pop
// desc:  Each letter begins as a thin horizontal strip — squashed to near
//        zero height and stretched wide — then pops open to its natural
//        proportions. After holding, it squeezes back into the strip. The
//        stagger makes the word look like it's opening like a set of blinds.
// tags:  text-animation, scale, squash-stretch, pop, loop
function anim_09() {
  const chars = split()
  const STAGGER = 10, ENTER = 38, HOLD = 52, EXIT = 30, PAUSE = 38
  let f = 0
  loop(() => {
    f++
    chars.forEach((ch, i) => {
      const p = cyc(f, i * STAGGER, ENTER, HOLD, EXIT, PAUSE, ease.outBack, ease.in)
      const sY = lerp(0.04, 1, p)
      const sX = lerp(1.70, 1, p)
      ch.style.opacity   = p < 0.08 ? p / 0.08 : 1
      ch.style.transform = `scaleX(${sX.toFixed(4)}) scaleY(${sY.toFixed(4)})`
    })
  })
}


// ── 10  Cascade Drop ──────────────────────────────────────────────────────────
// title: Cascade Drop
// desc:  A large per-letter stagger (14 frames) sends each character tumbling
//        in from above one at a time — the bounce ease makes each feel like
//        it lands and settles. After holding in formation, letters lift back
//        up with a smooth ease-in. The gap between first and last arrival
//        makes the word feel like it assembles itself from top to bottom.
// tags:  text-animation, cascade, bounce, drop, stagger
function anim_10() {
  const chars = split()
  const STAGGER = 14, ENTER = 42, HOLD = 62, EXIT = 34, PAUSE = 36
  let f = 0
  loop(() => {
    f++
    chars.forEach((ch, i) => {
      const p = cyc(f, i * STAGGER, ENTER, HOLD, EXIT, PAUSE, ease.bounce, ease.in)
      ch.style.opacity   = p < 0.12 ? p / 0.12 : 1
      ch.style.transform = `translateY(${(1 - p) * -46}px)`
    })
  })
}


// ─── Start ────────────────────────────────────────────────────────────────────
run(anim_01)
