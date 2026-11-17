import type { Metadata } from 'next';
import AudiobookClient from './AudiobookClient';

export const metadata: Metadata = {
  title: 'AI Audiobook Generator | Multi-Chapter Audiobook Studio | FlashTTS',
  description: 'Convert manuscripts, novels and guides into AI-narrated audiobooks. Automatic chapter detection, a voice per chapter, and commercial rights on paid plans.',
  alternates: {
    canonical: 'https://www.flashtts.com/audiobook',
  },
  openGraph: {
    title: 'FlashTTS Audiobook Studio - Turn Manuscripts into Studio Audiobooks',
    description: 'Convert full-length novels into AI-narrated audiobooks with automatic chapter detection and a voice per chapter.',
    url: 'https://www.flashtts.com/audiobook',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlashTTS Audiobook Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlashTTS Audiobook Studio | AI Audiobook Generator',
    description: 'Convert full-length manuscripts into AI-narrated, multi-chapter audiobooks.',
    images: ['/og-image.png'],
  },
};

export default function AudiobookPage() {
  return <AudiobookClient />;
}
