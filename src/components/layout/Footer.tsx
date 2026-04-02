'use client';

import React from 'react';
import { MessageCircle, Send, MessageSquare, FileText, Shield } from 'lucide-react';
import { NeXPayLogo } from './NeXPayLogo';

export default function Footer() {
  return (
    <footer className="glass-strong mt-16 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <NeXPayLogo size="md" />
            <p className="text-sm leading-relaxed text-gray-400">
              Sua carteira digital completa. Envie, receba e troque moedas com segurança e agilidade.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Serviços</h3>
            <ul className="space-y-3">
              <li>
                <a href="/#wallet" className="text-sm text-gray-400 transition-colors hover:text-white">
                  Carteira Digital
                </a>
              </li>
              <li>
                <a href="/#transactions" className="text-sm text-gray-400 transition-colors hover:text-white">
                  Transações
                </a>
              </li>
              <li>
                <a href="/#swap" className="text-sm text-gray-400 transition-colors hover:text-white">
                  Swap de Moedas
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Suporte</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/5500000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/nexpay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Telegram
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/nexpay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="mailto:suporte@nexpay.com"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>

          {/* Legal — external links to nextrustx.com */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://nextrustx.com/termos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Termos de Uso
                </a>
              </li>
              <li>
                <a
                  href="https://nextrustx.com/privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} NeXPay. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors hover:text-white"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <a
              href="https://t.me/nexpay"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors hover:text-white"
              aria-label="Telegram"
            >
              <Send className="h-5 w-5" />
            </a>
            <a
              href="https://discord.gg/nexpay"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors hover:text-white"
              aria-label="Discord"
            >
              <MessageSquare className="h-5 w-5" />
            </a>
            <a
              href="https://nextrustx.com/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors hover:text-white"
              aria-label="Privacidade"
            >
              <FileText className="h-5 w-5" />
            </a>
            <a
              href="https://nextrustx.com/termos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors hover:text-white"
              aria-label="Termos"
            >
              <Shield className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
