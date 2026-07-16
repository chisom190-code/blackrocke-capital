'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Download, Star } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

const PLAN_IMAGES = [
  'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/7567226/pexels-photo-7567226.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800',
];

type Plan = { id: string; name: string; slug: string; min_amount: number; max_amount: number; roi_percent: number; duration_days: number; description: string; features: string[]; sort_order: number; };

export default function PlansPage() {
  const { t, isRTL } = useLanguage();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    supabase.from('investment_plans').select('*').order('sort_order').then(({ data }) => {
      if (data) setPlans(data as Plan[]);
    });
  }, []);

  const planColors = [
    { bg: 'bg-white', border: 'border-gray-200', accent: 'text-gray-900' },
    { bg: 'bg-white', border: 'border-amber-300', accent: 'text-amber-700' },
    { bg: 'bg-white', border: 'border-gray-700', accent: 'text-gray-800' },
    { bg: 'bg-black', border: 'border-amber-500', accent: 'text-amber-400' },
  ];

  const displayPlans = plans.length > 0 ? plans : [
    { id: '1', name: 'Foundation Portfolio', slug: 'foundation', min_amount: 50, max_amount: 2000, roi_percent: 10, duration_days: 7, description: 'Perfect entry-level investment for new investors seeking steady returns.', features: ['Daily profit reports', 'Email notifications', '24/7 support', 'Secure platform', 'Easy withdrawals', 'Mobile dashboard'], sort_order: 1 },
    { id: '2', name: 'Executive Portfolio', slug: 'executive', min_amount: 500, max_amount: 50000, roi_percent: 15, duration_days: 7, description: 'Ideal for experienced investors seeking consistent high returns.', features: ['Priority support', 'Advanced analytics', 'Weekly briefings', 'Dedicated manager', 'Faster withdrawals', 'Custom alerts'], sort_order: 2 },
    { id: '3', name: 'Prestige Portfolio', slug: 'prestige', min_amount: 5000, max_amount: 50000, roi_percent: 23, duration_days: 7, description: 'Premium investment tier with exceptional ROI for serious investors.', features: ['Personal account manager', 'Custom strategies', 'VIP support', 'Monthly calls', 'Priority withdrawals', 'Exclusive insights'], sort_order: 3 },
    { id: '4', name: 'Platinum Portfolio', slug: 'platinum', min_amount: 20000, max_amount: 150000, roi_percent: 30, duration_days: 7, description: 'Exclusive high-yield portfolio for elite and institutional investors.', features: ['Elite concierge service', 'Bespoke portfolio', 'Board-level insights', 'Priority withdrawals', 'Custom reporting', 'Global diversification'], sort_order: 4 },
  ] as Plan[];

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <section className="bg-black pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <span className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-4 block">Investment Opportunities</span>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">{t('plans_title')}</h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">{t('plans_subtitle')}</p>
          <div className="flex items-center justify-center gap-8 mt-10">
            {[{ label: 'Min Investment', value: '$50' }, { label: 'Max ROI', value: '30%' }, { label: 'Duration', value: '7 Days' }].map(item => (
              <div key={item.label} className="text-center">
                <div className="text-3xl font-black text-amber-400">{item.value}</div>
                <div className="text-gray-400 text-xs mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayPlans.map((plan, i) => {
              const colors = planColors[i] || planColors[0];
              const isLast = i === displayPlans.length - 1;
              return (
                <FadeIn key={plan.id} delay={i * 100}>
                  <div className={`relative rounded-2xl border-2 ${colors.border} overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ${isLast ? 'ring-2 ring-amber-500' : ''} ${colors.bg}`}>
                    {isLast && (
                      <div className="absolute top-6 right-6 bg-amber-500 text-black text-xs font-bold px-4 py-1.5 rounded-full z-10 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-black" /> {t('plans_popular')}
                      </div>
                    )}
                    <div className="relative h-56 overflow-hidden">
                      <img src={PLAN_IMAGES[i]} alt={plan.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                      <div className={`absolute inset-0 ${isLast ? 'bg-gradient-to-t from-black/90 via-black/50 to-transparent' : 'bg-gradient-to-t from-black/80 via-black/30 to-transparent'}`} />
                      <div className="absolute bottom-6 left-6">
                        <div className="text-6xl font-black text-amber-400 leading-none">{plan.roi_percent}%</div>
                        <div className={`text-sm ${isLast ? 'text-amber-200' : 'text-white/70'}`}>{t('plans_roi')} in {plan.duration_days} {t('plans_duration')}</div>
                      </div>
                    </div>

                    <div className={`p-8 ${isLast ? 'bg-black text-white' : 'bg-white'}`}>
                      <h2 className={`text-2xl font-black mb-2 ${isLast ? 'text-white' : 'text-black'}`}>{plan.name}</h2>
                      <p className={`mb-6 leading-relaxed ${isLast ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>

                      <div className={`flex items-center justify-between p-4 rounded-xl mb-6 ${isLast ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <div>
                          <div className={`text-xs uppercase tracking-wider mb-1 ${isLast ? 'text-gray-500' : 'text-gray-400'}`}>{t('plans_range')}</div>
                          <div className={`font-black text-lg ${isLast ? 'text-amber-400' : 'text-black'}`}>${plan.min_amount.toLocaleString()} – ${plan.max_amount.toLocaleString()}</div>
                        </div>
                        <div className={`w-px h-10 ${isLast ? 'bg-white/10' : 'bg-gray-200'}`} />
                        <div className="text-right">
                          <div className={`text-xs uppercase tracking-wider mb-1 ${isLast ? 'text-gray-500' : 'text-gray-400'}`}>Duration</div>
                          <div className={`font-black text-lg ${isLast ? 'text-amber-400' : 'text-black'}`}>{plan.duration_days} {t('plans_duration')}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-8">
                        {(Array.isArray(plan.features) ? plan.features : []).map((f: string) => (
                          <div key={f} className="flex items-center gap-2 text-sm">
                            <CheckCircle className={`w-4 h-4 flex-shrink-0 ${isLast ? 'text-amber-400' : 'text-amber-500'}`} />
                            <span className={isLast ? 'text-gray-300' : 'text-gray-600'}>{f}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Link
                          href="/auth/register"
                          className="flex-1 flex items-center justify-center gap-2 py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all duration-200"
                        >
                          {t('plans_invest')} <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => window.print()}
                          className={`flex items-center justify-center gap-2 px-5 py-4 border rounded-xl font-medium transition-all duration-200 ${isLast ? 'border-white/20 text-gray-300 hover:border-amber-400 hover:text-amber-400' : 'border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-600'}`}
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-3xl font-bold text-black text-center mb-10">Plan Comparison</h2>
          </FadeIn>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-black text-white">
                  <th className="text-left px-6 py-4 font-semibold">Feature</th>
                  {displayPlans.map(p => <th key={p.id} className="px-6 py-4 font-semibold text-center text-amber-400">{p.name}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { label: 'Min Investment', values: displayPlans.map(p => `$${p.min_amount.toLocaleString()}`) },
                  { label: 'Max Investment', values: displayPlans.map(p => `$${p.max_amount.toLocaleString()}`) },
                  { label: 'ROI', values: displayPlans.map(p => `${p.roi_percent}%`) },
                  { label: 'Duration', values: displayPlans.map(p => `${p.duration_days} Days`) },
                ].map(row => (
                  <tr key={row.label} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-black text-sm">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={`px-6 py-4 text-center font-semibold text-sm ${i === displayPlans.length - 1 ? 'text-amber-600' : 'text-gray-700'}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
