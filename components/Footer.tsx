'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Youtube } from 'iconsax-reactjs';
import Image from 'next/image';
import { Button } from './ui/button';
import LocalCurrencySelector from './ui/LocalCurrencySelector';
// import LanguageCurrencyModal from './LanguageCurrencyModal';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';

export default function Footer() {
  // const [modalOpen, setModalOpen] = useState(false);
  // const [modalType, setModalType] = useState<'language' | 'currency' | null>(null);
  const { selectedCurrency } = useGlobalCurrency();

  // const handleOpenModal = (type: 'language' | 'currency') => {
  //   setModalType(type);
  //   setModalOpen(true);
  // };
  // const handleCloseModal = () => {
  //   setModalOpen(false);
  //   setModalType(null);
  // };

  return (
    <footer className="bg-white hidden md:block dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and tagline */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Franchiseen Logo" className="h-8 w-8" width={32} height={32} />
              <span className="text-xl ml-2 font-bold">FRANCHISEEN</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <LocalCurrencySelector
                compact={true}
                showLabel={false}
                className="w-auto"
              />
              {/* <Button variant="outline" size="sm" onClick={() => handleOpenModal('language')}>
                Language: English
              </Button> */}
            </div>

            <div className="flex gap-4">
              <a href="#" aria-label="Instagram" className="hover:text-yellow-600">
                <Instagram />
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-yellow-600">
                <Facebook />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-yellow-600">
                <Youtube />
              </a>
            </div>
          </div>

          {/* Company links */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/company/how" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">How it Works</Link>
              </li>
              <li>
                <Link href="/about" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">About Us</Link>
              </li>
              <li>
                <Link href="/careers" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Careers</Link>
              </li>
              <li>
                <Link href="/blog" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Blog</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/resources/help" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Help Center</Link>
              </li>
              <li>
                <Link href="/resources/doc" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Documentation</Link>
              </li>
              
              <li>
                <Link href="/resources/support" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Support</Link>
              </li>
              <li>
                <Link href="/resources/faq
                " className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">FAQs</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/legal/franchise" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Franchise Policy</Link>
              </li>
              <li>
                <Link href="/legal/funds" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Investment Policy</Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Terms of Service</Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          {/* <div className="flex flex-col gap-2 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Us</h3>
            <p className="text-stone-600 dark:text-stone-300 text-sm">WeWork, RMZ Latitude Commercial, 10th floor, Bellary Rd Hebbal, Bengaluru - 560024</p>
            <a href="mailto:hi@franchiseen.com" className="text-yellow-700 hover:underline mt-2">Email: hi@franchiseen.com</a>
          </div> */}
        </div>
      </div>
      <div className="border-t border-stone-200 dark:border-stone-700 py-4 text-center text-stone-500 dark:text-stone-400 flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 gap-2">
        <div>© 2024 Codelude Technologies Private Limited</div>
        {/* <div>
          <Link href="#" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Privacy Policy</Link>
          <Link href="#" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Terms of Service</Link>
        </div> */}
      </div>
      {/* <LanguageCurrencyModal isOpen={modalOpen} type={modalType} onClose={handleCloseModal} /> */}
    </footer>
  );
} 