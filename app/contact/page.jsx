'use client';

import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Cursor from '../components/Cursor';

const links = [
  { href: 'mailto:info@jeanphilippebelley.com', label: '📬 info@jeanphilippebelley.com' },
  { href: 'https://github.com/JPBelley',        label: '⌥ GitHub',   ext: true },
  { href: 'https://www.linkedin.com/in/jean-philippe-belley-01558286/', label: '◈ LinkedIn', ext: true },
];

export default function Contact() {
  return (
    <div className="min-h-screen bg-bg text-foreground font-head flex flex-col">
      <Cursor />
      <Nav />

      <main className="flex-1 flex flex-col items-center justify-center px-[60px] py-40 text-center">
        <div className="section-label font-mono text-[11px] text-violet tracking-[0.2em] uppercase mb-4 flex items-center gap-[10px] justify-center" data-num="01">
          Contact
        </div>
        <h1 className="text-[clamp(40px,6vw,72px)] font-bold tracking-[-0.03em] leading-[1.05] mb-8">
          Let&apos;s build<br />something <span className="text-mint">great</span>
        </h1>
        <p className="font-mono text-[15px] text-muted mb-14 leading-[1.7] max-w-md">
          I&apos;m always open to interesting projects and collaborations.<br />
          Drop me a line.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              {...(l.ext ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="flex items-center gap-2 px-7 py-[14px] border border-ui text-muted no-underline font-mono text-[13px] tracking-[0.05em] rounded-md transition-all duration-200 hover:border-mint hover:text-mint hover:-translate-y-0.5"
            >
              {l.label}
            </a>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
