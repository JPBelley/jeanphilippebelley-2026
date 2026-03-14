'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  // Sync from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      setLight(true);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    if (next) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light mode"
      className="relative flex items-center w-11 h-6 rounded-full border border-ui transition-colors duration-400"
      style={{
        background: light ? 'var(--color-violet)' : 'var(--color-bg2)',
        borderColor: light ? 'var(--color-violet)' : 'var(--color-ui)',
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}
    >
      {/* Track icons */}
      <span className="absolute left-[6px] text-[9px] select-none" style={{ opacity: light ? 0 : 1, transition: 'opacity 0.3s ease' }}>🌙</span>
      <span className="absolute right-[5px] text-[9px] select-none" style={{ opacity: light ? 1 : 0, transition: 'opacity 0.3s ease' }}>☀️</span>

      {/* Thumb */}
      <span
        className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full shadow-sm"
        style={{
          background: light ? '#fff' : 'var(--color-foreground)',
          left: light ? 'calc(100% - 21px)' : '3px',
          transition: 'left 0.35s cubic-bezier(0.77,0,0.18,1), background 0.3s ease',
        }}
      />
    </button>
  );
}
