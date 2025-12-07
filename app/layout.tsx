import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TarotTED - Tarot Cards Mapped to TED Talks',
  description: 'Discover TED talks through the wisdom of Tarot. Explore the intersection of ancient archetypes and modern insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
