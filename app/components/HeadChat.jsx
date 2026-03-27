'use client'

import { useState, useRef, useEffect } from 'react'

const SUGGESTIONS = [
  'What do you work with?',
  'Tell me about your experiments',
  'What\'s your design philosophy?',
]

const CANNED = {
  'What do you work with?':
    "My main stack is React, Next.js and Vue/Nuxt on the frontend, paired with Node.js, PHP, REST and GraphQL on the backend. I also have deep CMS experience — WordPress, Drupal, Webflow, headless setups. For this portfolio specifically: Next.js 15, Tailwind v4 and Three.js.",
  'Tell me about your experiments':
    "The Lab is where I scratch creative itches. Right now it has a magnetic dot mesh that reacts to your mouse, a 3D blob editor with morphable WebGL shapes, an interactive easing curve visualiser, 20 character-level text animations, and the pixel cursor grid you may have noticed on this page.",
  "What's your design philosophy?":
    "Three things I keep coming back to: design systems first (tokens for palette, type, motion — everything composable), complexity managed not avoided (tech debt is a ledger, not a dirty secret), and quality that actually ships. Pragmatism beats purity every time.",
}

const FALLBACK =
  "That's a great question — I'd love to answer it properly. Drop me a line directly and we can dig into the details."

// Simulate a typewriter effect for a canned string
function useTypewriter(text, active, onDone) {
  const [displayed, setDisplayed] = useState('')
  const rafRef = useRef(null)

  useEffect(() => {
    if (!active || !text) return
    setDisplayed('')
    let i = 0
    const step = () => {
      i++
      setDisplayed(text.slice(0, i))
      if (i < text.length) {
        rafRef.current = setTimeout(step, 18)
      } else {
        onDone?.()
      }
    }
    rafRef.current = setTimeout(step, 18)
    return () => clearTimeout(rafRef.current)
  }, [text, active])

  return displayed
}

export default function HeadChat({ visible }) {
  const [input,     setInput]     = useState('')
  const [messages,  setMessages]  = useState([])
  const [streaming, setStreaming] = useState(false)
  const [pending,   setPending]   = useState(null) // text being typed
  const inputRef  = useRef(null)
  const bottomRef = useRef(null)

  // Typewriter for the current pending answer
  const typed = useTypewriter(pending, !!pending, () => {
    if (pending !== null) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: pending }
        return updated
      })
      setPending(null)
      setStreaming(false)
    }
  })

  // Keep the streaming assistant slot updated while typing
  useEffect(() => {
    if (pending === null) return
    setMessages(prev => {
      const updated = [...prev]
      updated[updated.length - 1] = { role: 'assistant', content: typed }
      return updated
    })
  }, [typed, pending])

  // Focus when chat opens; reset when it closes
  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 350)
    } else {
      setInput('')
      setMessages([])
      setStreaming(false)
      setPending(null)
    }
  }, [visible])

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  function submit(text) {
    const q = (text ?? input).trim()
    if (!q || streaming) return
    setInput('')

    const answer = CANNED[q] ?? FALLBACK
    setMessages(prev => [
      ...prev,
      { role: 'user', content: q },
      { role: 'assistant', content: '' },
    ])
    setStreaming(true)
    // Tiny delay so the empty bubble renders first
    setTimeout(() => setPending(answer), 80)
  }

  const showSuggestions = messages.length === 0 && !streaming

  return (
    <div
      className="fixed left-1/2 z-[60] flex flex-col gap-3"
      onClick={e => e.stopPropagation()}
      style={{
        bottom: '5vh',
        transform: 'translateX(-50%)',
        width: 'min(500px, 92vw)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.35s ease',
        transitionDelay: visible ? '0.15s' : '0s',
      }}
    >
      {/* Message thread */}
      {messages.length > 0 && (
        <div
          className="flex flex-col gap-2 overflow-y-auto px-1"
          style={{ maxHeight: '28vh' }}
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <p
                className="font-mono text-[12px] leading-[1.6] px-4 py-2 rounded-2xl"
                style={m.role === 'user'
                  ? {
                      background: 'rgba(124,92,255,0.18)',
                      border: '1px solid rgba(124,92,255,0.35)',
                      color: 'rgba(232,234,240,0.95)',
                      maxWidth: '80%',
                    }
                  : {
                      background: 'rgba(20,16,40,0.96)',
                      border: '1px solid rgba(124,92,255,0.22)',
                      color: 'rgba(232,234,240,0.82)',
                      backdropFilter: 'blur(12px)',
                      maxWidth: '88%',
                    }
                }
              >
                {m.content}
              </p>
            </div>
          ))}

          {/* Dot indicator while the assistant slot is still empty */}
          {streaming && messages[messages.length - 1]?.content === '' && (
            <div className="flex justify-start">
              <p
                className="font-mono text-[13px] px-4 py-2 rounded-2xl"
                style={{
                  background: 'rgba(20,16,40,0.96)',
                  border: '1px solid rgba(124,92,255,0.22)',
                  color: 'rgba(124,92,255,0.6)',
                  backdropFilter: 'blur(12px)',
                  letterSpacing: '0.2em',
                }}
              >
                · · ·
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}

      {/* Suggestion chips */}
      {showSuggestions && (
        <div className="flex flex-wrap gap-2 justify-center">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="font-mono text-[11px] px-3 py-[6px] rounded-full border border-ui text-muted hover:border-violet hover:text-violet transition-colors duration-200"
              style={{ background: 'rgba(15,17,21,0.85)', backdropFilter: 'blur(8px)' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: 'rgba(20,16,40,0.96)',
          border: '1px solid rgba(124,92,255,0.4)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 0 1px rgba(124,92,255,0.08), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit() }}
          placeholder="Ask me anything about my work…"
          className="flex-1 bg-transparent font-mono text-[13px] text-foreground placeholder:text-muted outline-none"
        />
        <button
          onClick={() => submit()}
          disabled={!input.trim() || streaming}
          className="font-mono text-[18px] leading-none text-violet disabled:text-muted transition-colors duration-150 hover:text-mint"
          style={{ lineHeight: 1 }}
        >
          ↵
        </button>
      </div>
    </div>
  )
}
