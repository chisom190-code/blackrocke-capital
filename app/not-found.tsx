'use client';

import Link from 'next/link';
import { ArrowLeft, Home, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6 pt-32 pb-20">
        <div className="text-center max-w-md">
          <div className="text-8xl font-black text-amber-500 mb-4">404</div>
          <h1 className="text-3xl font-bold text-black mb-3">Page Not Found</h1>
          <p className="text-gray-500 mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
            <Link href="/contact" className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              <Search className="w-4 h-4" /> Contact Support
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
