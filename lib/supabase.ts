import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    client = createClient(url, anonKey, {
      auth: { persistSession: true },
    });
  }
  return client;
}

export const supabase = getSupabase();

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  role: 'investor' | 'admin';
  avatar_url: string | null;
  balance: number;
  total_invested: number;
  total_earnings: number;
  total_deposits: number;
  total_withdrawals: number;
  pending_withdrawals: number;
  is_suspended: boolean;
  kyc_status: 'unverified' | 'pending' | 'verified';
  created_at: string;
  updated_at: string;
};

export type InvestmentPlan = {
  id: string;
  name: string;
  slug: string;
  min_amount: number;
  max_amount: number;
  roi_percent: number;
  duration_days: number;
  description: string;
  features: string[];
  is_active: boolean;
  sort_order: number;
};

export type UserInvestment = {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  roi_percent: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  expected_return: number;
  actual_return: number;
  created_at: string;
  investment_plans?: InvestmentPlan;
};

export type Transaction = {
  id: string;
  user_id: string;
  investment_id: string | null;
  type: 'deposit' | 'withdrawal' | 'earning' | 'investment';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  reference: string | null;
  notes: string | null;
  created_at: string;
};

export type Deposit = {
  id: string;
  user_id: string;
  amount: number;
  crypto_type: string;
  wallet_address: string | null;
  txn_hash: string | null;
  screenshot_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  profiles?: { full_name: string | null };
};

export type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  crypto_type: string;
  wallet_address: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  profiles?: { full_name: string | null };
};

export type Referral = {
  id: string;
  referrer_id: string;
  referred_id: string;
  commission_rate: number;
  earnings: number;
  status: string;
  created_at: string;
  referred_profile?: { full_name: string | null; created_at: string };
};

export type Notification = {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'deposit' | 'withdrawal' | 'investment' | 'login';
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
};

export type Wallet = {
  id: string;
  crypto_type: string;
  network: string;
  address: string;
  qr_url: string | null;
  is_active: boolean;
  label: string | null;
  created_at: string;
};

export type LoginActivity = {
  id: string;
  user_id: string;
  ip_address: string | null;
  device: string | null;
  browser: string | null;
  country: string | null;
  city: string | null;
  status: string;
  created_at: string;
};

export type UserSettings = {
  id: string;
  two_fa_enabled: boolean;
  two_fa_secret: string | null;
  email_on_login: boolean;
  email_on_deposit: boolean;
  email_on_withdrawal: boolean;
  email_on_investment: boolean;
  referral_code: string | null;
  referred_by: string | null;
  total_referral_earnings: number;
  updated_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};
