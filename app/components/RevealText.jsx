'use client'

import { useEffect, useRef } from 'react'

// Walk text nodes inside el, split each word into overflow-hidden wrapper + char spans.
// Skips <br> and preserves all element structure (colored spans, etc.).
function prepare(el) {
  let idx = 0

  function walk(node) {
    if (node.nodeType === 3) {                    // text node
      const text = node.textContent
      if (!text.trim()) return
      const frag = document.createDocumentFragment()

      text.split(/(\s+)/).forEach(part => {
        if (!part) return
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode('\u00a0'))
          return
        }
        const wrap = document.createElement('span')
        wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom'
        part.split('').forEach(ch => {
          const s = document.createElement('span')
          s.style.cssText = 'display:inline-block;opacity:0;transform:translateY(110%)'
          s.dataset.ri = idx++
          s.textContent = ch
          wrap.appendChild(s)
        })
        frag.appendChild(wrap)
      })

      node.parentNode.replaceChild(frag, node)

    } else if (node.nodeType === 1 && node.tagName !== 'BR') {
      Array.from(node.childNodes).forEach(walk)
    }
  }

  walk(el)
}

function trigger(el, stagger) {
  el.querySelectorAll('[data-ri]').forEach(ch => {
    const delay = parseInt(ch.dataset.ri) * stagger
    ch.style.transition = `opacity 0.5s ease ${delay}ms, transform 0.6s cubic-bezier(0.2,0,0,1) ${delay}ms`
    ch.style.opacity    = '1'
    ch.style.transform  = 'translateY(0)'
  })
}

const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

export default function RevealText({
  children,
  as: Tag         = 'div',
  className,
  style,
  stagger         = 28,     // ms between each character
  threshold       = 0.25,   // intersection threshold
  triggered,                // if provided, fires on true instead of IntersectionObserver
  delay           = 0,      // extra ms to wait before triggering (programmatic mode only)
  disableOnMobile = false,  // skip animation entirely on mobile
}) {
  const ref = useRef(null)

  // Prepare DOM once on mount
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (disableOnMobile && isMobile()) return

    prepare(el)

    if (triggered !== undefined) return  // programmatic mode — skip observer

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      trigger(el, stagger)
    }, { threshold })

    observer.observe(el)
    return () => observer.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Programmatic trigger mode
  useEffect(() => {
    if (triggered !== true) return
    if (disableOnMobile && isMobile()) return
    const el = ref.current
    if (!el) return
    if (delay > 0) {
      const t = setTimeout(() => trigger(el, stagger), delay)
      return () => clearTimeout(t)
    }
    trigger(el, stagger)
  }, [triggered]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  )
}
