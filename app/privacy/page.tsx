'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/i18n';
import { Shield, Lock, Database, Eye, Users, Mail, FileText, AlertCircle } from 'lucide-react';

export default function PrivacyPage() {
  const { t, isRTL } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const sections = [
    { icon: Eye, title: 'Information We Collect', content: 'We collect information you provide directly to us when you create an account, make deposits, request withdrawals, or contact our support team. This includes your name, email address, phone number, country of residence, and transaction details. We also automatically collect certain technical information such as your IP address, browser type, device information, and usage data through cookies and similar technologies.' },
    { icon: Database, title: 'How We Use Your Information', content: 'We use your information to provide and maintain our investment services, process your deposits and withdrawals, communicate with you about your account and investments, send security alerts and notifications, comply with legal obligations, prevent fraud and unauthorized access, and improve our platform features and user experience.' },
    { icon: Lock, title: 'Data Security', content: 'We implement industry-standard security measures to protect your personal and financial information. This includes encryption of data in transit using TLS/SSL, secure password hashing using bcrypt, two-factor authentication options, role-based access controls, regular security audits, and secure server infrastructure. Your wallet addresses and transaction data are encrypted and stored securely.' },
    { icon: Users, title: 'Information Sharing', content: 'We do not sell, trade, or rent your personal information to third parties. We may share your information only in limited circumstances: with service providers who help us operate our platform (under strict confidentiality agreements), when required by law or legal process, to protect our legal rights, or with your explicit consent. We never share your investment details or wallet addresses with unauthorized parties.' },
    { icon: Mail, title: 'Marketing Communications', content: 'You may opt out of receiving promotional emails from us at any time by clicking the unsubscribe link in the email or contacting our support team. We will continue to send you essential account-related communications such as security alerts, transaction confirmations, and investment updates regardless of your marketing preferences.' },
    { icon: FileText, title: 'Your Data Rights', content: 'You have the right to access your personal data, request correction of inaccurate information, request deletion of your account and associated data (subject to legal retention requirements), export your data in a portable format, and object to certain processing of your information. To exercise these rights, contact our support team.' },
    { icon: Database, title: 'Data Retention', content: 'We retain your personal information for as long as your account is active. We may retain certain information after account closure as required by law, for fraud prevention, or to maintain transaction records for audit purposes. Investment and transaction records are typically retained for a minimum of 7 years as required by financial regulations.' },
    { icon: AlertCircle, title: 'Changes to This Policy', content: 'We may update this privacy policy from time to time. We will notify you of any material changes by posting the updated policy on this page and, for significant changes, sending a notification to your registered email address. We encourage you to review this page periodically.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">Privacy Policy</h1>
            <p className="text-gray-500 text-lg">Last updated: July 14, 2026</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 leading-relaxed mb-8">
              At BlackRocke Capital, we are committed to protecting your privacy and ensuring the security of your personal and financial information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our investment platform and services.
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
                If you have any questions about this Privacy Policy or how we handle your data, please contact us at Jamshidiazar728@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
