export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorEnvelope {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  profile_photo: string | null;
  referral_code: string;
  is_active: boolean;
  is_admin: boolean;
  roles: string[];
  phone_verified_at: string | null;
  created_at: string;
}

export interface Wallet {
  id: number;
  balance: number;
  total_deposited: number;
  total_invested: number;
  total_withdrawn: number;
  total_profit: number;
  total_commission: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: 'Bearer';
}

export interface WalletResponse {
  wallet: Wallet;
  today_profit: number;
  month_profit: number;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  category: string | null;
  min_investment: number;
  max_investment: number;
  estimated_return: number;
  duration_days: number;
  risk_level: 'low' | 'medium' | 'high';
  start_date: string;
  end_date: string;
  funding_target: number;
  current_funding: number;
  funding_progress: number;
  status: 'open' | 'closed' | 'funding';
  is_featured: boolean;
  is_investable: boolean;
  terms: string | null;
  risk_disclosure: string | null;
  created_at: string;
}

export type DepositStatus = 'pending' | 'paid' | 'approved' | 'rejected';

export interface Deposit {
  id: number;
  deposit_no: string;
  amount: number;
  payment_method: string;
  proof_path: string | null;
  status: DepositStatus;
  admin_note: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
}

export interface DepositInstructions {
  payment_method: 'qris';
  merchant_name: string;
  qris_payload: string | null;
  min_deposit: number;
  max_deposit: number;
}

export type InvestmentStatus = 'active' | 'completed' | 'cancelled';

export interface Investment {
  id: number;
  investment_no: string;
  amount: number;
  expected_return: number;
  expected_return_amount: number;
  daily_return_amount: number;
  duration_days: number;
  start_date: string;
  maturity_date: string;
  current_earnings: number;
  status: InvestmentStatus;
  completed_at: string | null;
  cancelled_at: string | null;
  project: Project | null;
  created_at: string;
}

export interface InvestmentDetail {
  investment: Investment;
  earnings_chart: { date: string; amount: number }[];
}

export interface InvestmentSummary {
  total_invested: number;
  active_investments: number;
  active_amount: number;
  total_expected_return: number;
  total_earned: number;
  today_profit: number;
}

export type WithdrawalStatus = 'pending' | 'processing' | 'approved' | 'completed' | 'rejected';

export interface Withdrawal {
  id: number;
  withdrawal_no: string;
  amount: number;
  fee: number;
  final_amount: number;
  account_type: string;
  provider: string;
  account_name: string;
  account_number: string;
  status: WithdrawalStatus;
  admin_note: string | null;
  submitted_at: string | null;
  processed_at: string | null;
  approved_at: string | null;
  completed_at: string | null;
  rejected_at: string | null;
  created_at: string;
}

export interface WithdrawalRules {
  fee_flat: number;
  fee_percent: number;
  min_amount: number;
  max_amount: number;
  available_balance: number;
}

export interface WithdrawalAccount {
  id: number;
  account_type: 'bank' | 'ewallet';
  provider: string;
  account_name: string;
  account_number: string;
  is_default: boolean;
}

export type TransactionType = 'deposit' | 'investment' | 'withdrawal' | 'profit' | 'commission' | 'adjustment';

export interface WalletTransaction {
  id: number;
  tx_id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  ref_type: string | null;
  ref_id: number | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface ReferralSummary {
  referral_code: string;
  referral_link: string;
  commission_percent: number;
  total_invited: number;
  total_qualified: number;
  total_commission: number;
}

export interface Referral {
  id: number;
  status: 'pending' | 'qualified';
  commission_amount: number;
  referred: User;
  created_at: string;
}

export interface Commission {
  id: number;
  amount: number;
  status: string;
  credited_at: string | null;
  created_at: string;
}

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  icon: string;
  type: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  pagination: PaginationMeta | null;
  unread_count: number;
}

export interface ProfileResponse {
  user: User;
  wallet: Wallet;
  withdrawal_accounts: WithdrawalAccount[];
}

export type RegisterPayload = {
  name: string;
  phone: string;
  password: string;
  pin: string;
  referral_code?: string;
};

export type StoreDepositPayload = {
  amount: number;
  idempotency_key: string;
};

export type StoreInvestmentPayload = {
  project_id: number;
  amount: number;
  pin: string;
  idempotency_key: string;
};

export type StoreWithdrawalPayload = {
  amount: number;
  account_id: number;
  pin: string;
  idempotency_key: string;
};

export type WithdrawalAccountPayload = {
  account_type: 'bank' | 'ewallet';
  provider: string;
  account_name: string;
  account_number: string;
  is_default?: boolean;
};
