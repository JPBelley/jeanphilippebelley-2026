'use client';

import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Cursor from '../components/Cursor';

const Section = ({ title, num, children }) => (
  <section className="mb-20">
    <div className="flex items-center gap-4 mb-8">
      <span
        className="section-label text-[10px] font-mono uppercase tracking-widest text-muted flex items-center gap-2"
        data-num={num}
      />
      <h2 className="text-[13px] font-mono uppercase tracking-widest text-muted">{title}</h2>
    </div>
    {children}
  </section>
);

const colors = [
  { name: '--color-bg',          hex: '#0F1115', label: 'Background',   tw: 'bg-bg' },
  { name: '--color-bg2',         hex: '#1A1D24', label: 'Background 2', tw: 'bg-bg2' },
  { name: '--color-ui',          hex: '#2A2F3A', label: 'UI',           tw: 'bg-ui' },
  { name: '--color-violet',      hex: '#7C5CFF', label: 'Violet',       tw: 'bg-violet' },
  { name: '--color-mint',        hex: '#2EE6A6', label: 'Mint',         tw: 'bg-mint' },
  { name: '--color-foreground',  hex: '#E8EAF0', label: 'Foreground',   tw: 'bg-foreground' },
  { name: '--color-muted',       hex: '#6B7280', label: 'Muted',        tw: 'bg-muted' },
];

const toolColors = [
  { name: '--color-tool-bg0',     hex: '#0d0d0f', label: 'Tool BG 0' },
  { name: '--color-tool-bg1',     hex: '#141416', label: 'Tool BG 1' },
  { name: '--color-tool-bg2',     hex: '#1c1c1f', label: 'Tool BG 2' },
  { name: '--color-tool-bg3',     hex: '#242428', label: 'Tool BG 3' },
  { name: '--color-tool-bg4',     hex: '#2e2e33', label: 'Tool BG 4' },
  { name: '--color-tool-border',  hex: '#2e2e33', label: 'Tool Border' },
  { name: '--color-tool-border2', hex: '#3a3a40', label: 'Tool Border 2' },
  { name: '--color-tool-text',    hex: '#e8e8ec', label: 'Tool Text' },
  { name: '--color-tool-text2',   hex: '#9090a0', label: 'Tool Text 2' },
  { name: '--color-tool-text3',   hex: '#5a5a6a', label: 'Tool Text 3' },
];

const skills = [
  { label: 'Next.js / React', pct: 90 },
  { label: 'Three.js / WebGL', pct: 75 },
  { label: 'TypeScript',       pct: 80 },
  { label: 'Python / ML',      pct: 65 },
];

const animations = [
  { name: 'fade-up-1',    value: 'fadeUp 0.6s ease 0.2s  forwards' },
  { name: 'fade-up-2',    value: 'fadeUp 0.7s ease 0.35s forwards' },
  { name: 'fade-up-3',    value: 'fadeUp 0.7s ease 0.5s  forwards' },
  { name: 'fade-up-4',    value: 'fadeUp 0.7s ease 0.65s forwards' },
  { name: 'fade-up-5',    value: 'fadeUp 0.7s ease 0.9s  forwards' },
  { name: 'fade-left',    value: 'fadeLeft 0.7s ease 0.8s forwards' },
  { name: 'scroll-down',  value: 'scrollDown 1.5s ease infinite' },
  { name: 'status-pulse', value: 'statusPulse 2s ease infinite' },
];

export default function DesignSystem() {
  return (
    <div className="min-h-screen bg-bg text-foreground font-head">
      <Cursor />
      <Nav />

      <main className="max-w-5xl mx-auto px-8 py-20">

        {/* Title */}
        <div className="mb-20">
          <p className="font-mono text-[11px] uppercase tracking-widest text-violet mb-3">
            // design-system
          </p>
          <h1 className="text-[clamp(36px,6vw,64px)] font-bold leading-none mb-4">
            Visual Language
          </h1>
          <p className="text-muted max-w-xl leading-relaxed">
            All tokens, components, and patterns used across the portfolio and experiment pages.
          </p>
        </div>

        {/* ─── COLORS ─────────────────────────────────────────────────────── */}
        <Section title="Portfolio Colors" num="01">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {colors.map((c) => (
              <div key={c.name} className="group">
                <div
                  className="h-16 rounded-lg mb-2 border border-ui"
                  style={{ background: c.hex }}
                />
                <p className="text-[13px] font-semibold">{c.label}</p>
                <p className="font-mono text-[11px] text-muted">{c.hex}</p>
                <p className="font-mono text-[10px] text-muted/60">{c.name}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Tool UI Colors" num="02">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {toolColors.map((c) => (
              <div key={c.name}>
                <div
                  className="h-12 rounded-lg mb-2 border border-tool-border2"
                  style={{ background: c.hex }}
                />
                <p className="text-[12px] font-semibold">{c.label}</p>
                <p className="font-mono text-[10px] text-muted">{c.hex}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── TYPOGRAPHY ──────────────────────────────────────────────────── */}
        <Section title="Typography" num="03">
          <div className="space-y-10">

            {/* Headings scale */}
            <div className="p-8 bg-bg2 rounded-xl border border-ui">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-8">
                Space Grotesk — Heading Scale
              </p>
              <div className="space-y-1 divide-y divide-ui">
                {[
                  { tag: 'h1', size: 'clamp(48px,7vw,86px)', weight: '700', label: 'Display / Hero',      sample: 'Full Stack Developer' },
                  { tag: 'h2', size: 'clamp(32px,4vw,52px)', weight: '700', label: 'Section Title',        sample: 'Selected Work' },
                  { tag: 'h3', size: '32px',                  weight: '600', label: 'Card Heading (large)', sample: 'Design System & Tokens' },
                  { tag: 'h4', size: '22px',                  weight: '600', label: 'Card Heading (small)', sample: 'Headless WordPress' },
                  { tag: 'h5', size: '16px',                  weight: '600', label: 'Label / Group Title',  sample: 'Frontend Frameworks' },
                  { tag: 'h6', size: '13px',                  weight: '600', label: 'Micro Label',          sample: 'Available for work' },
                ].map(({ tag: Tag, size, weight, label, sample }) => (
                  <div key={Tag} className="flex items-baseline justify-between gap-8 py-4 first:pt-0 last:pb-0">
                    <div className="flex items-baseline gap-6 min-w-0">
                      <span className="font-mono text-[10px] text-muted w-6 shrink-0">{Tag}</span>
                      <Tag style={{ fontSize: size, fontWeight: weight, lineHeight: 1.1 }} className="truncate">
                        {sample}
                      </Tag>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-[10px] text-muted">{size}</p>
                      <p className="font-mono text-[10px] text-muted/50">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Body & mono */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-8 bg-bg2 rounded-xl border border-ui">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">Body — Space Grotesk</p>
                <p className="text-[16px] leading-relaxed mb-3">
                  Regular body text. Readable and clean, used for descriptions and paragraphs across the portfolio.
                </p>
                <p className="text-[14px] leading-relaxed text-muted">
                  Secondary body — slightly smaller, used for card descriptions and supporting copy.
                </p>
              </div>
              <div className="p-8 bg-bg2 rounded-xl border border-ui">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">Mono — DM Mono</p>
                <p className="font-mono text-[14px] text-mint mb-2">// tech-tag prefix</p>
                <p className="font-mono text-[12px] uppercase tracking-widest text-muted mb-2">SECTION LABEL</p>
                <p className="font-mono text-[11px] text-muted/60">--color-violet: #7C5CFF;</p>
              </div>
            </div>

          </div>
        </Section>

        {/* ─── BUTTONS ─────────────────────────────────────────────────────── */}
        <Section title="Buttons & Links" num="04">
          <div className="p-8 bg-bg2 rounded-xl border border-ui flex flex-wrap gap-4 items-center">
            {/* Primary */}
            <button className="px-6 py-3 bg-violet text-white font-semibold rounded-lg hover:bg-violet/80 transition-colors duration-200">
              Primary CTA
            </button>

            {/* Secondary */}
            <button className="px-6 py-3 border border-ui text-foreground font-semibold rounded-lg hover:border-violet transition-colors duration-200">
              Secondary
            </button>

            {/* Ghost */}
            <button className="px-6 py-3 text-mint font-mono text-[13px] hover:text-violet transition-colors duration-200">
              → Ghost link
            </button>

            {/* Nav link */}
            <a className="nav-link relative font-mono text-[13px] text-muted hover:text-foreground transition-colors duration-200 cursor-pointer pb-0.5">
              Nav Link
            </a>

            {/* Tag */}
            <span className="px-3 py-1 bg-violet/10 border border-violet/20 text-violet font-mono text-[11px] rounded-full">
              Tag
            </span>
          </div>
        </Section>

        {/* ─── TECH TAGS ───────────────────────────────────────────────────── */}
        <Section title="Tech Tags" num="05">
          <div className="p-8 bg-bg2 rounded-xl border border-ui">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">
              .tech-tag — adds // prefix via CSS
            </p>
            <div className="flex flex-wrap gap-2">
              {['Next.js', 'React', 'Three.js', 'WebGL', 'TypeScript', 'Python', 'Tailwind CSS', 'GLSL'].map((t) => (
                <span
                  key={t}
                  className="tech-tag flex items-center px-3 py-1 bg-ui/50 border border-ui text-muted font-mono text-[12px] rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Section>

        {/* ─── CARDS ───────────────────────────────────────────────────────── */}
        <Section title="Cards" num="06">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Project Card */}
            <div className="project-card relative p-8 bg-bg2 border border-ui rounded-xl cursor-pointer hover:border-violet/40 transition-colors duration-300 overflow-hidden">
              <p className="font-mono text-[11px] text-mint mb-2">// Project Card</p>
              <h3 className="text-[20px] font-bold mb-2">Project Title</h3>
              <p className="text-muted text-[14px] leading-relaxed mb-4">
                Brief description of what this project does and what makes it interesting.
              </p>
              <div className="flex gap-2 flex-wrap">
                {['React', 'Three.js', 'WebGL'].map((t) => (
                  <span key={t} className="tech-tag flex items-center px-2 py-0.5 font-mono text-[11px] text-muted">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Experiment Card */}
            <div className="exp-card relative p-8 bg-bg2 border border-ui rounded-xl cursor-pointer hover:border-mint/20 transition-colors duration-300 overflow-hidden">
              <p className="font-mono text-[11px] text-mint mb-2">// Experiment Card</p>
              <h3 className="text-[20px] font-bold mb-2">Experiment Title</h3>
              <p className="text-muted text-[14px] leading-relaxed">
                An interactive experiment exploring creative coding and WebGL techniques.
              </p>
            </div>
          </div>
        </Section>

        {/* ─── SKILL BARS ──────────────────────────────────────────────────── */}
        <Section title="Skill Bars" num="07">
          <div className="skill-group relative p-8 bg-bg2 border border-ui rounded-xl overflow-hidden">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-6">
              .skill-group + .skill-bar-fill.visible
            </p>
            <div className="space-y-5">
              {skills.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between mb-2">
                    <span className="font-mono text-[13px]">{s.label}</span>
                    <span className="font-mono text-[12px] text-muted">{s.pct}%</span>
                  </div>
                  <div className="relative h-[3px] bg-ui rounded-sm overflow-hidden">
                    <div
                      className="skill-bar-fill visible"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ─── SECTION ANATOMY ─────────────────────────────────────────────── */}
        <Section title="Section Anatomy" num="08">
          <div className="p-8 bg-bg2 rounded-xl border border-ui space-y-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              .section-label[data-num] + heading pattern
            </p>
            <div className="border border-dashed border-ui rounded-lg p-6 space-y-2">
              <div className="flex items-center gap-3">
                <span
                  className="section-label font-mono text-[10px] text-muted flex items-center gap-2"
                  data-num="01"
                />
                <span className="font-mono text-[12px] uppercase tracking-widest text-muted">
                  Section Label
                </span>
              </div>
              <h2 className="text-[32px] font-bold leading-tight">Section Heading</h2>
              <p className="text-muted max-w-md leading-relaxed text-[15px]">
                Supporting paragraph that provides context for the section content.
              </p>
            </div>
          </div>
        </Section>

        {/* ─── STATUS & INDICATORS ─────────────────────────────────────────── */}
        <Section title="Indicators" num="09">
          <div className="p-8 bg-bg2 rounded-xl border border-ui flex flex-wrap gap-8 items-start">
            {/* Status dot */}
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
                Status Pulse
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full bg-mint animate-status-pulse"
                />
                <span className="font-mono text-[13px]">Available for work</span>
              </div>
            </div>

            {/* Cursor */}
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
                Cursor Dot
              </p>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-violet" style={{ mixBlendMode: 'screen' }} />
                <span className="font-mono text-[13px] text-muted">12px • violet • screen</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full border border-violet/40" />
                <span className="font-mono text-[13px] text-muted">36px ring • 0.4 opacity</span>
              </div>
            </div>

            {/* Reveal */}
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
                Scroll Reveal
              </p>
              <div className="reveal visible p-3 bg-ui rounded-lg font-mono text-[12px]">
                .reveal.visible
              </div>
              <div className="reveal visible reveal-delay-1 p-3 bg-ui rounded-lg font-mono text-[12px]">
                .reveal-delay-1 (100ms)
              </div>
              <div className="reveal visible reveal-delay-2 p-3 bg-ui rounded-lg font-mono text-[12px]">
                .reveal-delay-2 (200ms)
              </div>
            </div>
          </div>
        </Section>

        {/* ─── ANIMATIONS ──────────────────────────────────────────────────── */}
        <Section title="Animations" num="10">
          <div className="grid sm:grid-cols-2 gap-3">
            {animations.map((a) => (
              <div
                key={a.name}
                className="p-4 bg-bg2 border border-ui rounded-lg flex items-center justify-between gap-4"
              >
                <span className="font-mono text-[12px] text-mint">animate-{a.name}</span>
                <span className="font-mono text-[10px] text-muted text-right">{a.value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── GRADIENTS ───────────────────────────────────────────────────── */}
        <Section title="Gradients" num="11">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="h-20 rounded-xl" style={{ background: 'linear-gradient(90deg, #7C5CFF, #2EE6A6)' }}>
              <div className="h-full flex items-end p-4">
                <span className="font-mono text-[11px] text-white/80">violet → mint (primary)</span>
              </div>
            </div>
            <div className="h-20 rounded-xl" style={{ background: 'radial-gradient(circle at 30% 70%, rgba(124,92,255,0.4), transparent 60%)' }}>
              <div className="h-full flex items-end p-4 bg-bg2 rounded-xl">
                <span className="font-mono text-[11px] text-muted">radial violet glow (project visual)</span>
              </div>
            </div>
            <div
              className="h-20 rounded-xl flex items-end p-4"
              style={{
                background: `
                  linear-gradient(rgba(42,47,58,0.25) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(42,47,58,0.25) 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px',
                backgroundColor: '#0F1115'
              }}
            >
              <span className="font-mono text-[11px] text-muted">Hero grid overlay (80px)</span>
            </div>
            <div
              className="h-20 rounded-xl flex items-end p-4"
              style={{ background: 'linear-gradient(to bottom, rgba(15,17,21,0), rgba(15,17,21,1))' }}
            >
              <span className="font-mono text-[11px] text-muted">bg fade (sections)</span>
            </div>
          </div>
        </Section>

      </main>

      <Footer />
    </div>
  );
}
