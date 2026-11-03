import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: "About FlashTTS - Built for Creators Who Never Stop Publishing",
  description: "FlashTTS was built because ElevenLabs kept running out of credits. Founded by Avis Littel, we give creators unlimited studio-quality AI voices at a price that makes sense.",
  alternates: {
    canonical: 'https://www.flashtts.com/about',
  },
  openGraph: {
    title: 'About FlashTTS - Our Story & Team',
    description: 'Learn why Avis Littel and the FlashTTS team built an unmetered alternative to legacy AI voice generators.',
    url: 'https://www.flashtts.com/about',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'About FlashTTS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About FlashTTS - Our Story & Team',
    description: 'Learn why Avis Littel and the FlashTTS team built an unmetered alternative to legacy AI voice generators.',
    images: ['/og-image.png'],
  },
};

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About FlashTTS',
    url: 'https://www.flashtts.com/about',
    mainEntity: {
      '@type': 'Organization',
      name: 'FlashTTS',
      url: 'https://www.flashtts.com',
      logo: 'https://www.flashtts.com/logo.png',
      founder: {
        '@type': 'Person',
        name: 'Avis Littel',
        jobTitle: 'Founder & Lead Engineer',
        description: 'Speech synthesis engineer and audio systems architect with 8+ years developing neural voice architectures.',
        sameAs: [
          'https://github.com/flashtts',
          'https://linkedin.com/company/flashtts',
          'https://x.com/flashtts'
        ]
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <AboutClient />
    </>
  );
}
