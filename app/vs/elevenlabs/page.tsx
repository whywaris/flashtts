import type { Metadata } from 'next';
import VsComparisonTemplate from '@/components/vs/VsComparisonTemplate';
import { elevenLabsData } from '@/data/comparisons/elevenlabs';

export const metadata: Metadata = {
  title: elevenLabsData.metaTitle,
  description: elevenLabsData.metaDescription,
  openGraph: {
    title: elevenLabsData.metaTitle,
    description: elevenLabsData.metaDescription,
    url: `https://flashtts.com/vs/${elevenLabsData.slug}`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: elevenLabsData.metaTitle,
    description: elevenLabsData.metaDescription,
  },
  alternates: {
    canonical: `https://flashtts.com/vs/${elevenLabsData.slug}`,
  },
};

export default function ElevenLabsComparisonPage() {
  return <VsComparisonTemplate data={elevenLabsData} />;
}
