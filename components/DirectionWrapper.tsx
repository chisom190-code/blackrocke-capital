'use client';

import { useLanguage } from '@/lib/i18n';
import { useEffect } from 'react';

export default function DirectionWrapper({ children }: { children: React.ReactNode }) {
  const { isRTL, lang } = useLanguage();

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [isRTL, lang]);

  return <>{children}</>;
}
