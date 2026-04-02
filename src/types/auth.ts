// NeXPay Types - Complete Type Definitions

export type Tier = 'WHITE' | 'BLACK';
export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  cpf?: string;
  role: Tier;
  kyc_status: KycStatus;
  two_factor_enabled?: boolean;
  webhook_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  access_token: string;
  tier: Tier;
  user?: User;
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
}

export interface Balances {
  BRL: number;
  EUR: number;
  USDT: number;
  BTC: number;
}

export interface BalanceResponse {
  success: boolean;
  balances: Balances;
}

export interface DepositResponse {
  success: boolean;
  type: 'PIX_DYNAMIC';
  qr_code: string;
  copy_paste: string;
  transactionId: string;
}

export interface WithdrawResponse {
  success: boolean;
  transactionId: string;
  message: string;
}

export interface SwapResponse {
  success: boolean;
  from_amount: number;
  to_amount: number;
  fee_applied: string;
  transaction_id: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'swap';
  method?: string;
  currency_from?: string;
  amount_from?: string;
  currency_to?: string;
  amount_to?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at?: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface DepositStatusResponse {
  success: boolean;
  data: {
    status: 'pending' | 'completed';
    transaction_id?: string;
  };
}

export interface ApiKey {
  id: string;
  key: string;
  is_active: boolean;
  created_at: string;
  last_used?: string;
}

export interface ApiKeysResponse {
  success: boolean;
  data: ApiKey[];
}

export interface GenerateApiKeyResponse {
  success: boolean;
  data: {
    key: string;
    id: string;
  };
}

export interface WebhookConfigResponse {
  success: boolean;
  webhook_url: string;
}

// 2FA Types
export interface TwoFAGenerateResponse {
  success: boolean;
  qr_code: string; // Base64 data URL
  secret: string;
  backup_codes?: string[];
}

export interface TwoFAVerifyResponse {
  success: boolean;
  message: string;
  backup_codes?: string[];
}

// Registration payload types for different tiers
export interface WhiteTierRegistration {
  email: string;
  password: string;
  name: string;
  tier: 'WHITE';
  cpf: string;
}

export interface BlackTierRegistration {
  email: string;
  password: string;
  name: string;
  tier: 'BLACK';
}

export type RegistrationPayload = WhiteTierRegistration | BlackTierRegistration;

// Checkout / B2B Types
export interface CheckoutLink {
  id: string;
  title: string;
  description: string;
  currency: string;
  amount: number;
  status: string;
  payment_url: string;
  created_at: string;
}

export interface CheckoutDetails {
  success: boolean;
  data: {
    id: string;
    title: string;
    description: string;
    currency: string;
    amount: number;
    status: string;
    pix_code?: string;
    pix_copy_paste?: string;
    created_at: string;
  };
}

export interface CheckoutListResponse {
  success: boolean;
  data: CheckoutLink[];
}

export interface CryptoDepositResponse {
  success: boolean;
  address: string;
  network: string;
  min_deposit: string;
}
