import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "coinHyper - Advanced Blockchain Tools & Analytics Platform | 先进区块链工具平台",
  description: "Transform your blockchain experience with coinHyper's advanced analytics tools, real-time market insights, and comprehensive DeFi solutions. Unleash your full potential in the digital world. | coinHyper 提供先进的区块链分析工具、实时市场洞察和全面的DeFi解决方案。",
  keywords: [
    // English keywords
    "blockchain tools", "crypto analytics", "DeFi platform", "Web3 tools", 
    "cryptocurrency analysis", "on-chain data", "market insights", "digital assets",
    "crypto market analysis", "blockchain analytics", "DeFi tools", "crypto trading tools",
    "blockchain data", "cryptocurrency tracking", "Web3 analytics", "crypto portfolio",
    // Chinese keywords  
    "区块链工具", "加密货币分析", "DeFi工具", "链上数据", "市场分析", 
    "Web3工具", "数字资产", "投资工具", "区块链信息", "加密货币追踪"
  ],
  authors: [{ name: "coinHyper Team", url: "https://coinhyper.com" }],
  creator: "coinHyper",
  publisher: "coinHyper",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-token', // 替换为实际的验证码
  },
  alternates: {
    canonical: 'https://coinhyper.com',
    languages: {
      'en': 'https://coinhyper.com/en',
      'zh': 'https://coinhyper.com/zh',
      'zh-CN': 'https://coinhyper.com/zh',
    },
  },
  openGraph: {
    title: "coinHyper - Advanced Blockchain Tools & Analytics Platform",
    description: "Transform your blockchain experience with advanced analytics tools, real-time market insights, and comprehensive DeFi solutions. Unleash your full potential in the digital world.",
    type: "website",
    url: "https://coinhyper.com",
    siteName: "coinHyper",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
    images: [
      {
        url: "https://coinhyper.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "coinHyper - Advanced Blockchain Tools Platform",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@coinHyper",
    creator: "@coinHyper",
    title: "coinHyper - Advanced Blockchain Tools & Analytics Platform",
    description: "Transform your blockchain experience with advanced analytics tools and real-time market insights. Unleash your full potential in the digital world.",
    images: ["https://coinhyper.com/twitter-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#0ea5e9" },
    ],
  },
  manifest: "/site.webmanifest",
  category: "Technology",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'coinHyper',
    alternateName: 'coinHyper Blockchain Tools',
    url: 'https://coinhyper.com',
    description: 'Advanced blockchain tools and analytics platform for cryptocurrency and DeFi analysis',
    publisher: {
      '@type': 'Organization',
      name: 'coinHyper',
      url: 'https://coinhyper.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://coinhyper.com/logo.png',
        width: 512,
        height: 512,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://coinhyper.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    sameAs: [
      'https://twitter.com/coinHyper',
      'https://github.com/coinHyper',
      'https://linkedin.com/company/coinHyper',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://coinhyper.com" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 