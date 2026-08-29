import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Inochi',
    short_name: 'Inochi',
    description: 'Your Health. Your Data. Your Control.',
    start_url: '/patient',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f172a',
    theme_color: '#0d9488',
    categories: ['health', 'medical'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'My Records',
        url: '/patient/records',
        description: 'View your medical records',
      },
      {
        name: 'Share Records',
        url: '/patient/share',
        description: 'Share records with a provider',
      },
    ],
  };
}
