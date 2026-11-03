'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

const EXCLUDED_PREFIXES = [
  '/dashboard',
  '/login',
  '/signup',
  '/auth',
  '/admin',
  '/studio',
  '/reset-password',
  '/forgot-password',
]

interface GoogleAdSenseProps {
  publisherId: string
}

export default function GoogleAdSense({ publisherId }: GoogleAdSenseProps) {
  const pathname = usePathname()

  // Strictly block AdSense script execution on dashboard, studio, and auth pages to prevent accidental/invalid clicks
  const isExcluded = pathname ? EXCLUDED_PREFIXES.some(prefix => pathname.startsWith(prefix)) : false

  if (isExcluded) {
    return null
  }

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}

