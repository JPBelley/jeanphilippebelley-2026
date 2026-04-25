'use client'

import Link from 'next/link'
import Section from '../Section'
import Button from '../Button'
import experiments from '../../data/experiments'

export default function ExperimentSection() {
  return (
    <Section className="bg-bg2 relative" id="experiments">
      <div className="flex items-start justify-between mb-14 reveal">
        <div>
          <div className="section-label font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-5 flex items-center gap-[10px]">Lab</div>
          <div className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.02em] leading-[1.1] reveal-delay-1">
            Experiments &amp;<br /><span className="text-mint">playground</span>
          </div>
        </div>
        <div className="flex gap-[3px] mt-1 max-[640px]:hidden">
          <div className="w-10 h-10 border border-ui flex items-center justify-center font-mono text-[13px] text-muted">←</div>
          <div className="w-10 h-10 border border-ui flex items-center justify-center font-mono text-[13px] text-muted">→</div>
        </div>
      </div>

      {/* Editorial card grid */}
      <div className="hp-lab-grid reveal reveal-delay-1">
        {experiments.filter(e => e.published).slice(0, 3).map((e, i) => (
          <Link
            key={e.href}
            href={e.href}
            className={`hp-lab-card group relative overflow-hidden no-underline block${i === 0 ? ' hp-lab-featured' : ''}`}
            style={{ background: '#070709', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Accent glow */}
            <div
              className="absolute inset-0 opacity-50 group-hover:opacity-90 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at 68% 28%, rgba(${e.accent},0.22) 0%, transparent 60%),
                             radial-gradient(circle at 18% 80%, rgba(${e.accent},0.08) 0%, transparent 50%)`,
              }}
            />

            {/* Watermark icon */}
            <div
              className="absolute select-none pointer-events-none transition-transform duration-700 group-hover:scale-110"
              style={{
                right: '6%', top: '50%', transform: 'translateY(-50%)',
                fontSize:   i === 0 ? '190px' : '88px',
                lineHeight: 1,
                opacity:    0.055,
                color:      `rgb(${e.accent})`,
                fontFamily: 'var(--font-head)',
                fontWeight: 900,
              }}
            >
              {e.icon}
            </div>

            {/* Tags */}
            <div className="absolute top-4 left-4 flex gap-[5px] flex-wrap z-10">
              {e.tags.slice(0, i === 0 ? 3 : 2).map(t => (
                <span
                  key={t}
                  className="font-mono text-[9px] uppercase tracking-[0.14em] px-2 py-[3px]"
                  style={{
                    background: `rgba(${e.accent},0.1)`,
                    border:     `1px solid rgba(${e.accent},0.25)`,
                    color:      `rgb(${e.accent})`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Bottom overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 z-10"
              style={{
                padding:    i === 0 ? '28px 24px' : '18px 18px',
                background: 'linear-gradient(to top, rgba(4,4,6,0.96) 0%, rgba(4,4,6,0.55) 60%, transparent 100%)',
              }}
            >
              <h3
                className="font-black uppercase leading-[0.9] tracking-[-0.03em] text-foreground"
                style={{ fontSize: i === 0 ? 'clamp(24px,2.6vw,40px)' : 'clamp(15px,1.5vw,20px)' }}
              >
                {e.title}
              </h3>
              {i === 0 && (
                <p className="font-mono text-[12px] text-muted leading-[1.6] mt-3 mb-3 max-w-[280px]">
                  {e.desc}
                </p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: `rgba(${e.accent},0.8)` }}>
                  Open →
                </span>
                <span className="font-mono text-[9px] text-muted tracking-[0.1em] uppercase opacity-40">
                  {e.href.split('/').pop().replace(/-/g, '_')}
                </span>
              </div>
            </div>

            {/* Hover ring */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ boxShadow: `inset 0 0 0 1px rgba(${e.accent},0.3)` }}
            />
          </Link>
        ))}
      </div>

      <div className="mt-3 flex justify-center reveal reveal-delay-2">
        <Button href="/experiments" variant="link">Explore the full lab →</Button>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .hp-lab-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-auto-rows: 260px;
            gap: 3px;
          }
          .hp-lab-featured {
            grid-column: span 2;
            grid-row: span 2;
          }
        }
        @media (max-width: 899px) {
          .hp-lab-grid { display: flex; flex-direction: column; gap: 3px; }
          .hp-lab-card { min-height: 240px; }
          .hp-lab-featured { min-height: 340px; }
        }
      `}</style>
    </Section>
  )
}
