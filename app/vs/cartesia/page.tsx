import type { Metadata } from 'next';
import VsComparisonTemplate from '@/components/vs/VsComparisonTemplate';
import { cartesiaData } from '@/data/comparisons/cartesia';

export const metadata: Metadata = {
  title: cartesiaData.metaTitle,
  description: cartesiaData.metaDescription,
  openGraph: {
    title: cartesiaData.metaTitle,
    description: cartesiaData.metaDescription,
    url: `https://www.flashtts.com/vs/${cartesiaData.slug}`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: cartesiaData.metaTitle,
    description: cartesiaData.metaDescription,
  },
  alternates: {
    canonical: `https://www.flashtts.com/vs/${cartesiaData.slug}`,
  },
};

export default function CartesiaComparisonPage() {
  return <VsComparisonTemplate data={cartesiaData} />;
}

