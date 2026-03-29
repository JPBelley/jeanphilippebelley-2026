'use client'

/**
 * ExperimentControls
 *
 * The left panel of a two-column experiment layout.
 * Fixed width on desktop, full-width stacked on mobile.
 *
 * Props:
 *   width    – panel width in px (default 220)
 *   children – sections, inputs, presets, etc.
 */
export default function ExperimentControls({ width = 220, children }) {
  return (
    <aside
      className="shrink-0 flex flex-col gap-[1px] overflow-hidden rounded-xl border max-[900px]:w-full"
      style={{
        width,
        background: 'var(--color-tool-bg1)',
        borderColor: 'var(--color-tool-border)',
      }}
    >
      {children}
    </aside>
  )
}

/**
 * ExperimentControls.Section
 *
 * A labelled group inside the controls panel.
 *
 * Props:
 *   label    – section header string
 *   children – the controls inside
 *   noPad    – skip default body padding (useful for button lists)
 */
ExperimentControls.Section = function ControlSection({ label, children, noPad = false }) {
  return (
    <div style={{ borderTop: '1px solid var(--color-tool-border)' }}
      className="first:border-t-0"
    >
      <div className="sec-hdr">
        <span>{label}</span>
      </div>
      <div
        className="sec-body"
        style={noPad ? { padding: '4px 0 6px' } : undefined}
      >
        {children}
      </div>
    </div>
  )
}
