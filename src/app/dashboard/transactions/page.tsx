'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Clock,
  RefreshCw,
  CalendarIcon,
  Filter,
} from 'lucide-react';

/* ─── Helpers ──────────────────────────────────────────────────────────── */

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
  const validCurrencies = ['BRL', 'EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CNY'];
  if (validCurrencies.includes(cur)) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: cur }).format(num);
  }
  return `${num.toFixed(2)} ${cur}`;
}

/* ─── Config Maps ──────────────────────────────────────────────────────── */

const typeConfig: Record<string, { label: string; className: string }> = {
  deposit: {
    label: 'Depósito',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  withdraw: {
    label: 'Saque',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  swap: {
    label: 'Swap',
    className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: {
    label: 'Concluído',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  pending: {
    label: 'Pendente',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  failed: {
    label: 'Falhou',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
};

/* ─── Skeleton Rows ───────────────────────────────────────────────────── */

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i} className="border-white/5">
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

/* ─── Summary Card Component ──────────────────────────────────────────── */

function SummaryCard({
  title,
  value,
  accent,
  icon: Icon,
}: {
  title: string;
  value: string;
  accent: 'green' | 'red' | 'cyan';
  icon: React.ElementType;
}) {
  const accentColors = {
    green: {
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
      iconText: 'text-emerald-400',
      valueText: 'text-emerald-400',
    },
    red: {
      border: 'border-red-500/20',
      iconBg: 'bg-red-500/10',
      iconText: 'text-red-400',
      valueText: 'text-red-400',
    },
    cyan: {
      border: 'border-cyan-500/20',
      iconBg: 'bg-cyan-500/10',
      iconText: 'text-cyan-400',
      valueText: 'text-cyan-400',
    },
  };

  const c = accentColors[accent];

  return (
    <div className={`glass-strong rounded-xl p-4 border ${c.border}`}>
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 ${c.iconText}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-400 truncate">{title}</p>
          <p className={`text-lg font-bold ${c.valueText} truncate`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────── */

export default function TransactionsPage() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  /* ─── Fetch transactions ──────────────────────────────────────────── */
  const fetchTransactions = useCallback(async () => {
    try {
      const res = await api.getTransactions(100);
      setAllTransactions(res.data.transactions || []);
    } catch {
      // handled by api service
    }
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
    return () => {
      cancelled = true;
    };
  }, [fetchTransactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  /* ─── Filtered data ───────────────────────────────────────────────── */
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Currency filter
      if (currencyFilter !== 'all') {
        const txCur = tx.currency_to
          ? `${tx.currency_from}/${tx.currency_to}`
          : tx.currency_from || '';
        if (!txCur.includes(currencyFilter)) return false;
      }

      // Date filter
      if (startDate) {
        const txDate = new Date(tx.created_at);
        if (txDate < startDate) return false;
      }

      return true;
    });
  }, [allTransactions, typeFilter, currencyFilter, startDate]);

  /* ─── Summary calculations ────────────────────────────────────────── */
  const summary = useMemo(() => {
    let deposits = 0;
    let withdraws = 0;
    let swapVolume = 0;

    allTransactions.forEach((tx) => {
      if (tx.status !== 'completed') return;
      const amt = parseFloat(tx.amount_from || '0');

      if (tx.type === 'deposit') {
        deposits += amt;
      } else if (tx.type === 'withdraw') {
        withdraws += amt;
      } else if (tx.type === 'swap') {
        swapVolume += amt;
      }
    });

    return { deposits, withdraws, swapVolume };
  }, [allTransactions]);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  /* ─── Clear filters ───────────────────────────────────────────────── */
  const hasActiveFilters = typeFilter !== 'all' || currencyFilter !== 'all' || !!startDate;
  const clearFilters = () => {
    setTypeFilter('all');
    setCurrencyFilter('all');
    setStartDate(undefined);
  };

  /* ─── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* ─── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Extrato</h1>
          <p className="text-sm text-gray-400 mt-1">
            Histórico completo de transações com análise
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* ─── Summary Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Entradas Acumuladas"
          value={formatBRL(summary.deposits)}
          accent="green"
          icon={TrendingUp}
        />
        <SummaryCard
          title="Saídas Acumuladas"
          value={formatBRL(summary.withdraws)}
          accent="red"
          icon={TrendingDown}
        />
        <SummaryCard
          title="Volume de Swap"
          value={formatBRL(summary.swapVolume)}
          accent="cyan"
          icon={ArrowLeftRight}
        />
      </div>

      {/* ─── Advanced Filters Row ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>

        {/* Type filter */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="form-input-enhanced h-10 w-[160px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-white/10">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="deposit">Depósito</SelectItem>
            <SelectItem value="withdraw">Saque</SelectItem>
            <SelectItem value="swap">Swap</SelectItem>
          </SelectContent>
        </Select>

        {/* Currency filter */}
        <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
          <SelectTrigger className="form-input-enhanced h-10 w-[140px]">
            <SelectValue placeholder="Moeda" />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-white/10">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="BRL">BRL</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="USDT">USDT</SelectItem>
            <SelectItem value="BTC">BTC</SelectItem>
          </SelectContent>
        </Select>

        {/* Date picker */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`form-input-enhanced h-10 justify-start text-left font-normal ${
                startDate ? 'text-white' : 'text-gray-400'
              }`}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {startDate
                ? startDate.toLocaleDateString('pt-BR')
                : 'Data inicial'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#111] border-white/10" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                setStartDate(date);
                setCalendarOpen(false);
              }}
              className="bg-[#111] text-white"
            />
          </PopoverContent>
        </Popover>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-400 hover:text-white h-10"
          >
            Limpar
          </Button>
        )}

        {/* Results count */}
        <span className="text-xs text-gray-500 ml-auto">
          {filteredTransactions.length} transação(ões)
        </span>
      </div>

      {/* ─── Data Table ─────────────────────────────────────────────── */}
      <div className="glass-strong rounded-xl overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto">
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
              ) : filteredTransactions.length === 0 ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Clock className="h-12 w-12 text-white/20" />
                      <p className="text-white/40 text-lg">Nenhuma transação encontrada</p>
                      {hasActiveFilters && (
                        <p className="text-white/25 text-sm">
                          Tente ajustar os filtros
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => {
                  const type = typeConfig[tx.type] || {
                    label: tx.type,
                    className: 'bg-white/10 text-white/60 border-white/20',
                  };
                  const status = statusConfig[tx.status] || {
                    label: tx.status,
                    className: 'bg-white/10 text-white/60 border-white/20',
                  };

                  return (
                    <TableRow
                      key={tx.id}
                      className="glass border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <TableCell className="text-white/80 text-sm">
                        {formatDate(tx.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={type.className}>
                          {type.label}
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
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
