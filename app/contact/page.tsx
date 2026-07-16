'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle, Mail, MapPin } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

export default function ContactPage() {
  const { t, isRTL } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    const { error } = await supabase.from('contact_messages').insert([form]);
    if (error) { setStatus('error'); return; }
    setStatus('success');
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <section className="bg-black pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <span className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-4 block">Get In Touch</span>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">{t('contact_title')}</h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">{t('contact_subtitle')}</p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <FadeIn direction="left">
              <div>
                <h2 className="text-3xl font-bold text-black mb-6">We're Here to Help</h2>
                <p className="text-gray-500 leading-relaxed mb-8">
                  Whether you have questions about our investment plans, need help with your account, or want to learn more about our services, our expert team is ready to assist you.
                </p>
                <div className="space-y-5">
                  {[
                    { icon: Mail, label: t('contact_email_label'), value: 'Jamshidiazar728@gmail.com', detail: '24/7 Response' },
                    { icon: MapPin, label: t('contact_address_label'), value: t('contact_address_value'), detail: 'Financial District, NYC' },
                  ].map(({ icon: Icon, label, value, detail }) => (
                    <div key={label} className="flex items-start gap-5 p-5 bg-gray-50 rounded-2xl hover:bg-amber-50 hover:border-amber-200 border border-transparent transition-all duration-300">
                      <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</div>
                        <div className="font-bold text-black">{value}</div>
                        <div className="text-gray-500 text-sm">{detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
                <h3 className="text-xl font-bold text-black mb-6">Send Us a Message</h3>
                {status === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">{t('contact_success')}</span>
                  </div>
                )}
                {status === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">Something went wrong. Please try again.</div>
                )}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact_name')}</label>
                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm" placeholder="John Smith" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact_email')}</label>
                    <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact_subject')}</label>
                  <input type="text" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm" placeholder="How can we help?" />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact_message')}</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm resize-none" placeholder="Tell us about your investment goals..." />
                </div>
                <button type="submit" disabled={status === 'sending'} className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70">
                  {status === 'sending' ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> {t('contact_sending')}</> : <>{t('contact_send')} <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
