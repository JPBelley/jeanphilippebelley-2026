/* ═══════════════════════════════════════════════════════════════════════════
   HERO 01 — MAGNETIC TYPOGRAPHY — jeanphilippebelley.com
   ─────────────────────────────────────────────────────────────────────────
   title: Magnetic Typography Hero
   desc:  Full-screen dark hero where the name splits into spring-physics
          characters. Each letter repels from the cursor and snaps back
          with elastic damping. Oversized italic serif, warm cream palette,
          red accent. Zero decoration — the physics is the design.
   tags:  spring-physics, cursor-interaction, typography, hero, javascript
   ─────────────────────────────────────────────────────────────────────────
   HTML — paste in the HTML pane:
   ─────────────────────────────────────────────────────────────────────────

   <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet">

   <section id="hero">
     <div class="eyebrow">Creative Developer</div>
     <h1 id="name">
       <div class="h-line">Jean-Philippe</div>
       <div class="h-line">Belley</div>
     </h1>
     <p class="sub">I build beautiful interfaces and generative&nbsp;experiences.<br>Full Stack · WebGL · Always cooking something.</p>
     <nav class="links">
       <a href="#" class="btn-solid">View work</a>
       <a href="#" class="btn-text">jeanphilippebelley.com →</a>
     </nav>
   </section>

   ─────────────────────────────────────────────────────────────────────────
   CSS — paste in the CSS pane:
   ─────────────────────────────────────────────────────────────────────────

   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

   body {
     background: #0A0808;
     min-height: 100vh;
     display: flex;
     align-items: center;
     padding: 0 clamp(28px, 8vw, 120px);
     overflow: hidden;
   }

   #hero { max-width: 900px; }

   .eyebrow {
     font-family: 'DM Mono', monospace;
     font-size: 11px;
     font-weight: 300;
     letter-spacing: 0.22em;
     text-transform: uppercase;
     color: #E6100F;
     margin-bottom: 32px;
   }

   h1 { display: block; }

   .h-line {
     display: block;
     white-space: nowrap;
     line-height: 0.92;
   }

   /* JS splits .h-line text into .char spans */
   .char {
     font-family: 'Instrument Serif', Georgia, serif;
     font-size: clamp(68px, 12vw, 152px);
     font-weight: 400;
     font-style: italic;
     color: #F0EAE0;
     letter-spacing: -0.025em;
     display: inline-block;
     white-space: pre;
     cursor: default;
     will-change: transform;
   }

   .sub {
     font-family: 'DM Mono', monospace;
     font-size: 13px;
     font-weight: 300;
     color: rgba(240,234,224,0.35);
     line-height: 1.85;
     margin-top: 44px;
     max-width: 400px;
     letter-spacing: 0.01em;
   }

   .links {
     display: flex;
     align-items: center;
     gap: 32px;
     margin-top: 52px;
   }

   .btn-solid {
     background: #E6100F;
     color: #F0EAE0;
     font-family: 'DM Mono', monospace;
     font-size: 11px;
     font-weight: 400;
     letter-spacing: 0.14em;
     text-transform: uppercase;
     padding: 14px 30px;
     text-decoration: none;
     display: inline-block;
     transition: opacity 0.2s;
   }
   .btn-solid:hover { opacity: 0.72; }

   .btn-text {
     font-family: 'DM Mono', monospace;
     font-size: 12px;
     font-weight: 300;
     letter-spacing: 0.04em;
     color: rgba(240,234,224,0.28);
     text-decoration: none;
     transition: color 0.2s;
   }
   .btn-text:hover { color: rgba(240,234,224,0.72); }

   ═══════════════════════════════════════════════════════════════════════ */


// ─── Spring 2D ─────────────────────────────────────────────────────────────
function spring2D(s, tx, ty, k = 0.08, d = 0.72) {
  s.vx += (tx - s.x) * k;  s.vx *= d;  s.x += s.vx
  s.vy += (ty - s.y) * k;  s.vy *= d;  s.y += s.vy
}

// ─── Split each .h-line into .char spans ────────────────────────────────────
const lines  = document.querySelectorAll('.h-line')
const chars  = []

lines.forEach(line => {
  const text = line.textContent
  line.textContent = ''
  for (const ch of text) {
    const span = document.createElement('span')
    span.className = 'char'
    span.textContent = ch
    line.appendChild(span)
    chars.push(span)
  }
})

// ─── State: one entry per char ───────────────────────────────────────────────
let rects  = []
let states = chars.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }))

function captureRects() {
  rects = chars.map(ch => ch.getBoundingClientRect())
}

// Wait for fonts + layout before measuring
document.fonts.ready.then(() => requestAnimationFrame(captureRects))
window.addEventListener('resize', () => requestAnimationFrame(captureRects))

// ─── Mouse tracking ──────────────────────────────────────────────────────────
let mx = -9999, my = -9999
const RADIUS = 130, PUSH = 0.65

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY })
document.addEventListener('mouseleave', () => { mx = -9999; my = -9999 })

// ─── Render loop ─────────────────────────────────────────────────────────────
function tick() {
  chars.forEach((ch, i) => {
    if (!rects[i]) return
    const r  = rects[i]
    const s  = states[i]
    const cx = r.left + r.width  / 2 + s.x
    const cy = r.top  + r.height / 2 + s.y
    const dx = cx - mx
    const dy = cy - my
    const dist = Math.hypot(dx, dy)

    // Repulsion impulse
    if (dist < RADIUS && dist > 0) {
      const f = ((RADIUS - dist) / RADIUS) * PUSH
      s.vx += (dx / dist) * f
      s.vy += (dy / dist) * f
    }

    // Spring home
    spring2D(s, 0, 0, 0.055, 0.80)
    ch.style.transform = `translate(${s.x}px,${s.y}px)`
  })
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
