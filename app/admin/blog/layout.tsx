import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Write & Manage Blog',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
