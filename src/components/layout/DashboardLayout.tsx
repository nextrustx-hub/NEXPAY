'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { NeXPayLogo } from './NeXPayLogo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, LogIn } from 'lucide-react';
import { useEffect, useRef } from 'react';
import Footer from './Footer';

// ─── TradingView Ticker Tape Widget (Free, Official) ──────────────────────
function TradingViewTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    if (containerRef.current.querySelector('script')) return;
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'BITSTAMP:BTCUSD', title: 'BTC/USD' },
        { proName: 'BINANCE:ETHUSDT', title: 'ETH/USDT' },
        { proName: 'BITSTAMP:LTCUSD', title: 'LTC/USDT' },
        { proName: 'KRAKEN:XMRUSD', title: 'XMR/USDT' },
        { proName: 'FX:EURBRL', title: 'EUR/BRL' },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'br',
    });
    containerRef.current.appendChild(script);
  }, []);
  return (
    <div className="w-full border-b border-white/5 bg-black/30">
      <div ref={containerRef} className="tradingview-widget-container">
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        {/* ─── Sticky Header ─── */}
        <header className="flex h-14 items-center gap-3 border-b border-white/10 px-4 bg-background/95 backdrop-blur-sm sticky top-0 z-40 shrink-0">
          {isAuthenticated && (
            <SidebarTrigger className="-ml-1 text-gray-400 hover:text-white" />
          )}
          <NeXPayLogo size="md" className="hidden sm:flex" />
          <NeXPayLogo size="sm" showText={false} className="sm:hidden" />
          <div className="flex-1" />
          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/?auth=login" className="text-gray-300 hover:text-white">
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Login
                </Link>
              </Button>
              <Button size="sm" asChild className="btn-green-enhanced">
                <Link href="/?auth=register">
                  <Wallet className="h-4 w-4 mr-1.5" />
                  Criar Conta
                </Link>
              </Button>
            </div>
          )}
        </header>

        {/* ─── TradingView Ticker (auth users only) ─── */}
        {isAuthenticated && <TradingViewTicker />}

        {/* ─── Main Content ─── */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>

        {/* ─── Footer (INSIDE SidebarInset so it participates in the CSS grid) ─── */}
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
