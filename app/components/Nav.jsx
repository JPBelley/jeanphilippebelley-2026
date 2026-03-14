'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/',            label: 'Home' },
  { href: '/experiments', label: 'Experiments' },
  { href: '/contact',     label: 'Contact' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <nav className="site-nav fixed top-0 left-0 right-0 z-[100] px-[60px] max-[640px]:px-6 py-6 flex justify-between items-center bg-gradient-to-b from-[rgba(15,17,21,0.95)] to-transparent backdrop-blur-[8px]">
        <Link href="/" className="text-[14px] font-semibold tracking-[0.12em] uppercase text-foreground no-underline">
          JP<span className="text-violet">.</span>
        </Link>

        {/* Desktop links + toggle */}
        <div className="flex items-center gap-10 max-[640px]:hidden">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="nav-link font-mono text-[12px] text-muted no-underline tracking-[0.05em] transition-colors duration-200 relative hover:text-foreground capitalize"
              style={{ color: pathname === href ? 'var(--color-mint)' : undefined }}
            >
              {label}
            </Link>
          ))}
          <ThemeToggle />
        </div>

        {/* Burger button */}
        <button
          onClick={() => setOpen(o => !o)}
          className="hidden max-[640px]:flex items-center justify-center w-8 h-8 relative z-[110]"
          aria-label="Toggle menu"
        >
          <div className="relative w-[22px] h-[12px]">
            {/* Top bar → becomes top-right diagonal */}
            <span style={{
              position: 'absolute', left: 0, top: 0,
              width: '22px', height: '1.5px',
              background: 'var(--color-foreground)', borderRadius: '2px',
              transformOrigin: 'center',
              transform: open ? 'translateY(6px) rotate(45deg)' : 'translateY(0)',
              transition: 'transform 0.5s cubic-bezier(0.77,0,0.18,1)',
            }} />
            {/* Middle bar → fades out */}
            <span style={{
              position: 'absolute', left: 0, top: '50%',
              width: '14px', height: '1.5px',
              background: 'var(--color-foreground)', borderRadius: '2px',
              transform: 'translateY(-50%)',
              opacity: open ? 0 : 1,
              transition: 'opacity 0.25s ease',
            }} />
            {/* Bottom bar → becomes bottom-right diagonal */}
            <span style={{
              position: 'absolute', left: 0, bottom: 0,
              width: '22px', height: '1.5px',
              background: 'var(--color-foreground)', borderRadius: '2px',
              transformOrigin: 'center',
              transform: open ? 'translateY(-6px) rotate(-45deg)' : 'translateY(0)',
              transition: 'transform 0.5s cubic-bezier(0.77,0,0.18,1)',
            }} />
          </div>
        </button>
      </nav>

      {/* Mobile overlay */}
      <div
        className="fixed inset-0 z-[90] flex flex-col justify-center items-center bg-bg transition-all duration-500"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          clipPath: open
            ? 'circle(150% at calc(100% - 40px) 48px)'
            : 'circle(0% at calc(100% - 40px) 48px)',
          transition: 'clip-path 0.75s cubic-bezier(0.77,0,0.18,1), opacity 0.4s ease',
        }}
      >
        {/* Background grid */}
        <div className="hero-grid absolute inset-0 opacity-40" />

        <nav className="relative flex flex-col items-center gap-2 w-full px-10">
          {links.map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="group w-full text-center py-5 border-b border-ui no-underline transition-all duration-200"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? 'translateX(0)' : 'translateX(-40px)',
                transition: `opacity 0.5s ease ${0.2 + i * 0.1}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.2 + i * 0.1}s`,
              }}
            >
              <span
                className="font-head text-[clamp(32px,8vw,52px)] font-bold tracking-[-0.02em] transition-colors duration-200"
                style={{ color: pathname === href ? 'var(--color-mint)' : 'var(--color-foreground)' }}
              >
                {label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Footer info */}
        <div
          className="absolute bottom-10 flex items-center gap-4"
          style={{
            opacity: open ? 1 : 0,
            transition: `opacity 0.5s ease ${0.2 + links.length * 0.1 + 0.1}s`,
          }}
        >
          <span className="w-[6px] h-[6px] rounded-full bg-mint animate-status-pulse" />
          <span className="font-mono text-[11px] text-muted tracking-widest uppercase">
            Always cooking something
          </span>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
