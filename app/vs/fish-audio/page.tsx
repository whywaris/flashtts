import type { Metadata } from 'next';
import VsComparisonTemplate from '@/components/vs/VsComparisonTemplate';
import { fishAudioData } from '@/data/comparisons/fish-audio';

export const metadata: Metadata = {
  title: fishAudioData.metaTitle,
  description: fishAudioData.metaDescription,
  openGraph: {
    title: fishAudioData.metaTitle,
    description: fishAudioData.metaDescription,
    url: `https://www.flashtts.com/vs/${fishAudioData.slug}`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: fishAudioData.metaTitle,
    description: fishAudioData.metaDescription,
  },
  alternates: {
    canonical: `https://www.flashtts.com/vs/${fishAudioData.slug}`,
  },
};

export default function FishAudioComparisonPage() {
  return <VsComparisonTemplate data={fishAudioData} />;
}

