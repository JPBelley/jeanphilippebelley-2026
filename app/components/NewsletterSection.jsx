'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

function applyStyles(container) {
  const css = getComputedStyle(document.documentElement)
  const get = (v) => css.getPropertyValue(v).trim()

  const violet     = get('--color-violet')     || '#7C5CFF'
  const mint       = get('--color-mint')       || '#2EE6A6'
  const bg2        = get('--color-bg2')        || '#1A1D24'
  const ui         = get('--color-ui')         || '#2A2F3A'
  const foreground = get('--color-foreground') || '#E8EAF0'
  const muted      = get('--color-muted')      || '#6B7280'
  const fontHead   = get('--font-head')        || 'sans-serif'
  const fontMono   = get('--font-mono')        || 'monospace'

  // Wrapper / body — strip MailerLite card styling
  container.querySelectorAll(
    '.ml-form-embedWrapper, .ml-form-align-center, .ml-form-embedBody'
  ).forEach(el => {
    el.style.setProperty('background', 'transparent', 'important')
    el.style.setProperty('border', 'none', 'important')
    el.style.setProperty('box-shadow', 'none', 'important')
    el.style.setProperty('padding', '0', 'important')
    el.style.setProperty('margin', '0', 'important')
  })

  // MailerLite's own heading block — hidden since we provide our own
  container.querySelectorAll('.ml-form-embedContent').forEach(el => {
    el.style.setProperty('display', 'none', 'important')
  })

  // Inputs
  container.querySelectorAll('input[type="email"], input[type="text"]').forEach(el => {
    el.style.setProperty('background', bg2, 'important')
    el.style.setProperty('border', `1px solid ${ui}`, 'important')
    el.style.setProperty('border-radius', '6px', 'important')
    el.style.setProperty('color', foreground, 'important')
    el.style.setProperty('font-family', fontMono, 'important')
    el.style.setProperty('font-size', '13px', 'important')
    el.style.setProperty('padding', '11px 14px', 'important')
    el.style.setProperty('width', '100%', 'important')
    el.style.setProperty('box-sizing', 'border-box', 'important')
    el.style.setProperty('outline', 'none', 'important')
    el.style.setProperty('box-shadow', 'none', 'important')
    el.addEventListener('focus', () => el.style.setProperty('border-color', violet, 'important'))
    el.addEventListener('blur',  () => el.style.setProperty('border-color', ui, 'important'))
  })

  // Checkbox row
  container.querySelectorAll('.ml-form-checkboxRow').forEach(el => {
    el.style.setProperty('display', 'flex', 'important')
    el.style.setProperty('align-items', 'flex-start', 'important')
    el.style.setProperty('gap', '10px', 'important')
    el.style.setProperty('margin-bottom', '12px', 'important')
  })
  container.querySelectorAll('.ml-form-checkboxRow input[type="checkbox"]').forEach(el => {
    el.style.setProperty('width', '15px', 'important')
    el.style.setProperty('height', '15px', 'important')
    el.style.setProperty('accent-color', violet, 'important')
    el.style.setProperty('flex-shrink', '0', 'important')
    el.style.setProperty('margin-top', '2px', 'important')
    el.style.setProperty('cursor', 'pointer', 'important')
  })
  container.querySelectorAll(
    '.ml-form-checkboxRow .label-description, .ml-form-checkboxRow .label-description p, .ml-form-checkboxRow .label-description a'
  ).forEach(el => {
    el.style.setProperty('color', muted, 'important')
    el.style.setProperty('font-family', fontMono, 'important')
    el.style.setProperty('font-size', '12px', 'important')
    el.style.setProperty('line-height', '1.6', 'important')
    el.style.setProperty('margin', '0', 'important')
    el.style.setProperty('text-align', 'left', 'important')
  })

  // Submit button
  container.querySelectorAll(
    '.ml-form-embedSubmit button.primary, .ml-form-embedSubmit button[type="submit"]'
  ).forEach(el => {
    el.style.setProperty('background', violet, 'important')
    el.style.setProperty('color', '#fff', 'important')
    el.style.setProperty('border', 'none', 'important')
    el.style.setProperty('border-radius', '6px', 'important')
    el.style.setProperty('font-family', fontHead, 'important')
    el.style.setProperty('font-size', '13px', 'important')
    el.style.setProperty('font-weight', '600', 'important')
    el.style.setProperty('letter-spacing', '0.03em', 'important')
    el.style.setProperty('padding', '11px 28px', 'important')
    el.style.setProperty('cursor', 'pointer', 'important')
    el.style.setProperty('width', 'auto', 'important')
    el.style.setProperty('box-shadow', 'none', 'important')
    el.style.setProperty('text-transform', 'none', 'important')
    el.addEventListener('mouseenter', () => el.style.setProperty('background', '#9070ff', 'important'))
    el.addEventListener('mouseleave', () => el.style.setProperty('background', violet, 'important'))
  })

  // Validation error messages
  container.querySelectorAll(
    '.ml-error, .ml-form-error, .ml-field-error, .label-description.ml-error, .primary-error'
  ).forEach(el => {
    el.style.setProperty('display', 'block', 'important')
    el.style.setProperty('color', '#f87171', 'important')
    el.style.setProperty('font-family', fontMono, 'important')
    el.style.setProperty('font-size', '12px', 'important')
    el.style.setProperty('margin-top', '4px', 'important')
    el.style.setProperty('text-align', 'left', 'important')
  })

  // Success message
  container.querySelectorAll('.ml-form-successBody, .ml-form-successContent').forEach(el => {
    el.style.setProperty('background', 'transparent', 'important')
    el.style.setProperty('padding', '0', 'important')
    el.style.setProperty('text-align', 'center', 'important')
  })
  container.querySelectorAll('.ml-form-successBody h4').forEach(el => {
    el.style.setProperty('color', mint, 'important')
    el.style.setProperty('font-family', fontHead, 'important')
    el.style.setProperty('font-size', '18px', 'important')
    el.style.setProperty('text-align', 'center', 'important')
  })
  container.querySelectorAll('.ml-form-successBody p').forEach(el => {
    el.style.setProperty('color', muted, 'important')
    el.style.setProperty('font-family', fontMono, 'important')
    el.style.setProperty('font-size', '13px', 'important')
    el.style.setProperty('text-align', 'center', 'important')
  })
}

export default function NewsletterSection() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Apply immediately in case form is already rendered
    applyStyles(container)

    // Re-apply whenever MailerLite mutates the DOM (form injection, success state, etc.)
    const formObserver = new MutationObserver(() => applyStyles(container))
    formObserver.observe(container, { childList: true, subtree: true })

    // Re-apply when the theme changes (data-theme on <html>)
    const themeObserver = new MutationObserver(() => applyStyles(container))
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      formObserver.disconnect()
      themeObserver.disconnect()
    }
  }, [])

  return (
    <section className="border-t border-ui">
      <div className="max-w-6xl mx-auto px-[60px] max-[640px]:px-10 py-20 flex flex-col items-center text-center">

        <p className="font-mono text-[11px] uppercase tracking-widest text-violet mb-3">// newsletter</p>
        <h2 className="text-[clamp(24px,3vw,38px)] font-bold leading-tight tracking-[-0.02em] mb-3">
          Stay in the loop
        </h2>
        <p className="text-muted text-[14px] leading-relaxed mb-8 max-w-md">
          New experiments, articles, and tools — straight to your inbox. No spam, unsubscribe anytime.
        </p>

        <div className="w-full max-w-md" ref={containerRef}>
          <div className="ml-embedded" data-form="JWgk4z" />
        </div>

      </div>

      <Script id="mailerlite-universal" strategy="afterInteractive">{`
        (function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[])
        .push(arguments);},l=d.createElement(e),l.async=1,l.src=u,
        n=d.getElementsByTagName(e)[0],n.parentNode.insertBefore(l,n);})
        (window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
        ml('account', '2197166');
      `}</Script>
    </section>
  )
}
