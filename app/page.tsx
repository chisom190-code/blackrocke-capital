'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ChevronLeft, ChevronRight, Plus, Minus, Mail, MapPin, CheckCircle, Download, TrendingUp, Shield, Award, Users } from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';
import FadeIn from '@/components/FadeIn';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

const PLAN_IMAGES = [
  'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/7567226/pexels-photo-7567226.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800',
];

const TESTIMONIALS = [
  { name: 'James Harrison', role: 'CEO, TechVentures', country: 'United States', flag: '🇺🇸', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200', text: 'BlackRocke Capital has completely transformed my investment portfolio. The 23% ROI on my Prestige plan exceeded all my expectations. I\'ve been investing for 15 years and this is by far the best platform.', stars: 5 },
  { name: 'Sophie Laurent', role: 'Financial Director', country: 'France', flag: '🇫🇷', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200', text: 'Exceptional service and remarkable returns. The team is always available, the platform is intuitive, and the weekly reports are incredibly detailed. Je recommande vivement!', stars: 5 },
  { name: 'Ahmed Al-Rashid', role: 'Business Owner', country: 'UAE', flag: '🇦🇪', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200', text: 'I started with the Foundation Portfolio and within a year moved to Platinum. The customer support is outstanding and the returns are consistent. Highly recommended for serious investors.', stars: 5 },
  { name: 'Yuki Tanaka', role: 'Investment Analyst', country: 'Japan', flag: '🇯🇵', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200', text: 'The transparency and professionalism of BlackRocke Capital sets them apart. My Platinum Portfolio has delivered exceptional 30% returns consistently. The dashboard makes tracking investments effortless.', stars: 5 },
  { name: 'Elena Volkova', role: 'Entrepreneur', country: 'Russia', flag: '🇷🇺', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200', text: 'После многих инвестиционных платформ я наконец нашла надежную. BlackRocke Capital — это профессионализм на высшем уровне. Мои вложения выросли на 30% за 3 месяца.', stars: 5 },
  { name: 'Carlos Mendez', role: 'Real Estate Developer', country: 'Brazil', flag: '🇧🇷', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200', text: 'Investi com o plano Executive e fui surpreendido com os resultados. 15% de ROI em 7 dias é incrível. A equipe é extremamente profissional e o suporte 24/7 é excelente!', stars: 5 },
];

const SERVICES = [
  { key: 'portfolio', icon: TrendingUp, image: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'wealth', icon: Shield, image: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'asset', icon: Award, image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'consulting', icon: Users, image: 'https://images.pexels.com/photos/7567226/pexels-photo-7567226.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'retirement', icon: Shield, image: 'https://images.pexels.com/photos/4386158/pexels-photo-4386158.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'corporate', icon: TrendingUp, image: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'risk', icon: Shield, image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { key: 'realestate', icon: Award, image: 'https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

type Plan = { id: string; name: string; slug: string; min_amount: number; max_amount: number; roi_percent: number; duration_days: number; description: string; features: string[]; sort_order: number; };

export default function HomePage() {
  const { t, isRTL } = useLanguage();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [heroParticles] = useState(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 3,
  })));

  useEffect(() => {
    supabase.from('investment_plans').select('*').order('sort_order').then(({ data }) => {
      if (data) setPlans(data as Plan[]);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const faqs = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
    { q: t('faq_q4'), a: t('faq_a4') },
    { q: t('faq_q5'), a: t('faq_a5') },
    { q: t('faq_q6'), a: t('faq_a6') },
  ];

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');
    const { error } = await supabase.from('contact_messages').insert([{ ...contactForm }]);
    if (error) { setContactStatus('error'); return; }
    setContactStatus('success');
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setContactStatus('idle'), 3000);
  };

  const planColors = ['from-gray-900 to-gray-800', 'from-amber-900 to-amber-800', 'from-gray-900 to-black', 'from-amber-700 to-amber-900'];
  const planBadges = ['', '', '', t('plans_popular')];

  return (
    <div className="overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center bg-black overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Investment"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60" />
        </div>

        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {heroParticles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-amber-400/30 animate-pulse"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size * 8}px`,
                height: `${p.size * 8}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Grid Lines */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(251,191,36,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-32 lg:py-0">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-5 py-2 mb-8 animate-fade-in">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-amber-400 text-sm font-medium">{t('hero_badge')}</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              <span className="block">{t('hero_title')}</span>
              <span className="block text-amber-400 mt-2">{t('hero_title_gold')}</span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl">
              {t('hero_subtitle')}
            </p>

            <div className={`flex flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Link
                href="/auth/register"
                className="group flex items-center gap-3 px-8 py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-1"
              >
                {t('hero_cta_primary')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/plans"
                className="flex items-center gap-3 px-8 py-4 border-2 border-amber-400/40 text-amber-400 font-bold rounded-xl hover:border-amber-400 hover:bg-amber-400/10 transition-all duration-300 hover:-translate-y-1"
              >
                {t('hero_cta_secondary')}
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className={`flex flex-wrap gap-6 mt-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {[{ icon: Shield, text: 'Bank-grade Security' }, { icon: Award, text: 'Award Winning' }, { icon: CheckCircle, text: 'Fully Regulated' }].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span className="text-gray-400 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-gray-500 text-xs">Scroll</span>
          <div className="w-0.5 h-8 bg-gradient-to-b from-amber-400 to-transparent" />
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: t('stats_aum'), value: 2.8, prefix: '$', suffix: 'B+', decimals: 1 },
              { label: t('stats_investors'), value: 50000, suffix: '+' },
              { label: t('stats_returns'), value: 24, suffix: '%', decimals: 0 },
              { label: t('stats_countries'), value: 85, suffix: '+' },
            ].map((stat, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold text-black mb-2 group-hover:text-amber-600 transition-colors duration-300">
                    <AnimatedCounter end={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} decimals={stat.decimals || 0} />
                  </div>
                  <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
                  <div className="w-12 h-0.5 bg-amber-400 mx-auto mt-3" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* INVESTMENT PLANS */}
      <section id="plans" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3 block">Investment Plans</span>
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">{t('plans_title')}</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">{t('plans_subtitle')}</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(plans.length > 0 ? plans : [
              { id: '1', name: 'Foundation Portfolio', slug: 'foundation', min_amount: 50, max_amount: 2000, roi_percent: 10, duration_days: 7, description: 'Perfect entry-level investment', features: ['Daily profit reports', 'Email notifications', '24/7 support', 'Secure platform'], sort_order: 1 },
              { id: '2', name: 'Executive Portfolio', slug: 'executive', min_amount: 500, max_amount: 50000, roi_percent: 15, duration_days: 7, description: 'For experienced investors', features: ['Priority support', 'Advanced analytics', 'Weekly briefings', 'Dedicated manager'], sort_order: 2 },
              { id: '3', name: 'Prestige Portfolio', slug: 'prestige', min_amount: 5000, max_amount: 50000, roi_percent: 23, duration_days: 7, description: 'Premium investment tier', features: ['Personal account manager', 'Custom strategies', 'VIP support', 'Monthly calls'], sort_order: 3 },
              { id: '4', name: 'Platinum Portfolio', slug: 'platinum', min_amount: 20000, max_amount: 150000, roi_percent: 30, duration_days: 7, description: 'Elite high-yield portfolio', features: ['Elite concierge service', 'Bespoke portfolio', 'Board-level insights', 'Priority withdrawals'], sort_order: 4 },
            ] as Plan[]).map((plan, i) => (
              <FadeIn key={plan.id} delay={i * 100} direction="up">
                <div className={`relative rounded-2xl overflow-hidden border-2 border-amber-400/30 hover:border-amber-400 group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 bg-white flex flex-col ${i === 3 ? 'ring-2 ring-amber-400' : ''}`}>
                  {planBadges[i] && (
                    <div className="absolute top-4 right-4 z-10 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      {planBadges[i]}
                    </div>
                  )}
                  {/* Card Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={PLAN_IMAGES[i]}
                      alt={plan.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${planColors[i]} opacity-60`} />
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      <div className="text-5xl font-black text-amber-400">{plan.roi_percent}%</div>
                      <div className="text-white/80 text-sm">{t('plans_roi')}</div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-black mb-1">{plan.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{plan.description}</p>

                    <div className="flex items-center justify-between mb-4 py-3 border-y border-gray-100">
                      <div>
                        <div className="text-xs text-gray-400">{t('plans_range')}</div>
                        <div className="font-bold text-black text-sm">
                          ${plan.min_amount.toLocaleString()} – ${plan.max_amount.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Duration</div>
                        <div className="font-bold text-black text-sm">{plan.duration_days} {t('plans_duration')}</div>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-5 flex-1">
                      {(Array.isArray(plan.features) ? plan.features : []).map((feature: string, fi: number) => (
                        <li key={fi} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-2 mt-auto">
                      <Link
                        href="/auth/register"
                        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all duration-200 text-sm"
                      >
                        {t('plans_invest')} <ArrowRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => window.print()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:border-amber-400 hover:text-amber-600 transition-all duration-200 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        {t('plans_pdf')}
                      </button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3 block">What We Offer</span>
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">{t('services_title')}</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">{t('services_subtitle')}</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service, i) => {
              const Icon = service.icon;
              const nameKey = `service_${service.key}` as any;
              const descKey = `service_${service.key}_desc` as any;
              return (
                <FadeIn key={i} delay={i * 75} direction="up">
                  <div className="group relative rounded-2xl overflow-hidden border border-gray-100 hover:border-amber-400 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl cursor-pointer bg-white">
                    <div className="relative h-48 overflow-hidden">
                      <img src={service.image} alt={t(nameKey)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mb-2">
                          <Icon className="w-5 h-5 text-black" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-black mb-2 group-hover:text-amber-600 transition-colors">{t(nameKey)}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{t(descKey)}</p>
                      <div className="mt-3 flex items-center gap-1 text-amber-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Learn more <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(251,191,36,0.8) 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Team"
                  className="rounded-2xl w-full h-96 object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-amber-500 rounded-2xl p-6 shadow-2xl">
                  <div className="text-4xl font-black text-black">15+</div>
                  <div className="text-black/70 text-sm font-medium">Years Experience</div>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="right">
              <div>
                <span className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3 block">Why BlackRocke</span>
                <h2 className="text-4xl font-bold text-white mb-6">The World's Most Trusted Investment Platform</h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  With over 15 years of expertise and $2.8 billion in managed assets, BlackRocke Capital delivers exceptional returns through sophisticated investment strategies and unwavering commitment to client success.
                </p>
                <div className="space-y-4">
                  {[
                    'Expert team with combined 200+ years of experience',
                    'Fully regulated and compliant with international standards',
                    'Advanced AI-powered portfolio optimization',
                    '24/7 dedicated support and transparent reporting',
                  ].map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all duration-300"
                >
                  Get Started Today <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3 block">Our Leadership</span>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">Led by Visionary Expertise</h2>
            <div className="inline-flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-5 shadow-lg">
                <span className="text-4xl font-black text-black">LF</span>
              </div>
              <h3 className="text-2xl font-bold text-black">Larry Fink</h3>
              <p className="text-amber-600 font-semibold mt-1">Chairman &amp; CEO</p>
              <p className="text-gray-500 text-sm mt-2 max-w-md">Leading BlackRocke Capital with decades of financial expertise and a commitment to delivering exceptional investment returns for our global clients.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3 block">Testimonials</span>
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">{t('testimonials_title')}</h2>
              <p className="text-gray-500 text-lg">{t('testimonials_subtitle')}</p>
            </div>
          </FadeIn>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(${isRTL ? '' : '-'}${testimonialIdx * 100}%)` }}
              >
                {TESTIMONIALS.map((t_item, i) => (
                  <div key={i} className="min-w-full">
                    <div className="bg-white rounded-2xl p-8 md:p-12 border border-amber-100 shadow-lg">
                      <div className="flex items-center gap-1 mb-6">
                        {[...Array(t_item.stars)].map((_, si) => (
                          <Star key={si} className="w-5 h-5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <blockquote className="text-gray-700 text-lg leading-relaxed mb-8 italic">
                        &ldquo;{t_item.text}&rdquo;
                      </blockquote>
                      <div className="flex items-center gap-4">
                        <img src={t_item.avatar} alt={t_item.name} className="w-14 h-14 rounded-full object-cover border-2 border-amber-400" />
                        <div>
                          <div className="font-bold text-black">{t_item.name}</div>
                          <div className="text-gray-500 text-sm">{t_item.role}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-lg">{t_item.flag}</span>
                            <span className="text-gray-400 text-xs">{t_item.country}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setTestimonialIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-amber-400 hover:text-amber-600 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIdx(i)}
                    className={`transition-all duration-300 rounded-full ${testimonialIdx === i ? 'w-8 h-3 bg-amber-500' : 'w-3 h-3 bg-gray-300 hover:bg-amber-300'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length)}
                className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-amber-400 hover:text-amber-600 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3 block">FAQ</span>
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">{t('faq_title')}</h2>
              <p className="text-gray-500 text-lg">{t('faq_subtitle')}</p>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 75}>
                <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${openFaq === i ? 'border-amber-400 shadow-md shadow-amber-100' : 'border-gray-200 hover:border-amber-200'}`}>
                  <button
                    className="w-full flex items-center justify-between p-6 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-semibold text-black pr-4">{faq.q}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${openFaq === i ? 'bg-amber-500' : 'bg-gray-100'}`}>
                      {openFaq === i ? <Minus className="w-4 h-4 text-black" /> : <Plus className="w-4 h-4 text-gray-600" />}
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{faq.a}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3 block">Contact Us</span>
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">{t('contact_title')}</h2>
              <p className="text-gray-500 text-lg">{t('contact_subtitle')}</p>
            </div>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <FadeIn direction="left">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">Let's Talk Investments</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Ready to start your investment journey? Our expert team is here to guide you through every step of the process.
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: Mail, label: t('contact_email_label'), value: 'Jamshidiazar728@gmail.com' },
                    { icon: MapPin, label: t('contact_address_label'), value: t('contact_address_value') },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-amber-200 transition-colors">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</div>
                        <div className="font-medium text-black">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-black rounded-2xl">
                  <div className="text-amber-400 font-bold mb-2">Office Hours</div>
                  <div className="text-gray-400 text-sm space-y-1">
                    <div>Monday – Friday: 9:00 AM – 7:00 PM EST</div>
                    <div>Saturday: 10:00 AM – 4:00 PM EST</div>
                    <div>24/7 Online Support Available</div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Contact Form */}
            <FadeIn direction="right">
              <form onSubmit={handleContact} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact_name')}</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 transition-colors text-sm"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact_email')}</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 transition-colors text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact_subject')}</label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 transition-colors text-sm"
                    placeholder="Investment inquiry"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact_message')}</label>
                  <textarea
                    required
                    rows={5}
                    value={contactForm.message}
                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 transition-colors text-sm resize-none"
                    placeholder="Tell us about your investment goals..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={contactStatus === 'sending'}
                  className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {contactStatus === 'sending' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      {t('contact_sending')}
                    </>
                  ) : contactStatus === 'success' ? (
                    <><CheckCircle className="w-5 h-5" /> {t('contact_success')}</>
                  ) : (
                    <>{t('contact_send')} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
