import type { Metadata } from 'next';
import './globals.css';
import { BottomNav } from '@/components/layout/BottomNav';
import { InstallBanner } from '@/components/ui/InstallBanner';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'TarotTED - Tarot Cards Mapped to TED Talks',
  description: 'Discover TED talks through the wisdom of Tarot. Explore the intersection of ancient archetypes and modern insights.',
  metadataBase: new URL('https://tarotted.com'),
  openGraph: {
    title: 'TarotTED - Tarot Cards Mapped to TED Talks',
    description: 'Discover TED talks through the wisdom of Tarot. Explore the intersection of ancient archetypes and modern insights.',
    url: 'https://tarotted.com',
    siteName: 'TarotTED',
    images: [
      {
        url: '/applicationhero.png',
        width: 745,
        height: 642,
        alt: 'TarotTED - Tarot Cards Mapped to TED Talks',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TarotTED - Tarot Cards Mapped to TED Talks',
    description: 'Discover TED talks through the wisdom of Tarot. Explore the intersection of ancient archetypes and modern insights.',
    images: ['/applicationhero.png'],
  },
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
