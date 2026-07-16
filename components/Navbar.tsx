'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Globe, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage, LANGUAGES } from '@/lib/i18n';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const { t, setLang, currentLanguage, isRTL } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/', label: t('nav_home') },
    { href: '/plans', label: t('nav_plans') },
    { href: '/services', label: t('nav_services') },
    { href: '/faq', label: t('nav_faq') },
    { href: '/contact', label: t('nav_contact') },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-amber-100' : 'bg-white/90 backdrop-blur-sm'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300">
              <TrendingUp className="w-6 h-6 text-amber-400 group-hover:text-white transition-colors duration-300" />
            </div>
            <div>
              <span className="text-xl font-bold text-black tracking-tight">BlackRocke</span>
              <span className="text-xl font-bold text-amber-500 tracking-tight"> Capital</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 relative group ${
                  isActive(link.href) ? 'text-amber-600' : 'text-gray-700 hover:text-amber-600'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-amber-500 transition-all duration-300 ${isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className={`hidden lg:flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Language Selector */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-amber-400 transition-all duration-200 text-sm text-gray-700 hover:text-amber-600"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLanguage.flag}</span>
                <span className="hidden xl:block">{currentLanguage.nativeName}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className={`absolute top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 w-52 max-h-80 overflow-y-auto ${isRTL ? 'left-0' : 'right-0'}`}>
                  {LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => { setLang(language.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 text-left ${
                        currentLanguage.code === language.code
                          ? 'bg-amber-50 text-amber-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span>{language.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <>
                {profile?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors"
                  >
                    {t('nav_admin')}
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-sm font-medium px-4 py-2 border border-amber-400 text-amber-600 rounded-lg hover:bg-amber-50 transition-all duration-200"
                >
                  {t('nav_dashboard')}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium px-4 py-2 bg-black text-white rounded-lg hover:bg-amber-600 transition-all duration-200"
                >
                  {t('nav_logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors px-3 py-2"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium px-5 py-2.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-all duration-200 shadow-md hover:shadow-amber-200 font-semibold"
                >
                  {t('nav_register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 bg-white border-t border-gray-100 ${
          mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-4 pb-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href) ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100">
            <p className="px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wider">Language</p>
            <div className="grid grid-cols-2 gap-1">
              {LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => { setLang(language.code); setMobileOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentLanguage.code === language.code ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{language.flag}</span>
                  <span className="truncate">{language.nativeName}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-center bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
                  {t('nav_dashboard')}
                </Link>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="block w-full px-4 py-3 text-center bg-black text-white rounded-lg text-sm font-medium">
                  {t('nav_logout')}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-center border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                  {t('nav_login')}
                </Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-center bg-amber-500 text-black rounded-lg text-sm font-semibold">
                  {t('nav_register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
