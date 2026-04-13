'use client'

// ─────────────────────────────────────────────────────────────────────────────
// LAB HERO SANDBOX — localhost only (production returns 404)
// Edit this file freely. The real homepage (app/page.jsx) is untouched.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Button from '../components/Button'
import Section from '../components/Section'
import dynamic from 'next/dynamic'
import SpeechBubble from '../components/SpeechBubble'
import HeadChat from '../components/HeadChat'
import experiments from '../data/experiments'
import HeroIntro from './HeroIntro'
import HeroBrutalist from '../components/heroes/HeroBrutalist'
import AlwaysCooking from './AlwaysCooking'

const MemojiHead = dynamic(() => import('../components/MemojiHead'), {
  ssr: false,
  loading: () => null,
})

export default function HomeContent() {
  const headContainerRef = useRef(null)
  const expandedRef      = useRef(false)
  const [headLoaded,     setHeadLoaded]     = useState(false)
  const [expanded,       setExpanded]       = useState(false)
  const [introComplete,  setIntroComplete]  = useState(false)

  const CONTAINER = 580
  const SCALE_MAX = 1.6
  const SCALE_MIN = 0.52

  function handleHeadClick() {
    const el = headContainerRef.current
    if (!el) return
    const next = !expandedRef.current
    expandedRef.current = next
    setExpanded(next)

    const EXPAND_SCALE = 2.0
    if (next) {
      const tx = CONTAINER * EXPAND_SCALE / 2 - window.innerWidth  / 2
      const ty = window.innerHeight / 2       - CONTAINER * EXPAND_SCALE / 2
      el.style.transition      = 'transform 0.5s cubic-bezier(0.34,1.2,0.64,1)'
      el.style.transformOrigin = 'top right'
      el.style.transform       = `translateX(${tx}px) translateY(${ty}px) scale(${EXPAND_SCALE})`
      el.style.zIndex          = '50'
      el.style.cursor          = 'zoom-out'
      el.style.pointerEvents   = 'auto'
    } else {
      const progress = Math.min(window.scrollY / (window.innerHeight * 0.6), 1)
      const scale    = SCALE_MAX - (SCALE_MAX - SCALE_MIN) * progress
      const ty       = (1 - progress) * (window.innerHeight / 2 - (CONTAINER * SCALE_MAX) / 2)
      const tx       = (1 - progress) * -140
      el.style.transition      = 'transform 0.4s ease'
      el.style.transformOrigin = 'top right'
      el.style.transform       = `translateX(${tx}px) translateY(${ty}px) scale(${scale})`
      el.style.zIndex          = '10'
      el.style.cursor          = 'zoom-in'
      setTimeout(() => { if (!expandedRef.current) el.style.transition = 'none' }, 400)
    }
  }

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && expandedRef.current) handleHeadClick() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!introComplete) return

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
            bar.classList.add('visible')
            bar.style.width = bar.style.width
          })
        }
      })
    }, { threshold: 0.15 })

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    document.querySelectorAll('.skill-group').forEach(el => observer.observe(el))

    function onScroll() {
      if (!headContainerRef.current) return
      if (expandedRef.current) return
      if (window.innerWidth < 768) {
        headContainerRef.current.style.width  = '100px'
        headContainerRef.current.style.height = '100px'
        headContainerRef.current.style.top    = '80px'
        headContainerRef.current.style.transform = 'none'
        headContainerRef.current.style.pointerEvents = 'auto'
        headContainerRef.current.style.cursor = 'pointer'
        return
      }
      headContainerRef.current.style.top    = '0px'
      headContainerRef.current.style.width  = `${CONTAINER}px`
      headContainerRef.current.style.height = `${CONTAINER}px`
      const progress = Math.min(window.scrollY / (window.innerHeight * 0.6), 1)
      const scale = SCALE_MAX - (SCALE_MAX - SCALE_MIN) * progress
      const ty = (1 - progress) * (window.innerHeight / 2 - (CONTAINER * SCALE_MAX) / 2)
      const tx = (1 - progress) * -140
      headContainerRef.current.style.transform = `translateX(${tx}px) translateY(${ty}px) scale(${scale})`
      headContainerRef.current.style.pointerEvents = 'auto'
      headContainerRef.current.style.cursor = 'pointer'
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [introComplete])

  return (
    <>
      {/* ── Intro animation — fixed overlay, unmounts when done ── */}
      <HeroIntro onComplete={() => setIntroComplete(true)} />

      {/* ── DEV BADGE ── */}
      <div style={{
        position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
        fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.08em',
        padding: '4px 10px', borderRadius: 6,
        background: 'rgba(46,230,166,0.15)', border: '1px solid rgba(46,230,166,0.3)',
        color: '#2EE6A6', pointerEvents: 'none',
      }}>
        LAB · localhost only
      </div>

      {/* ── Page content — fades in after intro ── */}
      <div style={{
        opacity:    introComplete ? 1 : 0,
        transition: introComplete ? 'opacity 1s ease' : 'none',
        pointerEvents: introComplete ? 'auto' : 'none',
      }}>

      {expanded && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={handleHeadClick} />
      )}

      {introComplete && (
        <div
          ref={headContainerRef}
          className="fixed top-0 right-0 z-10"
          style={{ width: 580, height: 580, pointerEvents: 'auto', cursor: 'pointer', transformOrigin: 'top right' }}
          onClick={handleHeadClick}
        >
          <MemojiHead size={2.8} className="w-full h-full" onLoad={() => setTimeout(() => setHeadLoaded(true), 700)} />
        </div>
      )}

      {headLoaded && <SpeechBubble headRef={headContainerRef} />}
      <HeadChat visible={expanded} />

      {/* ─────────────────────────────────────────────────────────────────────
          HERO v3 — brutalist
      ───────────────────────────────────────────────────────────────────── */}
      <HeroBrutalist introComplete={introComplete} />


      {/* ─────────────────────────────────────────────────────────────────────
          REST OF PAGE — unchanged from production
      ───────────────────────────────────────────────────────────────────── */}
      <Section className="bg-bg relative" id="about">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-ui to-transparent" />
        <div className="h-20" />
        <div className="grid grid-cols-2 gap-[80px] items-center max-[900px]:grid-cols-1 max-[900px]:gap-12">
          <div>
            <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]">About</div>
            <div className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.02em] leading-[1.1] mb-[60px] reveal reveal-delay-1">
              Building on the<br /><span className="text-violet">front lines</span> of the web
            </div>
            <p className="font-mono text-[15px] text-muted leading-[1.8] mb-5 reveal reveal-delay-2">
              I&apos;m a full stack developer with a frontend focus, the kind of engineer who obsesses over render performance just as much as pixel precision.
            </p>
            <p className="font-mono text-[15px] text-muted leading-[1.8] mb-5 reveal reveal-delay-2">
              My sweet spot is the intersection of <strong className="text-foreground font-normal">design systems, component architecture, and CMS integrations</strong>. Whether that&apos;s a headless WordPress API, a Drupal backend, or a polished Webflow build, I get the job done right.
            </p>
            <p className="font-mono text-[15px] text-muted leading-[1.8] reveal reveal-delay-3">
              I write clean, maintainable code and believe the best user experience is the one you never have to think about.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-[2px] reveal reveal-delay-2">
            {[
              { num: '10', sup: '+', label: 'Years of experience' },
              { num: '30',  sup: '+', label: 'Projects shipped' },
              { num: '7', sup: '',  label: 'Core technologies' },
              { num: '∞', sup: '',  label: 'Coffees consumed' },
            ].map(s => (
              <div key={s.label} className="stat-card bg-bg2 p-[28px_24px] border border-ui transition-colors duration-200 hover:border-violet">
                <div className="text-[40px] font-bold text-violet tracking-[-0.03em] leading-none">
                  {s.num}{s.sup && <span className="text-mint text-[24px]">{s.sup}</span>}
                </div>
                <div className="font-mono text-[11px] text-muted tracking-[0.08em] mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-bg2 relative" id="skills">
        <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]">Skills</div>
        <div className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.02em] leading-[1.1] mb-[60px] reveal reveal-delay-1">
          What I work<br />with <span className="text-mint">every day</span>
        </div>
        <div className="grid grid-cols-3 gap-[2px] max-[900px]:grid-cols-1">
          {[
            { icon: '⚛️', title: 'Frontend Frameworks', skills: [['React',95],['Vue.js',90],['Next.js',85],['TypeScript',88]], delay: '' },
            { icon: '🧱', title: 'CMS Platforms',       skills: [['WordPress',95],['Drupal',85],['Webflow',88],['Headless CMS',80]], delay: 'reveal-delay-1' },
            { icon: '⚙️', title: 'Backend & Tooling',   skills: [['Node.js',82],['REST / GraphQL',85],['PHP',75],['Git / CI/CD',90]], delay: 'reveal-delay-2' },
          ].map(group => (
            <div key={group.title} className={`skill-group bg-bg p-[36px_32px] border border-ui transition-all duration-[250ms] relative overflow-hidden hover:border-[rgba(124,92,255,0.3)] hover:-translate-y-0.5 reveal ${group.delay}`}>
              <div className="text-[20px] mb-4">{group.icon}</div>
              <h3 className="text-[16px] font-semibold mb-5 text-foreground">{group.title}</h3>
              <ul className="list-none flex flex-col gap-[10px]">
                {group.skills.map(([name, pct]) => (
                  <li key={name} className="font-mono text-[13px] text-muted flex items-center justify-between gap-3">
                    {name}
                    <div className="h-[2px] bg-ui flex-1 rounded-[2px] overflow-hidden relative">
                      <div className="skill-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <AlwaysCooking />

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

      </div>{/* end fade wrapper */}
    </>
  )
}
