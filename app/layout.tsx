import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // ── Primary Title ──
  title: {
    default: 'FlashTTS — AI Voice Generator | 10x More Credits Than ElevenLabs',
    template: '%s | FlashTTS'
  },

  // ── Meta Description ──
  description: 'Generate studio-quality AI voices in 19 languages. 10x more credits than ElevenLabs at half the price. Voice cloning, audiobooks & 1,000+ voices. Start free today.',

  // ── Keywords ──
  keywords: [
    'AI voice generator',
    'text to speech',
    'AI text to speech',
    'voice cloning AI',
    'text to speech online free',
    'AI voice generator free',
    'ElevenLabs alternative',
    'Murf alternative',
    'Speechify alternative',
    'AI voiceover generator',
    'voice cloning online',
    'audiobook generator',
    'AI voice changer',
    'realistic AI voices',
    'text to speech 19 languages',
    'FlashTTS',
  ],

  // ── Canonical URL ──
  metadataBase: new URL('https://flashtts.com'),
  alternates: {
    canonical: '/',
  },

  // ── Open Graph (Facebook, LinkedIn) ──
  openGraph: {
    type: 'website',
    url: 'https://flashtts.com',
    siteName: 'FlashTTS',
    title: 'FlashTTS — AI Voice Generator | 10x More Credits Than ElevenLabs',
    description: 'Generate studio-quality AI voices in 19 languages. 10x more credits than ElevenLabs at half the price. Voice cloning, audiobooks & 1,000+ voices. Start free today.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlashTTS — AI Voice Generator',
      }
    ],
    locale: 'en_US',
  },

  // ── Twitter Card ──
  twitter: {
    card: 'summary_large_image',
    site: '@flashtts',
    creator: '@flashtts',
    title: 'FlashTTS - AI Voice Generator | More Credits, Half the Price',
    description: 'Generate studio-quality AI voices in 19 languages. 10x more credits than ElevenLabs at half the price. Start free today.',
    images: ['/og-image.png'],
  },

  // ── Robots ──
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Icons ──
  icons: {
    icon: 'https://pub-3f46038553dd48c18ff7e328b4172cab.r2.dev/FlashTTS%20Logo.png',
    shortcut: 'https://pub-3f46038553dd48c18ff7e328b4172cab.r2.dev/FlashTTS%20Logo.png',
    apple: 'https://pub-3f46038553dd48c18ff7e328b4172cab.r2.dev/FlashTTS%20Logo.png',
  },

  // ── App info ──
  applicationName: 'FlashTTS',
  authors: [{ name: 'FlashTTS' }],
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="https://pub-3f46038553dd48c18ff7e328b4172cab.r2.dev/FlashTTS%20Logo.png" />
        <link rel="apple-touch-icon" href="https://pub-3f46038553dd48c18ff7e328b4172cab.r2.dev/FlashTTS%20Logo.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
