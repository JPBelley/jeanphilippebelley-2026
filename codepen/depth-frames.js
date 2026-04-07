/* ═══════════════════════════════════════════════════════════════════════════════
   DEPTH FRAMES — jeanphilippebelley.com
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

   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
   body { background: #0d0b0c; overflow: hidden; }
   canvas { display: block; cursor: grab; }
   canvas:active { cursor: grabbing; }
   #credit {
     position: fixed;
     bottom: 20px; right: 24px;
     font-family: 'Space Grotesk', sans-serif;
     font-size: 13px;
     font-weight: 700;
     letter-spacing: 0.06em;
     color: rgba(232,234,240,0.2);
     text-decoration: none;
     transition: color 0.2s;
   }
   #credit span { color: #7C5CFF; }
   #credit:hover { color: rgba(232,234,240,0.6); }

   ═══════════════════════════════════════════════════════════════════════════════ */

const FRONT_COLOR = '#e8707a'   // warm coral — front layers
const BACK_COLOR  = '#253252'   // deep navy  — back layers
const BG          = '#0d0b0c'

const N     = 12     // number of layers
const FOV   = 800    // perspective focal length (lower = more dramatic)
const DEPTH = 220    // z-extent of the full stack

// ── Color helpers ─────────────────────────────────────────────────────────────
function lerpColor(hex1, hex2, t) {
  const a = parseInt(hex1.slice(1), 16)
  const b = parseInt(hex2.slice(1), 16)
  const r = Math.round(((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t)
  const g = Math.round(((a >>  8) & 255) * (1 - t) + ((b >>  8) & 255) * t)
  const c = Math.round( (a        & 255) * (1 - t) +  (b        & 255) * t)
  return `rgb(${r},${g},${c})`
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// ── Setup ─────────────────────────────────────────────────────────────────────
const canvas = document.getElementById('c')
const ctx    = canvas.getContext('2d')
let width, height

// Per-layer state: screen-space offset (ox, oy) and perspective scale (os)
const pos = Array.from({ length: N }, () => ({ ox: 0, oy: 0, os: 1 }))

// Offscreen canvas for film grain
const grain   = document.createElement('canvas')
const grainCtx = grain.getContext('2d')

function resize() {
  width  = canvas.width  = window.innerWidth
  height = canvas.height = window.innerHeight
  pos.forEach(p => { p.ox = 0; p.oy = 0; p.os = 1 })
}
window.addEventListener('resize', resize)
resize()

// ── Drag interaction ──────────────────────────────────────────────────────────
let tiltX = 3.5, tiltY = -2   // start at a visible angle
let dragging = false
let startX, startY, baseX, baseY

function pt(e) {
  return {
    x: e.clientX ?? e.touches?.[0]?.clientX ?? 0,
    y: e.clientY ?? e.touches?.[0]?.clientY ?? 0,
  }
}

canvas.addEventListener('mousedown',  e => { dragging = true; const p = pt(e); startX = p.x; startY = p.y; baseX = tiltX; baseY = tiltY })
canvas.addEventListener('touchstart', e => { dragging = true; const p = pt(e); startX = p.x; startY = p.y; baseX = tiltX; baseY = tiltY }, { passive: true })
window.addEventListener('mousemove',  e => { if (!dragging) return; const p = pt(e); tiltX = Math.max(-8, Math.min(8, baseX + (p.x - startX) * 0.025)); tiltY = Math.max(-8, Math.min(8, baseY + (p.y - startY) * 0.025)) })
window.addEventListener('touchmove',  e => { if (!dragging) return; const p = pt(e); tiltX = Math.max(-8, Math.min(8, baseX + (p.x - startX) * 0.025)); tiltY = Math.max(-8, Math.min(8, baseY + (p.y - startY) * 0.025)) }, { passive: true })
window.addEventListener('mouseup',   () => { dragging = false })
window.addEventListener('touchend',  () => { dragging = false })

// ── Draw loop ─────────────────────────────────────────────────────────────────
const [fr, fg, fb] = hexToRgb(FRONT_COLOR)

function draw() {
  requestAnimationFrame(draw)

  ctx.fillStyle = BG
  ctx.fillRect(0, 0, width, height)

  const cx = width  / 2
  const cy = height / 2

  // Convert tilt values to rotation angles (each unit ≈ 0.15 rad → ±8 ≈ ±68°)
  const rotX = tiltY * 0.15
  const rotY = tiltX * 0.15
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX)
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY)

  const size = Math.min(width, height) * 0.48
  const base = 0.9   // opacity multiplier

  // Draw layers back to front (i = N-1 is back, i = 0 is front)
  for (let i = N - 1; i >= 0; i--) {
    const t         = i / (N - 1)    // 0 = front, 1 = back
    const frontness = 1 - t

    // 3D position of this layer along the stack axis
    const zi = (t - 0.5) * DEPTH

    // Rotate point (0, 0, zi): Y rotation then X rotation
    const wx =  zi * sinY
    const wy = -zi * cosY * sinX
    const wz =  zi * cosY * cosX

    // Perspective projection
    const targetScale = FOV / (FOV + wz)
    const targetOx    = wx * targetScale
    const targetOy    = wy * targetScale

    // Fluid lerp — front layers react fast, back layers trail behind
    const lf = 0.35 + (0.04 - 0.35) * t

    pos[i].ox += (targetOx - pos[i].ox) * lf
    pos[i].oy += (targetOy - pos[i].oy) * lf
    pos[i].os += (targetScale - pos[i].os) * lf

    const layerSize = size * pos[i].os
    const lh        = layerSize / 2
    const alpha     = base * (0.04 + 0.20 * Math.pow(frontness, 0.55))

    ctx.globalAlpha = alpha
    ctx.fillStyle   = lerpColor(BACK_COLOR, FRONT_COLOR, frontness)

    ctx.save()
    ctx.translate(cx + pos[i].ox, cy + pos[i].oy)
    ctx.fillRect(-lh, -lh, layerSize, layerSize)
    ctx.restore()
  }

  // ── Radial glow from front layer ──────────────────────────────────────────
  const fp  = pos[0]
  const gx  = cx + fp.ox
  const gy  = cy + fp.oy
  const grd = ctx.createRadialGradient(gx, gy, 0, gx, gy, size * 0.85)
  grd.addColorStop(0,   `rgba(${fr},${fg},${fb},0.18)`)
  grd.addColorStop(0.5, `rgba(${fr},${fg},${fb},0.06)`)
  grd.addColorStop(1,   `rgba(${fr},${fg},${fb},0)`)
  ctx.globalAlpha = 1
  ctx.fillStyle   = grd
  ctx.fillRect(0, 0, width, height)

  // ── Film grain clipped to frame rectangles ────────────────────────────────
  const SCALE = 3
  const gw = Math.ceil(width  / SCALE)
  const gh = Math.ceil(height / SCALE)
  grain.width  = gw
  grain.height = gh

  const img = grainCtx.createImageData(gw, gh)
  const d   = img.data
  for (let i = 0; i < d.length; i += 4) {
    const v   = (Math.random() * 255) | 0
    d[i]      = v
    d[i + 1]  = v
    d[i + 2]  = v
    d[i + 3]  = (Math.random() * 28) | 0   // subtle grain
  }
  grainCtx.putImageData(img, 0, 0)

  ctx.save()
  ctx.beginPath()
  for (let i = 0; i < N; i++) {
    const ls = size * pos[i].os
    const lh = ls / 2
    ctx.rect(cx + pos[i].ox - lh, cy + pos[i].oy - lh, ls, ls)
  }
  ctx.clip()
  ctx.globalAlpha = 1
  ctx.drawImage(grain, 0, 0, width, height)
  ctx.restore()

  ctx.globalAlpha = 1
}

draw()
