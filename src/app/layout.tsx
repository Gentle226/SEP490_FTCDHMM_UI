import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';

import { Toaster } from '@/base/components/ui/toaster';
import { QueryProvider } from '@/base/providers';
import '@/base/styles/globals.css';
import { AuthProvider } from '@/modules/auth';

export const metadata: Metadata = {
  title: {
    template: '%s | FitFood Tracker',
    default: 'FitFood Tracker',
  },
  description: 'Quản lý chế độ ăn và chỉ số sức khỏe toàn diện',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FitFood Tracker',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors />
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
