'use client';

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-[60px] py-6 flex justify-between items-center bg-gradient-to-b from-[rgba(15,17,21,0.95)] to-transparent backdrop-blur-[8px]">
      <div className="text-[14px] font-semibold tracking-[0.12em] uppercase text-foreground">
        Dev<span className="text-violet">.</span>
      </div>
      <div className="flex gap-10">
        {['about', 'skills', 'projects', 'experiments', 'contact'].map(id => (
          <a
            key={id}
            href={`#${id}`}
            className="nav-link font-mono text-[12px] text-muted no-underline tracking-[0.05em] transition-colors duration-200 relative hover:text-foreground capitalize"
          >
            {id === 'experiments' ? 'Lab' : id.charAt(0).toUpperCase() + id.slice(1)}
          </a>
        ))}
      </div>
    </nav>
  );
}
