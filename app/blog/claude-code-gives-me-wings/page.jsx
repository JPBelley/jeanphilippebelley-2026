'use client'

import Link from 'next/link'
import Section from '../../components/Section'

// ─── Prose components ─────────────────────────────────────────────────────────

function P({ children }) {
  return <p className="text-[15px] leading-[1.85] text-foreground mb-5">{children}</p>
}
function H2({ id, children }) {
  return <h2 id={id} className="text-[22px] font-bold mt-12 mb-4 scroll-mt-24">{children}</h2>
}
function IC({ children }) {
  return (
    <code className="font-mono text-[12.5px] text-violet bg-bg2 border border-ui rounded px-[5px] py-[2px]">
      {children}
    </code>
  )
}
function Callout({ children }) {
  return (
    <div className="my-6 px-5 py-4 rounded-xl border border-[rgba(107,78,230,0.3)] bg-[rgba(107,78,230,0.06)] text-[14px] leading-relaxed text-foreground">
      {children}
    </div>
  )
}
function MintCallout({ children }) {
  return (
    <div className="my-6 px-5 py-4 rounded-xl border border-[rgba(46,230,166,0.25)] bg-[rgba(46,230,166,0.04)] text-[14px] leading-relaxed text-foreground">
      {children}
    </div>
  )
}
function Divider() {
  return <hr className="border-none border-t border-ui my-12" />
}

// ─── The Post ─────────────────────────────────────────────────────────────────

export default function ClaudeCodeWingsPost() {
  return (
    <Section size="narrow">

      {/* Back link */}
      <Link href="/blog" className="inline-flex items-center gap-2 text-[12px] font-mono text-muted hover:text-foreground transition-colors no-underline mb-10">
        ← All posts
      </Link>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-2 text-[11px] font-mono text-muted mb-4">
          <span>March 25, 2026</span>
          <span>·</span>
          <span>5 min read</span>
        </div>
        <h1 className="text-[clamp(28px,5vw,44px)] font-bold leading-[1.15] tracking-[-0.02em] mb-5">
          Claude Code Gives Me Wings
        </h1>
        <div className="flex flex-wrap gap-2">
          {['Claude Code', 'AI', 'Workflow', 'Developer Tools'].map(tag => (
            <span key={tag} className="font-mono text-[10px] px-2 py-1 rounded border border-ui bg-bg2 text-muted">
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Article */}
      <article>
        <P>
          For years I had a list. Not a task list — more of a "someday" list. Perlin noise flow
          fields. WebGL shaders. Three.js displacement maps. Generative art experiments. Things
          I genuinely wanted to explore, concepts I found fascinating, ideas I wanted to see
          running in a browser. And for years, that list barely moved.
        </P>
        <P>
          Not because I lacked interest. Because I lacked time. After a full day of production
          work, the energy required to start something from scratch — the boilerplate, the
          unfamiliar API surface, the inevitable first two hours of setup before you even touch
          the interesting part — was just too high. The list stayed a list.
        </P>
        <P>
          Claude Code changed that. Not in a vague, motivational way. In a very concrete,
          measurable way: the things on that list are now on this site.
        </P>

        <Divider />

        <H2 id="the-time-problem">The Real Problem Was Never Skill</H2>
        <P>
          I want to be honest about what was actually blocking me, because I think a lot of
          developers are in the same position. It was not capability. I knew how to build these
          things. It was the startup cost. Every new experiment meant:
        </P>

        <ul className="list-none flex flex-col gap-3 mb-6 pl-0">
          {[
            'Setting up the canvas and render loop from scratch',
            'Re-reading documentation for an API I touch once a year',
            'Writing the same boilerplate state and ref wiring I write in every project',
            'Getting through the first hour before the interesting decisions start',
          ].map(item => (
            <li key={item} className="flex gap-3 text-[14px] leading-relaxed">
              <span className="text-violet mt-[3px] shrink-0">—</span>
              <span className="text-muted">{item}</span>
            </li>
          ))}
        </ul>

        <P>
          None of that is hard. All of it is slow. And after work, slow is the same as
          impossible. You run out of evening before you run out of ideas.
        </P>

        <Callout>
          With Claude Code, that startup cost is nearly zero. I describe what I want to explore,
          the scaffolding appears, and I am already at the interesting part. The evening is long
          enough again.
        </Callout>

        <Divider />

        <H2 id="the-dev-advantage">The Developer Advantage Is Infrastructure</H2>
        <P>
          Here is the insight that took me a few weeks to fully appreciate: Claude Code is not
          equally powerful for everyone. The output quality scales directly with the quality of
          the context you provide. And as a developer, I have something that most users do
          not — I can build the infrastructure that makes that context excellent.
        </P>
        <P>
          On this site, that means three things in practice.
        </P>

        <ul className="list-none flex flex-col gap-8 mb-8 pl-0">
          {[
            {
              num: '01',
              title: 'A design system with real tokens',
              body: 'Every color, spacing value, and animation is a CSS custom property. When Claude writes a new component, it reaches for text-violet, bg-bg2, font-mono — not arbitrary hex values. The design language is legible in the codebase, so the output speaks it automatically.',
            },
            {
              num: '02',
              title: 'Reusable components with consistent APIs',
              body: 'Section, Button, ExperimentLayout — small, focused, and used everywhere. Claude can infer how new things should work from how existing things work. There is less to specify because the pattern is already the spec.',
            },
            {
              num: '03',
              title: 'A structure that mirrors intent',
              body: 'Routes live where you expect them. Data in data/. Components in components/. One source of truth for experiments and blog posts. Claude knows where new things go without being told, because the folder structure communicates it.',
            },
          ].map(item => (
            <li key={item.num} className="flex gap-5">
              <span className="font-mono text-[11px] text-violet mt-[4px] shrink-0 w-7">{item.num}</span>
              <div>
                <strong className="text-[15px] text-foreground block mb-2">{item.title}</strong>
                <p className="text-[14px] leading-[1.8] text-muted">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <P>
          This is the part that is hard to explain to someone who has not experienced it. A
          strong design system is not just good engineering. When working with Claude, it is
          the shared vocabulary that makes every request land on the first pass. You stop
          spending time correcting style decisions and start spending time on what actually
          matters — the behavior, the feel, the thing that makes it interesting.
        </P>

        <Divider />

        <H2 id="quality-without-slowdown">Quality Without Slowdown</H2>
        <P>
          The other thing that surprised me: the quality did not drop. I expected that moving
          faster would mean accepting more mess. It did not. Because the infrastructure enforces
          consistency automatically, Claude stays on-pattern. A new experiment looks like the
          other experiments. A new blog post uses the same prose components. The brand holds.
        </P>
        <P>
          That is the compounding payoff of building the right foundation first. Every good
          decision you make in the codebase — consistent naming, clear component boundaries,
          real design tokens — translates directly into AI output that needs less correction.
          You speed up without loosening up.
        </P>

        <MintCallout>
          The developer who gets the most from these tools is not the one who knows the best
          prompts. It is the one who built a codebase clean enough that the tool can read it
          clearly and speak its language back.
        </MintCallout>

        <Divider />

        <H2 id="the-list">The List Is Moving</H2>
        <P>
          The flow field on this site started as a sentence: "help me build a Perlin noise
          particle system with controls on the left." It was running in minutes. The interesting
          work — tuning the cursor distortion, getting the color fade right, finding the trail
          opacity that looks good — happened in a tight loop of trying and seeing.
        </P>
        <P>
          That loop used to be hours long. Now it is minutes. And that difference is everything.
          It is the difference between something staying on a list and something existing in
          the world.
        </P>
        <P>
          I still write a lot of code by hand. There is thinking that happens at the keyboard
          that I would not want to skip. But the ceiling on what I can explore after work, alone,
          in an evening — that ceiling moved. And I am still figuring out how high it goes.
        </P>
      </article>

    </Section>
  )
}
