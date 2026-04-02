'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function KycBanner() {
  const { showKycBanner } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!showKycBanner || dismissed) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 min-w-0">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-500" />
        <p className="truncate text-sm text-yellow-200">
          Conta com limites de transação restritos. Complete a sua verificação de identidade (KYC).
        </p>
        <Link
          href="/?kyc=true"
          className="flex-shrink-0 text-sm font-semibold text-yellow-300 underline underline-offset-2 transition-colors hover:text-yellow-100"
        >
          Verificar
        </Link>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 rounded-md p-1 text-yellow-400 transition-colors hover:bg-yellow-500/20 hover:text-yellow-200"
        aria-label="Fechar aviso"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
