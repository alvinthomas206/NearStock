import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { MobileFrame } from '@/components/layout/MobileFrame';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'NearStock — Find it nearby. Reserve it. Get it.',
  description:
    'Local inventory discovery and instant pickup reservation platform for pharmacies, retail, groceries, and medical supplies.',
  keywords: [
    'NearStock',
    'Local Inventory',
    'Pharmacy Stock Search',
    'Medicine Reservation',
    'Store Pickup',
    'Smart Stock Request',
  ],
  authors: [{ name: 'NearStock Team' }],
  icons: {
    icon: [
      { url: '/logo.png' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen bg-[#F5F9FC] text-slate-800">
        <AppProvider>
          <MobileFrame>{children}</MobileFrame>
        </AppProvider>
      </body>
    </html>
  );
}
