import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'MLens — Interactive ML Book',
  description:
    'A free, visual, interactive machine learning textbook for high school and undergraduate students.',
  keywords: ['machine learning', 'interactive', 'education', 'AI', 'deep learning'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Bengali:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <SiteHeader />
        <div className="flex flex-1 pt-[var(--header-height)]">
          <Sidebar />
          <main className="flex-1 min-w-0 ml-0 md:ml-[var(--sidebar-width)]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
