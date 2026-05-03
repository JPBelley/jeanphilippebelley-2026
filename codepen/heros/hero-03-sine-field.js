/* ═══════════════════════════════════════════════════════════════════════════
   HERO 03 — SINE FIELD — jeanphilippebelley.com
   ─────────────────────────────────────────────────────────────────────────
   title: Sine Field Hero
   desc:  Full-screen animated canvas of 48 flowing sine-wave lines that
          shift from violet at the top to mint at the bottom. Layered
          frequencies create an organic, textile-like motion. Minimal dark
          text floats over the field. Mouse proximity disturbs the lines.
   tags:  canvas, sine-wave, generative, hero, javascript
   ─────────────────────────────────────────────────────────────────────────
   HTML — paste in the HTML pane:
   ─────────────────────────────────────────────────────────────────────────

   <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;700&family=DM+Mono:wght@300&display=swap" rel="stylesheet">

   <canvas id="cv"></canvas>
   <div id="content">
     <div class="label">jeanphilippebelley.com</div>
     <h1>Creative<br><span class="hi">Developer</span></h1>
     <p class="desc">Full Stack · WebGL · Generative Art<br>Always cooking something.</p>
     <div class="btns">
       <a href="#" class="btn-v">View experiments</a>
       <a href="#" class="btn-m">Read the blog</a>
     </div>
   </div>

   ─────────────────────────────────────────────────────────────────────────
   CSS — paste in the CSS pane:
   ─────────────────────────────────────────────────────────────────────────

   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

   body {
     background: #080E1A;
     min-height: 100vh;
     overflow: hidden;
   }

   #cv {
     position: fixed;
     inset: 0;
     width: 100%; height: 100%;
   }

   #content {
     position: relative;
     z-index: 1;
     min-height: 100vh;
     display: flex;
     flex-direction: column;
     justify-content: center;
     padding: 0 clamp(32px, 8vw, 120px);
   }

   .label {
     font-family: 'DM Mono', monospace;
     font-size: 10px;
     font-weight: 300;
     letter-spacing: 0.22em;
     text-transform: uppercase;
     color: rgba(46,230,166,0.55);
     margin-bottom: 28px;
   }

   h1 {
     font-family: 'Space Grotesk', sans-serif;
     font-size: clamp(60px, 11vw, 136px);
     font-weight: 700;
     color: #E8EAF0;
     line-height: 0.93;
     letter-spacing: -0.035em;
   }

   .hi {
     color: transparent;
     -webkit-text-stroke: 2px rgba(124,92,255,0.7);
   }

   .desc {
     font-family: 'DM Mono', monospace;
     font-size: 13px;
     font-weight: 300;
     color: rgba(232,234,240,0.32);
     line-height: 1.9;
     margin-top: 36px;
     letter-spacing: 0.02em;
   }

   .btns {
     display: flex;
     gap: 14px;
     margin-top: 48px;
     flex-wrap: wrap;
   }

   .btn-v {
     background: rgba(124,92,255,0.14);
     border: 1px solid rgba(124,92,255,0.32);
     color: #7C5CFF;
     font-family: 'DM Mono', monospace;
     font-size: 11px;
     letter-spacing: 0.1em;
     padding: 13px 24px;
     text-decoration: none;
     transition: background 0.2s;
   }
   .btn-v:hover { background: rgba(124,92,255,0.26); }

   .btn-m {
     border: 1px solid rgba(46,230,166,0.18);
     color: rgba(46,230,166,0.55);
     font-family: 'DM Mono', monospace;
     font-size: 11px;
     letter-spacing: 0.1em;
     padding: 13px 24px;
     text-decoration: none;
     transition: all 0.2s;
   }
   .btn-m:hover { color: #2EE6A6; border-color: rgba(46,230,166,0.45); }

   ═══════════════════════════════════════════════════════════════════════ */


const cv  = document.getElementById('cv')
const ctx = cv.getContext('2d')

// ─── Resize ──────────────────────────────────────────────────────────────────
function resize() {
  cv.width  = window.innerWidth
  cv.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

// ─── Mouse ───────────────────────────────────────────────────────────────────
let mx = -9999, my = -9999
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY })
document.addEventListener('mouseleave', () => { mx = -9999; my = -9999 })

// ─── Line parameters ─────────────────────────────────────────────────────────
const N = 48

// Pre-compute per-line constants so they're stable across frames
const lineParams = Array.from({ length: N }, (_, i) => ({
  phase:  i * 0.38,
  amp1:   18 + Math.sin(i * 0.7)  * 10,
  amp2:   8  + Math.cos(i * 1.1)  * 5,
  freq1:  0.0055 + i * 0.00008,
  freq2:  0.0110 + i * 0.00012,
  speed1: 0.38 + (i % 5) * 0.04,
  speed2: 0.21 + (i % 3) * 0.03,
}))

// ─── Draw ─────────────────────────────────────────────────────────────────────
let t = 0

function draw() {
  const W = cv.width, H = cv.height
  ctx.clearRect(0, 0, W, H)

  for (let i = 0; i < N; i++) {
    const p = lineParams[i]
    const progress = i / (N - 1)

    // Violet (#7C5CFF) → Mint (#2EE6A6)
    const r = Math.round(124 + (46  - 124) * progress)
    const g = Math.round(92  + (230 - 92)  * progress)
    const b = Math.round(255 + (166 - 255) * progress)

    // Lines that are near vertical center are a little brighter
    const centerFactor = 1 - Math.abs(progress - 0.5) * 1.6
    const alpha = 0.06 + centerFactor * 0.09

    ctx.beginPath()
    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`
    ctx.lineWidth   = 1

    const baseY = progress * H

    for (let x = 0; x <= W; x += 4) {
      const sinY = Math.sin(x * p.freq1 + t * p.speed1 + p.phase) * p.amp1
                 + Math.sin(x * p.freq2 + t * p.speed2 + p.phase * 1.7) * p.amp2

      // Mouse proximity disturbance
      const dxM = x - mx, dyM = baseY + sinY - my
      const distM = Math.hypot(dxM, dyM)
      const push = distM < 160 ? ((160 - distM) / 160) * 28 : 0
      const pushY = distM > 0 ? (dyM / distM) * push : 0

      const y = baseY + sinY + pushY

      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  t += 0.016
  requestAnimationFrame(draw)
}

requestAnimationFrame(draw)
