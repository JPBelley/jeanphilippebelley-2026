/* ═══════════════════════════════════════════════════════════════════════════════
   20 TEXT ANIMATIONS — jeanphilippebelley.com
   ───────────────────────────────────────────────────────────────────────────────
   HTML — paste in the HTML pane:
   ───────────────────────────────────────────────────────────────────────────────

   <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=DM+Mono&display=swap" rel="stylesheet">

   <div id="stage">
     <h1 class="text">Always cooking something</h1>
     <button id="replay">↺ Replay</button>
   </div>

   <a href="https://jeanphilippebelley.com/" target="_blank" id="credit">
     JP<span>.</span>
   </a>

   ───────────────────────────────────────────────────────────────────────────────
   CSS — paste in the CSS pane:
   ───────────────────────────────────────────────────────────────────────────────

   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
   body {
     background: #0F1115;
     display: flex; align-items: center; justify-content: center;
     min-height: 100vh;
     font-family: 'Space Grotesk', sans-serif;
   }
   #stage { text-align: center; padding: 20px; }
   .text {
     font-size: clamp(28px, 5vw, 64px);
     font-weight: 700;
     color: #E8EAF0;
     letter-spacing: -0.02em;
     display: flex; flex-wrap: wrap; justify-content: center;
   }
   .char { display: inline-block; white-space: pre; }
   #replay {
     margin: 48px auto 0;
     padding: 10px 24px;
     background: rgba(124,92,255,0.12);
     border: 1px solid rgba(124,92,255,0.3);
     border-radius: 6px;
     color: #7C5CFF;
     font-family: 'DM Mono', monospace;
     font-size: 12px;
     cursor: pointer;
     display: block;
     transition: background 0.2s;
   }
   #replay:hover { background: rgba(124,92,255,0.25); }
   #credit {
     position: fixed;
     bottom: 20px; right: 24px;
     font-family: 'Space Grotesk', sans-serif;
     font-size: 13px;
     font-weight: 700;
     letter-spacing: 0.06em;
     color: rgba(232,234,240,0.35);
     text-decoration: none;
     transition: color 0.2s;
   }
   #credit span { color: #7C5CFF; }
   #credit:hover { color: rgba(232,234,240,0.75); }

   ═══════════════════════════════════════════════════════════════════════════════
   INSTRUCTIONS
   ─────────────────────────────────────────────────────────────────────────────
   Paste all three sections in the respective CodePen panes.
   In the JS pane, keep only ONE animation call at the bottom:
     run(anim_XX)
   Change XX (01–20) to switch animations.
   ═══════════════════════════════════════════════════════════════════════════════ */


// ─── Shared helpers ───────────────────────────────────────────────────────────

const TEXT  = document.querySelector('.text')
const BTN   = document.getElementById('replay')

/** Split element text into .char spans, preserving spaces */
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

/** Inject a @keyframes rule if not already present */
function keyframes(name, css) {
  if (document.getElementById('kf-' + name)) return
  const style = document.createElement('style')
  style.id = 'kf-' + name
  style.textContent = `@keyframes ${name} { ${css} }`
  document.head.appendChild(style)
}

/** Run an animation function, re-run on button click */
function run(fn) {
  fn()
  BTN.onclick = fn
}


// ─── 01  Fade Up — classic stagger ───────────────────────────────────────────
function anim_01() {
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    ch.style.cssText = 'opacity:0; transform:translateY(28px); transition:none'
    setTimeout(() => {
      ch.style.transition = `opacity 0.55s ease ${i * 45}ms, transform 0.55s ease ${i * 45}ms`
      ch.style.opacity = '1'
      ch.style.transform = 'translateY(0)'
    }, 20)
  })
}


// ─── 02  Blur In — letters sharpen from fog ──────────────────────────────────
function anim_02() {
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    ch.style.cssText = 'opacity:0; filter:blur(12px); transition:none'
    setTimeout(() => {
      ch.style.transition = `opacity 0.6s ease ${i * 40}ms, filter 0.6s ease ${i * 40}ms`
      ch.style.opacity = '1'
      ch.style.filter = 'blur(0)'
    }, 20)
  })
}


// ─── 03  Scale Bounce — overshoot spring ─────────────────────────────────────
function anim_03() {
  const chars = split(TEXT)
  const spring = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  chars.forEach((ch, i) => {
    ch.style.cssText = 'opacity:0; transform:scale(0.3); transition:none; transform-origin:50% 80%'
    setTimeout(() => {
      ch.style.transition = `opacity 0.5s ease ${i * 50}ms, transform 0.6s ${spring} ${i * 50}ms`
      ch.style.opacity = '1'
      ch.style.transform = 'scale(1)'
    }, 20)
  })
}


// ─── 04  Slide from Right ─────────────────────────────────────────────────────
function anim_04() {
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    const delay = (chars.length - 1 - i) * 40
    ch.style.cssText = 'opacity:0; transform:translateX(36px); transition:none'
    setTimeout(() => {
      ch.style.transition = `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms`
      ch.style.opacity = '1'
      ch.style.transform = 'translateX(0)'
    }, 20)
  })
}


// ─── 05  Wave — sine-curve delay ─────────────────────────────────────────────
function anim_05() {
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    const delay = i * 55 + Math.sin(i * 0.9) * 120
    ch.style.cssText = 'opacity:0; transform:translateY(32px); transition:none'
    setTimeout(() => {
      ch.style.transition = `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms`
      ch.style.opacity = '1'
      ch.style.transform = 'translateY(0)'
    }, 20)
  })
}


// ─── 06  Flip X — rotate on horizontal axis ──────────────────────────────────
function anim_06() {
  TEXT.style.perspective = '600px'
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    ch.style.cssText = 'opacity:0; transform:rotateX(90deg); transition:none; transform-origin:50% 100%'
    setTimeout(() => {
      ch.style.transition = `opacity 0.4s ease ${i * 50}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 50}ms`
      ch.style.opacity = '1'
      ch.style.transform = 'rotateX(0)'
    }, 20)
  })
}


// ─── 07  Flip Y — rotate on vertical axis ────────────────────────────────────
function anim_07() {
  TEXT.style.perspective = '600px'
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    ch.style.cssText = 'opacity:0; transform:rotateY(90deg); transition:none'
    setTimeout(() => {
      ch.style.transition = `opacity 0.4s ease ${i * 55}ms, transform 0.55s cubic-bezier(0.34,1.56,0.64,1) ${i * 55}ms`
      ch.style.opacity = '1'
      ch.style.transform = 'rotateY(0)'
    }, 20)
  })
}


// ─── 08  Typewriter — one char at a time with cursor ─────────────────────────
function anim_08() {
  const chars = split(TEXT)
  chars.forEach(ch => { ch.style.opacity = '0' })
  chars.forEach((ch, i) => {
    setTimeout(() => {
      ch.style.transition = 'none'
      ch.style.opacity = '1'
    }, i * 80)
  })
}


// ─── 09  Scramble — random chars settle into real ones ───────────────────────
function anim_09() {
  const CHARS   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$'
  const original = TEXT.textContent.split('')
  const spans   = split(TEXT)

  spans.forEach((ch, i) => {
    if (ch.textContent === ' ') return
    let ticks = 0
    const target  = original[i]
    const delay   = i * 40
    const settle  = 8 + Math.floor(Math.random() * 6)
    setTimeout(() => {
      const iv = setInterval(() => {
        ch.textContent = ticks >= settle
          ? target
          : CHARS[Math.floor(Math.random() * CHARS.length)]
        ch.style.color = ticks >= settle ? '#E8EAF0' : '#7C5CFF'
        if (ticks >= settle) clearInterval(iv)
        ticks++
      }, 50)
    }, delay)
  })
}


// ─── 10  Glitch — rapid jitter then settle ───────────────────────────────────
function anim_10() {
  keyframes('glitch-jitter', `
    0%   { transform: translate(-4px, 2px) skewX(-5deg); opacity: 0.4; color: #7C5CFF; }
    20%  { transform: translate(4px, -2px) skewX(3deg);  opacity: 0.7; color: #2EE6A6; }
    40%  { transform: translate(-2px, 4px) skewX(-2deg); opacity: 0.5; }
    60%  { transform: translate(3px, -3px) skewX(4deg);  opacity: 0.8; }
    80%  { transform: translate(-1px, 1px);               opacity: 0.9; }
    100% { transform: translate(0, 0);                    opacity: 1;   color: #E8EAF0; }
  `)
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    ch.style.opacity = '0'
    setTimeout(() => {
      ch.style.animation = `glitch-jitter 0.5s ease forwards`
    }, i * 40)
  })
}


// ─── 11  Color Sweep — violet → mint → white ─────────────────────────────────
function anim_11() {
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    ch.style.cssText = 'opacity:0; transform:translateY(20px); color:#7C5CFF; transition:none'
    setTimeout(() => {
      ch.style.transition = `opacity 0.4s ease, transform 0.4s ease, color 0.6s ease 0.15s`
      ch.style.opacity = '1'
      ch.style.transform = 'translateY(0)'
      setTimeout(() => { ch.style.color = '#2EE6A6' }, i * 40 + 200)
      setTimeout(() => { ch.style.color = '#E8EAF0' }, i * 40 + 600)
    }, i * 40 + 20)
  })
}


// ─── 12  Center Out — chars closest to middle animate first ──────────────────
function anim_12() {
  const chars = split(TEXT)
  const mid = (chars.length - 1) / 2
  chars.forEach((ch, i) => {
    const dist  = Math.abs(i - mid)
    const delay = dist * 55
    ch.style.cssText = 'opacity:0; transform:scale(0.5) translateY(20px); transition:none'
    setTimeout(() => {
      ch.style.transition = `opacity 0.5s ease ${delay}ms, transform 0.55s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`
      ch.style.opacity = '1'
      ch.style.transform = 'scale(1) translateY(0)'
    }, 20)
  })
}


// ─── 13  Fall Down — chars drop in from above ────────────────────────────────
function anim_13() {
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    ch.style.cssText = 'opacity:0; transform:translateY(-60px); transition:none'
    setTimeout(() => {
      ch.style.transition = `opacity 0.3s ease ${i * 45}ms, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 45}ms`
      ch.style.opacity = '1'
      ch.style.transform = 'translateY(0)'
    }, 20)
  })
}


// ─── 14  RTL — right to left stagger ─────────────────────────────────────────
function anim_14() {
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    const delay = (chars.length - 1 - i) * 45
    ch.style.cssText = 'opacity:0; transform:translateY(28px); transition:none'
    setTimeout(() => {
      ch.style.transition = `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms`
      ch.style.opacity = '1'
      ch.style.transform = 'translateY(0)'
    }, 20)
  })
}


// ─── 15  Neon Pulse — glow ignites letter by letter ──────────────────────────
function anim_15() {
  keyframes('neon-in', `
    0%   { opacity: 0; text-shadow: none; }
    30%  { opacity: 1; text-shadow: 0 0 8px #7C5CFF, 0 0 20px #7C5CFF, 0 0 40px #7C5CFF; color: #fff; }
    60%  { text-shadow: 0 0 4px #2EE6A6, 0 0 12px #2EE6A6; color: #fff; }
    100% { opacity: 1; text-shadow: none; color: #E8EAF0; }
  `)
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    ch.style.opacity = '0'
    setTimeout(() => {
      ch.style.animation = `neon-in 0.7s ease forwards`
    }, i * 55)
  })
}


// ─── 16  Elastic Snap — scale from 0 with elastic bounce ─────────────────────
function anim_16() {
  keyframes('elastic-snap', `
    0%   { transform: scale(0);    opacity: 0; }
    55%  { transform: scale(1.35); opacity: 1; }
    75%  { transform: scale(0.88); }
    90%  { transform: scale(1.08); }
    100% { transform: scale(1);    opacity: 1; }
  `)
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    ch.style.opacity = '0'
    ch.style.transformOrigin = '50% 80%'
    setTimeout(() => {
      ch.style.animation = `elastic-snap 0.7s ease forwards`
    }, i * 55)
  })
}


// ─── 17  Rotate In — spin + rise ─────────────────────────────────────────────
function anim_17() {
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    ch.style.cssText = 'opacity:0; transform:translateY(30px) rotate(-20deg); transition:none; transform-origin:50% 80%'
    setTimeout(() => {
      ch.style.transition = `opacity 0.5s ease ${i * 50}ms, transform 0.55s cubic-bezier(0.34,1.3,0.64,1) ${i * 50}ms`
      ch.style.opacity = '1'
      ch.style.transform = 'translateY(0) rotate(0)'
    }, 20)
  })
}


// ─── 18  Anticipate — dip down before rising up ──────────────────────────────
function anim_18() {
  keyframes('anticipate', `
    0%   { transform: translateY(0)  scale(1);    opacity: 0; }
    20%  { transform: translateY(8px) scale(0.95); opacity: 0.4; }
    100% { transform: translateY(-0px) scale(1);   opacity: 1; }
  `)
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    ch.style.opacity = '0'
    setTimeout(() => {
      ch.style.animation = `anticipate 0.7s cubic-bezier(0.36,-0.3,0.63,1.3) forwards`
    }, i * 50)
  })
}


// ─── 19  Stagger Fade — slow, cinematic, large delay spread ──────────────────
function anim_19() {
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    const delay = i * 80
    ch.style.cssText = 'opacity:0; transform:translateY(10px); transition:none'
    setTimeout(() => {
      ch.style.transition = `opacity 1s ease ${delay}ms, transform 1s ease ${delay}ms`
      ch.style.opacity = '1'
      ch.style.transform = 'translateY(0)'
    }, 20)
  })
}


// ─── 20  Random Rain — chars fall from random heights ────────────────────────
function anim_20() {
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    const fromY = -(40 + Math.random() * 120)
    const delay  = Math.random() * 600
    const dur    = 400 + Math.random() * 300
    ch.style.cssText = `opacity:0; transform:translateY(${fromY}px); transition:none`
    setTimeout(() => {
      ch.style.transition = `opacity ${dur}ms ease, transform ${dur}ms cubic-bezier(0.34,1.4,0.64,1)`
      ch.style.opacity = '1'
      ch.style.transform = 'translateY(0)'
    }, delay)
  })
}


// ─── Launch ───────────────────────────────────────────────────────────────────
// Change anim_01 to any anim_01 – anim_20 to preview that animation.

run(anim_01)