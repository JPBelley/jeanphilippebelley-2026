/* ═══════════════════════════════════════════════════════════════════════════════
   MAGNETIC DOT MESH — jeanphilippebelley.com
   ───────────────────────────────────────────────────────────────────────────────
   HTML — paste in the HTML pane:
   ───────────────────────────────────────────────────────────────────────────────

   <canvas id="c"></canvas>

   <a href="https://jeanphilippebelley.com/" target="_blank" id="credit">
     JP<span>.</span>
   </a>

   ───────────────────────────────────────────────────────────────────────────────
   CSS — paste in the CSS pane:
   ───────────────────────────────────────────────────────────────────────────────

   * { margin: 0; padding: 0; box-sizing: border-box; }
   body { background: #0F1115; overflow: hidden; }
   canvas { display: block; }
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

   ═══════════════════════════════════════════════════════════════════════════════ */

const canvas = document.getElementById('c')
const ctx    = canvas.getContext('2d')

// ─── Config ───────────────────────────────────────────────────────────────────
const GAP            = 48     // grid spacing
const DOT_R          = 2      // resting dot radius
const REPEL_RADIUS   = 140    // mouse influence radius
const REPEL_FORCE    = 14     // push strength
const SPRING         = 0.055  // pull-back stiffness
const DAMPING        = 0.82   // velocity decay
const LINE_DIST      = 70     // max distance for mesh lines
const SHOCKWAVE_DIST = 220    // click ripple reach
const SHOCKWAVE_F    = 22     // click push strength
const VIOLET         = [124, 92,  255]
const MINT           = [46,  230, 166]

// ─── State ────────────────────────────────────────────────────────────────────
let dots   = []
let W, H
let mouse  = { x: -9999, y: -9999 }
let clicks = []   // active shockwaves { x, y, t }

// ─── Grid ─────────────────────────────────────────────────────────────────────
function buildGrid() {
  dots = []
  const cols = Math.ceil(W / GAP) + 2
  const rows = Math.ceil(H / GAP) + 2
  const offX = ((W % GAP) / 2)
  const offY = ((H % GAP) / 2)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ox = offX + c * GAP
      const oy = offY + r * GAP
      dots.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 })
    }
  }
}

function resize() {
  W = canvas.width  = window.innerWidth
  H = canvas.height = window.innerHeight
  buildGrid()
}

// ─── Color ────────────────────────────────────────────────────────────────────
function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

// ─── Tick ─────────────────────────────────────────────────────────────────────
function tick() {
  ctx.clearRect(0, 0, W, H)

  // Prune old shockwaves
  clicks = clicks.filter(s => s.t < 1)

  // Update dots
  for (const d of dots) {
    // Mouse repulsion
    let dx = d.x - mouse.x
    let dy = d.y - mouse.y
    let dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < REPEL_RADIUS && dist > 0.01) {
      const f = (1 - dist / REPEL_RADIUS) ** 2 * REPEL_FORCE
      d.vx += (dx / dist) * f
      d.vy += (dy / dist) * f
    }

    // Shockwave repulsion
    for (const s of clicks) {
      dx = d.ox - s.x
      dy = d.oy - s.y
      dist = Math.sqrt(dx * dx + dy * dy)
      const ring  = s.t * SHOCKWAVE_DIST
      const delta = Math.abs(dist - ring)
      if (delta < 40 && dist > 0.01) {
        const f = (1 - delta / 40) * SHOCKWAVE_F * (1 - s.t)
        d.vx += (dx / dist) * f
        d.vy += (dy / dist) * f
      }
    }

    // Spring back to rest
    d.vx += (d.ox - d.x) * SPRING
    d.vy += (d.oy - d.y) * SPRING
    d.vx *= DAMPING
    d.vy *= DAMPING
    d.x  += d.vx
    d.y  += d.vy
  }

  // Advance shockwaves
  for (const s of clicks) s.t += 0.018

  // Draw connections
  for (let i = 0; i < dots.length; i++) {
    const a = dots[i]
    for (let j = i + 1; j < dots.length; j++) {
      const b = dots[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const d  = Math.sqrt(dx * dx + dy * dy)
      if (d > LINE_DIST) continue

      const dispA = Math.hypot(a.x - a.ox, a.y - a.oy)
      const dispB = Math.hypot(b.x - b.ox, b.y - b.oy)
      const t     = Math.min((dispA + dispB) / 2 / (REPEL_RADIUS * 0.6), 1)
      const alpha = (1 - d / LINE_DIST) * (0.06 + t * 0.25)
      const [r, g, bv] = lerpColor(VIOLET, MINT, t)

      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.strokeStyle = `rgba(${r},${g},${bv},${alpha})`
      ctx.lineWidth   = 0.8
      ctx.stroke()
    }
  }

  // Draw dots
  for (const d of dots) {
    const disp  = Math.hypot(d.x - d.ox, d.y - d.oy)
    const t     = Math.min(disp / (REPEL_RADIUS * 0.5), 1)
    const [r, g, b] = lerpColor(VIOLET, MINT, t)
    const alpha = 0.2 + t * 0.8
    const radius = DOT_R + t * 2.5

    ctx.beginPath()
    ctx.arc(d.x, d.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
    ctx.fill()
  }

  requestAnimationFrame(tick)
}

// ─── Events ───────────────────────────────────────────────────────────────────
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY })
window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999 })
window.addEventListener('click', e => { clicks.push({ x: e.clientX, y: e.clientY, t: 0 }) })
window.addEventListener('resize', resize)

// ─── Init ─────────────────────────────────────────────────────────────────────
resize()
tick()
