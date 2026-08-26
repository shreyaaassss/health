import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { PWARegister } from '@/components/PWARegister';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Health Wallet',
  description: 'Your Health. Your Data. Your Control.',
  applicationName: 'Health Wallet',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Health Wallet',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#0d9488',
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
      <body className={`${geist.className} bg-slate-50 text-slate-900 antialiased h-full`}>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
