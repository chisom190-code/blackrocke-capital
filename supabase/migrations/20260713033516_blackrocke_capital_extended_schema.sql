/*
# BlackRocke Capital – Extended Schema

Adds: deposits, withdrawals, referrals, notifications, wallets, login_activity, user_settings
All tables have RLS enabled.
*/

-- DEPOSITS
CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(15,2) NOT NULL,
  crypto_type text NOT NULL DEFAULT 'USDT',
  wallet_address text,
  txn_hash text,
  screenshot_url text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deposits_select" ON deposits;
CREATE POLICY "deposits_select" ON deposits FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "deposits_insert" ON deposits;
CREATE POLICY "deposits_insert" ON deposits FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "deposits_update" ON deposits;
CREATE POLICY "deposits_update" ON deposits FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR auth.uid() = user_id);

DROP POLICY IF EXISTS "deposits_delete" ON deposits;
CREATE POLICY "deposits_delete" ON deposits FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- WITHDRAWALS
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(15,2) NOT NULL,
  crypto_type text NOT NULL DEFAULT 'USDT',
  wallet_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "withdrawals_select" ON withdrawals;
CREATE POLICY "withdrawals_select" ON withdrawals FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "withdrawals_insert" ON withdrawals;
CREATE POLICY "withdrawals_insert" ON withdrawals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "withdrawals_update" ON withdrawals;
CREATE POLICY "withdrawals_update" ON withdrawals FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "withdrawals_delete" ON withdrawals;
CREATE POLICY "withdrawals_delete" ON withdrawals FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- REFERRALS
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commission_rate numeric(5,2) NOT NULL DEFAULT 5.00,
  earnings numeric(15,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrals_select" ON referrals;
CREATE POLICY "referrals_select" ON referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "referrals_insert" ON referrals;
CREATE POLICY "referrals_insert" ON referrals FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "referrals_update" ON referrals;
CREATE POLICY "referrals_update" ON referrals FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR auth.uid() = referrer_id);

DROP POLICY IF EXISTS "referrals_delete" ON referrals;
CREATE POLICY "referrals_delete" ON referrals FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "notifications_delete" ON notifications;
CREATE POLICY "notifications_delete" ON notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- WALLETS (admin managed)
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crypto_type text NOT NULL,
  network text NOT NULL DEFAULT 'TRC20',
  address text NOT NULL,
  qr_url text,
  is_active boolean NOT NULL DEFAULT true,
  label text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallets_select" ON wallets;
CREATE POLICY "wallets_select" ON wallets FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "wallets_insert" ON wallets;
CREATE POLICY "wallets_insert" ON wallets FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "wallets_update" ON wallets;
CREATE POLICY "wallets_update" ON wallets FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "wallets_delete" ON wallets;
CREATE POLICY "wallets_delete" ON wallets FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed default wallets
INSERT INTO wallets (crypto_type, network, address, label) VALUES
  ('USDT', 'TRC20', 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'USDT TRC20'),
  ('USDT', 'ERC20', '0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'USDT ERC20'),
  ('BTC', 'Bitcoin', '1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Bitcoin'),
  ('ETH', 'ERC20', '0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Ethereum')
ON CONFLICT DO NOTHING;

-- LOGIN ACTIVITY
CREATE TABLE IF NOT EXISTS login_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address text,
  device text,
  browser text,
  country text,
  city text,
  status text NOT NULL DEFAULT 'success',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE login_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "login_activity_select" ON login_activity;
CREATE POLICY "login_activity_select" ON login_activity FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "login_activity_insert" ON login_activity;
CREATE POLICY "login_activity_insert" ON login_activity FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "login_activity_delete" ON login_activity;
CREATE POLICY "login_activity_delete" ON login_activity FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- USER SETTINGS
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  two_fa_enabled boolean NOT NULL DEFAULT false,
  two_fa_secret text,
  email_on_login boolean NOT NULL DEFAULT true,
  email_on_deposit boolean NOT NULL DEFAULT true,
  email_on_withdrawal boolean NOT NULL DEFAULT true,
  email_on_investment boolean NOT NULL DEFAULT true,
  referral_code text UNIQUE,
  referred_by uuid REFERENCES auth.users(id),
  total_referral_earnings numeric(15,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_settings_select" ON user_settings;
CREATE POLICY "user_settings_select" ON user_settings FOR SELECT TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "user_settings_insert" ON user_settings;
CREATE POLICY "user_settings_insert" ON user_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "user_settings_update" ON user_settings;
CREATE POLICY "user_settings_update" ON user_settings FOR UPDATE TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Extend profiles table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='total_deposits') THEN
    ALTER TABLE profiles ADD COLUMN total_deposits numeric(15,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='total_withdrawals') THEN
    ALTER TABLE profiles ADD COLUMN total_withdrawals numeric(15,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='pending_withdrawals') THEN
    ALTER TABLE profiles ADD COLUMN pending_withdrawals numeric(15,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_suspended') THEN
    ALTER TABLE profiles ADD COLUMN is_suspended boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='kyc_status') THEN
    ALTER TABLE profiles ADD COLUMN kyc_status text NOT NULL DEFAULT 'unverified';
  END IF;
END $$;

-- Function to create user_settings on signup
CREATE OR REPLACE FUNCTION handle_new_user_settings()
RETURNS trigger AS $$
DECLARE
  ref_code text;
BEGIN
  ref_code := upper(substring(md5(random()::text) from 1 for 8));
  INSERT INTO user_settings (id, referral_code)
  VALUES (new.id, ref_code)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_settings ON auth.users;
CREATE TRIGGER on_auth_user_settings
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE handle_new_user_settings();
