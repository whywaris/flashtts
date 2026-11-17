'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'


interface GoogleAdSenseProps {
  publisherId: string
}

export default function GoogleAdSense({ publisherId }: GoogleAdSenseProps) {
  const pathname = usePathname()

  // AdSense runs on the blog only. Never on product, pricing, tools, signup, comparison or app pages.
  // TODO: in AdSense > Blocking controls, block competitor domains: elevenlabs.io, murf.ai, speechify.com,
  // lovo.ai, wellsaidlabs.com, naturalreaders.com, play.ht
  const isBlog = pathname === '/blog' || !!pathname?.startsWith('/blog/')

  if (!isBlog) {
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

