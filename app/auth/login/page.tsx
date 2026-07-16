'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, Eye, EyeOff, ArrowRight, Shield, CheckCircle, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [remainingLockout, setRemainingLockout] = useState(0);
  const lockoutTimer = useRef<NodeJS.Timeout | null>(null);
  const { signIn } = useAuth();
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (lockoutUntil) {
      const updateRemaining = () => {
        const remaining = lockoutUntil - Date.now();
        if (remaining <= 0) {
          setLockoutUntil(null);
          setAttempts(0);
          setRemainingLockout(0);
          if (lockoutTimer.current) clearInterval(lockoutTimer.current);
        } else {
          setRemainingLockout(Math.ceil(remaining / 1000));
        }
      };
      updateRemaining();
      lockoutTimer.current = setInterval(updateRemaining, 1000);
      return () => { if (lockoutTimer.current) clearInterval(lockoutTimer.current); };
    }
  }, [lockoutUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutUntil) { return; }
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_MS);
        setError(`Too many failed attempts. Account locked for 5 minutes.`);
      } else {
        setError(`${error} (${MAX_ATTEMPTS - newAttempts} attempts remaining)`);
      }
      setLoading(false);
      return;
    }
    router.push(redirectPath);
  };

  const isLocked = !!lockoutUntil;

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-black relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Investment"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-amber-900/30" />
        </div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">BlackRocke</span>
              <span className="text-xl font-bold text-amber-400"> Capital</span>
            </div>
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4">Welcome back to your wealth journey</h2>
          <p className="text-gray-400 mb-8">Access your portfolio, track investments, and manage your financial future.</p>
          <div className="space-y-3">
            {['$2.8B+ in managed assets', '50,000+ active investors', 'Up to 30% ROI available'].map(item => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span className="text-gray-500 text-sm">Bank-grade security &amp; SSL encryption</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-xl font-bold text-black">BlackRocke</span>
              <span className="text-xl font-bold text-amber-500"> Capital</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">{t('auth_login_title')}</h1>
            <p className="text-gray-500">{t('auth_login_subtitle')}</p>
          </div>

          {isLocked && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <Lock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 text-sm font-semibold">Account temporarily locked</p>
                <p className="text-red-500 text-xs mt-1">Too many failed attempts. Try again in {Math.floor(remainingLockout / 60)}:{(remainingLockout % 60).toString().padStart(2, '0')} minutes.</p>
              </div>
            </div>
          )}

          {error && !isLocked && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth_email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLocked}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth_password')}</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLocked}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm pr-12 disabled:opacity-50"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>{t('auth_login_btn')} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            {t('auth_no_account')}{' '}
            <Link href="/auth/register" className="text-amber-600 font-semibold hover:text-amber-500 transition-colors">
              {t('auth_sign_up')}
            </Link>
          </p>
          <p className="text-center mt-3">
            <Link href="/auth/forgot-password" className="text-gray-400 hover:text-amber-600 text-sm transition-colors">
              {t('auth_forgot')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
