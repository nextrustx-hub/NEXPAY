'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { ApiKey } from '@/types/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Key,
  Plus,
  Copy,
  Check,
  AlertTriangle,
  Webhook,
  Loader2,
} from 'lucide-react';

export default function DevelopersPage() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editedWebhookUrl, setEditedWebhookUrl] = useState<string | null>(null);
  const webhookUrl = editedWebhookUrl ?? user?.webhook_url ?? '';
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookSaved, setWebhookSaved] = useState(false);

  // Fetch existing API keys
  useEffect(() => {
    async function loadKeys() {
      try {
        const res = await api.getApiKeys();
        setApiKeys(res.data || []);
      } catch {}
      setLoadingKeys(false);
    }
    loadKeys();
  }, []);



  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const res = await api.generateApiKey();
      setNewKey(res.data.key);
      setDialogOpen(true);
      // Refresh list
      const list = await api.getApiKeys();
      setApiKeys(list.data || []);
    } catch {}
    setGenerating(false);
  };

  const handleCopyKey = async () => {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMasked = async (key: string) => {
    await navigator.clipboard.writeText(key);
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) return;
    setWebhookLoading(true);
    try {
      await api.configWebhook(webhookUrl.trim());
      setWebhookSaved(true);
      setTimeout(() => setWebhookSaved(false), 3000);
    } catch {}
    setWebhookLoading(false);
  };

  function formatKeyDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Desenvolvedores</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie suas chaves de API e webhooks
        </p>
      </div>

      {/* API Keys Section */}
      <div className="glass-strong rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Key className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Chaves de API</h2>
              <p className="text-xs text-muted-foreground">
                Autentique requisições para a API NeXPay
              </p>
            </div>
          </div>
          <Button
            onClick={handleGenerateKey}
            disabled={generating}
            className="btn-green-enhanced"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Gerar Nova Chave
          </Button>
        </div>

        {/* Keys List */}
        <div className="rounded-lg border border-white/5 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {loadingKeys ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Key className="h-10 w-10 text-white/15" />
                <p className="text-white/40 text-sm">Nenhuma chave gerada ainda</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="flex items-center justify-between p-4 glass hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="font-mono text-sm text-white/70 bg-white/5 px-3 py-1.5 rounded-md">
                        {apiKey.key.slice(0, 12)}***{apiKey.key.slice(-4)}
                      </div>
                      <span className="text-xs text-white/40">
                        {formatKeyDate(apiKey.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={
                          apiKey.is_active
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }
                      >
                        {apiKey.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
                        onClick={() => handleCopyMasked(apiKey.key)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="glass-strong rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Webhook className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Webhooks</h2>
            <p className="text-xs text-muted-foreground">
              Receba notificações de eventos em tempo real
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <Input
            placeholder="https://seu-servidor.com/webhook"
            value={webhookUrl}
            onChange={(e) => setEditedWebhookUrl(e.target.value)}
            className="flex-1 form-input-enhanced h-11"
          />
          <Button
            onClick={handleSaveWebhook}
            disabled={webhookLoading}
            className="btn-cyan-enhanced min-w-[100px]"
          >
            {webhookLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : webhookSaved ? (
              <Check className="h-4 w-4 mr-2" />
            ) : null}
            {webhookSaved ? 'Salvo!' : 'Salvar'}
          </Button>
        </div>

        {webhookSaved && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <Check className="h-4 w-4" />
            <span>Webhook configurado com sucesso</span>
          </div>
        )}
      </div>

      {/* New Key Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-strong border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-400" />
              Nova Chave de API
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Sua chave foi gerada com sucesso
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Warning */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200/80">
                Esta chave <strong>NÃO</strong> será exibida novamente. Guarde-a em local seguro.
              </p>
            </div>

            {/* Key display */}
            <div className="space-y-2">
              <label className="text-xs text-white/50 font-medium">Chave de API</label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={newKey || ''}
                  className="font-mono text-xs bg-white/5 border-white/10 text-white/90"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyKey}
                  className="shrink-0 border-white/10 bg-white/5 hover:bg-white/10 text-white"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              onClick={() => setDialogOpen(false)}
              className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/10"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
