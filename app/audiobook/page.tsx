import type { Metadata } from 'next';
import AudiobookClient from './AudiobookClient';

export const metadata: Metadata = {
  title: 'AI Audiobook Generator | Create Studio Audiobooks for Audible & ACX | FlashTTS',
  description: 'Convert full-length manuscripts, novels, and guides into studio-quality audiobooks. Automated ACX mastering, multi-voice character casting, and royalty-free commercial rights.',
  alternates: {
    canonical: 'https://www.flashtts.com/audiobook',
  },
  openGraph: {
    title: 'FlashTTS Audiobook Studio - Turn Manuscripts into Studio Audiobooks',
    description: 'Convert full-length novels into master-grade audiobooks. 100% Audible & ACX compliant with multi-voice character casting.',
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
    description: 'Convert full-length manuscripts into studio audiobooks in hours. 100% ACX and Audible compliant.',
    images: ['/og-image.png'],
  },
};

export default function AudiobookPage() {
  return <AudiobookClient />;
}
