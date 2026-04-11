'use client'
import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    function update() {
      const scrollY = window.scrollY
      const docH = document.documentElement.scrollHeight
      const winH = window.innerHeight
      if (docH === winH) {
        setProgress(0)
      } else {
        setProgress((scrollY / (docH - winH)) * 100)
      }
    }
    window.addEventListener('scroll', update)
    // Initial update
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, zIndex: 9999,
      height: '3px', width: `${progress}%`,
      background: '#ff4d1c', transition: 'width 0.1s',
    }} />
  )
}
