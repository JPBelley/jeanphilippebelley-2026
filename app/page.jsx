'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Cursor from './components/Cursor'
import Button from './components/Button'
import Section from './components/Section'
import MemojiHead from './components/MemojiHead'
import experiments from './data/experiments'

export default function Home() {
  const headContainerRef = useRef(null)

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

    // Big + centered in hero, shrinks to top-right on scroll
    const CONTAINER = 580
    const SCALE_MAX  = 1.6
    const SCALE_MIN  = 0.52
    function onScroll() {
      if (!headContainerRef.current) return
      // On mobile: 150×150 below the nav, fixed top-right, no scroll animation
      if (window.innerWidth < 768) {
        headContainerRef.current.style.width  = '100px'
        headContainerRef.current.style.height = '100px'
        headContainerRef.current.style.top    = '80px'
        headContainerRef.current.style.transform = 'none'
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
    }
    onScroll() // set initial state
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <>
      <Cursor />
      <Nav />

      {/* Fixed memoji head — big in hero, shrinks on scroll */}
      <div
        ref={headContainerRef}
        className="fixed top-0 right-0 z-10"
        style={{ width: 580, height: 580, pointerEvents: 'none', transformOrigin: 'top right' }}
      >
        <MemojiHead size={2.8} className="w-full h-full" />
      </div>

      {/* HERO */}
      <Section
        className="relative overflow-hidden"
        id="home"
        containerClassName="min-h-screen flex items-center max-[900px]:flex-col max-[900px]:justify-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,rgba(124,92,255,0.08)_0%,transparent_70%),radial-gradient(ellipse_40%_40%_at_20%_80%,rgba(46,230,166,0.05)_0%,transparent_60%)]" />
        <div className="hero-grid" />

        <div className="relative z-[2] flex-1 max-w-[780px] max-[900px]:pt-32 max-[900px]:w-full">
          <div className="hero-tag font-mono text-[12px] text-mint tracking-[0.15em] uppercase mb-7 flex items-center gap-[10px] opacity-0 animate-fade-up-1">
            Always cooking something
          </div>
          <h1 className="text-[clamp(40px,7vw,86px)] font-bold leading-[1.05] tracking-[-0.03em] opacity-0 animate-fade-up-2">
            Full Stack<br />
            <span className="text-violet">Developer</span><br />
            <span className="text-muted">&amp; UI Craftsman</span>
          </h1>
          <p className="font-mono text-[15px] text-muted leading-[1.7] mt-7 max-w-[500px] opacity-0 animate-fade-up-3">
            I build fast, beautiful interfaces and robust backends.<br />
            React, Vue, WordPress, Drupal, Webflow and whatever it takes.
          </p>
          <div className="flex max-[640px]:flex-col gap-4 mt-11 opacity-0 animate-fade-up-4">
            <Button href="#projects" variant="primary">View How I Work</Button>
            <Button href="#contact" variant="secondary">Get In Touch</Button>
          </div>

          {/* Tech tags — inline on mobile */}
          <div className="hidden max-[900px]:flex flex-wrap gap-2 mt-10 opacity-0 animate-fade-up-5">
            {['React','Vue.js','WordPress','Drupal','Webflow','Node.js','PHP'].map((t, i) => (
              <div key={t} className={`tech-tag font-mono text-[11px] text-muted px-[14px] py-2 bg-bg2 border border-ui rounded-[4px] tracking-[0.08em] relative${i === 0 ? ' !border-violet !text-violet !bg-[rgba(124,92,255,0.08)]' : ''}`}>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Tech tags — flex sibling on desktop */}
        <div className="relative z-[2] flex flex-col gap-3 opacity-0 animate-fade-left max-[900px]:hidden ml-auto">
          {['React','Vue.js','WordPress','Drupal','Webflow','Node.js','PHP'].map((t, i) => (
            <div key={t} className={`tech-tag font-mono text-[11px] text-muted px-[14px] py-2 bg-bg2 border border-ui rounded-[4px] tracking-[0.08em] transition-all duration-200 relative hover:border-violet hover:text-violet${i === 0 ? ' !border-violet !text-violet !bg-[rgba(124,92,255,0.08)]' : ''}`}>
              {t}
            </div>
          ))}
        </div>

        <div className="absolute bottom-10 left-[60px] max-[640px]:left-6 flex items-center gap-3 opacity-0 animate-fade-up-5 max-[900px]:hidden">
          <div className="scroll-line w-px h-12 bg-gradient-to-b from-transparent to-ui relative overflow-hidden" />
          <span className="font-mono text-[11px] text-muted tracking-[0.1em] [writing-mode:vertical-lr]">Scroll</span>
        </div>
      </Section>

      {/* ABOUT */}
      <Section className="bg-bg relative" id="about">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-ui to-transparent" />
        <div className="h-20" />
        <div className="grid grid-cols-2 gap-[80px] items-center max-[900px]:grid-cols-1 max-[900px]:gap-12">
          <div>
            <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]" data-num="01">About</div>
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
              { num: 'Projects', sup: '', label: 'Always shipping' },
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
        <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]" data-num="02">Skills</div>
        <div className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.02em] leading-[1.1] mb-[60px] reveal reveal-delay-1">
          What I work<br />with <span className="text-mint">every day</span>
        </div>
        <div className="grid grid-cols-3 gap-[2px] max-[900px]:grid-cols-1">
          {[
            { icon: '⚛️', title: 'Frontend Frameworks', skills: [['React',95],['Vue.js',90],['Next.js',85],['Nuxt',80]], delay: '' },
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

      {/* PHILOSOPHY */}
      <Section className="bg-bg relative" id="projects">
        <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]" data-num="03">Philosophy</div>
        <div className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.02em] leading-[1.1] mb-[60px] reveal reveal-delay-1">
          The principles<br />I build <span className="text-violet">with</span>
        </div>
        <div className="grid grid-cols-2 gap-[2px] max-[900px]:grid-cols-1">

          {/* 001 — Design System — featured, unchanged */}
          <Link href="/design-system" className="project-card bg-bg2 border border-ui p-[40px] transition-all duration-[250ms] relative overflow-hidden col-span-2 grid grid-cols-2 gap-[40px] items-center hover:border-[rgba(124,92,255,0.4)] hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] reveal max-[900px]:col-span-1 max-[900px]:grid-cols-1 no-underline">
            <div>
              <div className="font-mono text-[11px] text-violet tracking-[0.1em] mb-5">001 · Featured</div>
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
              num: '003',
              title: 'Tradeoffs, not opinions',
              desc: "Every architectural decision is a set of tradeoffs with a context. I don't push for the elegant solution when the pragmatic one ships and holds. What I do insist on is naming the tradeoff out loud: 'here's what we gain, here's what we give up, here's when we'd revisit it.' Pragmatism beats purity. Good enough is right more often than engineers admit, as long as everyone knows what good enough means.",
              tags: ['Architecture Decisions', 'Pragmatism', 'Communication'],
              delay: 'reveal-delay-2',
            },
          ].filter(p => !p.hidden).map(p => (
            <div key={p.num} className={`project-card bg-bg2 border border-ui p-[40px] transition-all duration-[250ms] relative overflow-hidden hover:border-[rgba(124,92,255,0.4)] hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] reveal ${p.delay}`}>
              <div className="font-mono text-[11px] text-violet tracking-[0.1em] mb-5">{p.num}</div>
              <h3 className="text-[22px] font-semibold tracking-[-0.02em] mb-3">{p.title}</h3>
              <p className="font-mono text-[13px] text-muted leading-[1.7] mb-7">{p.desc}</p>
              <div className="flex flex-wrap gap-2">
                {p.tags.map(t => <span key={t} className="font-mono text-[10px] tracking-[0.08em] px-[10px] py-1 bg-[rgba(124,92,255,0.1)] text-violet rounded-[3px]">{t}</span>)}
              </div>
            </div>
          ))}

          {/* 004 — Architecture — featured link */}
          <Link href="/architecture" className="project-card bg-bg2 border border-ui p-[40px] transition-all duration-[250ms] relative overflow-hidden col-span-2 grid grid-cols-2 gap-[40px] items-center hover:border-[rgba(124,92,255,0.4)] hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] reveal reveal-delay-1 max-[900px]:col-span-1 max-[900px]:grid-cols-1 no-underline">
            <div>
              <div className="font-mono text-[11px] text-violet tracking-[0.1em] mb-5">004</div>
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

      {/* EXPERIMENTS / LAB */}
      <Section className="bg-bg2 relative" id="experiments">
        <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]" data-num="04">Lab</div>
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
              <span className="font-mono text-[11px] text-violet tracking-[0.08em] flex items-center gap-[6px] transition-[color,gap] duration-200 group-hover:text-mint group-hover:gap-[10px]">Open tool →</span>
            </Link>
          ))}
        </div>
        <div className="mt-12 flex justify-center reveal reveal-delay-2">
          <Button href="/experiments" variant="link">Explore the full lab →</Button>
        </div>
      </Section>

      {/* CONTACT */}
      <Section className="bg-bg relative" id="contact" containerClassName="text-center">
        <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px] justify-center" data-num="05">Contact</div>
        <div className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.02em] leading-[1.1] mb-[60px] text-center reveal reveal-delay-1">
          Let&apos;s build<br />something <span className="text-mint">great</span>
        </div>
        <p className="font-mono text-[15px] text-muted mb-12 leading-[1.7] reveal reveal-delay-2">
          I&apos;m always open to interesting projects and collaborations.<br />
          Drop me a line.
        </p>
        <div className="flex justify-center gap-4 flex-wrap max-[640px]:flex-col reveal reveal-delay-2">
          {[
            { href:'mailto:info@jeanphilippebelley.com', label:'📬 info@jeanphilippebelley.com' },
            { href:'https://github.com/JPBelley',        label:'⌥ GitHub',    ext:true },
            { href:'https://www.linkedin.com/in/jean-philippe-belley-01558286/',      label:'◈ LinkedIn',  ext:true },
          ].map(l => (
            <Button key={l.href} href={l.href} variant="link" {...(l.ext ? { target:'_blank', rel:'noreferrer' } : {})}>
              {l.label}
            </Button>
          ))}
        </div>
      </Section>

      {/* FOOTER */}
      <Footer />
    </>
  )
}
