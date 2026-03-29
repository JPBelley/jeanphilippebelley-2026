'use client'

/**
 * ExperimentShell
 *
 * Two-column wrapper: ExperimentControls on the left, ExperimentStage on the right.
 * Stacks vertically below 900px.
 *
 * Usage:
 *   <ExperimentShell>
 *     <ExperimentControls>
 *       <ExperimentControls.Section label="Presets" noPad>...</ExperimentControls.Section>
 *       <ExperimentControls.Section label="Settings">...</ExperimentControls.Section>
 *     </ExperimentControls>
 *     <ExperimentStage>
 *       <canvas ref={canvasRef} />
 *     </ExperimentStage>
 *   </ExperimentShell>
 */
export default function ExperimentShell({ children }) {
  return (
    <div className="flex gap-5 items-start max-[900px]:flex-col">
      {children}
    </div>
  )
}
