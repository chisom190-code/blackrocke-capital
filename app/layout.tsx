import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { LanguageProvider } from '@/lib/i18n';
import DirectionWrapper from '@/components/DirectionWrapper';
import ClientLayout from '@/components/ClientLayout';

const inter = Inter({ subsets: ['latin', 'latin-ext'], display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'BlackRocke Capital – Premium Investment Platform',
    template: '%s | BlackRocke Capital',
  },
  description: 'Join 50,000+ investors earning up to 30% ROI with BlackRocke Capital\'s expertly managed investment portfolios. Start with as little as $50. Cryptocurrency deposits, secure withdrawals, daily profits.',
  keywords: ['investment platform', 'ROI', 'portfolio management', 'wealth management', 'cryptocurrency investment', 'Bitcoin investment', 'USDT investment', 'BlackRocke Capital', 'daily profits', 'investment plans'],
  authors: [{ name: 'BlackRocke Capital' }],
  creator: 'BlackRocke Capital',
  publisher: 'BlackRocke Capital',
  openGraph: {
    title: 'BlackRocke Capital – Premium Investment Platform',
    description: 'Earn up to 30% ROI with our expertly managed investment portfolios. Cryptocurrency deposits, daily profits, secure platform.',
    type: 'website',
    locale: 'en_US',
    siteName: 'BlackRocke Capital',
    images: [{ url: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1200', width: 1200, height: 630, alt: 'BlackRocke Capital Investment Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlackRocke Capital – Premium Investment Platform',
    description: 'Earn up to 30% ROI with expertly managed investment portfolios. Cryptocurrency deposits, daily profits.',
    images: ['https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  metadataBase: new URL('https://blackrockecapital.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'fr': '/',
      'es': '/',
      'de': '/',
      'pt': '/',
      'ar': '/',
      'fa': '/',
      'zh': '/',
      'ja': '/',
      'ko': '/',
      'ru': '/',
    },
  },
  category: 'finance',
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f59e0b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white`}>
        <LanguageProvider>
          <AuthProvider>
            <DirectionWrapper>
              <ClientLayout>
                {children}
              </ClientLayout>
            </DirectionWrapper>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
