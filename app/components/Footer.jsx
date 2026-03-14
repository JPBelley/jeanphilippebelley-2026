export default function Footer() {
  return (
    <footer className="px-[60px] py-8 border-t border-ui flex justify-between items-center max-[900px]:px-6 max-[900px]:flex-col max-[900px]:gap-3">
      <div className="font-mono text-[12px] text-muted">
        © 2026 — Built with <span className="text-violet">♥</span> and too much coffee
      </div>
      <div className="font-mono text-[12px] text-muted flex items-center gap-2">
        <div className="w-[7px] h-[7px] rounded-full bg-mint animate-status-pulse" />
        Available for work
      </div>
    </footer>
  );
}
