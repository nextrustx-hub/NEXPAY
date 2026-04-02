'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  Smartphone,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type SetupStep = 'idle' | 'generate' | 'verify' | 'success';

export default function SecuritySettings() {
  const { user, refreshUser } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<SetupStep>('idle');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [otpValue, setOtpValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const is2FAActive = !!user?.two_factor_enabled;

  const resetState = useCallback(() => {
    setStep('idle');
    setQrCode('');
    setSecret('');
    setOtpValue('');
    setIsGenerating(false);
    setIsVerifying(false);
    setError('');
  }, []);

  const handleOpenDialog = () => {
    resetState();
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetState();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const response = await api.generate2FA();
      if (response.success) {
        setQrCode(response.qr_code);
        setSecret(response.secret);
        setStep('verify');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar 2FA');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerify = async () => {
    if (otpValue.length !== 6) return;
    setIsVerifying(true);
    setError('');
    try {
      const response = await api.verify2FA(otpValue);
      if (response.success) {
        setStep('success');
        await refreshUser();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido');
    } finally {
      setIsVerifying(false);
    }
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = secret;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  return (
    <>
      <Card className="glass-strong border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            {is2FAActive ? (
              <ShieldCheck className="h-5 w-5 text-green-400" />
            ) : (
              <Shield className="h-5 w-5 text-gray-400" />
            )}
            Autenticação de Dois Fatores
          </CardTitle>
          <CardDescription className="text-gray-400">
            {is2FAActive
              ? 'Sua conta está protegida com autenticação de dois fatores.'
              : 'Adicione uma camada extra de segurança à sua conta.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  is2FAActive ? 'bg-green-500/20' : 'bg-white/5'
                }`}
              >
                <KeyRound
                  className={`h-5 w-5 ${is2FAActive ? 'text-green-400' : 'text-gray-400'}`}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Status:{' '}
                  <span className={is2FAActive ? 'text-green-400' : 'text-gray-400'}>
                    {is2FAActive ? 'Ativo' : 'Inativo'}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  {is2FAActive
                    ? 'Use seu app autenticador para login'
                    : 'Recomendado para maior segurança'}
                </p>
              </div>
            </div>
            <Button
              variant={is2FAActive ? 'outline' : 'default'}
              size="sm"
              onClick={handleOpenDialog}
            >
              {is2FAActive ? 'Gerenciar' : 'Ativar 2FA'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="glass-strong border-white/10 sm:max-w-md">
          <AnimatePresence mode="wait">
            {/* Step: Generate Info */}
            {step === 'idle' && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-white">
                    <Shield className="h-5 w-5" />
                    Configurar Autenticação 2FA
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Use um aplicativo autenticador como Google Authenticator ou Authy para proteger sua conta.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3 rounded-lg bg-white/5 p-4">
                    <Smartphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-300" />
                    <div>
                      <p className="text-sm font-medium text-white">1. Instale um app autenticador</p>
                      <p className="text-xs text-gray-400">
                        Google Authenticator, Authy ou 1Password
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-white/5 p-4">
                    <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-300" />
                    <div>
                      <p className="text-sm font-medium text-white">2. Escaneie o QR Code</p>
                      <p className="text-xs text-gray-400">
                        Após clicar em continuar, um QR Code será gerado
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-white/5 p-4">
                    <KeyRound className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-300" />
                    <div>
                      <p className="text-sm font-medium text-white">3. Insira o código de verificação</p>
                      <p className="text-xs text-gray-400">
                        Digite o código de 6 dígitos do seu app autenticador
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button variant="ghost" onClick={handleCloseDialog} className="text-gray-400">
                    Cancelar
                  </Button>
                  <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      'Continuar'
                    )}
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {/* Step: Verify */}
            {step === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-white">
                    <Smartphone className="h-5 w-5" />
                    Verificar Autenticador
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Escaneie o QR Code com seu app autenticador e insira o código de verificação.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 flex flex-col items-center gap-6">
                  {/* QR Code */}
                  {qrCode && (
                    <div className="rounded-lg bg-white p-2">
                      <img
                        src={qrCode}
                        alt="QR Code 2FA"
                        className="h-48 w-48"
                      />
                    </div>
                  )}

                  {/* Secret Key */}
                  <div className="w-full rounded-lg bg-white/5 p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                      Chave secreta (backup)
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-black/30 px-3 py-1.5 text-sm font-mono text-gray-300 break-all">
                        {secret}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copySecret}
                        className="flex-shrink-0 text-gray-400 hover:text-white"
                        aria-label="Copiar chave secreta"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Salve esta chave em um local seguro caso perca acesso ao seu app.
                    </p>
                  </div>

                  {/* OTP Input */}
                  <div className="w-full space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Código de verificação
                    </label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otpValue}
                        onChange={setOtpValue}
                        render={({ slots }) => (
                          <InputOTPGroup>
                            {slots.map((slot, index) => (
                              <React.Fragment key={index}>
                                {index === 3 && <InputOTPSeparator />}
                                <InputOTPSlot {...slot} />
                              </React.Fragment>
                            ))}
                          </InputOTPGroup>
                        )}
                      />
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400"
                      >
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <DialogFooter className="mt-6">
                  <Button variant="ghost" onClick={handleCloseDialog} className="text-gray-400">
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleVerify}
                    disabled={otpValue.length !== 6 || isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      'Verificar'
                    )}
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {/* Step: Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <DialogHeader>
                  <div className="flex flex-col items-center gap-4 pt-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                    >
                      <CheckCircle2 className="h-16 w-16 text-green-400" />
                    </motion.div>
                    <div className="text-center">
                      <DialogTitle className="text-white">
                        2FA Ativado com Sucesso!
                      </DialogTitle>
                      <DialogDescription className="mt-2 text-gray-400">
                        Sua conta agora está protegida com autenticação de dois fatores. 
                        Use seu app autenticador para fazer login.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <DialogFooter className="mt-6 sm:justify-center">
                  <Button onClick={handleCloseDialog}>Concluir</Button>
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
