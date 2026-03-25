'use client'

import Section from '../Section'

/**
 * ExperimentLayout
 *
 * Content shell for experiment pages. Nav, Footer, and NewsletterSection
 * are provided globally by the root layout.
 *
 * Props:
 *   label       – slug shown as "// label" above the title
 *   title       – h1 text
 *   description – subtitle (string or ReactNode)
 *   accentColor – optional CSS color for --tool-accent2 (e.g. '#f5a040')
 *   children    – the experiment UI
 */
export default function ExperimentLayout({ label, title, description, accentColor, children }) {
  return (
    <div
      className="min-h-screen"
      style={accentColor ? { '--tool-accent2': accentColor } : undefined}
    >
      <Section size="wide">
        <div className="mb-12">
          <p className="font-mono text-[11px] uppercase tracking-widest text-violet mb-3">// {label}</p>
          <h1 className="text-[clamp(28px,4vw,52px)] font-bold leading-none mb-3">{title}</h1>
          <p className="text-muted text-[14px]">{description}</p>
        </div>

        {children}
      </Section>
    </div>
  )
}
