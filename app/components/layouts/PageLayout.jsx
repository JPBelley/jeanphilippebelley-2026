'use client'

/**
 * PageLayout
 *
 * Content shell for standard pages. Nav, Footer, and NewsletterSection
 * are provided globally by the root layout.
 *
 * Props:
 *   center – wraps children in a flex-1 centering div (used for contact)
 */
export default function PageLayout({ children, center = false }) {
  return (
    <div className={`min-h-screen${center ? ' flex flex-col' : ''}`}>
      {center
        ? <div className="flex-1 flex items-center justify-center">{children}</div>
        : children
      }
    </div>
  )
}
