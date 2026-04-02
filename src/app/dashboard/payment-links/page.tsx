'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { CheckoutLink } from '@/types/auth';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  CheckCircle2,
  Copy,
  Link2,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function formatCurrency(amount: number, currency: string): string {
  const validCurrencies = ['BRL', 'EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CNY'];
  if (validCurrencies.includes(currency)) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount);
  }
  return `${amount.toFixed(2)} ${currency}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Ativo',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  expired: {
    label: 'Expirado',
    className: 'bg-white/10 text-white/40 border-white/20',
  },
  paid: {
    label: 'Pago',
    className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  },
};

/* ─── Skeleton Rows ───────────────────────────────────────────────────── */

function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={i} className="border-white/5">
          <TableCell>
            <Skeleton className="h-4 w-36" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-14" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-24 ml-auto rounded" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────── */

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<CheckoutLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('BRL');
  const [amount, setAmount] = useState('');

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* ─── Fetch links ──────────────────────────────────────────────────── */
  const fetchLinks = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.listCheckoutLinks();
      setLinks(res.data || []);
    } catch {
      // api service already shows toast on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.listCheckoutLinks();
        if (!cancelled) setLinks(res.data || []);
      } catch {
        // handled by api service
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ─── Form helpers ─────────────────────────────────────────────────── */
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCurrency('BRL');
    setAmount('');
  };

  const handleCreate = async () => {
    if (!title.trim() || !amount || parseFloat(amount) <= 0) return;
    setCreating(true);
    try {
      await api.createCheckoutLink({
        title: title.trim(),
        description: description.trim() || undefined,
        currency,
        amount: parseFloat(amount),
      });
      setDialogOpen(false);
      resetForm();
      await fetchLinks(false);
    } catch {
      // handled by api service
    } finally {
      setCreating(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLinks(false);
  };

  /* ─── Copy URL ─────────────────────────────────────────────────────── */
  const handleCopyUrl = async (linkId: string) => {
    const url = `${window.location.origin}/c/${linkId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(linkId);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(linkId);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleOpenCheckout = (linkId: string) => {
    window.open(`/c/${linkId}`, '_blank');
  };

  /* ─── Render ───────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* ─── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Links de Pagamento</h1>
          <p className="text-sm text-gray-400 mt-1">
            Crie e gerencie links de pagamento para seus clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button
            onClick={() => setDialogOpen(true)}
            className="btn-green-enhanced h-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Link
          </Button>
        </div>
      </div>

      {/* ─── Data Table ──────────────────────────────────────────────── */}
      <div className="glass-strong rounded-xl overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto">
          <Table>
            <TableHeader className="glass-strong">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/60 font-semibold">Título</TableHead>
                <TableHead className="text-white/60 font-semibold">Moeda</TableHead>
                <TableHead className="text-white/60 font-semibold">Valor</TableHead>
                <TableHead className="text-white/60 font-semibold">Status</TableHead>
                <TableHead className="text-white/60 font-semibold">Criado em</TableHead>
                <TableHead className="text-white/60 font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <SkeletonRows />
              ) : links.length === 0 ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Link2 className="h-12 w-12 text-white/20" />
                      <p className="text-white/40 text-lg">Nenhum link criado</p>
                      <p className="text-white/25 text-sm">
                        Clique em &quot;Novo Link&quot; para começar
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => {
                  const status = statusConfig[link.status] || {
                    label: link.status,
                    className: 'bg-white/10 text-white/60 border-white/20',
                  };

                  return (
                    <TableRow
                      key={link.id}
                      className="glass border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <TableCell className="text-white font-medium">{link.title}</TableCell>
                      <TableCell className="text-white/70">{link.currency}</TableCell>
                      <TableCell className="text-white font-semibold">
                        {formatCurrency(link.amount, link.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/60 text-sm">
                        {formatDate(link.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyUrl(link.id)}
                            className="text-white/60 hover:text-white hover:bg-white/10 h-8 px-2"
                          >
                            {copiedId === link.id ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-400" />
                                <span className="text-emerald-400">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1.5" />
                                <span>Copiar URL</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenCheckout(link.id)}
                            className="text-white/60 hover:text-white hover:bg-white/10 h-8 px-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ─── Create Link Modal ───────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="glass-strong border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-400" />
              Novo Link de Pagamento
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Crie um link personalizado para receber pagamentos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Título */}
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Título *</Label>
              <Input
                placeholder="Ex: Plano Pro — Mensalidade"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input-enhanced h-11"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Descrição</Label>
              <Input
                placeholder="Descrição opcional do pagamento"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input-enhanced h-11"
              />
            </div>

            {/* Moeda & Valor */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Moeda *</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="form-input-enhanced h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10">
                    <SelectItem value="BRL">BRL (R$)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USDT">USDT ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Valor *</Label>
                <Input
                  type="number"
                  placeholder="0,00"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input-enhanced h-11"
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handleCreate}
              disabled={creating || !title.trim() || !amount || parseFloat(amount) <= 0}
              className="w-full btn-green-enhanced h-11"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Criar Link
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
