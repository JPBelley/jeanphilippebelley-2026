// ─────────────────────────────────────────────────────────────────────────────
// HERO v1 — Original production hero
// Full Stack Developer / UI Craftsman with memoji head, tech tags, scroll indicator
// ─────────────────────────────────────────────────────────────────────────────
import Button from '../Button'
import Section from '../Section'

export default function HeroOriginal() {
  return (
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
          <Button href="/contact" variant="secondary">Get In Touch</Button>
        </div>

        <div className="hidden max-[900px]:flex flex-wrap gap-2 mt-10 opacity-0 animate-fade-up-5">
          {['React','Vue.js','WordPress','Drupal','Webflow','Node.js','PHP'].map((t, i) => (
            <div key={t} className={`tech-tag font-mono text-[11px] text-muted px-[14px] py-2 bg-bg2 border border-ui rounded-[4px] tracking-[0.08em] relative${i === 0 ? ' !border-violet !text-violet !bg-[rgba(124,92,255,0.08)]' : ''}`}>
              {t}
            </div>
          ))}
        </div>
      </div>

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
  )
}
