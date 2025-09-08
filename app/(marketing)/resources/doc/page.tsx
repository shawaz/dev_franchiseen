import React from 'react';
import Link from 'next/link';
import {
  Book,
  Wallet,
  Shield,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Smartphone,
  Globe,
  Lock,
  FileText
} from 'lucide-react';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Book className="h-4 w-4" />
              Platform Documentation
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Franchiseen Platform Guide
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Complete documentation for our multi-tenant fintech franchise management and crowdfunding platform.
              Learn about our two-phase approach to investment and platform features.
            </p>
          </div>
        </div>
      </section>

      {/* Phase Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Platform Development Phases
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Franchiseen is being developed in two strategic phases to ensure security, compliance, and optimal user experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Phase 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Phase 1</h3>
                  <p className="text-green-600 font-medium">Current - Phantom Wallet Integration</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Simple Investment Process</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Direct investment using Phantom wallet without complex legal frameworks</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Blockchain Technology</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Solana blockchain for fast, secure, and low-cost transactions</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Immediate Access</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Start investing in franchise opportunities right away</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Auto-Detection</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Seamless Phantom wallet integration with auto-detection</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> Phase 1 investments are made at your own risk without formal legal protections.
                    Suitable for early adopters and crypto-native users.
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Phase 2</h3>
                  <p className="text-blue-600 font-medium">Coming Soon - Legal Compliance</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Full Legal Framework</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Complete regulatory compliance with investor protections</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Custom Solana Wallet</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Built-in wallet solution with enhanced security features</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">KYC/AML Compliance</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Full identity verification and anti-money laundering measures</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Institutional Features</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Advanced portfolio management and institutional-grade tools</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Coming Soon:</strong> Phase 2 will provide full legal protections, regulatory compliance,
                    and institutional-grade security for all users.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 1 Detailed Guide */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Phase 1: Getting Started with Phantom Wallet
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Step-by-step guide to start investing in franchise opportunities using your Phantom wallet.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Install Phantom Wallet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Download and install the Phantom wallet browser extension or mobile app. Create a new wallet or import an existing one.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Browser extension available
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Mobile app for iOS/Android
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Secure seed phrase backup
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Connect to Franchiseen</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Visit the Franchiseen platform and connect your Phantom wallet. Our system will auto-detect your wallet.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Auto-detection feature
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  One-click connection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Secure authentication
                </li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Start Investing</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Browse franchise opportunities, review details, and make investments directly with SOL from your wallet.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Browse franchises
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Instant transactions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Track your portfolio
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Platform Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive tools and features for franchise management and investment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Multi-Currency Support</h3>
              <p className="text-gray-600 dark:text-gray-300">
                View your SOL balance in multiple local currencies with real-time exchange rates.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Portfolio Management</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track your franchise investments, returns, and performance across multiple opportunities.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Real-time Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access detailed analytics and performance metrics for your franchise investments.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Global Opportunities</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access franchise opportunities from around the world with blockchain technology.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Secure Transactions</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All transactions secured by Solana blockchain with multi-signature wallet support.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Transparent Reporting</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access detailed financial reports and transaction history for all your investments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Technical Specifications
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built on cutting-edge technology for security, scalability, and performance.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Phase 1 Tech */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Phase 1 Technology Stack</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Solana Blockchain</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">High-performance blockchain with sub-second finality and low transaction costs</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Phantom Wallet Integration</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Seamless wallet connection with auto-detection and mobile support</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Next.js Frontend</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Modern React framework with server-side rendering and optimal performance</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Convex Database</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Real-time database with automatic scaling and built-in security</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2 Tech */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Phase 2 Enhancements</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Custom Solana Wallet</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Built-in wallet solution with enhanced security and compliance features</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">KYC/AML Integration</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Identity verification and compliance monitoring systems</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Legal Framework</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Full regulatory compliance with investor protection mechanisms</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Institutional Tools</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Advanced portfolio management and institutional-grade features</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Jump to specific sections or explore related resources.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/resources/faq" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                  FAQ
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Frequently asked questions about the platform
                </p>
                <ArrowRight className="h-4 w-4 text-blue-600 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            <Link href="/resources/help" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Book className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 transition-colors">
                  Help Center
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Comprehensive help and support resources
                </p>
                <ArrowRight className="h-4 w-4 text-green-600 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            <Link href="/legal/terms" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">
                  Legal
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Terms, policies, and legal information
                </p>
                <ArrowRight className="h-4 w-4 text-purple-600 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            <Link href="/resources/support" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 transition-colors">
                  Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Get help from our support team
                </p>
                <ArrowRight className="h-4 w-4 text-orange-600 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}