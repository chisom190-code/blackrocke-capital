/*
# BlackRocke Capital – Full Platform Schema

1. profiles – extends auth.users with role, balance, country
2. investment_plans – the 4 portfolio tiers (seeded)
3. user_investments – per-user active investments
4. transactions – deposit/withdrawal/earning log
5. contact_messages – public contact form submissions

Security: RLS enabled on every table.
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  country text,
  role text NOT NULL DEFAULT 'investor',
  avatar_url text,
  balance numeric(15,2) NOT NULL DEFAULT 0,
  total_invested numeric(15,2) NOT NULL DEFAULT 0,
  total_earnings numeric(15,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE
TO authenticated USING (auth.uid() = id);

-- INVESTMENT PLANS
CREATE TABLE IF NOT EXISTS investment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  min_amount numeric(15,2) NOT NULL,
  max_amount numeric(15,2) NOT NULL,
  roi_percent numeric(5,2) NOT NULL,
  duration_days integer NOT NULL DEFAULT 7,
  description text,
  features jsonb DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plans_select" ON investment_plans;
CREATE POLICY "plans_select" ON investment_plans FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "plans_insert" ON investment_plans;
CREATE POLICY "plans_insert" ON investment_plans FOR INSERT
TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "plans_update" ON investment_plans;
CREATE POLICY "plans_update" ON investment_plans FOR UPDATE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "plans_delete" ON investment_plans;
CREATE POLICY "plans_delete" ON investment_plans FOR DELETE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

INSERT INTO investment_plans (name, slug, min_amount, max_amount, roi_percent, duration_days, description, features, sort_order)
VALUES
  ('Foundation Portfolio','foundation',50,2000,10,7,'Perfect entry-level investment for new investors','["Daily profit reports","Email notifications","24/7 support","Secure platform"]',1),
  ('Executive Portfolio','executive',500,50000,15,7,'Ideal for experienced investors seeking consistent returns','["Priority support","Advanced analytics","Weekly briefings","Dedicated manager"]',2),
  ('Prestige Portfolio','prestige',5000,50000,23,7,'Premium investment tier with exceptional ROI','["Personal account manager","Custom strategies","VIP support","Monthly calls"]',3),
  ('Platinum Portfolio','platinum',20000,150000,30,7,'Exclusive high-yield portfolio for elite investors','["Elite concierge service","Bespoke portfolio","Board-level insights","Priority withdrawals"]',4)
ON CONFLICT (slug) DO NOTHING;

-- USER INVESTMENTS
CREATE TABLE IF NOT EXISTS user_investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES investment_plans(id),
  amount numeric(15,2) NOT NULL,
  roi_percent numeric(5,2) NOT NULL,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  expected_return numeric(15,2) NOT NULL,
  actual_return numeric(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "investments_select" ON user_investments;
CREATE POLICY "investments_select" ON user_investments FOR SELECT
TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "investments_insert" ON user_investments;
CREATE POLICY "investments_insert" ON user_investments FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "investments_update" ON user_investments;
CREATE POLICY "investments_update" ON user_investments FOR UPDATE
TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "investments_delete" ON user_investments;
CREATE POLICY "investments_delete" ON user_investments FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id uuid REFERENCES user_investments(id),
  type text NOT NULL,
  amount numeric(15,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reference text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select" ON transactions;
CREATE POLICY "transactions_select" ON transactions FOR SELECT
TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "transactions_insert" ON transactions;
CREATE POLICY "transactions_insert" ON transactions FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_update" ON transactions;
CREATE POLICY "transactions_update" ON transactions FOR UPDATE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "transactions_delete" ON transactions;
CREATE POLICY "transactions_delete" ON transactions FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_insert" ON contact_messages;
CREATE POLICY "contact_insert" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "contact_select" ON contact_messages;
CREATE POLICY "contact_select" ON contact_messages FOR SELECT
TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "contact_update" ON contact_messages;
CREATE POLICY "contact_update" ON contact_messages FOR UPDATE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name',''), COALESCE(new.raw_user_meta_data->>'role','investor'))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
