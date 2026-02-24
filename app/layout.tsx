import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '30 Days of Claude Code | Ashley Harrison',
  description:
    'Every day for 30 days, building a real business tool for a different industry — using Claude Code. No tutorials. No toy projects. Tools that a business could use tomorrow.',
  openGraph: {
    title: '30 Days of Claude Code',
    description: 'Real business tools. Different industry every day. Built with Claude Code.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-cream text-ink">{children}</body>
    </html>
  );
}
