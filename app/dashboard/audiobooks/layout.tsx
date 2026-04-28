import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'ebook to Audiobook' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
