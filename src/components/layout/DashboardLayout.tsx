'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { NeXPayLogo } from './NeXPayLogo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, LogIn } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b border-white/10 px-4 glass-strong sticky top-0 z-40">
          {isAuthenticated && (
            <SidebarTrigger className="-ml-1 text-gray-400 hover:text-white" />
          )}
          {/* Logo - always visible */}
          <NeXPayLogo size="md" className="hidden sm:flex" />
          <NeXPayLogo size="sm" showText={false} className="sm:hidden" />
          <div className="flex-1" />
          {/* Auth actions for non-authenticated users */}
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
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
