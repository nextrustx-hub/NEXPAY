'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Transaction } from '@/types/auth';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock } from 'lucide-react';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: string | undefined, currency?: string): string {
  if (!amount) return '—';
  const num = parseFloat(amount);
  const cur = currency || 'BRL';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: cur,
  }).format(num);
}

const typeColors: Record<string, string> = {
  deposit: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  withdraw: 'bg-red-500/20 text-red-400 border-red-500/30',
  swap: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const typeLabels: Record<string, string> = {
  deposit: 'Depósito',
  withdraw: 'Saque',
  swap: 'Swap',
};

const statusLabels: Record<string, string> = {
  completed: 'Concluído',
  pending: 'Pendente',
  failed: 'Falhou',
};

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i} className="border-white/5">
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await api.getTransactions(100);
      setTransactions(res.data.transactions);
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        await fetchTransactions();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [fetchTransactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Extrato</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Histórico completo de transações
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Table */}
      <div className="glass-strong rounded-xl overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto">
          <Table>
            <TableHeader className="glass-strong">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/60 font-semibold">Data</TableHead>
                <TableHead className="text-white/60 font-semibold">Tipo</TableHead>
                <TableHead className="text-white/60 font-semibold">Moeda</TableHead>
                <TableHead className="text-white/60 font-semibold">Valor</TableHead>
                <TableHead className="text-white/60 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <SkeletonRows />
              ) : transactions.length === 0 ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Clock className="h-12 w-12 text-white/20" />
                      <p className="text-white/40 text-lg">Nenhuma transação encontrada</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id} className="glass border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-white/80 text-sm">
                      {formatDate(tx.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={typeColors[tx.type] || 'bg-white/10 text-white/60 border-white/20'}
                      >
                        {typeLabels[tx.type] || tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white/80 text-sm font-medium">
                      {tx.currency_to
                        ? `${tx.currency_from}/${tx.currency_to}`
                        : tx.currency_from || '—'}
                    </TableCell>
                    <TableCell className="text-white font-semibold text-sm">
                      {formatCurrency(tx.amount_from, tx.currency_from)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[tx.status] || 'bg-white/10 text-white/60 border-white/20'}
                      >
                        {statusLabels[tx.status] || tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
