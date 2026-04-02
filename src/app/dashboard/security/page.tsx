'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  Copy,
  Check,
  Settings,
  MessageCircle,
  Send,
  Mail,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   Card 1 — Alterar Senha
   ═══════════════════════════════════════════════════════════════════════ */

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setSuccess('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao alterar senha.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-strong rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
          <Lock className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Alterar Senha</h3>
          <p className="text-sm text-gray-400">Atualize sua senha de acesso</p>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="space-y-4">
        {/* Current password */}
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Senha atual</Label>
          <div className="relative">
            <Input
              type={showCurrent ? 'text' : 'password'}
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="form-input-enhanced h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Nova senha</Label>
          <div className="relative">
            <Input
              type={showNew ? 'text' : 'password'}
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input-enhanced h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {newPassword && newPassword.length < 6 && (
            <p className="text-xs text-red-400">Mínimo de 6 caracteres</p>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Confirmar nova senha</Label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input-enhanced h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-400">As senhas não coincidem</p>
          )}
        </div>

        {/* Feedback */}
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          className="w-full btn-green-enhanced h-11"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Alterando...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Alterar Senha
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Card 2 — Autenticação 2FA
   ═══════════════════════════════════════════════════════════════════════ */

function TwoFACard() {
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  const is2FAEnabled = user?.two_factor_enabled === true;

  /* ─── Generate 2FA ──────────────────────────────────────────────── */
  const handleGenerate = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.generate2FA();
      if (res.qr_code) setQrCode(res.qr_code);
      if (res.secret) setSecret(res.secret);
      setShowSetup(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar 2FA.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Verify 2FA ────────────────────────────────────────────────── */
  const handleVerify = async () => {
    if (otpToken.length !== 6) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.verify2FA(otpToken);
      setSuccess('2FA ativado com sucesso!');
      setShowSetup(false);
      setOtpToken('');
      setQrCode('');
      setSecret('');
      await refreshUser();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Código inválido.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Disable 2FA ───────────────────────────────────────────────── */
  const handleDisable = async () => {
    if (otpToken.length !== 6) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.disable2FA(otpToken);
      setSuccess('2FA desativado com sucesso!');
      setShowDisable(false);
      setOtpToken('');
      await refreshUser();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Código inválido.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Copy secret ───────────────────────────────────────────────── */
  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="glass-strong rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Autenticação 2FA</h3>
          <p className="text-sm text-gray-400">
            Proteja sua conta com verificação em duas etapas
          </p>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* ─── Active State ──────────────────────────────────────────── */}
      {is2FAEnabled && !showDisable && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
              2FA Ativo
            </Badge>
            <span className="text-sm text-gray-400">
              Sua conta está protegida com autenticação de dois fatores.
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setShowDisable(true);
              setError('');
              setSuccess('');
              setOtpToken('');
            }}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full h-11"
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            Desativar 2FA
          </Button>
        </div>
      )}

      {/* ─── Disable 2FA OTP Input ─────────────────────────────────── */}
      {is2FAEnabled && showDisable && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Digite o código de 6 dígitos do seu autenticador para desativar.
          </p>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otpToken} onChange={setOtpToken}>
              <InputOTPGroup>
                <InputOTPSlot index={0} className="form-input-enhanced h-11 w-11" />
                <InputOTPSlot index={1} className="form-input-enhanced h-11 w-11" />
                <InputOTPSlot index={2} className="form-input-enhanced h-11 w-11" />
              </InputOTPGroup>
              <InputOTPSeparator className="text-white/20" />
              <InputOTPGroup>
                <InputOTPSlot index={3} className="form-input-enhanced h-11 w-11" />
                <InputOTPSlot index={4} className="form-input-enhanced h-11 w-11" />
                <InputOTPSlot index={5} className="form-input-enhanced h-11 w-11" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-center">
              {success}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDisable(false);
                setOtpToken('');
                setError('');
              }}
              className="flex-1 border-white/10 text-white hover:bg-white/5 h-11"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDisable}
              disabled={loading || otpToken.length !== 6}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white h-11"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Desativar
            </Button>
          </div>
        </div>
      )}

      {/* ─── Inactive State ────────────────────────────────────────── */}
      {!is2FAEnabled && !showSetup && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-white/10 text-white/40 border-white/20 hover:bg-white/10">
              Inativo
            </Badge>
            <span className="text-sm text-gray-400">
              Ative o 2FA para maior segurança.
            </span>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-cyan-enhanced h-11"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Ativar Google Authenticator
              </>
            )}
          </Button>
        </div>
      )}

      {/* ─── Setup 2FA (QR + OTP) ─────────────────────────────────── */}
      {!is2FAEnabled && showSetup && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Escaneie o QR Code abaixo no seu aplicativo de autenticação e insira o código de verificação.
          </p>

          {/* QR Code */}
          {qrCode && (
            <div className="flex justify-center">
              <div className="rounded-xl overflow-hidden border border-white/10">
                <img
                  src={qrCode}
                  alt="2FA QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>
          )}

          {/* Secret key */}
          {secret && (
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Chave secreta</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={secret}
                  className="flex-1 font-mono text-sm form-input-enhanced h-10"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySecret}
                  className="border-white/10 text-white hover:bg-white/5 h-10 px-3"
                >
                  {copiedSecret ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* OTP verification */}
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otpToken} onChange={setOtpToken}>
              <InputOTPGroup>
                <InputOTPSlot index={0} className="form-input-enhanced h-11 w-11" />
                <InputOTPSlot index={1} className="form-input-enhanced h-11 w-11" />
                <InputOTPSlot index={2} className="form-input-enhanced h-11 w-11" />
              </InputOTPGroup>
              <InputOTPSeparator className="text-white/20" />
              <InputOTPGroup>
                <InputOTPSlot index={3} className="form-input-enhanced h-11 w-11" />
                <InputOTPSlot index={4} className="form-input-enhanced h-11 w-11" />
                <InputOTPSlot index={5} className="form-input-enhanced h-11 w-11" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-center">
              {success}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowSetup(false);
                setOtpToken('');
                setQrCode('');
                setSecret('');
                setError('');
              }}
              className="flex-1 border-white/10 text-white hover:bg-white/5 h-11"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleVerify}
              disabled={loading || otpToken.length !== 6}
              className="flex-1 btn-cyan-enhanced h-11"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Verificar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Card 3 — Preferências
   ═══════════════════════════════════════════════════════════════════════ */

function PreferencesCard() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="glass-strong rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
          <Settings className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Preferências</h3>
          <p className="text-sm text-gray-400">Personalize sua experiência</p>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Theme toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-sm text-white font-medium">Tema escuro</p>
          <p className="text-xs text-gray-400">Alterne entre modo claro e escuro</p>
        </div>
        <Switch
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        />
      </div>

      <Separator className="bg-white/10" />

      {/* Support contact info */}
      <div className="space-y-3">
        <p className="text-sm text-white font-medium">Suporte</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <MessageCircle className="h-4 w-4 text-emerald-400" />
            <span>WhatsApp: +55 (11) 99999-0000</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Send className="h-4 w-4 text-cyan-400" />
            <span>Telegram: @nexpay_suporte</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Mail className="h-4 w-4 text-purple-400" />
            <span>suporte@nextrustx.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════════ */

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      {/* ─── Page Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Segurança</h1>
        <p className="text-sm text-gray-400 mt-1">
          Gerencie a segurança da sua conta e preferências
        </p>
      </div>

      {/* ─── Cards Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChangePasswordCard />
        <TwoFACard />
        <PreferencesCard />
      </div>
    </div>
  );
}
