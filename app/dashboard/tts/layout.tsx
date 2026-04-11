import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text To Speech',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
