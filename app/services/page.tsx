'use client';

import { TrendingUp, Shield, Award, Users, Target, Globe, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';
import { useLanguage } from '@/lib/i18n';

const SERVICES = [
  { key: 'portfolio', icon: TrendingUp, image: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800', features: ['Portfolio analysis & rebalancing', 'Risk-adjusted returns', 'Diversification strategies', 'Performance benchmarking'] },
  { key: 'wealth', icon: Shield, image: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=800', features: ['Comprehensive financial planning', 'Tax optimization strategies', 'Estate planning', 'Insurance advisory'] },
  { key: 'asset', icon: Award, image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800', features: ['Multi-asset allocation', 'Alternative investments', 'Hedge fund strategies', 'Private equity access'] },
  { key: 'consulting', icon: Users, image: 'https://images.pexels.com/photos/7567226/pexels-photo-7567226.jpeg?auto=compress&cs=tinysrgb&w=800', features: ['1-on-1 expert consultations', 'Market intelligence reports', 'Investment thesis development', 'Bespoke investment strategies'] },
  { key: 'retirement', icon: Target, image: 'https://images.pexels.com/photos/4386158/pexels-photo-4386158.jpeg?auto=compress&cs=tinysrgb&w=800', features: ['Retirement income planning', 'Pension fund management', 'Long-term investment vehicles', 'Social security optimization'] },
  { key: 'corporate', icon: Globe, image: 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=800', features: ['Treasury management', 'Corporate bond portfolios', 'Mergers & acquisitions advisory', 'Institutional fund management'] },
  { key: 'risk', icon: Shield, image: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800', features: ['Risk profiling & assessment', 'Hedging strategies', 'Stress testing portfolios', 'Regulatory compliance'] },
  { key: 'realestate', icon: Award, image: 'https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg?auto=compress&cs=tinysrgb&w=800', features: ['Commercial property investments', 'REITs & real estate funds', 'Property portfolio diversification', 'International real estate access'] },
];

export default function ServicesPage() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <section className="bg-black pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <span className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-4 block">What We Offer</span>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">{t('services_title')}</h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">{t('services_subtitle')}</p>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICES.map((service, i) => {
              const Icon = service.icon;
              const nameKey = `service_${service.key}` as any;
              const descKey = `service_${service.key}_desc` as any;
              return (
                <FadeIn key={i} delay={i * 75}>
                  <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-amber-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col md:flex-row">
                    <div className="relative md:w-48 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                      <img src={service.image} alt={t(nameKey)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 md:bg-gradient-to-b" />
                      <div className="absolute top-4 left-4 w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-black" />
                      </div>
                    </div>
                    <div className="p-6 flex-1">
                      <h3 className="text-lg font-bold text-black mb-2 group-hover:text-amber-700 transition-colors">{t(nameKey)}</h3>
                      <p className="text-gray-500 text-sm mb-4 leading-relaxed">{t(descKey)}</p>
                      <ul className="space-y-1.5">
                        {service.features.map((f, fi) => (
                          <li key={fi} className="flex items-center gap-2 text-xs text-gray-600">
                            <CheckCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8">Let our experts craft the perfect investment strategy for your financial goals.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/register" className="flex items-center gap-2 px-8 py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all duration-300">
              {t('hero_cta_primary')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="flex items-center gap-2 px-8 py-4 border-2 border-amber-400/40 text-amber-400 font-bold rounded-xl hover:border-amber-400 hover:bg-amber-400/10 transition-all duration-300">
              {t('contact_title')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
