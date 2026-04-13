'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

const URL_REGEX = /(https?:\/\/[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g

function LinkedText({ text }) {
  const parts = text.split(URL_REGEX)
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(124,92,255,0.9)', textDecoration: 'underline' }}>{part}</a>
    }
    if (/@/.test(part) && URL_REGEX.test(part)) {
      return <a key={i} href={`mailto:${part}`} style={{ color: 'rgba(124,92,255,0.9)', textDecoration: 'underline' }}>{part}</a>
    }
    return part
  })
}

const SUGGESTIONS = [
  'What do you work with?',
  'Tell me about your experiments',
  'What\'s your design philosophy?',
]

export default function HeadChat({ visible }) {
  // messages follow the Claude API shape: { role: 'user'|'assistant', content: string }
  const [mounted,   setMounted]   = useState(false)
  const [input,     setInput]     = useState('')
  const [messages,  setMessages]  = useState([])
  const [streaming, setStreaming] = useState(false)
  const inputRef  = useRef(null)
  const bottomRef = useRef(null)
  const abortRef  = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  // Focus when chat opens; reset when it closes
  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 350)
    } else {
      abortRef.current?.abort()
      setInput('')
      setMessages([])
      setStreaming(false)
    }
  }, [visible])

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  async function submit(text) {
    const q = (text ?? input).trim()
    if (!q || streaming) return
    setInput('')

    // Full history with the new user message appended — sent on every request
    const next = [...messages, { role: 'user', content: q }]
    setMessages(next)
    setStreaming(true)

    // Add an empty assistant slot we'll stream text into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    abortRef.current = new AbortController()
    try {
      const endpoint = 'https://claude-api.belleyjeanphilippe.workers.dev/'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error('API error')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') break
          let parsed
          try { parsed = JSON.parse(payload) } catch { continue }
          if (parsed.error) throw new Error(parsed.error)
          if (parsed.text) setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role:    'assistant',
              content: updated[updated.length - 1].content + parsed.text,
            }
            return updated
          })
        }
      }

      // If stream closed with empty content (no tokens), show fallback
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last?.role === 'assistant' && last.content === '') {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role:    'assistant',
            content: "Sorry, looks like I ran out of AI tokens for now. Feel free to reach out directly at info@jeanphilippebelley.com, I'd love to chat!",
          }
          return updated
        }
        return prev
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role:    'assistant',
            content: "Sorry, looks like I ran out of AI tokens for now. Feel free to reach out directly at info@jeanphilippebelley.com, I'd love to chat!",
          }
          return updated
        })
      }
    } finally {
      setStreaming(false)
    }
  }

  const showSuggestions = messages.length === 0 && !streaming

  if (!mounted) return null

  return createPortal(
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
          {messages.map((m, i) => m.content === '' ? null : (
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
                {m.role === 'assistant' ? <LinkedText text={m.content} /> : m.content}
              </p>
            </div>
          ))}

          {/* Streaming indicator while assistant slot is empty */}
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
    </div>,
    document.body
  )
}
