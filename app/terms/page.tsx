'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/i18n';
import { FileText, CheckCircle, AlertTriangle, Scale, Globe, Shield, Clock, Mail } from 'lucide-react';

export default function TermsPage() {
  const { t, isRTL } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const sections = [
    { icon: FileText, title: 'Acceptance of Terms', content: 'By accessing and using BlackRocke Capital\'s investment platform, you accept and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services. Your continued use of the platform constitutes acceptance of any updated terms.' },
    { icon: Shield, title: 'Investment Services', content: 'BlackRocke Capital provides cryptocurrency-based investment management services. We offer various investment plans with different ROI percentages and durations. All returns are calculated based on the plan\'s published rates and are not guaranteed. Investment values can fluctuate, and past performance does not guarantee future results. You acknowledge that cryptocurrency investments carry inherent risks.' },
    { icon: Scale, title: 'User Responsibilities', content: 'You are responsible for maintaining the confidentiality of your account credentials, enabling two-factor authentication when available, ensuring all information provided is accurate and complete, using only your own account and not sharing access, complying with all applicable laws and regulations, and reporting any unauthorized access immediately. You must be at least 18 years old to use our services.' },
    { icon: CheckCircle, title: 'Deposits and Withdrawals', content: 'Deposits are accepted via cryptocurrency only (USDT TRC20, Bitcoin, Ethereum, BNB BEP20). All deposits require admin approval before being credited to your account. Withdrawals are processed within 1-3 business days after admin approval. Minimum deposit and withdrawal amounts apply as specified on the platform. You must provide accurate wallet addresses for withdrawals. We are not responsible for funds sent to incorrect addresses.' },
    { icon: AlertTriangle, title: 'Risk Disclosure', content: 'Cryptocurrency investments involve significant risk. Prices can be volatile and you may lose some or all of your investment. We do not guarantee any specific returns. You should only invest what you can afford to lose. We strongly recommend consulting with a qualified financial advisor before making any investment decisions. BlackRocke Capital is not liable for any financial losses resulting from market conditions.' },
    { icon: Globe, title: 'Jurisdiction and Compliance', content: 'These terms are governed by applicable international financial regulations. You are responsible for ensuring your use of our platform complies with your local jurisdiction\'s laws regarding cryptocurrency investments. We reserve the right to restrict access from certain jurisdictions. Any disputes shall be resolved through binding arbitration in accordance with applicable regulations.' },
    { icon: Clock, title: 'Account Suspension and Termination', content: 'We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, attempt to manipulate the platform, provide false information, or fail to comply with verification requirements. You may close your account at any time by contacting support, subject to completion of any pending transactions.' },
    { icon: FileText, title: 'Modifications to Terms', content: 'We may modify these Terms and Conditions at any time. Changes are effective immediately upon posting. Your continued use of the platform after changes constitutes acceptance of the modified terms. We will notify users of significant changes via email or platform notification.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-6">
              <FileText className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">Terms &amp; Conditions</h1>
            <p className="text-gray-500 text-lg">Last updated: July 14, 2026</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 leading-relaxed mb-8">
              Please read these Terms and Conditions carefully before using the BlackRocke Capital investment platform. By using our services, you agree to be bound by the following terms. If you have any questions, please contact our support team before proceeding.
            </p>

            <div className="space-y-8">
              {sections.map((section, i) => {
                const Icon = section.icon;
                return (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-amber-600" />
                      </div>
                      <h2 className="text-xl font-bold text-black">{section.title}</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm">{section.content}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
              <h3 className="font-bold text-black mb-2">Contact Us</h3>
              <p className="text-gray-600 text-sm">
                If you have any questions about these Terms and Conditions, please contact us at Jamshidiazar728@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
