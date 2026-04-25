// Shared prose components for blog posts.
// Import what you need: { P, H2, IC, Code, Callout, MintCallout, Divider, DemoBox }

export function P({ children }) {
  return <p className="text-[15px] leading-[1.85] text-foreground mb-5">{children}</p>
}

export function H2({ id, children }) {
  return <h2 id={id} className="text-[22px] font-bold mt-12 mb-4 scroll-mt-24">{children}</h2>
}

export function IC({ children }) {
  return (
    <code className="font-mono text-[12.5px] text-violet bg-bg2 border border-ui rounded px-[5px] py-[2px]">
      {children}
    </code>
  )
}

export function Code({ children, lang }) {
  return (
    <div className="relative my-6 rounded-xl overflow-hidden border border-ui">
      {lang && (
        <div className="absolute top-0 right-0 px-3 py-2 text-[10px] font-mono text-muted uppercase tracking-wider">
          {lang}
        </div>
      )}
      <pre className="bg-bg2 p-5 overflow-x-auto text-[13px] font-mono leading-[1.75] text-foreground m-0 [tab-size:2]">
        <code>{children}</code>
      </pre>
    </div>
  )
}

export function Callout({ children }) {
  return (
    <div className="my-6 px-5 py-4 rounded-xl border border-[rgba(107,78,230,0.3)] bg-[rgba(107,78,230,0.06)] text-[14px] leading-relaxed text-foreground">
      {children}
    </div>
  )
}

export function MintCallout({ children }) {
  return (
    <div className="my-6 px-5 py-4 rounded-xl border border-[rgba(46,230,166,0.25)] bg-[rgba(46,230,166,0.04)] text-[14px] leading-relaxed text-foreground">
      {children}
    </div>
  )
}

export function Divider() {
  return <hr className="border-none border-t border-ui my-12" />
}

export function DemoBox({ label, children }) {
  return (
    <div className="my-8 rounded-xl border border-ui bg-bg2 overflow-hidden">
      <div className="px-5 py-2.5 border-b border-ui flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-violet shrink-0" />
        <span className="text-[10px] font-mono text-muted uppercase tracking-widest">{label}</span>
      </div>
      <div className="p-6 flex flex-col gap-5">{children}</div>
    </div>
  )
}
