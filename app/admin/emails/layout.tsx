import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Send Emails',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
