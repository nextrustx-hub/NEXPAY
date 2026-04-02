'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import type { CheckoutDetails } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  QrCode,
  Copy,
  Check,
  Shield,
  AlertCircle,
  Loader2,
} from 'lucide-react';

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function formatAmount(amount: number, currency: string): string {
  const validCurrencies = ['BRL', 'EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CNY'];
  if (validCurrencies.includes(currency)) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount);
  }
  return `${amount.toFixed(2)} ${currency}`;
}

/* ─── Main Component ──────────────────────────────────────────────────── */

export default function CheckoutPage() {
  const params = useParams();
  const id = params?.id as string;

  const [checkout, setCheckout] = useState<CheckoutDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  /* ─── Fetch checkout details ───────────────────────────────────────── */
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await api.getCheckoutDetails(id);
        if (!cancelled) setCheckout(res);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  /* ─── Copy PIX code ────────────────────────────────────────────────── */
  const handleCopyPix = async () => {
    if (!checkout?.data?.pix_copy_paste) return;
    try {
      await navigator.clipboard.writeText(checkout.data.pix_copy_paste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = checkout.data.pix_copy_paste;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  /* ─── Loading State ────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          <p className="text-gray-500 text-sm">Carregando pagamento...</p>
        </div>
      </div>
    );
  }

  /* ─── Error State ──────────────────────────────────────────────────── */
  if (error || !checkout) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Link inválido ou expirado
          </h1>
          <p className="text-gray-500 text-sm">
            Este link de pagamento não existe ou expirou. Entre em contato com o vendedor para obter um novo link.
          </p>
        </div>
      </div>
    );
  }

  const { data } = checkout;

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* ─── Main Receipt Card ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header with logo */}
          <div className="p-6 pb-0">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/logo.png"
                alt="NeXPay"
                width={120}
                height={36}
                className="h-9 w-auto"
                priority
              />
            </div>

            {/* Product title */}
            <h1 className="text-xl font-semibold text-gray-900 text-center">
              {data.title}
            </h1>

            {/* Description */}
            {data.description && (
              <p className="text-sm text-gray-500 text-center mt-1">
                {data.description}
              </p>
            )}

            {/* Amount — prominently displayed */}
            <div className="mt-6 mb-6 text-center">
              <p className="text-4xl font-bold text-gray-900 tracking-tight">
                {formatAmount(data.amount, data.currency)}
              </p>
            </div>
          </div>

          <div className="px-6">
            <Separator className="bg-gray-100" />
          </div>

          {/* ─── PIX Payment Section ──────────────────────────────────── */}
          <div className="p-6 space-y-5">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-4">
                Pagar via PIX
              </p>

              {/* QR Code — render base64 or placeholder */}
              {data.pix_code ? (
                <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden border border-gray-100 mb-5">
                  <img
                    src={'data:image/png;base64,' + data.pix_code}
                    alt="QR Code PIX"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-5">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <QrCode className="h-16 w-16" />
                    <span className="text-xs">QR Code</span>
                  </div>
                </div>
              )}

              {/* Copy-paste PIX code */}
              {data.pix_copy_paste && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-medium">
                    Código PIX Copia e Cola
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={data.pix_copy_paste}
                      className="flex-1 font-mono text-xs bg-gray-50 border-gray-200 text-gray-600 h-10 pr-2"
                    />
                    <Button
                      onClick={handleCopyPix}
                      className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-1.5" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1.5" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Footer ───────────────────────────────────────────────── */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Pagamento seguro via NeXPay</span>
              <span className="text-gray-300 mx-1">•</span>
              <span className="text-gray-400">Powered by NexTrustX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
