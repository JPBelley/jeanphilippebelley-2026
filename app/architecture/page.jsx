'use client'

import Nav from '../components/Nav'
import Footer from '../components/Footer'
import Cursor from '../components/Cursor'
import Section from '../components/Section'

// ─── Primitives ───────────────────────────────────────────────────────────────

const Label = ({ children }) => (
  <p className="font-mono text-[11px] uppercase tracking-widest text-violet mb-3">{children}</p>
)

const SectionTitle = ({ children }) => (
  <h2 className="text-[22px] font-bold tracking-[-0.02em] mb-6 text-foreground">{children}</h2>
)

const Prose = ({ children }) => (
  <p className="font-mono text-[13px] text-muted leading-[1.8]">{children}</p>
)

const Tag = ({ children }) => (
  <span className="font-mono text-[10px] tracking-[0.08em] px-[10px] py-1 bg-[rgba(124,92,255,0.1)] text-violet rounded-[3px]">
    {children}
  </span>
)

const Divider = () => (
  <div className="w-full h-px bg-gradient-to-r from-transparent via-ui to-transparent my-16" />
)

// ─── File tree ────────────────────────────────────────────────────────────────

const tree = [
  { indent: 0, name: 'app/',             note: 'Next.js App Router root',   color: 'text-foreground font-semibold' },
  { indent: 1, name: 'components/',      note: 'Shared UI primitives',       color: 'text-violet' },
  { indent: 2, name: 'layouts/',         note: 'Page shell components',      color: 'text-violet' },
  { indent: 3, name: 'ExperimentLayout.jsx', note: 'Shared shell for all experiment pages' },
  { indent: 2, name: 'Button.jsx',       note: 'variant prop: primary / secondary / link' },
  { indent: 2, name: 'Cursor.jsx',       note: 'Custom magnetic cursor' },
  { indent: 2, name: 'Footer.jsx',       note: '' },
  { indent: 2, name: 'Nav.jsx',          note: 'Sticky nav with theme toggle' },
  { indent: 2, name: 'NewsletterSection.jsx', note: 'MailerLite embed, styled to match DS' },
  { indent: 2, name: 'Section.jsx',      note: 'Layout wrapper with size prop' },
  { indent: 2, name: 'ThemeToggle.jsx',  note: 'Light / dark switcher' },
  { indent: 1, name: 'data/',            note: 'Single source of truth',     color: 'text-mint' },
  { indent: 2, name: 'experiments.js',   note: 'All experiments, newest → oldest' },
  { indent: 2, name: 'posts.js',         note: 'All blog posts, newest → oldest' },
  { indent: 1, name: 'blog/',            note: 'Blog section',               color: 'text-violet' },
  { indent: 2, name: 'page.jsx',         note: 'Listing page, reads from data/posts.js' },
  { indent: 2, name: '[slug]/',          note: 'One folder per post' },
  { indent: 3, name: 'page.jsx',         note: 'Full post with interactive demos' },
  { indent: 1, name: 'experiments/',     note: 'Interactive tools',          color: 'text-violet' },
  { indent: 2, name: 'page.jsx',         note: 'Listing page, reads from data/experiments.js' },
  { indent: 2, name: '[tool]/',          note: 'One folder per experiment, wrapped in ExperimentLayout' },
  { indent: 1, name: 'architecture/',    note: 'This page',                  color: 'text-mint' },
  { indent: 1, name: 'design-system/',   note: 'Token & component explorer' },
  { indent: 1, name: 'globals.css',      note: 'Design tokens + Tailwind v4 theme' },
  { indent: 1, name: 'layout.jsx',       note: 'Root layout: fonts, metadata, theme' },
  { indent: 1, name: 'page.jsx',         note: 'Homepage: assembles all sections' },
]

// ─── Principles ───────────────────────────────────────────────────────────────

const principles = [
  {
    icon: '◈',
    title: 'One source of truth',
    body: 'Experiments and blog posts are defined once in app/data/ as plain JS arrays, ordered newest to oldest. The homepage, listing pages, and any future feed all read from the same file. Adding a new post means editing one object in one place.',
    tags: ['DRY', 'Data Layer'],
  },
  {
    icon: '⬡',
    title: 'Shared layout components',
    body: 'Every experiment page is wrapped in ExperimentLayout, a single component that owns the Cursor, Nav, Section header, NewsletterSection, and Footer. Changing the experiment template means editing one file, not five.',
    tags: ['Component Reuse', 'Templates'],
  },
  {
    icon: '⊞',
    title: 'Composable primitives',
    body: "UI is built from a small set of primitives: Section handles all layout width and padding concerns, Button manages all variant logic, Tag and Label standardise typographic roles. Pages compose these primitives; they don't reinvent them.",
    tags: ['Composition', 'Primitives'],
  },
  {
    icon: '⌗',
    title: 'Folder mirrors mental model',
    body: 'Routes live where you expect them. Data lives in data/. Components live in components/. There are no flat dumps of files, no ambiguous names, no mystery folders. The structure is a map of the product.',
    tags: ['File Structure', 'Clarity'],
  },
  {
    icon: '◐',
    title: 'Tokens, not magic numbers',
    body: 'Every colour, spacing value, and animation is a CSS custom property defined in globals.css. Light mode overrides are scoped to [data-theme="light"]. Nothing is hardcoded in a component that belongs in a token.',
    tags: ['Design Tokens', 'Theming'],
  },
  {
    icon: '↗',
    title: 'Static by default, scalable by design',
    body: 'The site exports as a fully static build with no server required. Pagination-style features use static JSON route handlers so new patterns never force an architecture change. The site can grow from 2 posts to 200 without touching a layout.',
    tags: ['Static Export', 'Scalability'],
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Architecture() {
  return (
    <div className="min-h-screen bg-bg text-foreground font-head">
      <Cursor />
      <Nav />

      <Section>
        <div className="pt-12 pb-4 max-w-[780px]">
          <Label>// architecture</Label>
          <h1 className="text-[clamp(36px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.03em] mb-6">
            How this site<br />
            <span className="text-violet">is built</span>
          </h1>
          <p className="font-mono text-[15px] text-muted leading-[1.8] max-w-[580px]">
            A walkthrough of the decisions behind this codebase: folder structure, component patterns, data layer, and the rules that keep it clean as it grows.
          </p>
        </div>
      </Section>

      <Section className="bg-bg2">
        <Label>// folder structure</Label>
        <SectionTitle>Everything has a place</SectionTitle>
        <p className="font-mono text-[13px] text-muted leading-[1.8] mb-10 max-w-[580px]">
          The project follows Next.js App Router conventions strictly. Routes are folders, shared code lives in components/, and data files are their own layer. New contributors find what they need without asking.
        </p>

        <div className="rounded-xl border border-ui overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-ui bg-bg">
            <div className="w-3 h-3 rounded-full bg-ui" />
            <div className="w-3 h-3 rounded-full bg-ui" />
            <div className="w-3 h-3 rounded-full bg-ui" />
            <span className="font-mono text-[11px] text-muted ml-2 tracking-widest">project structure</span>
          </div>
          <div className="p-6 flex flex-col gap-[5px] font-mono text-[12px] overflow-x-auto">
            {tree.map((row, i) => (
              <div key={i} className="flex items-baseline gap-3 min-w-0" style={{ paddingLeft: `${row.indent * 20}px` }}>
                <span className={`shrink-0 ${row.color ?? 'text-foreground'}`}>
                  {row.indent > 0 && <span className="text-ui mr-1 select-none">{'─ '}</span>}
                  {row.name}
                </span>
                {row.note && (
                  <span className="text-muted text-[11px] truncate">{row.note}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-bg">
        <Label>// principles in practice</Label>
        <SectionTitle>The rules behind the structure</SectionTitle>
        <p className="font-mono text-[13px] text-muted leading-[1.8] mb-10 max-w-[580px]">
          These are not aspirational guidelines posted in a wiki nobody reads. They are constraints enforced by the structure itself.
        </p>

        <div className="grid grid-cols-2 gap-[2px] max-[900px]:grid-cols-1">
          {principles.map((p, i) => (
            <div key={i} className="bg-bg2 border border-ui p-[36px_32px] transition-colors duration-200 hover:border-[rgba(124,92,255,0.4)]">
              <div className="text-[28px] text-violet mb-4 leading-none">{p.icon}</div>
              <h3 className="text-[18px] font-semibold tracking-[-0.02em] mb-3 text-foreground">{p.title}</h3>
              <p className="font-mono text-[12px] text-muted leading-[1.8] mb-5">{p.body}</p>
              <div className="flex flex-wrap gap-2">
                {p.tags.map(t => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-bg2">
        <Label>// data flow</Label>
        <SectionTitle>How content moves through the site</SectionTitle>

        <div className="grid grid-cols-3 gap-[2px] max-[900px]:grid-cols-1 mb-10">
          {[
            {
              step: '01',
              title: 'Defined once',
              body: 'A post or experiment is added as a single object in app/data/. Slug, title, date, tags, description: all in one place.',
            },
            {
              step: '02',
              title: 'Read everywhere',
              body: 'The homepage slices the first 3 experiments. Listing pages render all. Both read the same file, no sync required.',
            },
            {
              step: '03',
              title: 'Page renders itself',
              body: 'Each post/experiment page is its own route. The data file holds metadata; the page file holds the content and logic.',
            },
          ].map(s => (
            <div key={s.step} className="bg-bg border border-ui p-[32px] relative">
              <div className="font-mono text-[11px] text-violet tracking-[0.1em] mb-4">{s.step}</div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em] mb-2 text-foreground">{s.title}</h3>
              <p className="font-mono text-[12px] text-muted leading-[1.8]">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-ui overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-ui bg-bg">
            <span className="font-mono text-[11px] text-muted tracking-widest">data flow: blog posts</span>
          </div>
          <div className="p-6 font-mono text-[12px] flex flex-col gap-4">
            <div className="flex items-start gap-4 max-[640px]:flex-col">
              <div className="shrink-0 px-3 py-2 rounded-lg bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.2)] text-violet">
                app/data/posts.js
              </div>
              <div className="text-muted pt-2">
                Single array of post objects. Ordered newest → oldest. Imported by any page that needs it.
              </div>
            </div>
            <div className="flex gap-2 pl-1 text-ui select-none">↓ &nbsp; imported by</div>
            <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
              {[
                { file: 'app/page.jsx', note: 'slices first 3, renders cards' },
                { file: 'app/blog/page.jsx', note: 'renders full listing' },
              ].map(f => (
                <div key={f.file} className="px-3 py-2 rounded-lg bg-bg2 border border-ui text-foreground flex flex-col gap-1">
                  <span className="text-mint">{f.file}</span>
                  <span className="text-muted text-[11px]">{f.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-bg">
        <Label>// component model</Label>
        <SectionTitle>Primitives, layouts, and features</SectionTitle>

        <div className="grid grid-cols-3 gap-[2px] max-[900px]:grid-cols-1">
          {[
            {
              tier: 'Primitives',
              color: 'text-mint',
              desc: 'Stateless, generic, reused everywhere. No business logic.',
              items: ['Button', 'Section', 'Cursor', 'Nav', 'Footer'],
            },
            {
              tier: 'Layouts',
              color: 'text-violet',
              desc: 'Compose primitives into page shells. One layout per page family.',
              items: ['ExperimentLayout'],
            },
            {
              tier: 'Features',
              color: 'text-foreground',
              desc: 'Self-contained, stateful components with their own logic.',
              items: ['NewsletterSection', 'ThemeToggle', 'BezierCanvas', 'BlobEditor'],
            },
          ].map(tier => (
            <div key={tier.tier} className="bg-bg2 border border-ui p-[36px_32px]">
              <div className={`font-mono text-[11px] uppercase tracking-widest mb-3 ${tier.color}`}>{tier.tier}</div>
              <p className="font-mono text-[12px] text-muted leading-[1.7] mb-5">{tier.desc}</p>
              <div className="flex flex-col gap-2">
                {tier.items.map(item => (
                  <div key={item} className="font-mono text-[12px] text-foreground px-3 py-2 bg-bg rounded-lg border border-ui">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Footer />
    </div>
  )
}
