import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import KycBanner from "@/components/layout/KycBanner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4ADE80",
};

export const metadata: Metadata = {
  title: "NeXPay — Sua Carteira Digital Segura",
  description: "Carteira digital segura para BRL, EUR, USDT e BTC. Depósitos via PIX, SEPA e Crypto. Saques instantâneos e swap de moedas com taxas competitivas.",
  keywords: ["NeXPay", "carteira digital", "wallet", "PIX", "SEPA", "Bitcoin", "USDT", "BRL", "EUR", "crypto", "swap", "NexTrustX"],
  authors: [{ name: "NexTrustX" }],
  creator: "NexTrustX",
  publisher: "NexTrustX",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://nexpay.com",
    siteName: "NeXPay",
    title: "NeXPay — Sua Carteira Digital Segura",
    description: "Carteira digital segura para BRL, EUR, USDT e BTC. Depósitos via PIX, SEPA e Crypto. Saques instantâneos e swap de moedas.",
    images: [
      {
        url: "/logo-512.png",
        width: 512,
        height: 512,
        alt: "NeXPay Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "NeXPay — Sua Carteira Digital Segura",
    description: "Carteira digital segura para BRL, EUR, USDT e BTC.",
    images: ["/logo-512.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NeXPay",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground overscroll-none`}
      >
        <AuthProvider>
          <div className="animated-bg" />
          <div className="relative min-h-screen flex flex-col">
            <KycBanner />
            <DashboardLayout>
              {children}
            </DashboardLayout>
          </div>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              },
              className: 'glass-strong',
            }}
            richColors
            closeButton
          />
        </AuthProvider>
      </body>
    </html>
  );
}
