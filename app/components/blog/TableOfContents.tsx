'use client'
import { useEffect, useState } from 'react'

export default function TableOfContents() {
  const [headings, setHeadings] = useState<{id: string, text: string, level: number}[]>([])
  const [active, setActive] = useState('')

  useEffect(() => {
    // Get all headings from article
    const els = document.querySelectorAll('article h2, article h3')
    const items = Array.from(els).map((el, i) => {
      const id = el.id || `heading-${i}`
      el.id = id
      return { id, text: el.textContent || '', level: parseInt(el.tagName[1]) }
    })
    setHeadings(items)

    // Intersection observer for active heading
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-20% 0% -60% 0%' } // Adjusted for TOC and top bar
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null;

  return (
    <nav style={{ position: 'sticky', top: '100px' }}>
      <div style={{
        background: '#fff', border: '1px solid #e9ecef',
        borderRadius: '16px', padding: '20px'
      }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 700, fontSize: '14px', color: '#0a0a0f', marginBottom: '12px' }}>
          Contents
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {headings.map(h => (
            <a key={h.id} href={`#${h.id}`} style={{
              display: 'block',
              padding: '6px 0',
              fontSize: '13px',
              color: active === h.id ? '#ff4d1c' : '#6b6878',
              fontWeight: active === h.id ? '600' : '400',
              textDecoration: 'none',
              borderLeft: active === h.id ? '2px solid #ff4d1c' : '2px solid transparent',
              paddingLeft: h.level === 3 ? '12px' : '8px',
              transition: 'all 0.15s',
            }}>
              {h.text}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
