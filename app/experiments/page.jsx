'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Cursor from '../components/Cursor';
import Section from '../components/Section';
import experiments from '../data/experiments';

export default function Experiments() {
  useEffect(() => {
    const cards = document.querySelectorAll('.exp-card-interactive');

    cards.forEach(card => {
      const glow = card.querySelector('.card-glow');

      const onMove = e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -7;
        const rotY = ((x - cx) / cx) * 7;

        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
        card.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease, border-color 0.2s';

        if (glow) {
          const accent = card.dataset.accent;
          glow.style.background = `radial-gradient(280px circle at ${x}px ${y}px, rgba(${accent},0.18), transparent 70%)`;
        }
      };

      const onLeave = () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease, border-color 0.2s';
        if (glow) glow.style.background = 'none';
      };

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }, []);

  return (
    <div className="min-h-screen bg-bg text-foreground font-head">
      <Cursor />
      <Nav />

      <Section size="wide">
        <div className="mb-16">
          <div className="section-label font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]" data-num="01">
            Lab
          </div>
          <h1 className="text-[clamp(40px,6vw,72px)] font-bold leading-[1.05] tracking-[-0.03em] mb-6">
            Experiments &amp;<br /><span className="text-mint">playground</span>
          </h1>
          <p className="font-mono text-[15px] text-muted max-w-lg leading-[1.7]">
            Creative coding explorations: WebGL, Three.js, shaders, and interactive graphics.
            More experiments coming as they get built.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
          {experiments.map(e => (
            <Link
              key={e.href}
              href={e.href}
              data-accent={e.accent}
              className="exp-card-interactive group relative flex flex-col gap-4 p-8 bg-bg2 border border-ui rounded-xl no-underline text-inherit overflow-hidden will-change-transform hover:border-[rgba(124,92,255,0.4)] hover:shadow-[0_24px_64px_rgba(0,0,0,0.4)]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Spotlight glow */}
              <div className="card-glow pointer-events-none absolute inset-0 rounded-xl transition-none" />

              {/* Top gradient bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, rgba(${e.accent},0.8), transparent)` }}
              />

              {/* Icon with glow ring */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"
                  style={{ background: `rgba(${e.accent},0.3)` }}
                />
                <span className="relative text-[28px] leading-none">{e.icon}</span>
              </div>

              <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-foreground">{e.title}</h3>
              <p className="font-mono text-[12px] text-muted leading-[1.7] flex-1">{e.desc}</p>

              <div className="flex flex-wrap gap-2 mt-1">
                {e.tags.map(t => (
                  <span
                    key={t}
                    className="font-mono text-[10px] px-[10px] py-1 rounded-[3px] border transition-colors duration-200"
                    style={{
                      background: `rgba(${e.accent},0.08)`,
                      borderColor: `rgba(${e.accent},0.2)`,
                      color: `rgb(${e.accent})`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <span
                className="font-mono text-[11px] tracking-[0.08em] flex items-center gap-[6px] transition-all duration-200 group-hover:gap-[10px]"
                style={{ color: `rgb(${e.accent})` }}
              >
                Open tool →
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Footer />
    </div>
  );
}
