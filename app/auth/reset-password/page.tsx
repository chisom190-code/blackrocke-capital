'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { isRTL } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess(true);
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="hidden lg:flex w-1/2 bg-black relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-amber-900/30" />
        </div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center"><TrendingUp className="w-6 h-6 text-black" /></div>
            <div><span className="text-xl font-bold text-white">BlackRocke</span><span className="text-xl font-bold text-amber-400"> Capital</span></div>
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4">Secure Your Account</h2>
          <p className="text-gray-400">Choose a strong password to protect your investment portfolio and financial data.</p>
          <div className="mt-6 space-y-2">
            {['At least 8 characters', 'Mix of letters and numbers', 'Avoid common passwords'].map(tip => (
              <div key={tip} className="flex items-center gap-2 text-gray-400 text-sm"><CheckCircle className="w-4 h-4 text-amber-400" />{tip}</div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-gray-500 text-sm"><Shield className="w-4 h-4 text-amber-400" />Bank-grade encryption</div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center"><TrendingUp className="w-6 h-6 text-amber-400" /></div>
            <div><span className="text-xl font-bold text-black">BlackRocke</span><span className="text-xl font-bold text-amber-500"> Capital</span></div>
          </div>

          {success ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-black mb-3">Password Updated!</h1>
              <p className="text-gray-500">Your password has been reset successfully. Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-black mb-2">Reset Password</h1>
                <p className="text-gray-500">Enter your new password below.</p>
              </div>

              {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm pr-12"
                      placeholder="Min. 6 characters" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${password.length >= i * 2 ? (password.length >= 8 ? 'bg-green-500' : 'bg-amber-500') : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                    className={`w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all text-sm ${confirm && confirm !== password ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-amber-400'}`}
                    placeholder="Repeat your password" />
                  {confirm && confirm !== password && <p className="text-red-500 text-xs mt-1">Passwords do not match</p>}
                </div>
                <button type="submit" disabled={loading || (!!confirm && confirm !== password)} className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Shield className="w-4 h-4" /> Reset Password</>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
