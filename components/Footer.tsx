'use client';

import Link from 'next/link';
import { TrendingUp, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function Footer() {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-black text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* CTA Band */}
      <div className="bg-amber-500 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-black mb-1">Ready to Grow Your Wealth?</h3>
            <p className="text-black/70">Join 50,000+ investors building their future with BlackRocke Capital.</p>
          </div>
          <Link
            href="/auth/register"
            className="flex items-center gap-2 px-8 py-4 bg-black text-amber-400 rounded-xl font-bold hover:bg-gray-900 transition-all duration-300 shadow-lg whitespace-nowrap"
          >
            {t('hero_cta_primary')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">BlackRocke</span>
                <span className="text-xl font-bold text-amber-400"> Capital</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">{t('footer_tagline')}</p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors duration-200 group"
                >
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-black" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-amber-400 font-bold mb-5 text-sm uppercase tracking-wider">{t('footer_quick_links')}</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: t('nav_home') },
                { href: '/plans', label: t('nav_plans') },
                { href: '/services', label: t('nav_services') },
                { href: '/faq', label: t('nav_faq') },
                { href: '/contact', label: t('nav_contact') },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-amber-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-amber-400 font-bold mb-5 text-sm uppercase tracking-wider">{t('footer_services')}</h4>
            <ul className="space-y-3">
              {[
                t('service_portfolio'),
                t('service_wealth'),
                t('service_asset'),
                t('service_consulting'),
                t('service_retirement'),
                t('service_realestate'),
              ].map((service) => (
                <li key={service}>
                  <Link
                    href="/services"
                    className="text-gray-400 hover:text-amber-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-amber-400 font-bold mb-5 text-sm uppercase tracking-wider">{t('footer_contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">{t('contact_address_value')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">Jamshidiazar728@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} BlackRocke Capital. {t('footer_rights')}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-gray-500 hover:text-amber-400 text-sm transition-colors">{t('footer_privacy')}</Link>
            <Link href="/terms" className="text-gray-500 hover:text-amber-400 text-sm transition-colors">{t('footer_terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
