import type { Metadata } from 'next';
import AboutClient from './AboutClient';
import { FOUNDER, LANGUAGE_COUNT } from '@/lib/siteStats';

export const metadata: Metadata = {
  title: "About FlashTTS - Built for Creators Who Never Stop Publishing",
  description: `FlashTTS is an AI text-to-speech and voice cloning platform for creators, founded by ${FOUNDER.name}. ${LANGUAGE_COUNT} languages and a lower cost per character.`,
  alternates: {
    canonical: 'https://www.flashtts.com/about',
  },
  openGraph: {
    title: 'About FlashTTS - Our Story',
    description: `Why ${FOUNDER.name} started FlashTTS, a credit-based AI voice generator for creators.`,
    url: 'https://www.flashtts.com/about',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'About FlashTTS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About FlashTTS - Our Story',
    description: `Why ${FOUNDER.name} started FlashTTS, a credit-based AI voice generator for creators.`,
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
        name: FOUNDER.name,
        jobTitle: FOUNDER.role,
        ...(FOUNDER.bio ? { description: FOUNDER.bio } : {}),
        ...(FOUNDER.linkedinUrl ? { sameAs: [FOUNDER.linkedinUrl] } : {}),
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
