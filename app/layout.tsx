import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/i18n";
import DirectionWrapper from "@/components/DirectionWrapper";
import ClientLayout from "@/components/ClientLayout";
import Script from "next/script";

const inter = Inter({ subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Blackgold invests – Premium Investment Platform",
    template: "%s | Blackgold invests",
  },
  description:
    "Join 50,000+ investors earning up to 30% ROI with Blackgold invests's expertly managed investment portfolios. Start with as little as $50. Cryptocurrency deposits, secure withdrawals, daily profits.",
  keywords: [
    "investment platform",
    "ROI",
    "portfolio management",
    "wealth management",
    "cryptocurrency investment",
    "Bitcoin investment",
    "USDT investment",
    "Blackgold invests",
    "daily profits",
    "investment plans",
  ],
  authors: [{ name: "Blackgold invests" }],
  creator: "Blackgold invests",
  publisher: "Blackgold invests",
  openGraph: {
    title: "Blackgold invests – Premium Investment Platform",
    description:
      "Earn up to 30% ROI with our expertly managed investment portfolios. Cryptocurrency deposits, daily profits, secure platform.",
    type: "website",
    locale: "en_US",
    siteName: "Blackgold invests",
    images: [
      {
        url: "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1200",
        width: 1200,
        height: 630,
        alt: "Blackgold invests Investment Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blackgold invests – Premium Investment Platform",
    description:
      "Earn up to 30% ROI with expertly managed investment portfolios. Cryptocurrency deposits, daily profits.",
    images: [
      "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  metadataBase: new URL("https://Blackgoldinvests.com"),
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      fr: "/",
      es: "/",
      de: "/",
      pt: "/",
      ar: "/",
      fa: "/",
      zh: "/",
      ja: "/",
      ko: "/",
      ru: "/",
    },
  },
  category: "finance",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f59e0b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white`}>
        <LanguageProvider>
          <AuthProvider>
            <DirectionWrapper>
              <ClientLayout>{children}</ClientLayout>
            </DirectionWrapper>
          </AuthProvider>
        </LanguageProvider>
        {/* <!-- Smartsupp Live Chat script --> */}
        <Script id="smartsupp-chat" strategy="afterInteractive">
          {`
            var _smartsupp = _smartsupp || {};
            _smartsupp.key = '4c0c769904bb7ba52e96eee61c3d29c97b3c93b6';
            window.smartsupp || (function(d) {
              var s, c, o = smartsupp = function() {
                o._.push(arguments);
              };
              o._ = [];
              s = d.getElementsByTagName('script')[0];
              c = d.createElement('script');
              c.type = 'text/javascript';
              c.charset = 'utf-8';
              c.async = true;
              c.src = 'https://www.smartsuppchat.com/loader.js?';
              s.parentNode.insertBefore(c, s);
            })(document);
          `}
        </Script>

        <noscript>
          Powered by{" "}
          <a
            href="https://www.smartsupp.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Smartsupp
          </a>
        </noscript>
      </body>
    </html>
  );
}
