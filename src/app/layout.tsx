import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNavProvider } from '@/components/layout/MobileNavContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-bengali',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MLTheta — Interactive ML Book',
  description:
    'A free, visual, interactive machine learning textbook for college and undergraduate students.',
  keywords: ['machine learning', 'interactive', 'education', 'AI', 'deep learning'],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/logo-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${notoSansBengali.variable} bg-[#f4eed9]`}>
      <body className="font-sans antialiased flex flex-col min-h-screen bg-[#f4eed9] text-[#26231f]">
        <MobileNavProvider>
          <SiteHeader />
          <div className="flex flex-1 pt-[var(--header-height)] bg-[#f4eed9]">
            <Sidebar />
            <main className="flex-1 min-w-0 ml-0 md:ml-[var(--sidebar-width)] overflow-x-hidden bg-[#f4eed9]">
              {children}
            </main>
          </div>
        </MobileNavProvider>
      </body>
    </html>
  );
}
