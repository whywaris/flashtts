'use client'

import { useEffect, useRef } from 'react'

interface AdUnitProps {
  slotId?: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal'
  responsive?: boolean
  className?: string
  label?: string
}

declare global {
  interface Window {
    adsbygoogle?: any[]
  }
}

export default function AdUnit({
  slotId,
  format = 'auto',
  responsive = true,
  className = '',
  label = 'Advertisement'
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null)
  const isPushed = useRef(false)

  useEffect(() => {
    if (isPushed.current) return

    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({})
        isPushed.current = true
      }
    } catch (e) {
      // AdSense push error or adblocker active
    }
  }, [])

  return (
    <div className={`my-8 mx-auto text-center overflow-hidden ${className}`}>
      {label && (
        <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">
          {label}
        </span>
      )}
      <div className="min-h-[100px] flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-9051515195236723"
          data-ad-slot={slotId || 'placeholder'}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  )
}

