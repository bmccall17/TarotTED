import type { Metadata } from 'next';
import './globals.css';
import { BottomNav } from '@/components/layout/BottomNav';
import { InstallBanner } from '@/components/ui/InstallBanner';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'TarotTED - Tarot Cards Mapped to TED Talks',
  description: 'Discover TED talks through the wisdom of Tarot. Explore the intersection of ancient archetypes and modern insights.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TarotTED',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 antialiased">
        {children}
        <InstallBanner />
        <BottomNav />
        <AnalyticsProvider />
        <SpeedInsights />
      </body>
    </html>
  );
}
