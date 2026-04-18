import type { Metadata } from 'next';
import VsComparisonTemplate from '@/components/vs/VsComparisonTemplate';
import { naturalreaderData } from '@/data/comparisons/naturalreader';

export const metadata: Metadata = {
  title: naturalreaderData.metaTitle,
  description: naturalreaderData.metaDescription,
  openGraph: {
    title: naturalreaderData.metaTitle,
    description: naturalreaderData.metaDescription,
    url: `https://flashtts.com/vs/${naturalreaderData.slug}`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: naturalreaderData.metaTitle,
    description: naturalreaderData.metaDescription,
  },
  alternates: {
    canonical: `https://flashtts.com/vs/${naturalreaderData.slug}`,
  },
};

export default function NaturalReaderComparisonPage() {
  return <VsComparisonTemplate data={naturalreaderData} />;
}
