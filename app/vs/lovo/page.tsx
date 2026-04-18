import type { Metadata } from 'next';
import VsComparisonTemplate from '@/components/vs/VsComparisonTemplate';
import { lovoData } from '@/data/comparisons/lovo';

export const metadata: Metadata = {
  title: lovoData.metaTitle,
  description: lovoData.metaDescription,
  openGraph: {
    title: lovoData.metaTitle,
    description: lovoData.metaDescription,
    url: `https://flashtts.com/vs/${lovoData.slug}`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: lovoData.metaTitle,
    description: lovoData.metaDescription,
  },
  alternates: {
    canonical: `https://flashtts.com/vs/${lovoData.slug}`,
  },
};

export default function LovoComparisonPage() {
  return <VsComparisonTemplate data={lovoData} />;
}
