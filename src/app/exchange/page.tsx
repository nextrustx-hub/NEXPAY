'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowDownUp,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Wallet,
  ArrowLeftRight,
  Info,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Balances } from '@/types/auth';

const CURRENCIES = [
  { value: 'BRL', label: 'BRL', symbol: 'R$', icon: '💵' },
  { value: 'EUR', label: 'EUR', symbol: '€', icon: '💶' },
  { value: 'USDT', label: 'USDT', symbol: '₮', icon: ' CircleDollarSign' },
  { value: 'BTC', label: 'BTC', symbol: '₿', icon: '₿' },
] as const;

const formatCurrency = (value: number, currency: string): string => {
  if (currency === 'BRL') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  if (currency === 'EUR') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(value);
  return `${value.toFixed(currency === 'BTC' ? 8 : 2)} ${currency}`;
};

export default function ExchangePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [balances, setBalances] = useState<Balances | null>(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);

  const [fromCurrency, setFromCurrency] = useState('BRL');
  const [toCurrency, setToCurrency] = useState('USDT');
  const [amount, setAmount] = useState('');

  const [isSwapping, setIsSwapping] = useState(false);
  const [swapResult, setSwapResult] = useState<{
    from_amount: number;
    to_amount: number;
    fee_applied: string;
    transaction_id: string;
  } | null>(null);
  const [swapError, setSwapError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/?auth=login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBalances();
    }
  }, [isAuthenticated]);

  const loadBalances = async () => {
    try {
      setIsLoadingBalances(true);
      const response = await api.getBalance();
      if (response.success) setBalances(response.balances);
    } catch {} finally {
      setIsLoadingBalances(false);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount('');
    setSwapResult(null);
    setSwapError('');
  };

  const handleMaxAmount = () => {
    if (!balances) return;
    const max = balances[fromCurrency as keyof Balances] || 0;
    setAmount(max.toString());
    setSwapResult(null);
    setSwapError('');
  };

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setSwapError('Digite um valor válido');
      return;
    }
    if (fromCurrency === toCurrency) {
      setSwapError('Selecione moedas diferentes');
      return;
    }
    if (balances) {
      const available = balances[fromCurrency as keyof Balances] || 0;
      if (parseFloat(amount) > available) {
        setSwapError('Saldo insuficiente');
        return;
      }
    }

    setSwapError('');
    setIsSwapping(true);

    try {
      const response = await api.swap(fromCurrency, toCurrency, parseFloat(amount));
      if (response.success) {
        setSwapResult({
          from_amount: response.from_amount,
          to_amount: response.to_amount,
          fee_applied: response.fee_applied,
          transaction_id: response.transaction_id,
        });
        loadBalances();
      }
    } catch {
      setSwapError('Erro ao realizar conversão. Tente novamente.');
    } finally {
      setIsSwapping(false);
    }
  };

  const handleNewSwap = () => {
    setAmount('');
    setSwapResult(null);
    setSwapError('');
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  const getCurrencyLabel = (value: string) => {
    const cur = CURRENCIES.find(c => c.value === value);
    return cur ? cur.label : value;
  };

  const getCurrencySymbol = (value: string) => {
    const cur = CURRENCIES.find(c => c.value === value);
    return cur ? cur.symbol : '';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Conversor de Moedas</h1>
        </div>
        <p className="text-gray-400 ml-8">Converta entre BRL, EUR, USDT e BTC com taxas competitivas.</p>
      </motion.div>

      {/* Exchange Terminal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass-strong border border-white/10 rounded-2xl p-6 md:p-8">
          {/* Success State */}
          {swapResult ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-green-900/30 border-2 border-green-500/50 flex items-center justify-center"
                >
                  <CheckCircle2 className="h-10 w-10 text-green-400" />
                </motion.div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Conversão Realizada!</h2>
                <p className="text-gray-400">Sua conversão foi processada com sucesso.</p>
              </div>

              <Card className="glass border-white/10">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Você enviou</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(swapResult.from_amount, fromCurrency)}
                      </p>
                    </div>
                    <ArrowLeftRight className="h-5 w-5 text-neon-green" />
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Você recebeu</p>
                      <p className="text-xl font-bold text-neon-green">
                        {formatCurrency(swapResult.to_amount, toCurrency)}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Taxa aplicada</p>
                      <p className="text-white font-medium">{swapResult.fee_applied}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Transação</p>
                      <p className="text-white font-mono text-xs">{swapResult.transaction_id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleNewSwap}
                className="btn-green-enhanced py-6 text-lg px-8"
              >
                <ArrowLeftRight className="mr-2 h-5 w-5" />
                Nova Conversão
              </Button>
            </motion.div>
          ) : (
            /* Exchange Form */
            <div className="space-y-6">
              {/* Pay Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Você Paga</label>
                  {!isLoadingBalances && balances && (
                    <button
                      onClick={handleMaxAmount}
                      className="text-xs text-neon-green hover:text-green-300 font-medium transition-colors"
                    >
                      Máx: {formatCurrency(balances[fromCurrency as keyof Balances] || 0, fromCurrency)}
                    </button>
                  )}
                </div>
                <Card className="glass border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Select value={fromCurrency} onValueChange={(val) => { setFromCurrency(val); if (val === toCurrency) setToCurrency(fromCurrency); setSwapResult(null); setSwapError(''); }}>
                        <SelectTrigger className="w-[130px] form-input-enhanced h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.symbol} {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => { setAmount(e.target.value); setSwapResult(null); setSwapError(''); }}
                          className="form-input-enhanced h-12 text-right text-xl font-semibold"
                          disabled={isSwapping}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Swap Button (between cards) */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSwapCurrencies}
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-neon-green transition-colors"
                >
                  <ArrowDownUp className="h-5 w-5" />
                </Button>
              </div>

              {/* Receive Card */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Você Recebe</label>
                <Card className="glass border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Select value={toCurrency} onValueChange={(val) => { setToCurrency(val); if (val === fromCurrency) setFromCurrency(toCurrency); setSwapResult(null); setSwapError(''); }}>
                        <SelectTrigger className="w-[130px] form-input-enhanced h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.symbol} {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder="0.00"
                          value={amount && parseFloat(amount) > 0 ? `≈ ${formatCurrency(parseFloat(amount) * (toCurrency === 'BTC' ? 0.000015 : toCurrency === 'USDT' ? 5.12 : 0.18), toCurrency)}` : ''}
                          readOnly
                          className="form-input-enhanced h-12 text-right text-xl font-semibold text-neon-green/70"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Error */}
              {swapError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 text-center bg-red-900/20 border border-red-500/30 rounded-lg p-3"
                >
                  {swapError}
                </motion.div>
              )}

              {/* Fee Info */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Info className="h-3 w-3" />
                <span>Taxa: <span className="text-neon-green font-medium">0.5%</span> por conversão</span>
              </div>

              {/* Convert Button */}
              <Button
                onClick={handleSwap}
                disabled={isSwapping || !amount || parseFloat(amount) <= 0}
                className="w-full btn-green-enhanced py-7 text-xl font-bold"
              >
                {isSwapping ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="mr-2 h-6 w-6" />
                    Converter {getCurrencySymbol(fromCurrency)} {getCurrencyLabel(fromCurrency)} → {getCurrencySymbol(toCurrency)} {getCurrencyLabel(toCurrency)}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Balance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-neon-green" />
              Saldos Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBalances ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-white/5 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {CURRENCIES.map((c) => {
                  const bal = balances?.[c.value as keyof Balances] || 0;
                  return (
                    <div
                      key={c.value}
                      className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 transition-colors cursor-pointer"
                      onClick={() => { setFromCurrency(c.value); setAmount(''); setSwapResult(null); setSwapError(''); }}
                    >
                      <p className="text-xs text-gray-500 mb-1">{c.symbol} {c.label}</p>
                      <p className="text-lg font-bold text-white">{formatCurrency(bal, c.value)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
