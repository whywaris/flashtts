import type { Metadata } from 'next';
import VsComparisonTemplate from '@/components/vs/VsComparisonTemplate';
import { wellsaidData } from '@/data/comparisons/wellsaid';

export const metadata: Metadata = {
  title: wellsaidData.metaTitle,
  description: wellsaidData.metaDescription,
  openGraph: {
    title: wellsaidData.metaTitle,
    description: wellsaidData.metaDescription,
    url: `https://flashtts.com/vs/${wellsaidData.slug}`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: wellsaidData.metaTitle,
    description: wellsaidData.metaDescription,
  },
  alternates: {
    canonical: `https://flashtts.com/vs/${wellsaidData.slug}`,
  },
};

export default function WellSaidComparisonPage() {
  return <VsComparisonTemplate data={wellsaidData} />;
}
