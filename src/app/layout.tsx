import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { PWARegister } from '@/components/PWARegister';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'Inochi',
  description: 'Your Health. Your Data. Your Control.',
  applicationName: 'Inochi',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Inochi',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#2F6BFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${plusJakarta.variable} plus-jakarta antialiased h-full`}
        style={{ backgroundColor: 'var(--page)', color: 'var(--ink)' }}
      >
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
