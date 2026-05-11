import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dog Training',
  description: 'Track training sessions and level up your dogs.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Dog Training',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
