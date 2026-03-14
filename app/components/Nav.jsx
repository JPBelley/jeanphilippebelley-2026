'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/',             label: 'Home' },
  { href: '/experiments',  label: 'Experiments' },
  { href: '/contact',      label: 'Contact' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-[60px] py-6 flex justify-between items-center bg-gradient-to-b from-[rgba(15,17,21,0.95)] to-transparent backdrop-blur-[8px]">
      <Link href="/" className="text-[14px] font-semibold tracking-[0.12em] uppercase text-foreground no-underline">
        JP<span className="text-violet">.</span>
      </Link>
      <div className="flex gap-10">
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
      </div>
    </nav>
  );
}
