'use client';

import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Cursor from '../components/Cursor';
import Button from '../components/Button';

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

      <main className="flex-1 flex flex-col items-center justify-center px-[60px] max-[640px]:px-10 py-40 max-[640px]:py-10 text-center">
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
        <div className="flex justify-center gap-4 flex-wrap max-[640px]:flex-col max-[640px]:w-full">
          {links.map(l => (
            <Button key={l.href} href={l.href} variant="link" {...(l.ext ? { target: '_blank', rel: 'noreferrer' } : {})}>
              {l.label}
            </Button>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
