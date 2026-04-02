'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Wallet, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { label: 'Carteira', href: '/#wallet' },
    { label: 'Transações', href: '/#transactions' },
    { label: 'Swap', href: '/#swap' },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="glass-strong sticky top-0 z-50 border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
          <Image src="/logo.png" alt="NeXPay" width={32} height={32} className="rounded" />
          <span className="text-lg font-bold text-white">NeXPay</span>
        </Link>

        {/* Desktop nav items */}
        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <User className="h-4 w-4 text-gray-300" />
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-1.5 text-gray-300 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/?auth=login" className="gap-1.5 text-gray-300 hover:text-white">
                  Login
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/?auth=register" className="gap-1.5">
                  <Wallet className="h-4 w-4" />
                  Criar Conta
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex items-center justify-center rounded-md p-2 text-gray-300 hover:text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 md:hidden">
          <div className="space-y-1 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                onClick={closeMobile}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-white/10 px-4 py-4">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <User className="h-4 w-4 text-gray-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{user.name}</p>
                    <p className="truncate text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-gray-300 hover:text-white"
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-gray-300 hover:text-white"
                  asChild
                  onClick={closeMobile}
                >
                  <Link href="/?auth=login">Login</Link>
                </Button>
                <Button className="w-full justify-center gap-2" asChild onClick={closeMobile}>
                  <Link href="/?auth=register">
                    <Wallet className="h-4 w-4" />
                    Criar Conta
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
