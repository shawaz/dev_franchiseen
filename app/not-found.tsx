"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  Building2, 
  TrendingUp,
  MapPin,
  Compass
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  const quickLinks = [
    {
      title: 'Explore Franchises',
      description: 'Browse available franchise opportunities',
      icon: Building2,
      href: '/home',
      color: 'bg-blue-500'
    },
    {
      title: 'Investment Opportunities',
      description: 'Find profitable investment options',
      icon: TrendingUp,
      href: '/home?tab=fund',
      color: 'bg-green-500'
    },
    {
      title: 'Register Your Brand',
      description: 'List your business as a franchise',
      icon: MapPin,
      href: '/register',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <Image
            src="/logo.svg"
            alt="Franchiseen"
            width={40}
            height={40}
            className="rounded-lg"
          />
        </motion.div>

        {/* 404 Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative">
            <h1 className="text-9xl md:text-[12rem] font-bold text-gray-200 dark:text-stone-700 select-none">
              404
            </h1>
            {/* <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <Compass className="w-12 h-12 text-yellow-800" />
              </motion.div>
            </div> */}
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            The page you're looking for seems to have wandered off into the franchise universe. 
            Don't worry, we'll help you find your way back to profitable opportunities!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center gap-2 h-12 px-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          
          {/* <Link href="/">
            <Button className="flex items-center gap-2 h-12 px-6 bg-blue-600 hover:bg-blue-700">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link> */}
          
          {/* <Link href="/home">
            <Button 
              variant="outline"
              className="flex items-center gap-2 h-12 px-6"
            >
              <Search className="w-4 h-4" />
              Search Franchises
            </Button>
          </Link> */}
        </motion.div>


        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Still can't find what you're looking for? 
            <Link href="/home" className="text-yellow-600 dark:text-yellow-700 hover:underline ml-1">
              Contact our support team
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
