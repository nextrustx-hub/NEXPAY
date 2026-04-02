// NeXPay API Service — 100% Headless (External API Only)
// All requests go directly to the NexTrustX VPS backend.
// No internal Next.js API routes are used.

import { toast } from 'sonner';
import { cookieUtils } from '@/lib/cookies';
import type {
  AuthResponse,
  MeResponse,
  BalanceResponse,
  DepositResponse,
  WithdrawResponse,
  SwapResponse,
  TransactionsResponse,
  TwoFAGenerateResponse,
  TwoFAVerifyResponse,
  CheckoutDetails,
  CheckoutListResponse,
  CryptoDepositResponse,
  ApiKeysResponse,
  GenerateApiKeyResponse,
  WebhookConfigResponse,
} from '@/types/auth';

// ─── STRICT EXTERNAL API URL ────────────────────────────────────────────
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-wallet.nextrustx.com/api/v1';

class ApiService {
  private getToken(): string | null {
    return cookieUtils.getToken();
  }

  private setToken(token: string): void {
    cookieUtils.setToken(token);
  }

  private removeToken(): void {
    cookieUtils.removeToken();
  }

  /**
   * Core request method — ALL calls go to `${API_BASE_URL}${endpoint}`
   * No relative paths like `/api/auth/register` — only absolute external URLs.
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    auth: boolean = true
  ): Promise<T> {
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (auth && token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // ABSOLUTE URL — never a relative path
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        const msg = data?.data?.message || data?.message || data?.error || 'Erro na requisição';

        if (response.status === 401) {
          this.removeToken();
          if (typeof window !== 'undefined') window.location.href = '/?auth=login';
        }

        toast.error(msg);
        throw new Error(msg);
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        toast.error('Erro de conexão', {
          description: `Não foi possível conectar ao servidor (${API_BASE_URL}).`,
        });
      }
      throw error;
    }
  }

  // ==================== AUTH ENDPOINTS ====================

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.access_token) {
      this.setToken(response.access_token);
      toast.success('Login realizado com sucesso!', {
        description: 'Bem-vindo à NeXPay',
      });
    }

    return response;
  }

  async register(
    email: string,
    password: string,
    name: string,
    tier: 'WHITE' | 'BLACK',
    cpf?: string
  ): Promise<AuthResponse> {
    const payload: Record<string, unknown> = { email, password, name, tier };

    if (tier === 'WHITE' && cpf) {
      payload.cpf = cpf.replace(/\D/g, '');
    }

    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (response.access_token) {
      this.setToken(response.access_token);
      toast.success('Conta criada com sucesso!', {
        description: tier === 'WHITE'
          ? 'Bem-vindo à NeXPay! Complete seu KYC para desbloquear todos os recursos.'
          : 'Bem-vindo à NeXPay VIP! Sua conta está pronta.',
      });
    }

    return response;
  }

  async getMe(): Promise<MeResponse> {
    return this.request<MeResponse>('/auth/me');
  }

  logout(): void {
    this.removeToken();
    toast.info('Sessão encerrada', {
      description: 'Até logo!',
    });
  }

  isAuthenticated(): boolean {
    return cookieUtils.hasToken();
  }

  // ==================== 2FA ENDPOINTS ====================

  async generate2FA(): Promise<TwoFAGenerateResponse> {
    return this.request<TwoFAGenerateResponse>('/auth/2fa/generate', {
      method: 'POST',
    });
  }

  async verify2FA(token: string): Promise<TwoFAVerifyResponse> {
    return this.request<TwoFAVerifyResponse>('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async disable2FA(token: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // ==================== WALLET ENDPOINTS ====================

  async getBalance(): Promise<BalanceResponse> {
    return this.request<BalanceResponse>('/wallet/balance');
  }

  async depositFiat(amount: number, currency: string = 'BRL'): Promise<DepositResponse> {
    return this.request<DepositResponse>('/wallet/deposit/fiat', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    });
  }

  async withdrawFiat(amount: number, currency: string, pix_key: string): Promise<WithdrawResponse> {
    return this.request<WithdrawResponse>('/wallet/withdraw/fiat', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, pix_key }),
    });
  }

  async withdrawCrypto(amount: number, currency: string, address: string, network: string): Promise<WithdrawResponse> {
    return this.request<WithdrawResponse>('/wallet/withdraw/crypto', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, address, network }),
    });
  }

  async changePassword(current_password: string, new_password: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    });
  }

  async swap(from: string, to: string, amount: number): Promise<SwapResponse> {
    return this.request<SwapResponse>('/wallet/swap', {
      method: 'POST',
      body: JSON.stringify({ from, to, amount }),
    });
  }

  async depositCrypto(currency: string): Promise<CryptoDepositResponse> {
    return this.request<CryptoDepositResponse>('/wallet/deposit/crypto', {
      method: 'POST',
      body: JSON.stringify({ currency }),
    });
  }

  // ==================== TRANSACTIONS ====================

  async getTransactions(limit: number = 10, type?: string): Promise<TransactionsResponse> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (type) params.append('type', type);
    return this.request<TransactionsResponse>(`/transactions?${params.toString()}`);
  }

  // ==================== B2B / CHECKOUT ====================

  async createCheckoutLink(data: { title: string; description?: string; currency: string; amount: number }): Promise<{ success: boolean; id: string; payment_url: string }> {
    const response = await this.request<{ success: boolean; id: string; payment_url: string }>('/checkout/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.success) toast.success('Link de pagamento criado!');
    return response;
  }

  async listCheckoutLinks(): Promise<CheckoutListResponse> {
    return this.request<CheckoutListResponse>('/checkout/list');
  }

  // PUBLIC route — NO auth header
  async getCheckoutDetails(id: string): Promise<CheckoutDetails> {
    return this.request<CheckoutDetails>(`/checkout/${id}`, {}, false);
  }

  // ==================== B2B API KEYS ====================

  async generateApiKey(): Promise<GenerateApiKeyResponse> {
    const response = await this.request<GenerateApiKeyResponse>('/b2b/api-keys/generate', { method: 'POST' });
    if (response.success) toast.success('API Key gerada! Guarde em local seguro.');
    return response;
  }

  async getApiKeys(): Promise<ApiKeysResponse> {
    return this.request<ApiKeysResponse>('/b2b/api-keys');
  }

  // ==================== WEBHOOKS ====================

  async configWebhook(webhook_url: string): Promise<WebhookConfigResponse> {
    const response = await this.request<WebhookConfigResponse>('/b2b/webhooks/config', {
      method: 'POST',
      body: JSON.stringify({ webhook_url }),
    });
    if (response.success) toast.success('Webhook configurado!');
    return response;
  }
}

// Export singleton instance
export const api = new ApiService();
export default api;
