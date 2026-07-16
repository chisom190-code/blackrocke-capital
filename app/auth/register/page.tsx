'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, Eye, EyeOff, ArrowRight, Shield, CheckCircle, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || '';
  const [referrerName, setReferrerName] = useState<string | null>(null);

  useEffect(() => {
    if (referralCode) {
      supabase.from('user_settings')
        .select('id, referral_code')
        .eq('referral_code', referralCode.toUpperCase())
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            supabase.from('profiles').select('full_name').eq('id', data.id).maybeSingle()
              .then(({ data: prof }) => { if (prof) setReferrerName(prof.full_name); });
          }
        });
    }
  }, [referralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    const { error } = await signUp(email, password, fullName, referralCode || undefined);
    if (error) { setError(error); setLoading(false); return; }
    setSuccess(true);
    setTimeout(() => router.push('/dashboard'), 1500);
  };

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-black relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Investment"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-amber-900/30" />
        </div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
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
          <h2 className="text-4xl font-bold text-white mb-4">Start Building Your Wealth Today</h2>
          <p className="text-gray-400 mb-8">Join 50,000+ investors who trust BlackRocke Capital to grow their wealth.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Min Investment', value: '$50' },
              { label: 'Max ROI', value: '30%' },
              { label: 'Duration', value: '7 Days' },
              { label: 'Support', value: '24/7' },
            ].map(item => (
              <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-amber-400 mb-1">{item.value}</div>
                <div className="text-gray-400 text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span className="text-gray-500 text-sm">Your funds are insured and protected</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
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
            <h1 className="text-3xl font-bold text-black mb-2">{t('auth_register_title')}</h1>
            <p className="text-gray-500">{t('auth_register_subtitle')}</p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-700 text-sm">Account created! Redirecting to dashboard...</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {referrerName && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
              <Users className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span className="text-amber-800 text-sm">You were referred by <strong>{referrerName}</strong></span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth_fullname')}</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth_email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm"
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
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm pr-12"
                  placeholder="Min. 6 characters"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>{t('auth_register_btn')} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-4">
            By registering, you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="text-center text-gray-500 text-sm mt-4">
            {t('auth_has_account')}{' '}
            <Link href="/auth/login" className="text-amber-600 font-semibold hover:text-amber-500 transition-colors">
              {t('auth_sign_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
