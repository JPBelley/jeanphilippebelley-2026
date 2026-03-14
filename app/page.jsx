'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Cursor from './components/Cursor'

export default function Home() {
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

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <Cursor />
      <Nav />

      {/* HERO */}
      <section className="min-h-screen flex items-center px-[60px] relative overflow-hidden" id="home">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,rgba(124,92,255,0.08)_0%,transparent_70%),radial-gradient(ellipse_40%_40%_at_20%_80%,rgba(46,230,166,0.05)_0%,transparent_60%)]" />
        <div className="hero-grid" />

        <div className="relative z-[2] max-w-[780px]">
          <div className="hero-tag font-mono text-[12px] text-mint tracking-[0.15em] uppercase mb-7 flex items-center gap-[10px] opacity-0 animate-fade-up-1">
            Always cooking something
          </div>
          <h1 className="text-[clamp(48px,7vw,86px)] font-bold leading-[1.05] tracking-[-0.03em] opacity-0 animate-fade-up-2">
            Full Stack<br />
            <span className="text-violet">Developer</span><br />
            <span className="text-muted">&amp; UI Craftsman</span>
          </h1>
          <p className="font-mono text-[15px] text-muted leading-[1.7] mt-7 max-w-[500px] opacity-0 animate-fade-up-3">
            I build fast, beautiful interfaces and robust backends.<br />
            React, Vue, WordPress, Drupal, Webflow and whatever it takes.
          </p>
          <div className="flex gap-4 mt-11 opacity-0 animate-fade-up-4">
            <a href="#projects" className="px-8 py-[13px] bg-violet text-white font-head font-semibold text-[14px] tracking-[0.03em] border-none rounded-md cursor-none no-underline transition-[background,transform,box-shadow] duration-200 hover:bg-[#9070ff] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(124,92,255,0.35)]">
              View My Work
            </a>
            <a href="#contact" className="px-8 py-[13px] bg-transparent text-foreground font-head font-medium text-[14px] border border-ui rounded-md cursor-none no-underline transition-[border-color,color,transform] duration-200 hover:border-mint hover:text-mint hover:-translate-y-0.5">
              Get In Touch
            </a>
          </div>
        </div>

        <div className="absolute right-[60px] top-1/2 -translate-y-1/2 flex flex-col gap-3 opacity-0 animate-fade-left">
          {['React','Vue.js','WordPress','Drupal','Webflow','Node.js','PHP'].map((t, i) => (
            <div key={t} className={`tech-tag font-mono text-[11px] text-muted px-[14px] py-2 bg-bg2 border border-ui rounded-[4px] tracking-[0.08em] transition-all duration-200 relative hover:border-violet hover:text-violet${i === 0 ? ' !border-violet !text-violet !bg-[rgba(124,92,255,0.08)]' : ''}`}>
              {t}
            </div>
          ))}
        </div>

        <div className="absolute bottom-10 left-[60px] flex items-center gap-3 opacity-0 animate-fade-up-5">
          <div className="scroll-line w-px h-12 bg-gradient-to-b from-transparent to-ui relative overflow-hidden" />
          <span className="font-mono text-[11px] text-muted tracking-[0.1em] [writing-mode:vertical-lr]">Scroll</span>
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-bg py-[100px] px-[60px] relative" id="about">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-ui to-transparent" />
        <div className="h-20" />
        <div className="grid grid-cols-2 gap-[80px] items-center max-[900px]:grid-cols-1 max-[900px]:gap-12">
          <div>
            <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]" data-num="01">About</div>
            <div className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.02em] leading-[1.1] mb-[60px] reveal reveal-delay-1">
              Building on the<br /><span className="text-violet">front lines</span> of the web
            </div>
            <p className="font-mono text-[15px] text-muted leading-[1.8] mb-5 reveal reveal-delay-2">
              I&apos;m a full stack developer with a frontend focus — the kind of engineer who obsesses over render performance just as much as pixel precision.
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
              { num: 'Many', sup: '+', label: 'Projects shipped' },
              { num: '6', sup: '',  label: 'Core technologies' },
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
      </section>

      {/* SKILLS */}
      <section className="bg-bg2 py-[100px] px-[60px] relative" id="skills">
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
      </section>

      {/* PROJECTS */}
      <section className="bg-bg py-[100px] px-[60px] relative" id="projects">
        <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]" data-num="03">Projects</div>
        <div className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.02em] leading-[1.1] mb-[60px] reveal reveal-delay-1">
          Selected<br /><span className="text-violet">work</span>
        </div>
        <div className="grid grid-cols-2 gap-[2px] max-[900px]:grid-cols-1">
          {/* Featured */}
          <Link href="/design-system" className="project-card bg-bg2 border border-ui p-[40px] transition-all duration-[250ms] relative overflow-hidden col-span-2 grid grid-cols-2 gap-[40px] items-center hover:border-[rgba(124,92,255,0.4)] hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] reveal max-[900px]:col-span-1 max-[900px]:grid-cols-1 no-underline">
            <div>
              <div className="font-mono text-[11px] text-violet tracking-[0.1em] mb-5">001 — Featured</div>
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
              <div className="font-mono text-[11px] text-muted tracking-widest uppercase">Aa Bb 01 — tokens</div>
              <div className="h-[2px] w-24 rounded" style={{ background: 'linear-gradient(90deg,#7C5CFF,#2EE6A6)' }} />
            </div>
          </Link>

          {[
            { num:'002', title:'Headless WordPress + Next.js', desc:'Decoupled a large editorial site from its monolithic WP theme into a Next.js frontend with ISR, cutting page loads by 4×.', tags:['Next.js','WordPress API','ISR'], delay:'' },
            { num:'003', title:'Drupal + Vue SPA', desc:'Custom Drupal 10 backend serving a Vue 3 single-page app, with a JSON:API layer, role-based permissions, and a rich editorial workflow.', tags:['Vue 3','Drupal 10','JSON:API'], delay:'reveal-delay-1' },
            { num:'004', title:'Webflow Enterprise Site', desc:'Full build of a multi-language marketing site on Webflow, with custom JavaScript interactions, CMS collections, and Figma-to-code fidelity.', tags:['Webflow','GSAP','i18n'], delay:'reveal-delay-2' },
          ].map(p => (
            <div key={p.num} className={`project-card bg-bg2 border border-ui p-[40px] transition-all duration-[250ms] relative overflow-hidden hover:border-[rgba(124,92,255,0.4)] hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] reveal ${p.delay}`}>
              <div className="font-mono text-[11px] text-violet tracking-[0.1em] mb-5">{p.num}</div>
              <h3 className="text-[22px] font-semibold tracking-[-0.02em] mb-3">{p.title}</h3>
              <p className="font-mono text-[13px] text-muted leading-[1.7] mb-7">{p.desc}</p>
              <div className="flex flex-wrap gap-2">
                {p.tags.map(t => <span key={t} className="font-mono text-[10px] tracking-[0.08em] px-[10px] py-1 bg-[rgba(124,92,255,0.1)] text-violet rounded-[3px]">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EXPERIMENTS / LAB */}
      <section className="bg-bg2 py-[100px] px-[60px] relative" id="experiments">
        <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px]" data-num="04">Lab</div>
        <div className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.02em] leading-[1.1] mb-[60px] reveal reveal-delay-1">
          Experiments &amp;<br /><span className="text-mint">playground</span>
        </div>
        <div className="grid grid-cols-3 gap-[2px] max-[900px]:grid-cols-1">
          {[
            { href:'/experiments/blob-editor',   icon:'🟠', title:'Blob Editor',    desc:'2D WebGL blob renderer with real-time SDF shape morphing, swirl color mixing, halo glow layers, and per-frame PNG export.', delay:'' },
            { href:'/experiments/morphing-blob', icon:'🫀', title:'Morphing Blob',  desc:'3D Three.js organic blob with layered FBM noise deformation, drag-to-orbit controls, palette switching, and panic mode.', delay:'reveal-delay-1' },
            { href:'/experiments/wire-studio',   icon:'🔵', title:'Wire Studio',    desc:'Interactive Three.js wireframe sphere editor with custom GLSL rim lighting, real-time displacement, edge scalloping, and presets.', delay:'reveal-delay-2' },
          ].map(e => (
            <Link key={e.href} href={e.href} className={`exp-card bg-bg border border-ui p-[36px_32px] no-underline text-inherit flex flex-col gap-4 relative overflow-hidden transition-all duration-[250ms] hover:border-[rgba(124,92,255,0.35)] hover:-translate-y-[3px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] reveal ${e.delay}`}>
              <div className="text-[32px] leading-none">{e.icon}</div>
              <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-foreground">{e.title}</h3>
              <p className="font-mono text-[12px] text-muted leading-[1.7] flex-1">{e.desc}</p>
              <span className="font-mono text-[11px] text-violet tracking-[0.08em] flex items-center gap-[6px] transition-[color,gap] duration-200 group-hover:text-mint group-hover:gap-[10px]">Open tool →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="bg-bg py-[100px] px-[60px] text-center relative" id="contact">
        <div className="section-label reveal font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px] justify-center" data-num="05">Contact</div>
        <div className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-0.02em] leading-[1.1] mb-[60px] text-center reveal reveal-delay-1">
          Let&apos;s build<br />something <span className="text-mint">great</span>
        </div>
        <p className="font-mono text-[15px] text-muted mb-12 leading-[1.7] reveal reveal-delay-2">
          I&apos;m always open to interesting projects and collaborations.<br />
          Drop me a line.
        </p>
        <div className="flex justify-center gap-4 flex-wrap reveal reveal-delay-2">
          {[
            { href:'mailto:info@jeanphilippebelley.com', label:'📬 info@jeanphilippebelley.com' },
            { href:'https://github.com/JPBelley',        label:'⌥ GitHub',    ext:true },
            { href:'https://www.linkedin.com/in/jean-philippe-belley-01558286/',      label:'◈ LinkedIn',  ext:true },
            // { href:'#',                         label:'↓ Resume' },
          ].map(l => (
            <a key={l.href} href={l.href} {...(l.ext ? { target:'_blank', rel:'noreferrer' } : {})}
              className="flex items-center gap-2 px-7 py-[14px] border border-ui text-muted no-underline font-mono text-[13px] tracking-[0.05em] rounded-md transition-all duration-200 hover:border-mint hover:text-mint hover:-translate-y-0.5">
              {l.label}
            </a>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </>
  )
}
