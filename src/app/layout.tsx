import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Footer from "@/components/layout/Footer";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#86efac" },
    { media: "(prefers-color-scheme: dark)", color: "#86efac" },
  ],
};

export const metadata: Metadata = {
  title: "NeXPay — Sua Carteira Digital Segura",
  description: "Carteira digital segura para BRL, EUR, USDT e BTC. Depósitos via PIX, saques instantâneos e swap de moedas.",
  keywords: ["NeXPay", "carteira digital", "wallet", "PIX", "Bitcoin", "USDT", "BRL", "EUR", "crypto", "swap"],
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
            <Footer />
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
