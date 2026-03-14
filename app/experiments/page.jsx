'use client';

import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Cursor from '../components/Cursor';

const experiments = [
  {
    href:  '/experiments/blob-editor',
    icon:  '🟠',
    title: 'Blob Editor',
    desc:  '2D WebGL blob renderer with real-time SDF shape morphing, swirl color mixing, halo glow layers, and per-frame PNG export.',
    tags:  ['WebGL', 'GLSL', 'Canvas API'],
  },
  {
    href:  '/experiments/morphing-blob',
    icon:  '🫀',
    title: 'Morphing Blob',
    desc:  '3D Three.js organic blob with layered FBM noise deformation, drag-to-orbit controls, palette switching, and panic mode.',
    tags:  ['Three.js', 'GLSL', 'FBM Noise'],
  },
  {
    href:  '/experiments/wire-studio',
    icon:  '🔵',
    title: 'Wire Studio',
    desc:  'Interactive Three.js wireframe sphere editor with custom GLSL rim lighting, real-time displacement, edge scalloping, and presets.',
    tags:  ['Three.js', 'GLSL', 'Wireframe'],
  },
];

export default function Experiments() {
  return (
    <div className="min-h-screen bg-bg text-foreground font-head">
      <Cursor />
      <Nav />

      <main className="max-w-6xl mx-auto px-[60px] pt-40 pb-20">
        <div className="mb-16">
          <div className="section-label font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]" data-num="01">
            Lab
          </div>
          <h1 className="text-[clamp(40px,6vw,72px)] font-bold leading-[1.05] tracking-[-0.03em] mb-6">
            Experiments &amp;<br /><span className="text-mint">playground</span>
          </h1>
          <p className="font-mono text-[15px] text-muted max-w-lg leading-[1.7]">
            Creative coding explorations — WebGL, Three.js, shaders, and interactive graphics.
            More experiments coming as they get built.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-[2px] max-[900px]:grid-cols-1">
          {experiments.map(e => (
            <Link
              key={e.href}
              href={e.href}
              className="exp-card bg-bg2 border border-ui p-[36px_32px] no-underline text-inherit flex flex-col gap-4 relative overflow-hidden transition-all duration-[250ms] hover:border-[rgba(124,92,255,0.35)] hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            >
              <div className="text-[32px] leading-none">{e.icon}</div>
              <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-foreground">{e.title}</h3>
              <p className="font-mono text-[12px] text-muted leading-[1.7] flex-1">{e.desc}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {e.tags.map(t => (
                  <span key={t} className="font-mono text-[10px] px-[10px] py-1 bg-[rgba(124,92,255,0.1)] text-violet rounded-[3px]">{t}</span>
                ))}
              </div>
              <span className="font-mono text-[11px] text-violet tracking-[0.08em] flex items-center gap-[6px]">
                Open tool →
              </span>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
