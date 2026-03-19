'use client';

import { useState, useRef } from 'react';
import ExperimentLayout from '../../components/layouts/ExperimentLayout';

/* ─── Constants ────────────────────────────────────────────────────────────── */

const EASINGS = [
  { label: 'ease',         value: 'ease' },
  { label: 'ease-in',      value: 'ease-in' },
  { label: 'ease-out',     value: 'ease-out' },
  { label: 'ease-in-out',  value: 'ease-in-out' },
  { label: 'linear',       value: 'linear' },
  { label: 'spring',       value: 'cubic-bezier(0.34,1.56,0.64,1)' },
  { label: 'snappy',       value: 'cubic-bezier(0.77,0,0.18,1)' },
  { label: 'bounce',       value: 'cubic-bezier(0.68,-0.55,0.27,1.55)' },
];

const DIRECTIONS = [
  { label: '→ L to R',  value: 'ltr' },
  { label: '← R to L',  value: 'rtl' },
  { label: '↔ Center',  value: 'center' },
  { label: '⟳ Random',  value: 'random' },
];

const SPLIT_MODES = [
  { label: '✦ Letters', value: 'letter' },
  { label: '◻ Words',   value: 'word' },
];

const DEFAULTS = {
  text:        'Hello World',
  opacityFrom: 0,   opacityTo:   1,
  yFrom:       40,  yTo:         0,
  xFrom:       0,   xTo:         0,
  scaleFrom:   0.6, scaleTo:     1,
  rotateFrom:  0,   rotateTo:    0,
  blurFrom:    8,   blurTo:      0,
  stagger:     60,
  duration:    600,
  easing:      'ease',
  direction:   'ltr',
  splitMode:   'letter',
  wave:        false,
  waveAmp:     40,
  waveFreq:    1.0,
  overshoot:   0,
};

/* ─── Sub-components ────────────────────────────────────────────────────────── */

function SectionHdr({ label }) {
  return <div className="sec-hdr"><span>{label}</span></div>;
}

function SliderRow({ label, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <div className="ctrl-row">
      <span className="ctrl-label">{label}</span>
      <div className="ctrl-right">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
        />
        <span className="ctrl-val">{value}{unit}</span>
      </div>
    </div>
  );
}

function ToggleGrid({ options, value, onChange }) {
  return (
    <div className="grid gap-1.5 pt-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="text-[10px] px-2 py-1.5 rounded border transition-colors duration-150"
          style={{
            background:  value === o.value ? 'rgba(124,92,255,0.12)' : 'var(--color-tool-bg3)',
            borderColor: value === o.value ? 'rgba(124,92,255,0.5)'  : 'var(--color-tool-border2)',
            color:       value === o.value ? 'var(--color-violet)'   : 'var(--color-tool-text2)',
            fontFamily:  'var(--font-mono)',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function TextAnimator() {
  const [cfg, setCfg]         = useState(DEFAULTS);
  const [playKey, setPlayKey] = useState(0);
  const [playing, setPlaying] = useState(false);
  const randomOrder           = useRef([]);

  const set = (key, val) => setCfg(prev => ({ ...prev, [key]: val }));

  /* Tokenise based on split mode */
  const tokens = cfg.splitMode === 'word'
    ? cfg.text.split(' ').filter(w => w.length > 0)
    : cfg.text.split('');

  /* Stagger delay with optional wave distortion */
  const getDelay = (i) => {
    const n = tokens.length;
    let base;
    switch (cfg.direction) {
      case 'rtl':    base = (n - 1 - i) * cfg.stagger; break;
      case 'center': base = Math.abs(i - (n - 1) / 2) * cfg.stagger; break;
      case 'random': base = (randomOrder.current[i] ?? i) * cfg.stagger; break;
      default:       base = i * cfg.stagger;
    }
    if (cfg.wave) {
      const offset = Math.sin(i * cfg.waveFreq) * cfg.waveAmp;
      return Math.max(0, base + offset);
    }
    return base;
  };

  /* Overshoot generates a dynamic cubic-bezier, overriding the easing picker */
  const effectiveEasing = cfg.overshoot > 0
    ? `cubic-bezier(0.34,${(1 + cfg.overshoot).toFixed(2)},0.64,1)`
    : cfg.easing;

  const play = () => {
    const n = tokens.length;
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    randomOrder.current = arr;
    setPlayKey(k => k + 1);
    setPlaying(true);
    const totalDuration = (n - 1) * cfg.stagger + cfg.duration + 200;
    setTimeout(() => setPlaying(false), totalDuration);
  };

  const kf = `la${playKey}`;
  const keyframeCSS = `
    @keyframes ${kf} {
      from {
        opacity: ${cfg.opacityFrom};
        transform: translateY(${cfg.yFrom}px) translateX(${cfg.xFrom}px) scale(${cfg.scaleFrom}) rotate(${cfg.rotateFrom}deg);
        filter: blur(${cfg.blurFrom}px);
      }
      to {
        opacity: ${cfg.opacityTo};
        transform: translateY(${cfg.yTo}px) translateX(${cfg.xTo}px) scale(${cfg.scaleTo}) rotate(${cfg.rotateTo}deg);
        filter: blur(${cfg.blurTo}px);
      }
    }
  `;

  return (
    <ExperimentLayout
      label="text-animator"
      title="Text Animation Studio"
      description="Compose letter-by-letter animations with live preview."
    >
        <div className="flex gap-6 items-start max-[900px]:flex-col">

          {/* ── CONTROLS PANEL ───────────────────────────────────────────────── */}
          <aside
            id="controls"
            className="w-[260px] max-[900px]:w-full shrink-0 bg-tool-bg1 border border-tool-border rounded-xl overflow-hidden font-mono"
          >

            {/* Text input */}
            <div className="p-4 border-b border-tool-border">
              <p className="text-[10px] uppercase tracking-widest text-tool-text3 mb-2">Text</p>
              <input
                type="text" value={cfg.text}
                onChange={e => set('text', e.target.value)}
                className="w-full bg-tool-bg3 border border-tool-border2 rounded px-3 py-2 text-[13px] text-tool-text outline-none"
                style={{ fontFamily: 'var(--font-mono)' }}
                placeholder="Enter text…"
              />
            </div>

            {/* Split mode */}
            <div className="section border-b border-tool-border">
              <SectionHdr label="Split Mode" />
              <div className="sec-body">
                <ToggleGrid options={SPLIT_MODES} value={cfg.splitMode} onChange={v => set('splitMode', v)} />
              </div>
            </div>

            {/* Opacity */}
            <div className="section border-b border-tool-border">
              <SectionHdr label="Opacity" />
              <div className="sec-body">
                <SliderRow label="From" value={cfg.opacityFrom} min={0} max={1} step={0.01} onChange={v => set('opacityFrom', v)} />
                <SliderRow label="To"   value={cfg.opacityTo}   min={0} max={1} step={0.01} onChange={v => set('opacityTo', v)} />
              </div>
            </div>

            {/* Translate Y */}
            <div className="section border-b border-tool-border">
              <SectionHdr label="Translate Y" />
              <div className="sec-body">
                <SliderRow label="From" value={cfg.yFrom} min={-140} max={140} unit="px" onChange={v => set('yFrom', v)} />
                <SliderRow label="To"   value={cfg.yTo}   min={-140} max={140} unit="px" onChange={v => set('yTo', v)} />
              </div>
            </div>

            {/* Translate X */}
            <div className="section border-b border-tool-border">
              <SectionHdr label="Translate X" />
              <div className="sec-body">
                <SliderRow label="From" value={cfg.xFrom} min={-140} max={140} unit="px" onChange={v => set('xFrom', v)} />
                <SliderRow label="To"   value={cfg.xTo}   min={-140} max={140} unit="px" onChange={v => set('xTo', v)} />
              </div>
            </div>

            {/* Scale */}
            <div className="section border-b border-tool-border">
              <SectionHdr label="Scale" />
              <div className="sec-body">
                <SliderRow label="From" value={cfg.scaleFrom} min={0} max={3} step={0.01} onChange={v => set('scaleFrom', v)} />
                <SliderRow label="To"   value={cfg.scaleTo}   min={0} max={3} step={0.01} onChange={v => set('scaleTo', v)} />
              </div>
            </div>

            {/* Rotate */}
            <div className="section border-b border-tool-border">
              <SectionHdr label="Rotate" />
              <div className="sec-body">
                <SliderRow label="From" value={cfg.rotateFrom} min={-180} max={180} unit="°" onChange={v => set('rotateFrom', v)} />
                <SliderRow label="To"   value={cfg.rotateTo}   min={-180} max={180} unit="°" onChange={v => set('rotateTo', v)} />
              </div>
            </div>

            {/* Blur */}
            <div className="section border-b border-tool-border">
              <SectionHdr label="Blur" />
              <div className="sec-body">
                <SliderRow label="From" value={cfg.blurFrom} min={0} max={40} unit="px" onChange={v => set('blurFrom', v)} />
                <SliderRow label="To"   value={cfg.blurTo}   min={0} max={40} unit="px" onChange={v => set('blurTo', v)} />
              </div>
            </div>

            {/* Timing */}
            <div className="section border-b border-tool-border">
              <SectionHdr label="Timing" />
              <div className="sec-body">
                <SliderRow label="Duration" value={cfg.duration} min={100} max={2000} step={50} unit="ms" onChange={v => set('duration', v)} />
                <SliderRow label="Stagger"  value={cfg.stagger}  min={0}   max={300}  step={5}  unit="ms" onChange={v => set('stagger', v)} />
                <div className="ctrl-row">
                  <span className="ctrl-label" style={{ opacity: cfg.overshoot > 0 ? 0.4 : 1 }}>Easing</span>
                  <select
                    value={cfg.easing}
                    onChange={e => set('easing', e.target.value)}
                    disabled={cfg.overshoot > 0}
                    style={{ opacity: cfg.overshoot > 0 ? 0.4 : 1 }}
                  >
                    {EASINGS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Direction */}
            <div className="section border-b border-tool-border">
              <SectionHdr label="Direction" />
              <div className="sec-body">
                <ToggleGrid options={DIRECTIONS} value={cfg.direction} onChange={v => set('direction', v)} />
              </div>
            </div>

            {/* Creative */}
            <div className="section">
              <SectionHdr label="Creative" />
              <div className="sec-body">

                {/* Overshoot */}
                <SliderRow
                  label="Overshoot"
                  value={cfg.overshoot} min={0} max={1.5} step={0.05}
                  onChange={v => set('overshoot', v)}
                />
                {cfg.overshoot > 0 && (
                  <p className="font-mono text-[9px] pb-1" style={{ color: 'var(--color-violet)', opacity: 0.7 }}>
                    cubic-bezier(0.34,{(1 + cfg.overshoot).toFixed(2)},0.64,1)
                  </p>
                )}

                {/* Wave toggle */}
                <div className="ctrl-row mt-1">
                  <span className="ctrl-label">Wave</span>
                  <button
                    onClick={() => set('wave', !cfg.wave)}
                    className="text-[10px] px-3 py-1 rounded border transition-colors duration-150"
                    style={{
                      background:  cfg.wave ? 'rgba(46,230,166,0.12)' : 'var(--color-tool-bg3)',
                      borderColor: cfg.wave ? 'rgba(46,230,166,0.5)'  : 'var(--color-tool-border2)',
                      color:       cfg.wave ? 'var(--color-mint)'     : 'var(--color-tool-text2)',
                      fontFamily:  'var(--font-mono)',
                    }}
                  >
                    {cfg.wave ? 'on' : 'off'}
                  </button>
                </div>

                {/* Wave controls — only visible when wave is on */}
                {cfg.wave && (
                  <>
                    <SliderRow label="Amplitude" value={cfg.waveAmp}  min={0} max={150} step={5}   unit="ms" onChange={v => set('waveAmp', v)} />
                    <SliderRow label="Frequency" value={cfg.waveFreq} min={0.1} max={3} step={0.1}           onChange={v => set('waveFreq', v)} />
                  </>
                )}
              </div>
            </div>

          </aside>

          {/* ── PREVIEW ──────────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-4 min-w-0 sticky top-[100px] self-start max-[900px]:w-full">
            <style dangerouslySetInnerHTML={{ __html: keyframeCSS }} />

            {/* Square preview window */}
            <div
              className="w-full rounded-xl border border-ui overflow-hidden relative flex items-center justify-center"
              style={{ aspectRatio: '1 / 1', background: 'var(--color-bg2)' }}
            >
              <div className="hero-grid absolute inset-0 opacity-20" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(124,92,255,0.06), transparent 70%)' }}
              />

              <div
                className="relative px-10 text-center"
                style={{ fontSize: 'clamp(22px, 4.5vw, 56px)', fontWeight: 700, lineHeight: 1.2, wordBreak: 'break-word' }}
              >
                {playKey === 0 ? (
                  <span className="font-mono text-[13px] font-normal" style={{ color: 'var(--color-muted)', opacity: 0.4 }}>
                    Press Play to preview
                  </span>
                ) : (
                  tokens.map((token, i) => (
                    <span
                      key={`${playKey}-${i}`}
                      style={{
                        display: 'inline-block',
                        marginRight: cfg.splitMode === 'word' && i < tokens.length - 1 ? '0.3em' : undefined,
                        whiteSpace: cfg.splitMode === 'letter' && token === ' ' ? 'pre' : undefined,
                        animation: `${kf} ${cfg.duration}ms ${effectiveEasing} ${getDelay(i)}ms both`,
                      }}
                    >
                      {cfg.splitMode === 'letter' && token === ' ' ? '\u00A0' : token}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Play button */}
            <button
              onClick={play}
              disabled={!cfg.text.trim()}
              className="w-full py-4 rounded-xl font-head font-semibold text-[15px] tracking-wide disabled:opacity-30 disabled:cursor-not-allowed text-white"
              style={{
                background: playing
                  ? 'var(--color-mint)'
                  : 'linear-gradient(135deg, var(--color-violet), var(--color-mint))',
                transition: 'background 0.4s ease',
              }}
            >
              {playing ? '● Playing…' : '▶ Play'}
            </button>

            <p className="font-mono text-[10px] text-center" style={{ color: 'var(--color-muted)', opacity: 0.5 }}>
              Hit Play again to restart the animation
            </p>
          </div>

        </div>
    </ExperimentLayout>
  );
}
