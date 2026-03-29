'use client'

/**
 * ExperimentStage
 *
 * The main visual area of a two-column experiment layout.
 * Fills remaining horizontal space, with a consistent dark
 * background and border matching the controls panel.
 *
 * Props:
 *   height   – explicit height string e.g. 'min(60vh, 560px)' (default: 'min(70vh, 640px)')
 *   center   – center children inside the stage (default: true)
 *   noBg     – remove the background (useful when the canvas fills the area itself)
 *   children – the canvas, SVG, Three.js mount, etc.
 */
export default function ExperimentStage({
  height = 'min(70vh, 640px)',
  center = true,
  noBg   = false,
  children,
}) {
  return (
    <div
      className="flex-1 overflow-hidden rounded-xl border"
      style={{
        height,
        background: noBg ? 'transparent' : 'var(--color-tool-bg1)',
        borderColor: 'var(--color-tool-border)',
        display: 'flex',
        alignItems: center ? 'center' : 'flex-start',
        justifyContent: center ? 'center' : 'flex-start',
      }}
    >
      {children}
    </div>
  )
}
