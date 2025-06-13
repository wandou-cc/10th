import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Designer Portfolio - Showcase Your Creative Work",
  description: "Professional designer portfolio helping startups and brands craft expressive and engaging solutions for their software needs.",
  keywords: ["design", "portfolio", "UI/UX", "web design", "creative", "designer"],
  authors: [{ name: "Designer Portfolio" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
} 