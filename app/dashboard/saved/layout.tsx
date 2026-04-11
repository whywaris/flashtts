import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Voices',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
