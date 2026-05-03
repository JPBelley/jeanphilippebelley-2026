/* ═══════════════════════════════════════════════════════════════════════════
   HERO 02 — TERMINAL — jeanphilippebelley.com
   ─────────────────────────────────────────────────────────────────────────
   title: Terminal Hero
   desc:  A retro phosphor-green terminal hero that types out a biography
          as CLI output. macOS window chrome, realistic keystroke rhythm,
          blinking block cursor. Commands appear character by character;
          output streams in fast. Pure nostalgia meets portfolio.
   tags:  terminal, typewriter, retro, hero, javascript
   ─────────────────────────────────────────────────────────────────────────
   HTML — paste in the HTML pane:
   ─────────────────────────────────────────────────────────────────────────

   <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400&display=swap" rel="stylesheet">

   <div id="wrap">
     <div id="window">
       <div id="chrome">
         <span class="dot" style="background:#FF5F56"></span>
         <span class="dot" style="background:#FFBD2E"></span>
         <span class="dot" style="background:#27C93F"></span>
         <span class="chrome-label">jp@terminal ~ </span>
       </div>
       <div id="output"></div>
     </div>
   </div>

   ─────────────────────────────────────────────────────────────────────────
   CSS — paste in the CSS pane:
   ─────────────────────────────────────────────────────────────────────────

   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

   body {
     background: #080A08;
     min-height: 100vh;
     display: flex;
     align-items: center;
     justify-content: center;
     padding: 24px;
     font-family: 'DM Mono', monospace;
   }

   #wrap { width: min(700px, 100%); }

   #window {
     background: #0C0F0C;
     border-radius: 10px;
     border: 1px solid rgba(57,255,60,0.10);
     box-shadow:
       0 0 0 1px rgba(0,0,0,0.6),
       0 0 80px rgba(57,255,60,0.05),
       0 32px 80px rgba(0,0,0,0.8);
     overflow: hidden;
   }

   #chrome {
     background: #141814;
     padding: 14px 18px;
     display: flex;
     align-items: center;
     gap: 8px;
     border-bottom: 1px solid rgba(57,255,60,0.07);
   }

   .dot {
     width: 12px; height: 12px;
     border-radius: 50%;
     display: inline-block;
     opacity: 0.85;
   }

   .chrome-label {
     font-size: 11px;
     color: rgba(57,255,60,0.28);
     margin-left: 10px;
     letter-spacing: 0.04em;
   }

   #output {
     padding: 28px 28px 40px;
     min-height: 380px;
   }

   .line {
     font-size: 14px;
     line-height: 2.1;
     white-space: pre;
     letter-spacing: 0.01em;
   }
   .cmd  { color: #39FF3C; }
   .out  { color: rgba(57,255,60,0.52); }
   .dim  { color: rgba(57,255,60,0.28); }
   .acc  { color: #7C5CFF; }
   .hl   { color: #E6100F; }

   .cursor {
     display: inline-block;
     width: 9px; height: 17px;
     background: #39FF3C;
     vertical-align: middle;
     margin-left: 1px;
     animation: blink 1.1s step-end infinite;
   }
   @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

   ═══════════════════════════════════════════════════════════════════════ */


const output = document.getElementById('output')

// ─── Script ──────────────────────────────────────────────────────────────────
// Each entry: [class, text, pause-after-in-ms]
const SCRIPT = [
  ['cmd', '$ whoami',                                      600],
  ['out', 'jean-philippe belley',                          350],
  ['gap', '',                                              160],
  ['cmd', '$ cat role.txt',                                500],
  ['out', 'creative developer  ·  ui craftsman',           350],
  ['gap', '',                                              160],
  ['cmd', '$ cat stack.txt',                               500],
  ['dim', '  react  vue  webgl  canvas  three.js',         80],
  ['dim', '  node  php  wordpress  drupal  webflow',        350],
  ['gap', '',                                              160],
  ['cmd', '$ ls experiments/',                             500],
  ['acc', '  particle-dissolve/   flow-field/',             80],
  ['acc', '  rocky-sphere/        text-animator/',          350],
  ['gap', '',                                              160],
  ['cmd', '$ echo $MOTTO',                                 500],
  ['out', '"always cooking something."',                   400],
  ['gap', '',                                              160],
  ['cmd', '$ open jeanphilippebelley.com',                 800],
  ['hl',  '  ↗  launching in browser...',                  0],
]

// ─── Typewriter ───────────────────────────────────────────────────────────────
let idx = 0

function next() {
  if (idx >= SCRIPT.length) { addCursor(); return }
  const [cls, text, pause] = SCRIPT[idx++]

  if (cls === 'gap') {
    const el = document.createElement('div')
    el.className = 'line'; el.innerHTML = '&nbsp;'
    output.appendChild(el)
    setTimeout(next, pause)
    return
  }

  typeOut(cls, text, () => setTimeout(next, pause))
}

function typeOut(cls, text, onDone, pos = 0, el) {
  if (!el) {
    el = document.createElement('div')
    el.className = `line ${cls}`
    output.appendChild(el)
  }
  if (pos >= text.length) { onDone(); return }

  el.textContent = text.slice(0, pos + 1)

  // Commands type with variable human-like speed; output streams faster
  const delay = cls === 'cmd'
    ? 30 + Math.random() * 45
    : 11 + Math.random() * 8

  setTimeout(() => typeOut(cls, text, onDone, pos + 1, el), delay)
}

function addCursor() {
  const last = output.lastElementChild
  const cur  = document.createElement('span')
  cur.className = 'cursor'
  last.appendChild(cur)
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
setTimeout(next, 700)
