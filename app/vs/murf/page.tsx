import type { Metadata } from 'next';
import VsComparisonTemplate from '@/components/vs/VsComparisonTemplate';
import { murfData } from '@/data/comparisons/murf';

export const metadata: Metadata = {
  title: murfData.metaTitle,
  description: murfData.metaDescription,
  openGraph: {
    title: murfData.metaTitle,
    description: murfData.metaDescription,
    url: `https://flashtts.com/vs/${murfData.slug}`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: murfData.metaTitle,
    description: murfData.metaDescription,
  },
  alternates: {
    canonical: `https://flashtts.com/vs/${murfData.slug}`,
  },
};

export default function MurfComparisonPage() {
  return <VsComparisonTemplate data={murfData} />;
}
