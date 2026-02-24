import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  title: '30 Days of Claude Code | Ashley Harrison',
  description:
    'Every day for 30 days, building a real business tool for a different industry — using Claude Code. No tutorials. No toy projects. Tools that a business could use tomorrow.',
  icons: {
    icon: '/favicon.svg',
  },
  metadataBase: new URL('https://30-days-claude-code.vercel.app'),
  openGraph: {
    title: '30 Days of Claude Code',
    description: 'Real business tools. Different industry every day. Built with Claude Code.',
    type: 'website',
    siteName: '30 Days of Claude Code',
    url: 'https://30-days-claude-code.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: '30 Days of Claude Code',
    description: 'Real business tools. Different industry every day. Built with Claude Code.',
    creator: '@tellavsn',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-cream text-ink">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
