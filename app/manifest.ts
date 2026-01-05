import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TarotTED',
    short_name: 'TarotTED',
    description: 'Discover TED talks through the wisdom of Tarot',
    start_url: '/',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#1e1b4b',
    orientation: 'portrait',
    icons: [
      {
        src: '/api/icons?size=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/api/icons?size=512',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/api/icons?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
