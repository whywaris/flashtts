import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { INDIC_LANGUAGES } from '@/data/languages/indic';
import LanguageTTSClient from './LanguageTTSClient';

export function generateStaticParams() {
  return Object.keys(INDIC_LANGUAGES).map((language) => ({
    language,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ language: string }>;
}): Promise<Metadata> {
  const { language } = await params;
  const slug = language.toLowerCase();
  const langData = INDIC_LANGUAGES[slug];

  if (!langData) {
    return {
      title: 'Text to Speech | FlashTTS',
    };
  }

  const canonicalUrl = `https://www.flashtts.com/text-to-speech/${langData.slug}`;

  return {
    title: langData.metaTitle,
    description: langData.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: langData.metaTitle,
      description: langData.metaDescription,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${langData.name} Text to Speech - FlashTTS`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: langData.metaTitle,
      description: langData.metaDescription,
      images: ['/og-image.png'],
    },
  };
}

export default async function LanguageTTSPage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  const slug = language.toLowerCase();
  const langData = INDIC_LANGUAGES[slug];

  if (!langData) {
    notFound();
  }

  return <LanguageTTSClient langData={langData} />;
}

