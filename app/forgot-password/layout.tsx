import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forget Password | FlashTTS',
  description: 'Reset your FlashTTS account password.',
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
