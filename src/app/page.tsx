'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Wallet, ArrowRight, Shield, Zap, Clock, Bitcoin,
  CircleDollarSign, LogIn,
  UserPlus, Eye, EyeOff, Loader2, ArrowLeftRight,
  QrCode, Send, Copy, RefreshCw, Crown, User,
  CheckCircle2, AlertTriangle, Coins, Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Tier, Balances, Transaction, DepositResponse, SepaDepositResponse, PixDepositResponse, CryptoDepositFiatResponse } from '@/types/auth';
import { toast } from 'sonner';

const formatCPF = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

function AuthForm() {
  const searchParams = useSearchParams();
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [cpf, setCpf] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const authParam = searchParams.get('auth');
    if (authParam === 'register') setMode('register');
    else if (authParam === 'login') setMode('login');
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      window.history.pushState({}, '', '/');
    }
  }, [isAuthenticated, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (password !== confirmPassword) throw new Error('As senhas não coincidem');
        if (password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres');
        
        const tier: Tier = isVip ? 'BLACK' : 'WHITE';
        const displayName = isVip ? alias : name;
        
        if (!isVip && !cpf) throw new Error('CPF é obrigatório para conta WHITE');
        if (isVip && !alias) throw new Error('Vulgo/Alias é obrigatório para conta BLACK');
        
        await register(email, password, displayName, tier, isVip ? undefined : cpf.replace(/\D/g, ''));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar solicitação';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setAlias('');
    setCpf('');
    setConfirmPassword('');
    setIsVip(false);
  };

  return (
    <div className="auth-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
      >
        <Card className={`glass-strong border-white/10 ${isVip && mode === 'register' ? 'border-gray-600/50' : ''}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image src="/logo.png" alt="NeXPay" width={64} height={64} className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {mode === 'login' ? 'Entrar na' : 'Criar Conta'}{' '}
              <span className="font-extrabold tracking-tight">N<span className="text-neon-green">e</span>X<span className="text-neon-green">P</span>ay</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              {mode === 'login' 
                ? 'Digite suas credenciais para acessar sua carteira' 
                : 'Escolha seu tipo de conta e comece agora'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className={`p-4 rounded-lg border-2 transition-all ${isVip ? 'bg-gray-900/50 border-gray-600' : 'bg-transparent border-white/10'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {!isVip ? <User className="h-5 w-5 text-neon-green" /> : <Crown className="h-5 w-5 text-gray-300" />}
                      <div>
                        <p className={`font-medium ${isVip ? 'text-gray-300' : 'text-white'}`}>
                          {isVip ? 'Conta VIP (BLACK)' : 'Conta Padrão (WHITE)'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isVip ? 'Privacidade total, sem KYC obrigatório' : 'Conformidade total, KYC necessário'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${!isVip ? 'text-neon-green' : 'text-gray-500'}`}>WHITE</span>
                      <Switch checked={isVip} onCheckedChange={setIsVip} className="data-[state=checked]:bg-gray-600" />
                      <span className={`text-xs ${isVip ? 'text-gray-300' : 'text-gray-500'}`}>BLACK</span>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'register' && !isVip && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Nome Completo</Label>
                  <Input id="name" type="text" placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} required className="form-input-enhanced" disabled={isLoading} />
                </div>
              )}

              {mode === 'register' && isVip && (
                <div className="space-y-2">
                  <Label htmlFor="alias" className="text-gray-300">Vulgo / Alias</Label>
                  <Input id="alias" type="text" placeholder="Seu pseudônimo (ex: CryptoKing)" value={alias} onChange={(e) => setAlias(e.target.value)} required className="form-input-enhanced border-gray-600/50" disabled={isLoading} />
                  <p className="text-xs text-gray-500">Sua identidade permanece anônima</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input-enhanced" disabled={isLoading} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Senha</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="form-input-enhanced pr-10" disabled={isLoading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Senha</Label>
                    <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="form-input-enhanced" disabled={isLoading} />
                  </div>

                  {!isVip && (
                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="text-gray-300">CPF <span className="text-red-400">*</span></Label>
                      <Input id="cpf" type="text" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} required maxLength={14} className="form-input-enhanced" disabled={isLoading} />
                      <p className="text-xs text-gray-500">Necessário para verificação de identidade (KYC)</p>
                    </div>
                  )}
                </>
              )}

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
                  <span>{error}</span>
                </motion.div>
              )}

              <Button type="submit" className={`w-full py-6 text-lg ${isVip && mode === 'register' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'btn-green-enhanced'}`} disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{mode === 'login' ? 'Entrando...' : 'Criando conta...'}</>
                ) : (
                  <>{mode === 'login' ? <><LogIn className="mr-2 h-5 w-5" />Entrar</> : <><UserPlus className="mr-2 h-5 w-5" />Criar Conta {isVip ? 'VIP' : ''}</>}</>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                <button onClick={switchMode} className="text-neon-green hover:underline font-medium" disabled={isLoading}>
                  {mode === 'login' ? 'Criar conta' : 'Fazer login'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();

  // Balance & transactions state
  const [balances, setBalances] = useState<Balances | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  // Deposit modal state
  const [showDeposit, setShowDeposit] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // PIX deposit
  const [pixAmount, setPixAmount] = useState('');
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixCopyPaste, setPixCopyPaste] = useState<string | null>(null);
  const [isDepositingPix, setIsDepositingPix] = useState(false);

  // SEPA deposit
  const [sepaAmount, setSepaAmount] = useState('');
  const [sepaResult, setSepaResult] = useState<SepaDepositResponse['bank_details'] | null>(null);
  const [isDepositingSepa, setIsDepositingSepa] = useState(false);

  // Crypto deposit
  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC');
  const [usdtNetwork, setUsdtNetwork] = useState<string>('TRC20');
  const [cryptoResult, setCryptoResult] = useState<{ address: string; network: string; min_deposit: string } | null>(null);
  const [isDepositingCrypto, setIsDepositingCrypto] = useState(false);

  // Withdraw modal state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPixKey, setWithdrawPixKey] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawTab, setWithdrawTab] = useState<'pix' | 'sepa' | 'crypto'>('pix');
  const [withdrawIban, setWithdrawIban] = useState('');
  const [withdrawHolderName, setWithdrawHolderName] = useState('');
  const [withdrawCryptoAddress, setWithdrawCryptoAddress] = useState('');
  const [withdrawCryptoCurrency, setWithdrawCryptoCurrency] = useState('BTC');
  const [withdrawNetwork, setWithdrawNetwork] = useState('TRC20');

  useEffect(() => {
    if (user && !authLoading) {
      loadBalances();
      loadTransactions();
    }
  }, [user, authLoading]);

  const loadBalances = async () => {
    try {
      setIsLoadingBalances(true);
      const response = await api.getBalance();
      if (response.success) setBalances(response.balances);
    } catch {
      toast.error('Falha ao carregar saldos');
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const response = await api.getTransactions(10);
      if (response.success) setTransactions(response.data.transactions);
    } catch {
      toast.error('Falha ao carregar transações');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // === Handlers ===

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePixDeposit = async () => {
    if (!pixAmount || parseFloat(pixAmount) <= 0) return;
    try {
      setIsDepositingPix(true);
      const response = await api.depositFiat(parseFloat(pixAmount), 'BRL');
      if (response.success && response.type === 'PIX_DYNAMIC') {
        setPixQrCode(response.qr_code);
        setPixCopyPaste(response.copy_paste);
      }
    } catch {
      toast.error('Falha ao gerar PIX. Tente novamente.');
    } finally { setIsDepositingPix(false); }
  };

  const handleSepaDeposit = async () => {
    if (!sepaAmount || parseFloat(sepaAmount) <= 0) return;
    try {
      setIsDepositingSepa(true);
      const response = await api.depositFiat(parseFloat(sepaAmount), 'EUR');
      if (response.success) {
        if (response.type === 'SEPA' && response.bank_details) {
          setSepaResult(response.bank_details);
        } else {
          toast.error('Resposta inesperada do servidor para depósito SEPA');
        }
      }
    } catch {
      toast.error('Falha ao gerar depósito SEPA. Tente novamente.');
    } finally { setIsDepositingSepa(false); }
  };

  const getCryptoCurrencyCode = (): string => {
    if (selectedCrypto === 'USDT') {
      switch (usdtNetwork) {
        case 'BEP20': return 'USDTBEP20';
        case 'ERC20': return 'USDT_ERC20';
        case 'TRC20':
        default: return 'USDTRC20';
      }
    }
    return selectedCrypto;
  };

  const handleCryptoDeposit = async () => {
    try {
      setIsDepositingCrypto(true);
      const currencyCode = getCryptoCurrencyCode();
      const response = await api.depositCrypto(currencyCode);
      if (response.success) { setCryptoResult({ address: response.address, network: response.network, min_deposit: response.min_deposit }); }
    } catch {
      toast.error('Falha ao gerar carteira crypto. Tente novamente.');
    } finally { setIsDepositingCrypto(false); }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    try {
      setIsWithdrawing(true);
      if (withdrawTab === 'pix') {
        if (!withdrawPixKey) return;
        await api.withdrawFiat(parseFloat(withdrawAmount), 'BRL', withdrawPixKey);
      } else if (withdrawTab === 'sepa') {
        if (!withdrawIban) return;
        if (!withdrawHolderName) { toast.error('Nome do titular é obrigatório para saque SEPA'); return; }
        await api.withdrawFiat(parseFloat(withdrawAmount), 'EUR', withdrawIban, withdrawHolderName);
      } else if (withdrawTab === 'crypto') {
        if (!withdrawCryptoAddress) return;
        const networkCode = withdrawCryptoCurrency === 'USDT'
          ? (withdrawNetwork === 'BEP20' ? 'USDTBEP20' : withdrawNetwork === 'ERC20' ? 'USDT_ERC20' : 'USDTRC20')
          : withdrawCryptoCurrency;
        await api.withdrawCrypto(parseFloat(withdrawAmount), withdrawCryptoCurrency, withdrawCryptoAddress, networkCode);
      }
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWithdrawPixKey('');
      setWithdrawIban('');
      setWithdrawHolderName('');
      setWithdrawCryptoAddress('');
      loadBalances();
      loadTransactions();
      toast.success('Saque realizado com sucesso!');
    } catch {
      toast.error('Falha ao processar saque. Tente novamente.');
    } finally { setIsWithdrawing(false); }
  };

  const resetDepositModal = () => {
    setPixAmount(''); setPixQrCode(null); setPixCopyPaste(null);
    setSepaAmount(''); setSepaResult(null);
    setSelectedCrypto('BTC'); setUsdtNetwork('TRC20'); setCryptoResult(null);
  };

  const resetWithdrawModal = () => {
    setWithdrawTab('pix');
    setWithdrawAmount(''); setWithdrawPixKey('');
    setWithdrawIban(''); setWithdrawHolderName('');
    setWithdrawCryptoAddress(''); setWithdrawCryptoCurrency('BTC'); setWithdrawNetwork('TRC20');
  };

  // === Helpers ===

  const formatCurrency = (value: number, currency: string = 'BRL') => {
    if (currency === 'BRL') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    if (currency === 'EUR') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(value);
    return `${value.toFixed(currency === 'BTC' ? 8 : 2)} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-900/50 text-green-400 border border-green-600/50">Concluído</Badge>;
      case 'pending': return <Badge className="bg-yellow-900/50 text-yellow-400 border border-yellow-600/50">Pendente</Badge>;
      case 'failed': return <Badge className="bg-red-900/50 text-red-400 border border-red-600/50">Falhou</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Olá, <span className="text-neon-green">{user?.name || 'Usuário'}</span>!
            </h1>
            <p className="text-gray-400">Gerencie sua carteira e visualize suas transações.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${user?.role === 'BLACK' ? 'bg-gray-800 text-white border border-gray-600' : 'bg-green-900/50 text-neon-green border border-green-600/50'}`}>
              {user?.role === 'BLACK' ? <Crown className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
              Conta {user?.role}
            </Badge>
            {user?.kyc_status === 'PENDING' && user?.role === 'WHITE' && (
              <Badge className="bg-yellow-900/50 text-yellow-400 border border-yellow-600/50">KYC Pendente</Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* Split Balance Cards (FASE 2.4) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {isLoadingBalances ? (
          <>
            <Card className="glass border-white/10"><CardContent className="p-6"><div className="h-24 bg-white/5 animate-pulse rounded" /></CardContent></Card>
            <Card className="glass border-white/10"><CardContent className="p-6"><div className="h-24 bg-white/5 animate-pulse rounded" /></CardContent></Card>
          </>
        ) : (
          <>
            {/* Saldo Fiduciário */}
            <Card className="glass border-white/10 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-green-900/30">
                    <CircleDollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-400">Saldo Fiduciário</h3>
                    <p className="text-xs text-gray-500">BRL + EUR</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">BRL</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(balances?.BRL || 0, 'BRL')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">EUR</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(balances?.EUR || 0, 'EUR')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NeXWallet Crypto */}
            <Card className="glass border-white/10 card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-orange-900/30">
                    <Bitcoin className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-400">NeXWallet Crypto</h3>
                    <p className="text-xs text-gray-500">USDT + BTC</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">USDT</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(balances?.USDT || 0, 'USDT')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">BTC</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(balances?.BTC || 0, 'BTC')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Button className="btn-green-enhanced py-6 text-lg" onClick={() => { resetDepositModal(); setShowDeposit(true); }}>
          <QrCode className="mr-2 h-5 w-5" />Depositar
        </Button>
        <Button className="btn-cyan-enhanced py-6 text-lg" onClick={() => { resetWithdrawModal(); setShowWithdraw(true); }}>
          <Send className="mr-2 h-5 w-5" />Sacar
        </Button>
        <Link href="/exchange" className="md:col-span-1 col-span-2">
          <Button variant="outline" className="w-full py-6 text-lg border-neon-green text-neon-green hover:bg-green-900/20">
            <ArrowLeftRight className="mr-2 h-5 w-5" />Converter Moedas
          </Button>
        </Link>
      </motion.div>

      {/* Recent Transactions Preview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="glass border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Transações Recentes</CardTitle>
              <Link href="/dashboard/transactions" className="text-sm text-neon-green hover:underline flex items-center gap-1">
                Ver Extrato <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTransactions ? (
              <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white/5 animate-pulse rounded" />)}</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400"><Clock className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhuma transação encontrada</p></div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${tx.type === 'deposit' ? 'bg-green-900/30' : tx.type === 'withdraw' ? 'bg-red-900/30' : 'bg-blue-900/30'}`}>
                        {tx.type === 'deposit' ? <ArrowRight className="h-4 w-4 text-green-400" /> : tx.type === 'withdraw' ? <Send className="h-4 w-4 text-red-400" /> : <ArrowLeftRight className="h-4 w-4 text-blue-400" />}
                      </div>
                      <div><p className="font-medium text-white capitalize">{tx.type}</p><p className="text-sm text-gray-400">{formatDate(tx.created_at)}</p></div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">{tx.amount_from ? `${tx.amount_from} ${tx.currency_from}` : '-'}</p>
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ==================== DEPOSIT MODAL (Enterprise - NowPayments Crypto) ==================== */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowDeposit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <Card className="glass-strong border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-neon-green" />Depositar
                  </CardTitle>
                  <CardDescription>Escolha o método de depósito</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="pix" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full mb-4">
                      <TabsTrigger value="pix">PIX</TabsTrigger>
                      <TabsTrigger value="sepa">SEPA</TabsTrigger>
                      <TabsTrigger value="crypto">Crypto</TabsTrigger>
                    </TabsList>

                    {/* ---- PIX Tab (Real QR Code) ---- */}
                    <TabsContent value="pix">
                      {!pixQrCode ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-gray-300">Valor (BRL)</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={pixAmount}
                              onChange={(e) => setPixAmount(e.target.value)}
                              className="form-input-enhanced"
                              disabled={isDepositingPix}
                            />
                          </div>
                          <Button className="w-full btn-green-enhanced" onClick={handlePixDeposit} disabled={isDepositingPix || !pixAmount || parseFloat(pixAmount) <= 0}>
                            {isDepositingPix && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Gerar PIX
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            PIX gerado com sucesso!
                          </div>
                          <div className="flex justify-center">
                            <div className="bg-white p-4 rounded-lg">
                              {pixQrCode && pixQrCode.startsWith('data:') ? (
                                <img src={pixQrCode} alt="QR Code PIX" className="w-48 h-48 rounded" />
                              ) : pixQrCode ? (
                                <img src={'data:image/png;base64,' + pixQrCode} alt="QR Code PIX" className="w-48 h-48 rounded" />
                              ) : null}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-300">Código PIX (Copia e Cola)</Label>
                            <div className="flex gap-2">
                              <Input value={pixCopyPaste || ''} readOnly className="form-input-enhanced text-xs" />
                              <Button
                                onClick={() => handleCopy(pixCopyPaste!, 'pix')}
                                size="icon"
                                variant="outline"
                                className="shrink-0"
                              >
                                {copiedField === 'pix' ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full" onClick={() => { setPixQrCode(null); setPixCopyPaste(null); setPixAmount(''); }}>
                            <RefreshCw className="h-4 w-4 mr-2" />Novo PIX
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    {/* ---- SEPA Tab (Dynamic Fields) ---- */}
                    <TabsContent value="sepa">
                      {!sepaResult ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-gray-300">Valor (EUR)</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={sepaAmount}
                              onChange={(e) => setSepaAmount(e.target.value)}
                              className="form-input-enhanced"
                              disabled={isDepositingSepa}
                            />
                          </div>
                          <Button className="w-full btn-green-enhanced" onClick={handleSepaDeposit} disabled={isDepositingSepa || !sepaAmount || parseFloat(sepaAmount) <= 0}>
                            {isDepositingSepa && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Gerar Depósito
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Depósito gerado com sucesso!
                          </div>
                          <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                            {sepaResult && (
                              <>
                                <div>
                                  <p className="text-xs text-gray-500">Banco</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-white font-medium">{sepaResult.bank_name}</p>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => handleCopy(sepaResult.bank_name, 'sepa-bank')}>
                                      {copiedField === 'sepa-bank' ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">IBAN</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-white font-mono break-all">{sepaResult.iban}</p>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => handleCopy(sepaResult.iban, 'sepa-iban')}>
                                      {copiedField === 'sepa-iban' ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">BIC / SWIFT</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-white font-mono">{sepaResult.bic}</p>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => handleCopy(sepaResult.bic, 'sepa-bic')}>
                                      {copiedField === 'sepa-bic' ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Titular da Conta</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-white">{sepaResult.account_holder}</p>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => handleCopy(sepaResult.account_holder, 'sepa-holder')}>
                                      {copiedField === 'sepa-holder' ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Referência</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-white font-mono break-all">{sepaResult.reference}</p>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => handleCopy(sepaResult.reference, 'sepa-ref')}>
                                      {copiedField === 'sepa-ref' ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          <Button variant="outline" className="w-full" onClick={() => { setSepaResult(null); setSepaAmount(''); }}>
                            <RefreshCw className="h-4 w-4 mr-2" />Novo Depósito
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    {/* ---- Crypto Tab (NowPayments - Multi Currency + Network) ---- */}
                    <TabsContent value="crypto">
                      {!cryptoResult ? (
                        <div className="space-y-4">
                          {/* Currency Selector */}
                          <div className="space-y-2">
                            <Label className="text-gray-300">Moeda</Label>
                            <div className="grid grid-cols-5 gap-2">
                              {[
                                { id: 'BTC', label: 'BTC', icon: <Bitcoin className="h-4 w-4" />, color: 'border-orange-500/50 bg-orange-900/20 text-orange-400', activeColor: 'border-orange-500 bg-orange-900/40 text-orange-300 ring-orange-500/30' },
                                { id: 'ETH', label: 'ETH', icon: <Coins className="h-4 w-4" />, color: 'border-purple-500/50 bg-purple-900/20 text-purple-400', activeColor: 'border-purple-500 bg-purple-900/40 text-purple-300 ring-purple-500/30' },
                                { id: 'LTC', label: 'LTC', icon: <Coins className="h-4 w-4" />, color: 'border-gray-500/50 bg-gray-900/20 text-gray-400', activeColor: 'border-gray-500 bg-gray-900/40 text-gray-300 ring-gray-500/30' },
                                { id: 'XMR', label: 'XMR', icon: <Coins className="h-4 w-4" />, color: 'border-orange-500/50 bg-orange-900/20 text-orange-400', activeColor: 'border-orange-500 bg-orange-900/40 text-orange-300 ring-orange-500/30' },
                                { id: 'USDT', label: 'USDT', icon: <CircleDollarSign className="h-4 w-4" />, color: 'border-green-500/50 bg-green-900/20 text-green-400', activeColor: 'border-green-500 bg-green-900/40 text-green-300 ring-green-500/30' },
                              ].map((coin) => (
                                <button
                                  key={coin.id}
                                  type="button"
                                  disabled={isDepositingCrypto}
                                  onClick={() => { setSelectedCrypto(coin.id); setCryptoResult(null); }}
                                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-xs font-medium ${selectedCrypto === coin.id ? `${coin.activeColor} ring-2` : `${coin.color} hover:opacity-80`}`}
                                >
                                  {coin.icon}
                                  {coin.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* USDT Network Selection */}
                          {selectedCrypto === 'USDT' && (
                            <div className="space-y-2">
                              <Label className="text-gray-300 flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Rede</Label>
                              <RadioGroup value={usdtNetwork} onValueChange={setUsdtNetwork} disabled={isDepositingCrypto}>
                                {[
                                  { value: 'TRC20', label: 'TRC-20', desc: 'Tron', color: 'border-green-500/50' },
                                  { value: 'BEP20', label: 'BEP-20', desc: 'BSC', color: 'border-yellow-500/50' },
                                  { value: 'ERC20', label: 'ERC-20', desc: 'Ethereum', color: 'border-blue-500/50' },
                                ].map((net) => (
                                  <label
                                    key={net.value}
                                    className={`flex items-center gap-3 p-3 rounded-lg border ${usdtNetwork === net.value ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/5'} cursor-pointer transition-all`}
                                  >
                                    <RadioGroupItem value={net.value} />
                                    <div>
                                      <p className="text-sm text-white font-medium">{net.label}</p>
                                      <p className="text-xs text-gray-400">{net.desc}</p>
                                    </div>
                                  </label>
                                ))}
                              </RadioGroup>
                            </div>
                          )}

                          <Button className="w-full btn-green-enhanced" onClick={handleCryptoDeposit} disabled={isDepositingCrypto}>
                            {isDepositingCrypto && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Gerar Carteira
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Carteira gerada com sucesso!
                          </div>
                          <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                            <div>
                              <p className="text-xs text-gray-500">Rede</p>
                              <p className="text-sm text-white font-medium">{cryptoResult.network || selectedCrypto}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Endereço da Carteira</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-white font-mono break-all">{cryptoResult.address}</p>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 shrink-0"
                                  onClick={() => handleCopy(cryptoResult.address, 'crypto-addr')}
                                >
                                  {copiedField === 'crypto-addr' ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              </div>
                            </div>
                            {cryptoResult.min_deposit && (
                              <div>
                                <p className="text-xs text-gray-500">Depósito Mínimo</p>
                                <p className="text-sm text-white">{cryptoResult.min_deposit} {selectedCrypto}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                            <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-300">
                              Envie apenas {selectedCrypto === 'USDT' ? `USDT (${usdtNetwork})` : selectedCrypto} para este endereço. Outros ativos podem ser perdidos permanentemente.
                            </p>
                          </div>
                          <Button variant="outline" className="w-full" onClick={() => { setCryptoResult(null); }}>
                            <RefreshCw className="h-4 w-4 mr-2" />Novo Endereço
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== WITHDRAW MODAL (Multi-Tab - PIX + SEPA + Crypto) ==================== */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowWithdraw(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <Card className="glass-strong border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Send className="h-5 w-5 text-neon-cyan" />Sacar
                  </CardTitle>
                  <CardDescription>Escolha o método de saque</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={withdrawTab} onValueChange={(v) => setWithdrawTab(v as 'pix' | 'sepa' | 'crypto')} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full mb-4">
                      <TabsTrigger value="pix">PIX</TabsTrigger>
                      <TabsTrigger value="sepa">SEPA</TabsTrigger>
                      <TabsTrigger value="crypto">Crypto</TabsTrigger>
                    </TabsList>

                    {/* ---- PIX Withdraw ---- */}
                    <TabsContent value="pix">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300">Valor (BRL)</Label>
                          <Input type="number" placeholder="0.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="form-input-enhanced" disabled={isWithdrawing} />
                          <p className="text-xs text-gray-500">Saldo disponível: {formatCurrency(balances?.BRL || 0, 'BRL')}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Chave PIX</Label>
                          <Input placeholder="Email, CPF, Telefone ou Chave Aleatória" value={withdrawPixKey} onChange={(e) => setWithdrawPixKey(e.target.value)} className="form-input-enhanced" disabled={isWithdrawing} />
                        </div>
                        <Button className="w-full btn-cyan-enhanced" onClick={handleWithdraw} disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || !withdrawPixKey}>
                          {isWithdrawing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Solicitar Saque
                        </Button>
                      </div>
                    </TabsContent>

                    {/* ---- SEPA Withdraw ---- */}
                    <TabsContent value="sepa">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300">Valor (EUR)</Label>
                          <Input type="number" placeholder="0.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="form-input-enhanced" disabled={isWithdrawing} />
                          <p className="text-xs text-gray-500">Saldo disponível: {formatCurrency(balances?.EUR || 0, 'EUR')}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">IBAN</Label>
                          <Input placeholder="DE89 3704 0044 0532 0130 00" value={withdrawIban} onChange={(e) => setWithdrawIban(e.target.value)} className="form-input-enhanced" disabled={isWithdrawing} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Nome do Titular</Label>
                          <Input placeholder="Nome completo do titular da conta" value={withdrawHolderName} onChange={(e) => setWithdrawHolderName(e.target.value)} className="form-input-enhanced" disabled={isWithdrawing} />
                        </div>
                        <Button className="w-full btn-cyan-enhanced" onClick={handleWithdraw} disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || !withdrawIban}>
                          {isWithdrawing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Solicitar Saque
                        </Button>
                      </div>
                    </TabsContent>

                    {/* ---- Crypto Withdraw ---- */}
                    <TabsContent value="crypto">
                      <div className="space-y-4">
                        {/* Currency Selector */}
                        <div className="space-y-2">
                          <Label className="text-gray-300">Moeda</Label>
                          <div className="grid grid-cols-5 gap-2">
                            {[
                              { id: 'BTC', label: 'BTC', icon: <Bitcoin className="h-4 w-4" />, color: 'border-orange-500/50 bg-orange-900/20 text-orange-400', activeColor: 'border-orange-500 bg-orange-900/40 text-orange-300 ring-orange-500/30' },
                              { id: 'ETH', label: 'ETH', icon: <Coins className="h-4 w-4" />, color: 'border-purple-500/50 bg-purple-900/20 text-purple-400', activeColor: 'border-purple-500 bg-purple-900/40 text-purple-300 ring-purple-500/30' },
                              { id: 'LTC', label: 'LTC', icon: <Coins className="h-4 w-4" />, color: 'border-gray-500/50 bg-gray-900/20 text-gray-400', activeColor: 'border-gray-500 bg-gray-900/40 text-gray-300 ring-gray-500/30' },
                              { id: 'XMR', label: 'XMR', icon: <Coins className="h-4 w-4" />, color: 'border-orange-500/50 bg-orange-900/20 text-orange-400', activeColor: 'border-orange-500 bg-orange-900/40 text-orange-300 ring-orange-500/30' },
                              { id: 'USDT', label: 'USDT', icon: <CircleDollarSign className="h-4 w-4" />, color: 'border-green-500/50 bg-green-900/20 text-green-400', activeColor: 'border-green-500 bg-green-900/40 text-green-300 ring-green-500/30' },
                            ].map((coin) => (
                              <button
                                key={coin.id}
                                type="button"
                                disabled={isWithdrawing}
                                onClick={() => setWithdrawCryptoCurrency(coin.id)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-xs font-medium ${withdrawCryptoCurrency === coin.id ? `${coin.activeColor} ring-2` : `${coin.color} hover:opacity-80`}`}
                              >
                                {coin.icon}
                                {coin.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* USDT Network Selection */}
                        {withdrawCryptoCurrency === 'USDT' && (
                          <div className="space-y-2">
                            <Label className="text-gray-300 flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Rede</Label>
                            <RadioGroup value={withdrawNetwork} onValueChange={setWithdrawNetwork} disabled={isWithdrawing}>
                              {[
                                { value: 'TRC20', label: 'TRC-20', desc: 'Tron' },
                                { value: 'BEP20', label: 'BEP-20', desc: 'BSC' },
                                { value: 'ERC20', label: 'ERC-20', desc: 'Ethereum' },
                              ].map((net) => (
                                <label
                                  key={net.value}
                                  className={`flex items-center gap-3 p-3 rounded-lg border ${withdrawNetwork === net.value ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/5'} cursor-pointer transition-all`}
                                >
                                  <RadioGroupItem value={net.value} />
                                  <div>
                                    <p className="text-sm text-white font-medium">{net.label}</p>
                                    <p className="text-xs text-gray-400">{net.desc}</p>
                                  </div>
                                </label>
                              ))}
                            </RadioGroup>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-gray-300">Valor</Label>
                          <Input type="number" placeholder="0.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="form-input-enhanced" disabled={isWithdrawing} />
                          <p className="text-xs text-gray-500">Saldo disponível: {formatCurrency(balances?.[withdrawCryptoCurrency as keyof Balances] || 0, withdrawCryptoCurrency)}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Endereço da Carteira</Label>
                          <Input placeholder="Endereço de destino" value={withdrawCryptoAddress} onChange={(e) => setWithdrawCryptoAddress(e.target.value)} className="form-input-enhanced font-mono text-sm" disabled={isWithdrawing} />
                        </div>
                        <Button className="w-full btn-cyan-enhanced" onClick={handleWithdraw} disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || !withdrawCryptoAddress}>
                          {isWithdrawing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Solicitar Saque
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LandingPage() {
  const features = [
    { icon: <Shield className="h-8 w-8 text-neon-green" />, title: 'Segurança Total', description: 'Sua carteira protegida com as mais avançadas tecnologias de segurança.' },
    { icon: <Zap className="h-8 w-8 text-neon-cyan" />, title: 'Transações Rápidas', description: 'Depósitos via PIX instantâneos e saques processados em minutos.' },
    { icon: <Clock className="h-8 w-8 text-neon-green" />, title: '24/7 Disponível', description: 'Acesse sua carteira a qualquer momento, de qualquer lugar.' },
    { icon: <ArrowLeftRight className="h-8 w-8 text-neon-cyan" />, title: 'Swap de Moedas', description: 'Troque entre BRL, EUR, USDT e BTC com as melhores taxas.' },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge variant="outline" className="mb-4 text-neon-green border-neon-green">Seguro • Rápido • Confiável</Badge>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Sua Carteira Digital{' '}<span className="block text-neon-green">Segura e Descentralizada.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Gerencie BRL, EUR, USDT e BTC em um só lugar. Depósitos via PIX, saques instantâneos e swap de moedas.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/?auth=register"><Button size="lg" className="btn-green-enhanced font-semibold text-lg px-8 py-6"><Wallet className="mr-2 h-5 w-5" />Criar Conta Grátis</Button></Link>
              <Link href="/?auth=login"><Button size="lg" variant="outline" className="btn-cyan-enhanced font-semibold text-lg px-8 py-6"><LogIn className="mr-2 h-5 w-5" />Já tenho conta</Button></Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Por que escolher a <span className="text-neon-green">NeXPay</span>?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Uma carteira digital completa com todos os recursos que você precisa.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}>
                <Card className="glass border-white/10 card-hover h-full"><CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent></Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.2 }} className="glass-strong rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pronto para começar?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">Crie sua conta em menos de 1 minuto e comece a usar sua carteira digital agora mesmo.</p>
            <Link href="/?auth=register"><Button size="lg" className="btn-green-enhanced font-semibold text-lg px-12 py-6"><UserPlus className="mr-2 h-5 w-5" />Criar Minha Conta<ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function HomeContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const showAuth = searchParams.get('auth');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-b-2 border-neon-green rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  if (showAuth && !isAuthenticated) return <AuthForm />;
  if (isAuthenticated) return <Dashboard />;
  return <LandingPage />;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="loading-spinner" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
