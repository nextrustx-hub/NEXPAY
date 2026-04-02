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
  Copy,
  Check,
  Link2,
  Loader2,
} from 'lucide-react';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  expired: 'bg-white/10 text-white/40 border-white/20',
  paid: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  expired: 'Expirado',
  paid: 'Pago',
};

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<CheckoutLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('BRL');
  const [amount, setAmount] = useState('');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.listCheckoutLinks();
        if (!cancelled) setLinks(res.data || []);
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCurrency('BRL');
    setAmount('');
  };

  const handleCreate = async () => {
    if (!title.trim() || !amount) return;
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
      setLoading(true);
      try {
        const res = await api.listCheckoutLinks();
        setLinks(res.data || []);
      } catch {}
    } catch {}
    setLoading(false);
    setCreating(false);
  };

  const handleCopyLink = async (paymentUrl: string, linkId: string) => {
    const fullUrl = `${window.location.origin}${paymentUrl}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopiedId(linkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Links de Pagamento</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crie e gerencie links de pagamento personalizados
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="btn-green-enhanced"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Link
        </Button>
      </div>

      {/* Table */}
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
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto rounded" /></TableCell>
                  </TableRow>
                ))
              ) : links.length === 0 ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Link2 className="h-12 w-12 text-white/20" />
                      <p className="text-white/40 text-lg">Nenhum link criado ainda</p>
                      <p className="text-white/25 text-sm">Clique em &quot;Novo Link&quot; para começar</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
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
                      <Badge
                        variant="outline"
                        className={statusColors[link.status] || 'bg-white/10 text-white/60 border-white/20'}
                      >
                        {statusLabels[link.status] || link.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white/60 text-sm">
                      {formatDate(link.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(link.payment_url, link.id)}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        {copiedId === link.id ? (
                          <Check className="h-4 w-4 mr-1.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1.5" />
                        )}
                        {copiedId === link.id ? 'Copiado!' : 'Copiar Link'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="glass-strong border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-400" />
              Novo Link de Pagamento
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Crie um link de pagamento para receber valores
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Título *</Label>
              <Input
                placeholder="Ex: Plano Pro - Mensalidade"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input-enhanced h-11"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Descrição</Label>
              <Input
                placeholder="Descrição opcional do pagamento"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input-enhanced h-11"
              />
            </div>

            {/* Currency & Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Moeda *</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="form-input-enhanced h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10">
                    <SelectItem value="BRL">BRL (R$)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
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

            <Button
              onClick={handleCreate}
              disabled={creating || !title.trim() || !amount || parseFloat(amount) <= 0}
              className="w-full btn-green-enhanced h-11"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              Criar Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
