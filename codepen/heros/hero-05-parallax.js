/* ═══════════════════════════════════════════════════════════════════════════
   HERO 05 — DEEP SPACE PARALLAX — jeanphilippebelley.com
   ─────────────────────────────────────────────────────────────────────────
   title: Deep Space Parallax Hero
   desc:  Cinematic dark hero with three depth layers that drift apart on
          mouse move: canvas star field in the background, main text in the
          mid-ground, a floating ring accent in the foreground. Stars drift
          slowly on their own and shift with the cursor. No libraries.
   tags:  parallax, canvas, depth, hero, javascript
   ─────────────────────────────────────────────────────────────────────────
   HTML — paste in the HTML pane:
   ─────────────────────────────────────────────────────────────────────────

   <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700&family=DM+Mono:wght@300&display=swap" rel="stylesheet">

   <canvas id="stars"></canvas>

   <div id="scene">
     <!-- Layer -2: distant backdrop text -->
     <div class="layer" data-speed="-0.018">
       <div class="ghost-text">CREATIVE<br>DEVELOPER</div>
     </div>

     <!-- Layer 0: main content -->
     <div class="layer" data-speed="0">
       <div class="main">
         <div class="eyebrow">Jean-Philippe Belley</div>
         <h1>Building<br><em>beautiful</em><br>things.</h1>
         <p class="desc">Full Stack · WebGL · Generative Art</p>
         <div class="btns">
           <a href="#" class="btn-p">Explore work</a>
           <a href="#" class="btn-s">Get in touch</a>
         </div>
       </div>
     </div>

     <!-- Layer +1: near foreground accent -->
     <div class="layer" data-speed="0.034">
       <div class="ring-wrap">
         <div class="ring"></div>
       </div>
     </div>
   </div>

   ─────────────────────────────────────────────────────────────────────────
   CSS — paste in the CSS pane:
   ─────────────────────────────────────────────────────────────────────────

   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

   body {
     background: #060812;
     min-height: 100vh;
     overflow: hidden;
     position: relative;
   }

   #stars {
     position: fixed;
     inset: 0;
     width: 100%; height: 100%;
   }

   #scene {
     position: relative;
     z-index: 1;
     min-height: 100vh;
     pointer-events: none;
   }

   .layer {
     position: absolute;
     inset: 0;
     display: flex;
     align-items: center;
     pointer-events: none;
     will-change: transform;
   }

   /* Layer -2: giant ghost text */
   .ghost-text {
     position: absolute;
     left: -0.06em;
     top: 50%;
     transform: translateY(-50%);
     font-family: 'Space Grotesk', sans-serif;
     font-size: clamp(80px, 16vw, 200px);
     font-weight: 700;
     color: rgba(124,92,255,0.04);
     line-height: 0.9;
     letter-spacing: -0.04em;
     user-select: none;
     white-space: nowrap;
   }

   /* Layer 0: main content */
   .main {
     padding: 0 clamp(32px, 8vw, 120px);
     pointer-events: all;
   }

   .eyebrow {
     font-family: 'DM Mono', monospace;
     font-size: 11px;
     font-weight: 300;
     letter-spacing: 0.2em;
     text-transform: uppercase;
     color: rgba(46,230,166,0.5);
     margin-bottom: 26px;
   }

   h1 {
     font-family: 'Space Grotesk', sans-serif;
     font-size: clamp(56px, 11vw, 132px);
     font-weight: 700;
     color: #E8EAF0;
     line-height: 0.93;
     letter-spacing: -0.04em;
   }
   h1 em {
     font-style: italic;
     font-weight: 300;
     color: rgba(232,234,240,0.45);
   }

   .desc {
     font-family: 'DM Mono', monospace;
     font-size: 13px;
     font-weight: 300;
     color: rgba(232,234,240,0.28);
     letter-spacing: 0.05em;
     margin-top: 32px;
   }

   .btns {
     display: flex;
     gap: 14px;
     margin-top: 44px;
     flex-wrap: wrap;
   }

   .btn-p {
     background: rgba(124,92,255,0.18);
     border: 1px solid rgba(124,92,255,0.4);
     color: #A08AFF;
     font-family: 'DM Mono', monospace;
     font-size: 11px;
     letter-spacing: 0.12em;
     padding: 13px 26px;
     text-decoration: none;
     pointer-events: all;
     transition: background 0.2s;
   }
   .btn-p:hover { background: rgba(124,92,255,0.32); }

   .btn-s {
     border: 1px solid rgba(232,234,240,0.1);
     color: rgba(232,234,240,0.3);
     font-family: 'DM Mono', monospace;
     font-size: 11px;
     letter-spacing: 0.12em;
     padding: 13px 26px;
     text-decoration: none;
     pointer-events: all;
     transition: all 0.2s;
   }
   .btn-s:hover { color: rgba(232,234,240,0.7); border-color: rgba(232,234,240,0.3); }

   /* Layer +1: floating ring */
   .ring-wrap {
     position: absolute;
     right: clamp(40px, 8vw, 160px);
     top: 50%;
     transform: translateY(-50%);
   }

   .ring {
     width: clamp(120px, 18vw, 240px);
     height: clamp(120px, 18vw, 240px);
     border-radius: 50%;
     border: 1px solid rgba(46,230,166,0.14);
     box-shadow:
       0 0 0 1px rgba(46,230,166,0.06),
       inset 0 0 60px rgba(124,92,255,0.06),
       0 0 80px rgba(46,230,166,0.04);
     animation: spin 18s linear infinite;
   }
   .ring::before {
     content: '';
     position: absolute;
     top: 12%;
     left: -2px;
     width: 4px; height: 4px;
     border-radius: 50%;
     background: rgba(46,230,166,0.6);
     box-shadow: 0 0 8px rgba(46,230,166,0.4);
   }
   @keyframes spin { to { transform: rotate(360deg); } }

   ═══════════════════════════════════════════════════════════════════════ */


// ─── Canvas: star field ──────────────────────────────────────────────────────
const cv  = document.getElementById('stars')
const ctx = cv.getContext('2d')

function resize() {
  cv.width  = window.innerWidth
  cv.height = window.innerHeight
}
resize()
window.addEventListener('resize', () => { resize(); buildStars() })

// Build stars with random positions, sizes, velocities, opacity
const STAR_COUNT = 280
let stars = []

function buildStars() {
  stars = Array.from({ length: STAR_COUNT }, () => ({
    x:    Math.random() * cv.width,
    y:    Math.random() * cv.height,
    r:    Math.random() * 1.4 + 0.2,
    vx:   (Math.random() - 0.5) * 0.06,
    vy:   (Math.random() - 0.5) * 0.04,
    // Tint: white or violet-tinted
    hue:  Math.random() > 0.8 ? '124,92,255' : '232,234,240',
    op:   0.15 + Math.random() * 0.55,
  }))
}
buildStars()

function drawStars(mx, my) {
  const W = cv.width, H = cv.height
  ctx.clearRect(0, 0, W, H)
  stars.forEach(s => {
    // Drift
    s.x = (s.x + s.vx + W) % W
    s.y = (s.y + s.vy + H) % H
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${s.hue},${s.op})`
    ctx.fill()
  })
}

// ─── Parallax ────────────────────────────────────────────────────────────────
const layers = document.querySelectorAll('.layer')
// Lerped mouse position (normalized -1..1)
const mouse  = { x: 0, y: 0 }
let   tx = 0, ty = 0

document.addEventListener('mousemove', e => {
  tx = (e.clientX / window.innerWidth  - 0.5) * 2
  ty = (e.clientY / window.innerHeight - 0.5) * 2
})

// ─── Loop ─────────────────────────────────────────────────────────────────────
const MAX_SHIFT = 70 // max px any layer can move

function tick() {
  // Smooth mouse
  mouse.x += (tx - mouse.x) * 0.055
  mouse.y += (ty - mouse.y) * 0.055

  // Shift layers
  layers.forEach(layer => {
    const speed = parseFloat(layer.dataset.speed)
    const lx    = mouse.x * speed * MAX_SHIFT
    const ly    = mouse.y * speed * MAX_SHIFT
    layer.style.transform = `translate(${lx}px, ${ly}px)`
  })

  drawStars(mouse.x, mouse.y)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
