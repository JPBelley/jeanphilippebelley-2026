'use client'

import Cursor from '../Cursor'
import Nav from '../Nav'
import Footer from '../Footer'
import NewsletterSection from '../NewsletterSection'

/**
 * PageLayout
 *
 * Shared shell for all standard pages (blog, experiments, contact, etc.)
 *
 * Props:
 *   newsletter – adds <NewsletterSection /> before the footer
 *   center     – wraps children in a flex-1 centering div (used for contact)
 */
export default function PageLayout({ children, newsletter = false, center = false }) {
  return (
    <div className={`min-h-screen bg-bg text-foreground font-head${center ? ' flex flex-col' : ''}`}>
      <Cursor />
      <Nav />
      {center
        ? <div className="flex-1 flex items-center justify-center">{children}</div>
        : children
      }
      {newsletter && <NewsletterSection />}
      <Footer />
    </div>
  )
}
