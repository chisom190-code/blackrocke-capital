/*
# Backend Feature Extension

1. New Tables
- `admin_notifications` — notifications sent to admins (login alerts, system events)
  - id (uuid PK)
  - user_id (uuid, nullable — the user who triggered the notification)
  - type (text — login, deposit, withdrawal, investment, system)
  - title (text)
  - message (text)
  - metadata (jsonb — browser, device, OS, IP, country, etc.)
  - is_read (boolean, default false)
  - created_at (timestamptz)
- `settings` — platform-wide settings (email notification toggles, etc.)
  - id (uuid PK)
  - key (text, unique)
  - value (text)
  - updated_at (timestamptz)

2. Modified Tables
- `deposits` — add `plan_id` (uuid, nullable, FK to investment_plans) so admin can auto-start an investment when approving a deposit.
- `withdrawals` — add `completed_at` (timestamptz, nullable) to track when a withdrawal reaches "completed" status.
- `user_investments` — add `daily_profit` (numeric) and `source` (text — 'deposit' or 'manual') to track investment origin.

3. Security
- Enable RLS on `admin_notifications` — only admins can read; any authenticated user can insert (for login alerts).
- Enable RLS on `settings` — admins can read/write; all authenticated users can read.
- Deposits/withdrawals/user_investments policies already exist; new columns inherit existing policies.

4. Important Notes
- The `plan_id` on deposits is optional. When a user selects an investment plan during deposit, the admin approval flow will auto-create a user_investment linked to that plan.
- `admin_notifications` stores login activity metadata as JSONB so the admin dashboard can display browser, device, OS, IP, and country.
- `settings` table stores key-value pairs for platform configuration including email notification preferences.
*/

-- admin_notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_notif_select" ON admin_notifications;
CREATE POLICY "admin_notif_select" ON admin_notifications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "admin_notif_insert" ON admin_notifications;
CREATE POLICY "admin_notif_insert" ON admin_notifications FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_notif_update" ON admin_notifications;
CREATE POLICY "admin_notif_update" ON admin_notifications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "admin_notif_delete" ON admin_notifications;
CREATE POLICY "admin_notif_delete" ON admin_notifications FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- settings table (key-value platform settings)
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_select" ON settings;
CREATE POLICY "settings_select" ON settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "settings_insert" ON settings;
CREATE POLICY "settings_insert" ON settings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "settings_update" ON settings;
CREATE POLICY "settings_update" ON settings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed default settings
INSERT INTO settings (key, value) VALUES
  ('email_login_notifications', 'true'),
  ('email_deposit_notifications', 'true'),
  ('email_withdrawal_notifications', 'true'),
  ('email_investment_notifications', 'true'),
  ('site_name', 'BlackRocke Capital'),
  ('support_email', 'Jamshidiazar728@gmail.com')
ON CONFLICT (key) DO NOTHING;

-- Add plan_id to deposits
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deposits' AND column_name='plan_id') THEN
    ALTER TABLE deposits ADD COLUMN plan_id uuid REFERENCES investment_plans(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add completed_at to withdrawals
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='withdrawals' AND column_name='completed_at') THEN
    ALTER TABLE withdrawals ADD COLUMN completed_at timestamptz;
  END IF;
END $$;

-- Add daily_profit and source to user_investments
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_investments' AND column_name='daily_profit') THEN
    ALTER TABLE user_investments ADD COLUMN daily_profit numeric(15,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_investments' AND column_name='source') THEN
    ALTER TABLE user_investments ADD COLUMN source text NOT NULL DEFAULT 'manual';
  END IF;
END $$;

-- Add referred_by display name to user_settings for convenience
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='referred_by_name') THEN
    ALTER TABLE user_settings ADD COLUMN referred_by_name text;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_deposits_plan_id ON deposits(plan_id);
