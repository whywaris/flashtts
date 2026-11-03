import type { Metadata } from 'next';
import ToolsClient from './ToolsClient';

export const metadata: Metadata = {
  title: 'Free Audio & Voiceover Tools - Word to Audio Calculator | FlashTTS',
  description: 'Free creator utilities: Word to Audio Duration Calculator, Speech Pace Estimator, and Audio File Size Calculator. Calculate speech length and export sizes in seconds.',
  alternates: {
    canonical: 'https://www.flashtts.com/tools',
  },
  openGraph: {
    title: 'Free Audio & Voiceover Tools | FlashTTS',
    description: 'Calculate speech duration from word count, estimate audio file sizes, and plan your voiceover production with our free utilities.',
    url: 'https://www.flashtts.com/tools',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FlashTTS Free Audio Tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Audio & Voiceover Tools | FlashTTS',
    description: 'Word to audio duration calculator and audio planning utilities for creators.',
    images: ['/og-image.png'],
  },
};

export default function ToolsPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.flashtts.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: 'https://www.flashtts.com/tools',
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FlashTTS Word to Audio Duration Calculator',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    url: 'https://www.flashtts.com/tools',
    description: 'Free online tool to calculate spoken audio duration, word count, character count, and audio file sizes.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <ToolsClient />
    </>
  );
}

