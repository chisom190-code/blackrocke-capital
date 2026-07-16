'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { useLanguage } from '@/lib/i18n';

export default function FAQPage() {
  const { t, isRTL } = useLanguage();
  const [open, setOpen] = useState<number | null>(0);

  const faqs = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
    { q: t('faq_q4'), a: t('faq_a4') },
    { q: t('faq_q5'), a: t('faq_a5') },
    { q: t('faq_q6'), a: t('faq_a6') },
    { q: 'What payment methods are accepted?', a: 'We accept all major cryptocurrencies (BTC, ETH, USDT) and traditional bank transfers. Our payment gateway supports over 50 currencies.' },
    { q: 'How do I track my investment performance?', a: 'Your dashboard provides real-time tracking of all investments, including daily performance metrics, ROI calculations, and comprehensive transaction history.' },
    { q: 'What happens when my investment plan expires?', a: 'When your plan expires, your principal plus earned returns are automatically credited to your account balance. You can then reinvest or withdraw at any time.' },
    { q: 'Is there a referral program?', a: 'Yes! Earn 5% commission on every investment made by users you refer. Commissions are paid directly to your account with no minimum payout threshold.' },
  ];

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <section className="bg-black pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/4386158/pexels-photo-4386158.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <span className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-4 block">FAQ</span>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">{t('faq_title')}</h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">{t('faq_subtitle')}</p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 50}>
                <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${open === i ? 'border-amber-400 shadow-lg shadow-amber-100' : 'border-gray-200 hover:border-amber-200'}`}>
                  <button
                    className="w-full flex items-center justify-between p-6 text-left group"
                    onClick={() => setOpen(open === i ? null : i)}
                  >
                    <span className={`font-semibold pr-4 transition-colors ${open === i ? 'text-amber-700' : 'text-black group-hover:text-amber-700'}`}>{faq.q}</span>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${open === i ? 'bg-amber-500 rotate-180' : 'bg-gray-100 group-hover:bg-amber-100'}`}>
                      {open === i ? <Minus className="w-4 h-4 text-black" /> : <Plus className="w-4 h-4 text-gray-600" />}
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ${open === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{faq.a}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={500}>
            <div className="mt-16 bg-black rounded-2xl p-10 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">Still Have Questions?</h3>
              <p className="text-gray-400 mb-6">Our team is available 24/7 to answer all your investment questions.</p>
              <a href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all duration-300">
                {t('contact_title')}
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
