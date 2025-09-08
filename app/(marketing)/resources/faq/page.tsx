'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Shield,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Phase 1 Questions
  {
    category: "Phase 1 - Current Platform",
    question: "What is Phase 1 of Franchiseen?",
    answer: "Phase 1 is our current implementation that allows direct investment in franchise opportunities using Phantom wallet. It's designed for crypto-native users who are comfortable with blockchain technology and understand the risks of investing without formal legal protections. This phase focuses on simplicity and immediate access to investment opportunities."
  },
  {
    category: "Phase 1 - Current Platform",
    question: "How do I connect my Phantom wallet?",
    answer: "Simply visit the Franchiseen platform and click 'Connect Phantom Wallet' on your account page. Our system will auto-detect your Phantom wallet if it's installed. For mobile users, you can connect through the Phantom app or browser extension. The connection is secure and only requires your approval for transactions."
  },
  {
    category: "Phase 1 - Current Platform",
    question: "What are the risks of Phase 1 investments?",
    answer: "Phase 1 investments carry significant risks as they are made without formal legal protections. You could lose some or all of your investment. There's no regulatory oversight, no investor protection schemes, and no guarantees of returns. Only invest what you can afford to lose and ensure you understand blockchain technology and cryptocurrency risks."
  },
  {
    category: "Phase 1 - Current Platform",
    question: "Can I see my balance in local currency?",
    answer: "Yes! Our platform supports multiple local currencies with real-time exchange rates. You can view your SOL balance converted to USD, EUR, GBP, INR, and many other currencies. The currency selector is available in the footer and your wallet interface will show both SOL and your selected local currency."
  },
  {
    category: "Phase 1 - Current Platform",
    question: "How fast are transactions on Solana?",
    answer: "Solana transactions are extremely fast, typically confirming in under 1 second with finality in 2-3 seconds. Transaction costs are also very low, usually less than $0.01 per transaction. This makes it ideal for frequent trading and small investments that would be cost-prohibitive on other blockchains."
  },

  // Phase 2 Questions
  {
    category: "Phase 2 - Coming Soon",
    question: "What will Phase 2 include?",
    answer: "Phase 2 will introduce full legal compliance, regulatory oversight, and investor protections. It will feature a custom Solana wallet built into the platform, comprehensive KYC/AML procedures, formal legal frameworks, and institutional-grade security. This phase is designed for mainstream adoption and regulatory compliance."
  },
  {
    category: "Phase 2 - Coming Soon",
    question: "When will Phase 2 be available?",
    answer: "Phase 2 is currently in development. We're working with legal and regulatory experts to ensure full compliance. While we don't have a specific launch date yet, we're targeting a release within the next 12-18 months. We'll announce updates through our platform and communication channels."
  },
  {
    category: "Phase 2 - Coming Soon",
    question: "Will Phase 1 investments transfer to Phase 2?",
    answer: "We're designing Phase 2 to accommodate existing Phase 1 investors, but the exact migration process is still being finalized. Phase 1 investors will likely have priority access to Phase 2 features and may receive additional benefits. We'll provide detailed migration information as Phase 2 approaches launch."
  },
  {
    category: "Phase 2 - Coming Soon",
    question: "What is the custom Solana wallet?",
    answer: "The custom Solana wallet will be built directly into the Franchiseen platform, eliminating the need for external wallet extensions. It will include enhanced security features, compliance tools, institutional-grade custody options, and seamless integration with all platform features. Users will have full control of their private keys with additional security layers."
  },

  // General Platform Questions
  {
    category: "General Platform",
    question: "What is Franchiseen?",
    answer: "Franchiseen is a multi-tenant fintech franchise management and crowdfunding platform built on Solana blockchain. We enable investors to participate in franchise opportunities globally while providing franchise owners with tools to manage their operations, raise capital, and distribute returns to investors."
  },
  {
    category: "General Platform",
    question: "How does franchise investment work?",
    answer: "Investors can browse available franchise opportunities, review business plans and financial projections, and invest directly using SOL cryptocurrency. Investments are tokenized on the blockchain, providing transparency and liquidity. Returns are distributed monthly based on franchise performance and your ownership percentage."
  },
  {
    category: "General Platform",
    question: "What types of franchises are available?",
    answer: "We feature a diverse range of franchise opportunities including restaurants, retail stores, service businesses, and technology companies. Each franchise undergoes due diligence before being listed on our platform. You can filter opportunities by industry, investment size, expected returns, and geographic location."
  },
  {
    category: "General Platform",
    question: "How are returns calculated and distributed?",
    answer: "Returns are calculated based on franchise performance and your ownership percentage. Distributions typically occur monthly, though this may vary by franchise. All transactions are recorded on the blockchain for transparency. You can track your returns in real-time through your portfolio dashboard."
  },

  // Technical Questions
  {
    category: "Technical",
    question: "Why use Solana blockchain?",
    answer: "Solana offers high performance with sub-second transaction finality and extremely low costs (typically under $0.01 per transaction). This makes it ideal for frequent transactions, small investments, and real-time operations. Solana's scalability ensures the platform can handle millions of users without performance degradation."
  },
  {
    category: "Technical",
    question: "Is my investment secure on the blockchain?",
    answer: "Blockchain technology provides inherent security through cryptographic protection and decentralization. However, smart contract risks, wallet security, and platform risks still exist. In Phase 1, you're responsible for wallet security. Phase 2 will add institutional-grade security measures and insurance coverage."
  },
  {
    category: "Technical",
    question: "Can I access the platform on mobile?",
    answer: "Yes, our platform is fully responsive and works on all devices. For Phase 1, you can use the Phantom mobile app to connect your wallet. Phase 2 will include a dedicated mobile app with the built-in wallet and all platform features optimized for mobile use."
  },
  {
    category: "Technical",
    question: "What happens if I lose access to my wallet?",
    answer: "In Phase 1, wallet recovery depends on your Phantom wallet backup (seed phrase). If you lose your seed phrase, your funds may be permanently inaccessible. Phase 2 will include additional recovery options and security measures, including social recovery and institutional custody options."
  }
];

const categories = [
  "All",
  "Phase 1 - Current Platform",
  "Phase 2 - Coming Soon",
  "General Platform",
  "Technical"
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const filteredFAQs = selectedCategory === "All"
    ? faqData
    : faqData.filter(item => item.category === selectedCategory);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Phase 1 - Current Platform":
        return <Zap className="h-5 w-5 text-green-600" />;
      case "Phase 2 - Coming Soon":
        return <Shield className="h-5 w-5 text-blue-600" />;
      case "General Platform":
        return <Users className="h-5 w-5 text-purple-600" />;
      case "Technical":
        return <Globe className="h-5 w-5 text-orange-600" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <HelpCircle className="h-4 w-4" />
              Frequently Asked Questions
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Got Questions? We've Got Answers
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Everything you need to know about Franchiseen's two-phase approach,
              Phantom wallet integration, and franchise investment opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category !== "All" && getCategoryIcon(category)}
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getCategoryIcon(faq.category)}
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {faq.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="ml-4">
                      {openItems.includes(index) ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </button>

                {openItems.includes(index) && (
                  <div className="px-6 pb-6">
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phase Comparison */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Phase Comparison
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Quick comparison between our current Phase 1 and upcoming Phase 2 features.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Phase 1 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Phase 1</h3>
                  <p className="text-green-600 font-medium">Available Now</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Phantom wallet integration</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Direct SOL investments</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Multi-currency display</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Real-time portfolio tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">No legal protections</span>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Higher risk investments</span>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Phase 2</h3>
                  <p className="text-blue-600 font-medium">Coming Soon</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Custom Solana wallet</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Full legal compliance</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">KYC/AML verification</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Investor protections</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Institutional features</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Enhanced security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Still Have Questions?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Our support team is here to help you understand the platform and get started with your investments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/resources/support"
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold hover:bg-blue-50 transition-colors duration-200"
              >
                Contact Support
              </Link>
              <Link
                href="/resources/help"
                className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition-colors duration-200"
              >
                Visit Help Center
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}