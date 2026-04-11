'use client'
import { useState } from 'react'
import { Twitter, Copy, Check } from 'lucide-react'

export default function ShareButtons({ url, title, variant = 'side' }: { url: string, title: string, variant?: 'side' | 'meta' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`

  if (variant === 'meta') {
    return (
      <div className="flex items-center gap-3">
        <a 
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-[#0a0a0f] text-white hover:opacity-90 transition-all"
          title="Share on X"
        >
          <Twitter size={16} fill="currentColor" />
        </a>
        <button 
          onClick={handleCopy}
          className="p-2.5 rounded-xl bg-white border border-[rgba(10,10,15,0.1)] text-[#0a0a0f] hover:border-[#ff4d1c] transition-all relative group"
          title="Copy Link"
        >
          {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
          {copied && (
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded-md">
              Copied!
            </span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <a 
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1a1a1a] text-white font-bold text-sm hover:bg-black transition-all"
      >
        <Twitter size={16} fill="currentColor" />
        Share on X
      </a>
      <button 
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-[rgba(10,10,15,0.1)] text-[#0a0a0f] font-bold text-sm hover:border-[#ff4d1c] transition-all"
      >
        {copied ? (
          <>
            <Check size={16} className="text-emerald-500" />
            Copied!
          </>
        ) : (
          <>
            <Copy size={16} />
            Copy Link
          </>
        )}
      </button>
    </div>
  )
}
