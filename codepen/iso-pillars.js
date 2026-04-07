/* ═══════════════════════════════════════════════════════════════════════════════
   ISO PILLARS — jeanphilippebelley.com
   ───────────────────────────────────────────────────────────────────────────────
   Animated ring of 3D white columns in isometric projection.
   Move your mouse to shift the wave pattern.

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
   body { background: #1b1b1b; overflow: hidden; }
   canvas { display: block; width: 100vw; height: 100vh; }
   #credit {
     position: fixed;
     bottom: 20px; right: 24px;
     font-family: 'Space Grotesk', sans-serif;
     font-size: 13px;
     font-weight: 700;
     letter-spacing: 0.06em;
     color: rgba(255,255,255,0.2);
     text-decoration: none;
     transition: color 0.2s;
   }
   #credit span { color: #7C5CFF; }
   #credit:hover { color: rgba(255,255,255,0.5); }

   ═══════════════════════════════════════════════════════════════════════════════ */

const canvas = document.getElementById('c')
const ctx    = canvas.getContext('2d')

const COLS  = 5    // grid columns
const ROWS  = 5    // grid rows
const SPEED = 0.55 // wave animation speed
const BG    = '#1b1b1b'

// Tile dimensions — computed in resize() so the grid always fits the viewport
let TW, TH, MAX_H, MIN_H
let width, height, cx, cy

// Mouse — nudges the wave phase
let tx = 0, ty = 0   // target
let rx = 0, ry = 0   // lerped

canvas.addEventListener('mousemove', e => {
  tx = (e.clientX / window.innerWidth  - 0.5) * 2
  ty = (e.clientY / window.innerHeight - 0.5) * 2
})
canvas.addEventListener('mouseleave', () => { tx = 0; ty = 0 })

function resize() {
  width  = canvas.width  = canvas.offsetWidth
  height = canvas.height = canvas.offsetHeight

  // Scale TW so the grid footprint + pillar height never overflow
  // Grid footprint width  = (COLS + ROWS) * TW / 2
  // Grid footprint height = (COLS + ROWS) * TW / 8
  // Max pillar height     = TW * 2.6  (proportional)
  // Total vertical span   ≈ TW * (2.6 + (COLS+ROWS)/8)
  const twByWidth  = (width  * 0.78) / ((COLS + ROWS) / 2)
  const twByHeight = (height * 0.82) / (2.6 + (COLS + ROWS) / 8)
  TW    = Math.min(twByWidth, twByHeight, 110)
  TH    = TW / 2
  MAX_H = TW * 2.6
  MIN_H = TW * 0.14

  cx = width  / 2
  // Center the visual mass (base + half the max elevation)
  cy = height / 2 + MAX_H * 0.25 + (COLS + ROWS - 2) * TH / 8
}

const ro = new ResizeObserver(resize)
ro.observe(canvas)
resize()

// ── Isometric helpers ─────────────────────────────────────────────────────────

const gCtrY = (COLS - 1 + ROWS - 1) / 2   // diagonal sum of center tile

function screenX(c, r) {
  return cx + (c - r) * TW / 2
}
function screenY(c, r) {
  return cy - gCtrY * TH / 2 + (c + r) * TH / 2
}

// Hollow center: skip the inner (COLS-2) × (ROWS-2) region
function isRing(c, r) {
  return c === 0 || c === COLS - 1 || r === 0 || r === ROWS - 1
}

// ── Draw one pillar ───────────────────────────────────────────────────────────

function drawPillar(c, r, h) {
  const bx  = screenX(c, r)
  const by  = screenY(c, r)
  const ty_ = by - h
  const hw  = TW / 2
  const hh  = TH / 2

  // Top face
  const tg = ctx.createLinearGradient(bx - hw, ty_, bx + hw, ty_ + hh)
  tg.addColorStop(0, 'rgba(255,255,255,0.97)')
  tg.addColorStop(1, 'rgba(208,208,214,0.93)')
  ctx.beginPath()
  ctx.moveTo(bx,      ty_ - hh)
  ctx.lineTo(bx + hw, ty_)
  ctx.lineTo(bx,      ty_ + hh)
  ctx.lineTo(bx - hw, ty_)
  ctx.closePath()
  ctx.fillStyle = tg
  ctx.fill()

  // Left face
  const lg = ctx.createLinearGradient(0, ty_, 0, by + hh)
  lg.addColorStop(0, 'rgba(180,180,186,0.93)')
  lg.addColorStop(1, 'rgba(72,72,76,0.88)')
  ctx.beginPath()
  ctx.moveTo(bx - hw, ty_)
  ctx.lineTo(bx,      ty_ + hh)
  ctx.lineTo(bx,      by  + hh)
  ctx.lineTo(bx - hw, by)
  ctx.closePath()
  ctx.fillStyle = lg
  ctx.fill()

  // Right face
  const rg = ctx.createLinearGradient(0, ty_, 0, by + hh)
  rg.addColorStop(0, 'rgba(105,105,110,0.91)')
  rg.addColorStop(1, 'rgba(38,38,42,0.87)')
  ctx.beginPath()
  ctx.moveTo(bx + hw, ty_)
  ctx.lineTo(bx,      ty_ + hh)
  ctx.lineTo(bx,      by  + hh)
  ctx.lineTo(bx + hw, by)
  ctx.closePath()
  ctx.fillStyle = rg
  ctx.fill()
}

// ── Height function ───────────────────────────────────────────────────────────

function getHeight(c, r, t) {
  const phase = (c + r) * 0.9 + rx * 1.8 - ry * 0.6
  return MIN_H + (MAX_H - MIN_H) * (Math.sin(t * SPEED - phase) * 0.5 + 0.5)
}

// ── Draw loop ─────────────────────────────────────────────────────────────────

function draw() {
  requestAnimationFrame(draw)

  rx += (tx - rx) * 0.05
  ry += (ty - ry) * 0.05

  const t = Date.now() / 1000

  ctx.fillStyle = BG
  ctx.fillRect(0, 0, width, height)

  // Painter's algorithm: back to front
  for (let sum = 0; sum <= COLS + ROWS - 2; sum++) {
    for (let c = 0; c <= sum; c++) {
      const r = sum - c
      if (c >= COLS || r < 0 || r >= ROWS) continue
      if (!isRing(c, r)) continue   // skip inner cells → hollow center
      drawPillar(c, r, getHeight(c, r, t))
    }
  }

  // Subtle center glow
  const grd = ctx.createRadialGradient(cx, cy - MAX_H * 0.35, 0, cx, cy - MAX_H * 0.35, Math.min(width, height) * 0.5)
  grd.addColorStop(0, 'rgba(255,255,255,0.05)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, width, height)
}

draw()
