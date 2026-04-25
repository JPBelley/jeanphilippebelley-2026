'use client'

import Link from 'next/link'
import Section from '../Section'
import Button from '../Button'
import experiments from '../../data/experiments'

export default function ExperimentOldSection() {
  return (
    <Section className="bg-bg2 relative" id="experiments">
      <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]">Lab</div>
      <div className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.02em] leading-[1.1] mb-[60px] reveal reveal-delay-1">
        Experiments &amp;<br /><span className="text-mint">playground</span>
      </div>
      <div className="grid grid-cols-3 gap-[2px] max-[900px]:grid-cols-1">
        {experiments.filter(e => e.published).slice(0, 3).map((e, i) => ({
          ...e,
          delay: ['', 'reveal-delay-1', 'reveal-delay-2'][i],
        })).map(e => (
          <Link key={e.href} href={e.href} className={`exp-card bg-bg border border-ui p-[36px_32px] no-underline text-inherit flex flex-col gap-4 relative overflow-hidden transition-all duration-[250ms] hover:border-[rgba(124,92,255,0.35)] hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] reveal ${e.delay}`}>
            <div className="text-[32px] leading-none">{e.icon}</div>
            <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-foreground">{e.title}</h3>
            <p className="font-mono text-[12px] text-muted leading-[1.7] flex-1">{e.desc}</p>
            <span className="font-mono text-[11px] text-violet tracking-[0.08em] flex items-center gap-[6px]">Open tool →</span>
          </Link>
        ))}
      </div>
      <div className="mt-12 flex justify-center reveal reveal-delay-2">
        <Button href="/experiments" variant="link">Explore the full lab →</Button>
      </div>
    </Section>
  )
}
