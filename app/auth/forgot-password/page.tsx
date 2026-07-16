'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowRight, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { isRTL } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="hidden lg:flex w-1/2 bg-black relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-amber-900/30" />
        </div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center"><TrendingUp className="w-6 h-6 text-black" /></div>
            <div><span className="text-xl font-bold text-white">BlackRocke</span><span className="text-xl font-bold text-amber-400"> Capital</span></div>
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4">Password Recovery</h2>
          <p className="text-gray-400">We'll send a secure link to reset your password. Check your inbox after submitting.</p>
        </div>
        <div className="relative z-10 text-gray-500 text-sm">© {new Date().getFullYear()} BlackRocke Capital</div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center"><TrendingUp className="w-6 h-6 text-amber-400" /></div>
            <div><span className="text-xl font-bold text-black">BlackRocke</span><span className="text-xl font-bold text-amber-500"> Capital</span></div>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-black mb-3">Check Your Email</h1>
              <p className="text-gray-500 mb-6">We've sent a password reset link to <strong>{email}</strong>. The link will expire in 24 hours.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </div>
              <button onClick={() => setSent(false)} className="w-full py-4 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors mb-3">
                Try Again
              </button>
              <Link href="/auth/login" className="block text-center text-amber-600 font-semibold hover:text-amber-500 text-sm">Back to Login</Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-black mb-2">Forgot Password?</h1>
                <p className="text-gray-500">Enter your email and we'll send you a reset link.</p>
              </div>

              {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm"
                      placeholder="you@example.com" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Mail className="w-4 h-4" /> Send Reset Link</>}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-amber-600 font-semibold hover:text-amber-500 transition-colors">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
