'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Section from './components/Section'
import dynamic from 'next/dynamic'
import SpeechBubble from './components/SpeechBubble'
import HeadChat from './components/HeadChat'
import AlwaysCooking from './lab/AlwaysCooking'
import ExperimentSection from './components/sections/ExperimentSection'
import RevealText from './components/RevealText'

const MemojiHead = dynamic(() => import('./components/MemojiHead'), {
  ssr: false,
  loading: () => null,
})

const HeroCubeExplosion = dynamic(() => import('./components/heroes/HeroCubeExplosion'), {
  ssr: false,
  loading: () => null,
})

export default function Home() {
  const headContainerRef = useRef(null)
  const expandedRef      = useRef(false)
  const [headLoaded,     setHeadLoaded]     = useState(false)
  const [expanded,       setExpanded]       = useState(false)
  const [heroReady,      setHeroReady]      = useState(false)
  const [headlineReady,  setHeadlineReady]  = useState(false)
  const BUFFER_HEIGHT = 600

  const CONTAINER = 300
  const SCALE_MAX = 0.8
  const SCALE_MIN = 0.37

  function handleHeadClick() {
    const el = headContainerRef.current
    if (!el) return
    const next = !expandedRef.current
    expandedRef.current = next
    setExpanded(next)

    const EXPAND_SCALE = 2.0
    if (next) {
      const isMobile   = window.innerWidth < 768
      const RIGHT_GAP  = 20
      const actualSize = isMobile ? 100 : CONTAINER
      const elementTop = isMobile ? 80  : 0
      const tx = -(window.innerWidth / 2) + RIGHT_GAP + (actualSize * EXPAND_SCALE) / 2
      const ty = window.innerHeight / 2 - elementTop - (actualSize * EXPAND_SCALE) / 2
      el.style.transition      = 'transform 0.5s cubic-bezier(0.34,1.2,0.64,1)'
      el.style.transformOrigin = 'top right'
      el.style.transform       = `translateX(${tx}px) translateY(${ty}px) scale(${EXPAND_SCALE})`
      el.style.zIndex          = '50'
      el.style.cursor          = 'zoom-out'
      el.style.pointerEvents   = 'auto'
    } else {
      el.style.transition = 'transform 0.4s ease'
      el.style.zIndex     = '10'
      el.style.cursor     = 'zoom-in'
      if (window.innerWidth < 768) {
        el.style.transform = 'none'
      } else {
        const NAV_HEIGHT = 72
        const progress = Math.min(window.scrollY / (window.innerHeight * 0.6), 1)
        const scale    = SCALE_MAX - (SCALE_MAX - SCALE_MIN) * progress
        const ty       = (1 - progress) * (window.innerHeight / 2 - (CONTAINER * SCALE_MAX) / 2) + progress * NAV_HEIGHT
        const tx       = (1 - progress) * -(window.innerWidth / 2 - (CONTAINER * SCALE_MAX) / 2 - 20)
        el.style.transform = `translateX(${tx}px) translateY(${ty}px) scale(${scale})`
      }
      setTimeout(() => { if (!expandedRef.current) el.style.transition = 'none' }, 400)
    }
  }

  useEffect(() => {
    // Prevent browser scroll restoration from starting mid-hero
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && expandedRef.current) handleHeadClick() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const el = headContainerRef.current
    function onScroll() {
      if (!el) return
      if (expandedRef.current) return
      if (window.innerWidth < 768) {
        el.style.width  = '100px'
        el.style.height = '100px'
        el.style.top    = '80px'
        el.style.transform = 'none'
        el.style.pointerEvents = 'auto'
        el.style.cursor = 'pointer'
        return
      }
      el.style.top    = '0px'
      el.style.width  = `${CONTAINER}px`
      el.style.height = `${CONTAINER}px`
      const NAV_HEIGHT = 72
      const progress = Math.min(window.scrollY / (window.innerHeight * 0.6), 1)
      const scale = SCALE_MAX - (SCALE_MAX - SCALE_MIN) * progress
      const ty = (1 - progress) * (window.innerHeight / 2 - (CONTAINER * SCALE_MAX) / 2) + progress * NAV_HEIGHT
      const tx = (1 - progress) * -(window.innerWidth / 2 - (CONTAINER * SCALE_MAX) / 2 - 20)
      el.style.transform = `translateX(${tx}px) translateY(${ty}px) scale(${scale})`
      el.style.pointerEvents = 'auto'
      el.style.cursor = 'pointer'
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
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

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Backdrop when head is expanded */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={handleHeadClick}
        />
      )}

      {/* Fixed memoji head — appears once cube is assembled */}
      <div
        ref={headContainerRef}
        className="fixed top-0 right-5 z-10"
        style={{
          width: 300, height: 300, transformOrigin: 'top right',
          opacity: heroReady ? 1 : 0,
          pointerEvents: heroReady ? 'auto' : 'none',
          cursor: 'pointer',
          transition: 'opacity 0.6s ease',
        }}
        onClick={handleHeadClick}
      >
        <MemojiHead size={7.5} className="w-full h-full" onLoad={() => setTimeout(() => setHeadLoaded(true), 700)} />
      </div>

      {/* Speech bubble */}
      {headLoaded && heroReady && <SpeechBubble headRef={headContainerRef} />}

      {/* Chat prompt */}
      <HeadChat visible={expanded} />

      {/* HERO — sticky wrapper acts as scroll buffer; hero stays pinned until cube assembles */}
      <div style={{ position: 'relative', height: `calc(100vh + ${BUFFER_HEIGHT}px)` }}>
      <section style={{
        position:      'sticky',
        top:           0,
        height:        '100vh',
        display:       'flex',
        flexDirection: 'column',
        justifyContent:'center',
        overflow:      'hidden',
        padding:       'clamp(80px, 10vh, 140px) clamp(24px, 5vw, 72px) clamp(48px, 6vh, 80px)',
        boxSizing:     'border-box',
        background:    'var(--color-bg)',
      }}>
        <HeroCubeExplosion
          onAssembled={() => setHeroReady(true)}
          onNearlyAssembled={() => setHeadlineReady(true)}
          scrollBuffer={BUFFER_HEIGHT}
        />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>

          {/* Row 1: JP frame + headline */}
          <div
            className="flex flex-col-reverse items-start gap-6 sm:grid sm:grid-cols-2 sm:gap-0 sm:items-end"
            style={{ marginBottom: 'clamp(32px, 5vh, 56px)' }}
          >
            <div style={{
              width: 'clamp(80px, 22vw, 260px)', aspectRatio: '1',
              border: '8px solid var(--color-violet)', background: 'var(--color-bg2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              opacity: headlineReady ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}>
              <span style={{
                fontFamily: 'var(--font-head)', fontWeight: 900,
                fontSize: 'clamp(28px, 6vw, 96px)', color: 'var(--color-violet)',
                letterSpacing: '-0.06em', lineHeight: 1, userSelect: 'none',
              }}>JP</span>
            </div>
            <div className="sm:text-right">
              <RevealText
                as="h1"
                triggered={headlineReady}
                stagger={40}
                style={{
                  fontFamily: 'var(--font-head)', fontWeight: 900,
                  fontSize: 'clamp(52px, 11vw, 160px)', lineHeight: 0.85,
                  letterSpacing: '-0.06em', textTransform: 'uppercase',
                  color: 'var(--color-foreground)', margin: 0,
                }}
              >
                DIGITAL<br />
                <span style={{ color: 'var(--color-violet)' }}>BUILDER</span>
              </RevealText>
            </div>
          </div>

          {/* Row 2: manifesto + stack card */}
          <div
            className="flex flex-col gap-8 sm:flex-row sm:justify-between sm:items-start"
            style={{ marginTop: 'clamp(28px, 4vh, 48px)' }}
          >
            <RevealText
              as="p"
              triggered={headlineReady}
              stagger={10}
              style={{
                fontFamily: 'var(--font-head)', fontWeight: 900,
                fontSize: 'clamp(20px, 3.5vw, 48px)', lineHeight: 1.05,
                letterSpacing: '-0.03em', textTransform: 'uppercase',
                color: 'var(--color-foreground)', margin: 0,
              }}
            >
              I build fast,<br />
              <span style={{ color: 'var(--color-violet)' }}>beautiful</span> interfaces<br />
              and robust backends.<br />
              <span style={{ color: 'var(--color-muted)', fontSize: '0.75em' }}>React, Vue, WordPress, Drupal,<br />Webflow and whatever it takes.</span>
            </RevealText>

            <div
              className="flex flex-col gap-4 w-full sm:w-auto sm:min-w-[260px] sm:max-w-[320px]"
              style={{ opacity: headlineReady ? 1 : 0, transition: 'opacity 0.6s ease 0.4s' }}
            >
              <div style={{ background: 'var(--color-bg2)', border: '1px solid var(--color-ui)', padding: '28px 28px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--color-violet)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>CORE_STACK</span>
                  <span style={{ color: 'var(--color-violet)', fontSize: 18 }}>◫</span>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['REACT', 'NEXT.JS', 'WEBGL', 'NODE.JS'].map(item => (
                    <li key={item} style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 'clamp(16px, 1.8vw, 22px)', letterSpacing: '-0.02em', color: 'var(--color-foreground)', textTransform: 'uppercase' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>
      </div>{/* end sticky wrapper */}

      {/* Sections below — fade in once cube is assembled */}
      <div
        style={{
          opacity:        heroReady ? 1 : 0,
          transform:      heroReady ? 'translateY(0)' : 'translateY(24px)',
          transition:     'opacity 0.9s ease, transform 0.9s ease',
          pointerEvents:  heroReady ? 'auto' : 'none',
        }}
      >

      {/* ABOUT */}
      <Section className="bg-bg relative" id="about">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-ui to-transparent" />
        <div className="h-20" />
        <div className="grid grid-cols-2 gap-[80px] items-center max-[900px]:grid-cols-1 max-[900px]:gap-12">
          <div>
            <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]">About</div>
            <RevealText className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.02em] leading-[1.1] mb-[60px]">
              Building on the<br /><span className="text-violet">front lines</span> of the web
            </RevealText>
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

      {/* SKILLS */}
      <Section className="bg-bg2 relative" id="skills">
        <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]">Skills</div>
        <RevealText className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.02em] leading-[1.1] mb-[60px]">
          What I work<br />with <span className="text-mint">every day</span>
        </RevealText>
        <div className="grid grid-cols-3 gap-[2px] max-[900px]:grid-cols-1">
          {[
            { icon: '⚛️', title: 'Frontend Frameworks', skills: [['React',95],['Gatsby',90],['Next.js',85],['TypeScript',85]], delay: '' },
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

      {/* PHILOSOPHY */}
      <Section className="bg-bg relative" id="projects">
        <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]">Philosophy</div>
        <RevealText className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.02em] leading-[1.1] mb-[60px]">
          The principles<br />I build <span className="text-violet">with</span>
        </RevealText>
        <div className="grid grid-cols-2 gap-[2px] max-[900px]:grid-cols-1">

          <Link href="/design-system" className="project-card bg-bg2 border border-ui p-[40px] transition-all duration-[250ms] relative overflow-hidden col-span-2 grid grid-cols-2 gap-[40px] items-center hover:border-[rgba(124,92,255,0.4)] hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] reveal max-[900px]:col-span-1 max-[900px]:grid-cols-1 no-underline">
            <div>
              <h3 className="text-[32px] font-semibold tracking-[-0.02em] mb-3 text-foreground">Design System &amp; Token Architecture</h3>
              <p className="font-mono text-[13px] text-muted leading-[1.7] mb-7">
                I don't just know design systems, I build with them. This very site runs on a handcrafted token architecture: a unified palette, type scale, motion system, and component set, all documented and explorable.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {['CSS Custom Properties','Tailwind v4','Token Architecture','Next.js'].map(t => (
                    <span key={t} className="font-mono text-[10px] tracking-[0.08em] px-[10px] py-1 bg-[rgba(124,92,255,0.1)] text-violet rounded-[3px]">{t}</span>
                  ))}
                </div>
              </div>
              <div className="mt-6 font-mono text-[12px] text-mint flex items-center gap-2">
                Explore the design system <span className="text-[16px]">→</span>
              </div>
            </div>
            <div className="project-visual bg-gradient-to-br from-[rgba(124,92,255,0.15)] to-[rgba(46,230,166,0.1)] border border-ui rounded-lg h-[220px] flex flex-col items-center justify-center relative overflow-hidden gap-3 px-6">
              <div className="flex gap-2">
                {['#0F1115','#7C5CFF','#2EE6A6','#E8EAF0'].map(c => (
                  <div key={c} className="w-8 h-8 rounded-full border border-ui/50" style={{ background: c }} />
                ))}
              </div>
              <div className="font-mono text-[11px] text-muted tracking-widest uppercase">Aa Bb 01 · tokens</div>
              <div className="h-[2px] w-24 rounded" style={{ background: 'linear-gradient(90deg,#7C5CFF,#2EE6A6)' }} />
            </div>
          </Link>

          {[
            {
              num: '002',
              title: 'Complexity is managed, not avoided',
              desc: "I don't treat technical debt as failure; I treat it as a ledger. Sometimes the right call is to incur it deliberately and move fast. But it gets logged, prioritised, and paid. Refactoring isn't a project you pitch to a product manager; it's a discipline baked into every PR. A codebase should be easier to navigate on day 300 than it was on day 30.",
              tags: ['Refactoring', 'Architecture', 'Technical Debt'],
              delay: '',
            },
            {
              num: '003',
              hidden: true,
              title: "Quality ships, it doesn't slow things down",
              desc: "I test what actually breaks in production. Integration tests over unit tests where behaviour is what matters, e2e for the paths users care about, and just enough coverage to sleep at night. Code review isn't a gate; it's the mechanism that keeps the team's mental model aligned. My definition of done includes 'legible to whoever is next in the file.'",
              tags: ['Testing Strategy', 'Code Review', 'CI/CD'],
              delay: 'reveal-delay-1',
            },
            {
              num: '004',
              title: 'Tradeoffs, not opinions',
              desc: "Every architectural decision is a set of tradeoffs with a context. I don't push for the elegant solution when the pragmatic one ships and holds. What I do insist on is naming the tradeoff out loud: 'here's what we gain, here's what we give up, here's when we'd revisit it.' Pragmatism beats purity. Good enough is right more often than engineers admit, as long as everyone knows what good enough means.",
              tags: ['Architecture Decisions', 'Pragmatism', 'Communication'],
              delay: 'reveal-delay-2',
            },
          ].filter(p => !p.hidden).map(p => (
            <div key={p.num} className={`project-card bg-bg2 border border-ui p-[40px] transition-all duration-[250ms] relative overflow-hidden hover:border-[rgba(124,92,255,0.4)] hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] reveal ${p.delay}`}>
              <h3 className="text-[22px] font-semibold tracking-[-0.02em] mb-3">{p.title}</h3>
              <p className="font-mono text-[13px] text-muted leading-[1.7] mb-7">{p.desc}</p>
              <div className="flex flex-wrap gap-2">
                {p.tags.map(t => <span key={t} className="font-mono text-[10px] tracking-[0.08em] px-[10px] py-1 bg-[rgba(124,92,255,0.1)] text-violet rounded-[3px]">{t}</span>)}
              </div>
            </div>
          ))}

          <Link href="/architecture" className="project-card bg-bg2 border border-ui p-[40px] transition-all duration-[250ms] relative overflow-hidden col-span-2 grid grid-cols-2 gap-[40px] items-center hover:border-[rgba(124,92,255,0.4)] hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] reveal reveal-delay-1 max-[900px]:col-span-1 max-[900px]:grid-cols-1 no-underline">
            <div>
              <h3 className="text-[32px] font-semibold tracking-[-0.02em] mb-3 text-foreground">Structure is not an afterthought</h3>
              <p className="font-mono text-[13px] text-muted leading-[1.7] mb-7">
                Every component is written once and reused everywhere. Data lives in a single source of truth. Pages follow predictable patterns. The folder structure mirrors the mental model, so any new contributor can navigate the codebase in minutes, not days. Scalability is built in from the first commit, not retrofitted when it hurts.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {['Component Architecture', 'DRY', 'Scalability', 'File Structure'].map(t => (
                    <span key={t} className="font-mono text-[10px] tracking-[0.08em] px-[10px] py-1 bg-[rgba(124,92,255,0.1)] text-violet rounded-[3px]">{t}</span>
                  ))}
                </div>
              </div>
              <div className="mt-6 font-mono text-[12px] text-mint flex items-center gap-2">
                See how this site is built <span className="text-[16px]">→</span>
              </div>
            </div>
            <div className="project-visual bg-gradient-to-br from-[rgba(124,92,255,0.1)] to-[rgba(46,230,166,0.08)] border border-ui rounded-lg h-[220px] flex flex-col justify-center px-8 gap-[6px] font-mono text-[11px] overflow-hidden relative max-[900px]:hidden">
              {[
                { indent: 0, text: 'app/',          color: 'text-foreground', bold: true },
                { indent: 1, text: 'components/',   color: 'text-violet' },
                { indent: 2, text: 'Button.jsx',    color: 'text-muted' },
                { indent: 2, text: 'Nav.jsx',       color: 'text-muted' },
                { indent: 2, text: 'Section.jsx',   color: 'text-muted' },
                { indent: 1, text: 'data/',         color: 'text-mint' },
                { indent: 2, text: 'experiments.js',color: 'text-muted' },
                { indent: 2, text: 'posts.js',      color: 'text-muted' },
                { indent: 1, text: 'experiments/',  color: 'text-violet' },
                { indent: 1, text: 'blog/',         color: 'text-violet' },
              ].map((row, i) => (
                <div key={i} className={`flex items-center gap-1 ${row.color} ${row.bold ? 'font-bold' : ''}`} style={{ paddingLeft: `${row.indent * 16}px` }}>
                  {row.indent > 0 && <span className="text-ui select-none">{'─ '}</span>}
                  {row.text}
                </div>
              ))}
            </div>
          </Link>

        </div>
      </Section>

      <ExperimentSection />

      </div>
    </>
  )
}
