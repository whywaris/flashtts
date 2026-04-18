import type { Metadata } from 'next';
import VsComparisonTemplate from '@/components/vs/VsComparisonTemplate';
import { speechifyData } from '@/data/comparisons/speechify';

export const metadata: Metadata = {
  title: speechifyData.metaTitle,
  description: speechifyData.metaDescription,
  openGraph: {
    title: speechifyData.metaTitle,
    description: speechifyData.metaDescription,
    url: `https://flashtts.com/vs/${speechifyData.slug}`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: speechifyData.metaTitle,
    description: speechifyData.metaDescription,
  },
  alternates: {
    canonical: `https://flashtts.com/vs/${speechifyData.slug}`,
  },
};

export default function SpeechifyComparisonPage() {
  return <VsComparisonTemplate data={speechifyData} />;
}
