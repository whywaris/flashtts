import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Voice Cloning',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
