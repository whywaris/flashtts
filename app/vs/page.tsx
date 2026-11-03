import type { Metadata } from 'next';
import VsHubClient from './VsHubClient';

export const metadata: Metadata = {
  title: 'FlashTTS vs Competitors - Compare AI Voice Generators & Alternatives',
  description: 'See how FlashTTS compares to ElevenLabs, Murf AI, Speechify, LOVO AI, WellSaid Labs, and NaturalReader. 10x more credits, studio-grade voices, and half the price.',
  openGraph: {
    title: 'FlashTTS vs Competitors | Honest AI Voice Generator Comparisons',
    description: 'Compare FlashTTS with ElevenLabs, Murf AI, Speechify, LOVO AI, WellSaid Labs, and NaturalReader. Discover why creators switch to FlashTTS.',
    url: 'https://www.flashtts.com/vs',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlashTTS Comparisons Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlashTTS vs Competitors | Compare Top AI Voice Generators',
    description: 'Compare FlashTTS with ElevenLabs, Murf AI, Speechify, LOVO AI, WellSaid Labs, and NaturalReader.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://www.flashtts.com/vs',
  },
};

export default function VsIndexPage() {
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
        name: 'Comparisons',
        item: 'https://www.flashtts.com/vs',
      },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'FlashTTS Comparisons Hub',
    description: 'Honest, side-by-side comparisons of FlashTTS vs top AI voice platforms.',
    url: 'https://www.flashtts.com/vs',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'FlashTTS vs ElevenLabs',
          url: 'https://www.flashtts.com/vs/elevenlabs',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'FlashTTS vs Murf AI',
          url: 'https://www.flashtts.com/vs/murf',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'FlashTTS vs Speechify',
          url: 'https://www.flashtts.com/vs/speechify',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'FlashTTS vs LOVO AI',
          url: 'https://www.flashtts.com/vs/lovo',
        },
        {
          '@type': 'ListItem',
          position: 5,
          name: 'FlashTTS vs WellSaid Labs',
          url: 'https://www.flashtts.com/vs/wellsaid',
        },
        {
          '@type': 'ListItem',
          position: 6,
          name: 'FlashTTS vs NaturalReader',
          url: 'https://www.flashtts.com/vs/naturalreader',
        },
      ],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <VsHubClient />
    </>
  );
}

