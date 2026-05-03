/* ═══════════════════════════════════════════════════════════════════════════
   HERO 04 — EDITORIAL GRID — jeanphilippebelley.com
   ─────────────────────────────────────────────────────────────────────────
   title: Swiss Editorial Hero
   desc:  Light-mode hero inspired by Swiss International typography. A
          two-column grid: oversized name on the left, role and bio on the
          right. "JP" as a massive cream watermark. A ruled line draws
          itself on load. Each name word springs on hover.
   tags:  editorial, swiss, typography, hero, light-mode
   ─────────────────────────────────────────────────────────────────────────
   HTML — paste in the HTML pane:
   ─────────────────────────────────────────────────────────────────────────

   <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet">

   <section id="hero">
     <div class="bg-mark">JP</div>
     <div class="grid">
       <div class="col-l">
         <div class="index">001</div>
         <div class="rule-wrap"><div class="rule" id="rule"></div></div>
         <h1 id="name">
           <span class="word">Jean-</span>
           <span class="word">Philippe</span>
           <span class="word red">Belley</span>
         </h1>
       </div>
       <div class="col-r">
         <p class="role">Creative Developer<br>&amp; UI Craftsman</p>
         <p class="bio">I build fast, beautiful interfaces and generative web experiences.<br>Full Stack · WebGL · Always cooking something.</p>
         <nav class="links">
           <a href="#" class="cta">View work →</a>
           <a href="#" class="ghost">Blog</a>
           <a href="#" class="ghost">Contact</a>
         </nav>
         <div class="chips">
           <span>React</span><span>Vue</span><span>WebGL</span><span>Canvas</span><span>Node</span>
         </div>
       </div>
     </div>
   </section>

   ─────────────────────────────────────────────────────────────────────────
   CSS — paste in the CSS pane:
   ─────────────────────────────────────────────────────────────────────────

   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

   body {
     background: #F5F0E8;
     min-height: 100vh;
     display: flex;
     align-items: center;
     padding: clamp(40px, 6vh, 80px) clamp(28px, 7vw, 100px);
     overflow: hidden;
     position: relative;
   }

   #hero { width: 100%; position: relative; }

   .bg-mark {
     position: fixed;
     bottom: -0.05em;
     right: -0.04em;
     font-family: 'Space Grotesk', sans-serif;
     font-size: clamp(200px, 30vw, 420px);
     font-weight: 700;
     color: rgba(14,12,9,0.04);
     line-height: 1;
     pointer-events: none;
     user-select: none;
   }

   .grid {
     display: grid;
     grid-template-columns: 1fr 1fr;
     gap: clamp(48px, 6vw, 100px);
     align-items: end;
   }
   @media (max-width: 680px) {
     .grid { grid-template-columns: 1fr; gap: 48px; }
   }

   /* Left column */
   .index {
     font-family: 'DM Mono', monospace;
     font-size: 11px;
     font-weight: 400;
     letter-spacing: 0.16em;
     color: rgba(14,12,9,0.28);
     margin-bottom: 16px;
   }

   .rule-wrap {
     height: 2px;
     background: rgba(14,12,9,0.08);
     margin-bottom: 32px;
     overflow: hidden;
   }
   .rule {
     height: 100%;
     width: 0%;
     background: #0E0C09;
     transition: width 1.1s cubic-bezier(0.16, 1, 0.3, 1);
   }

   h1 {
     display: flex;
     flex-direction: column;
     gap: 0;
   }

   .word {
     font-family: 'Space Grotesk', sans-serif;
     font-size: clamp(52px, 9vw, 112px);
     font-weight: 700;
     color: #0E0C09;
     line-height: 0.93;
     letter-spacing: -0.04em;
     display: inline-block;
     cursor: default;
     will-change: transform;
     transform-origin: left center;
   }
   .word.red { color: #E6100F; }

   /* Right column */
   .role {
     font-family: 'DM Mono', monospace;
     font-size: clamp(16px, 2.2vw, 22px);
     font-weight: 400;
     color: #0E0C09;
     line-height: 1.45;
     margin-bottom: 26px;
     letter-spacing: -0.01em;
   }

   .bio {
     font-family: 'DM Mono', monospace;
     font-size: 13px;
     font-weight: 300;
     color: rgba(14,12,9,0.45);
     line-height: 1.85;
     max-width: 380px;
     margin-bottom: 40px;
   }

   .links {
     display: flex;
     align-items: center;
     gap: 28px;
     margin-bottom: 36px;
   }

   .cta {
     background: #E6100F;
     color: #F5F0E8;
     font-family: 'DM Mono', monospace;
     font-size: 12px;
     letter-spacing: 0.08em;
     padding: 14px 26px;
     text-decoration: none;
     display: inline-block;
     transition: opacity 0.2s;
   }
   .cta:hover { opacity: 0.78; }

   .ghost {
     font-family: 'DM Mono', monospace;
     font-size: 12px;
     font-weight: 300;
     letter-spacing: 0.05em;
     color: rgba(14,12,9,0.3);
     text-decoration: none;
     transition: color 0.2s;
   }
   .ghost:hover { color: #0E0C09; }

   .chips {
     display: flex;
     gap: 8px;
     flex-wrap: wrap;
   }
   .chips span {
     font-family: 'DM Mono', monospace;
     font-size: 10px;
     font-weight: 300;
     letter-spacing: 0.14em;
     color: rgba(14,12,9,0.28);
     border: 1px solid rgba(14,12,9,0.14);
     padding: 5px 10px;
     text-transform: uppercase;
   }

   ═══════════════════════════════════════════════════════════════════════ */


// ─── Animate rule on load ──────────────────────────────────────────────────
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.getElementById('rule').style.width = '100%'
  })
})

// ─── Spring hover on name words ────────────────────────────────────────────
const words = document.querySelectorAll('.word')
const st    = Array.from(words).map(() => ({ sx: 1, svx: 0, sy: 1, svy: 0 }))
let   raf   = null

words.forEach((w, i) => {
  w.style.transformOrigin = 'left center'

  w.addEventListener('mouseenter', () => {
    // Squash x, stretch y — jelly deformation
    st[i].svx = -0.07
    st[i].svy =  0.06
    if (!raf) loop()
  })
})

function loop() {
  let allRest = true
  words.forEach((w, i) => {
    const s = st[i]
    s.svx += (1 - s.sx) * 0.16; s.svx *= 0.54; s.sx += s.svx
    s.svy += (1 - s.sy) * 0.16; s.svy *= 0.54; s.sy += s.svy
    w.style.transform = `scaleX(${s.sx}) scaleY(${s.sy})`
    if (Math.abs(1 - s.sx) + Math.abs(1 - s.sy) > 0.002) allRest = false
  })
  if (!allRest) { raf = requestAnimationFrame(loop) } else { raf = null }
}
