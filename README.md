# BlackRocke Capital – Premium Investment Platform

A production-ready investment management platform built with Next.js, Supabase (PostgreSQL), and TypeScript.

## Features

### Investor Features
- User registration and login with secure authentication
- Cryptocurrency deposits (USDT TRC20, BTC, ETH, BNB BEP20) with QR codes
- Payment screenshot upload for deposit verification
- Withdrawal requests with wallet address selection
- Investment plan browsing and investment tracking
- Real-time investment progress with countdown timers
- Transaction history with filtering and search
- Referral system with unique codes and links
- Profile management, password change, and 2FA toggle
- Notification center with mark-as-read

### Admin Features
- User management (search, ban/unban, role toggle)
- Investment plan CRUD (create, edit, delete, activate/deactivate)
- Wallet address CRUD (add, edit, delete, enable/disable crypto wallets)
- Deposit approval and rejection with auto-investment
- Withdrawal approval, rejection, and completion workflow
- Reports dashboard with charts and CSV export
- Login logs viewer
- Admin notification center
- Platform settings (email notification toggles, financial limits, security)

### Security
- Supabase Auth with email/password (bcrypt hashing)
- Server-side middleware route protection (admin + investor)
- Client-side layout guards (defense in depth)
- Role-based authorization (admin vs investor)
- Rate limiting on login (5 attempts, 5-minute lockout)
- RLS (Row Level Security) on all database tables
- Input validation and error handling
- Secure cookies via Supabase SSR

### Performance & SEO
- Next.js App Router with static generation
- Sitemap.xml and robots.txt generation
- Open Graph and Twitter card metadata
- Multi-language SEO (11 languages)
- Lazy loading and code splitting
- Optimized fonts via next/font

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Edge Functions**: Supabase Edge Functions (Deno)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **i18n**: Custom (11 languages with RTL support)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Supabase project (free tier works)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd blackrocke-capital
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Supabase project URL, anon key, and service role key.

4. Run database migrations:
   Migrations are applied automatically via the Supabase MCP tools. See the `supabase/migrations/` directory for the SQL files. Apply them in order in your Supabase dashboard SQL editor.

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Creating an Admin Account

1. Register a new account via `/auth/register`
2. Go to your Supabase dashboard > Table Editor > `profiles`
3. Change the `role` column from `investor` to `admin` for your user
4. Log in and navigate to `/admin`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy — Vercel auto-detects Next.js and runs `npm run build`

### Database Migrations

The project includes these migrations in `supabase/migrations/`:
1. `blackrocke_capital_schema.sql` — Base schema (profiles, plans, investments, deposits, withdrawals, transactions, referrals, notifications, wallets, login_activity, user_settings, contact_messages)
2. `blackrocke_capital_extended_schema.sql` — Extended schema additions
3. `backend_feature_extension.sql` — Admin notifications, settings table, investment automation columns

Apply them in order via your Supabase SQL editor or the Supabase MCP migration tool.

### Edge Functions

Three edge functions are deployed via Supabase:
- `handle-deposit` — Deposit approval/rejection with auto-investment
- `handle-withdrawal` — Withdrawal approval/rejection/completion
- `login-activity` — Login logging and admin notifications

## Build

```bash
npm run build
```

## License

Proprietary. All rights reserved.
