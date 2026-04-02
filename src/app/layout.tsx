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
  description: "Carteira digital segura para BRL, EUR, USDT e BTC. Depósitos via PIX, saques instantâneos e swap de moedas.",
  keywords: ["NeXPay", "carteira digital", "wallet", "PIX", "Bitcoin", "USDT", "BRL", "EUR", "crypto", "swap"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
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
