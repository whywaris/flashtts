import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlashTTS — Professional AI Text to Speech",
  description: "Convert text to natural speech, clone voices, and transcribing audio with FlashTTS. Fast, reliable, and premium quality.",
  icons: {
    icon: "https://pub-3f46038553dd48c18ff7e328b4172cab.r2.dev/FlashTTS%20Logo%20(1).png",
    apple: "https://pub-3f46038553dd48c18ff7e328b4172cab.r2.dev/FlashTTS%20Logo%20(1).png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
