import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chat Commerce Admin',
  description: 'Platform administration',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Never maximumScale: 1 — it blocks pinch-zoom, which users with low vision
  // rely on, and it is an accessibility failure rather than a polish detail.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Self-hosted and subset in Phase 4. Preconnect here so the Bangla
          font is not the thing that makes first paint slow on 3G.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
