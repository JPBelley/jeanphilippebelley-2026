/* ═══════════════════════════════════════════════════════════════════════════════
   DIMENSION STACK — jeanphilippebelley.com
   ───────────────────────────────────────────────────────────────────────────────
   Stacked word "dimension" repeated top-to-bottom, each row growing larger,
   with a teal → violet → magenta → orange gradient flowing through the type.
   Inspired by the vintage Bell System "Dimension" brochure cover.

   HTML — paste in the HTML pane:
   ───────────────────────────────────────────────────────────────────────────────

   <div id="stack"></div>

   <a href="https://jeanphilippebelley.com/" target="_blank" id="credit">
     JP<span>.</span>
   </a>

   ───────────────────────────────────────────────────────────────────────────────
   CSS — paste in the CSS pane:
   ───────────────────────────────────────────────────────────────────────────────

   @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap');

   * { margin: 0; padding: 0; box-sizing: border-box; }

   body {
     background: #0e0e12;
     min-height: 100vh;
     display: flex;
     align-items: center;
     justify-content: center;
     overflow: hidden;
   }

   #stack {
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     gap: 0;
     line-height: 1;
     user-select: none;
   }

   .row {
     font-family: 'Space Grotesk', sans-serif;
     font-weight: 700;
     letter-spacing: 0.08em;
     text-transform: lowercase;
     white-space: nowrap;
     transition: opacity 0.3s ease;
   }

   #credit {
     position: fixed;
     bottom: 20px; right: 24px;
     font-family: 'Space Grotesk', sans-serif;
     font-size: 13px;
     font-weight: 700;
     letter-spacing: 0.06em;
     color: rgba(255,255,255,0.18);
     text-decoration: none;
   }
   #credit span { color: rgba(255,255,255,0.45); }
   #credit:hover { color: rgba(255,255,255,0.55); }

   ═══════════════════════════════════════════════════════════════════════════════
   SEO Description:
   Stacked word typography animation inspired by a vintage Bell System brochure.
   The word "dimension" repeats from small to large, each row tinted across a
   teal-to-orange gradient — a pure HTML/CSS/JS typographic art piece.

   Tags: typography, gradient, retro, generative, css
   ═══════════════════════════════════════════════════════════════════════════════ */

const WORD  = 'dimension'
const ROWS  = 14

// Gradient stops: teal → violet → magenta → orange
const STOPS = [
  [0,    [0,   210, 200]],   // teal
  [0.25, [80,  100, 240]],   // blue-violet
  [0.50, [160,  60, 255]],   // violet
  [0.68, [220,  50, 180]],   // magenta
  [0.82, [255,  60,  80]],   // red
  [1.0,  [255, 160,  30]],   // orange
]

function lerpColor(t) {
  let i = 0
  while (i < STOPS.length - 2 && t > STOPS[i + 1][0]) i++
  const [t0, c0] = STOPS[i]
  const [t1, c1] = STOPS[i + 1]
  const f = (t - t0) / (t1 - t0)
  return c0.map((v, k) => Math.round(v + (c1[k] - v) * f))
}

const stack = document.getElementById('stack')

// Font size: smallest at top, largest at bottom
const MIN_SIZE = 12   // px — topmost (smallest) row
const MAX_SIZE = 96   // px — bottommost (largest) row

const rows = []

for (let i = 0; i < ROWS; i++) {
  const t        = i / (ROWS - 1)              // 0 = top, 1 = bottom
  const size     = MIN_SIZE + (MAX_SIZE - MIN_SIZE) * Math.pow(t, 1.6)
  const [r, g, b] = lerpColor(t)

  // Last row is white, slightly brighter
  const color = i === ROWS - 1
    ? '#ffffff'
    : `rgb(${r},${g},${b})`

  const div = document.createElement('div')
  div.className = 'row'
  div.textContent = WORD
  div.style.fontSize   = size + 'px'
  div.style.color      = color
  div.style.lineHeight = size < 24 ? '1.35' : size < 48 ? '1.2' : '1.05'

  // Slight opacity fade for upper rows — vintage print feel
  div.style.opacity = 0.35 + 0.65 * t

  stack.appendChild(div)
  rows.push({ div, baseOpacity: 0.35 + 0.65 * t })
}

// ── Subtle hover: rows near cursor brighten ──────────────────────────────────
document.addEventListener('mousemove', (e) => {
  const cy = e.clientY
  rows.forEach(({ div, baseOpacity }) => {
    const rect = div.getBoundingClientRect()
    const rowY = rect.top + rect.height / 2
    const dist = Math.abs(cy - rowY)
    const pull = Math.max(0, 1 - dist / 120)
    div.style.opacity = Math.min(1, baseOpacity + pull * (1 - baseOpacity) * 0.9)
  })
})

document.addEventListener('mouseleave', () => {
  rows.forEach(({ div, baseOpacity }) => {
    div.style.opacity = baseOpacity
  })
})
