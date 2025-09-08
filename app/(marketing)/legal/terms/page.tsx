import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last updated: January 2024
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            Welcome to Franchiseen, operated by Codelude Technologies Private Limited. These Terms of Service
            ("Terms") govern your use of our platform, website, and services. By accessing or using our
            platform, you agree to be bound by these Terms and our Privacy Policy.
          </p>
          <p className="mb-4">
            If you do not agree to these Terms, please do not use our platform or services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="mb-4">
            Franchiseen is a multi-tenant fintech franchise management and crowdfunding platform that
            facilitates:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Franchise investment opportunities</li>
            <li>Crowdfunding campaigns for franchise businesses</li>
            <li>Portfolio management and tracking</li>
            <li>Payment processing and distribution</li>
            <li>Business management tools and analytics</li>
            <li>Communication and collaboration features</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
          <h3 className="text-xl font-medium mb-3">3.1 Account Creation</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>You must provide accurate and complete information during registration</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must be at least 18 years old to create an account</li>
            <li>One person may not maintain multiple accounts</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">3.2 Account Verification</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Identity verification (KYC) is required for all users</li>
            <li>Additional verification may be required for certain activities</li>
            <li>We reserve the right to suspend accounts pending verification</li>
            <li>False information may result in account termination</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
          <h3 className="text-xl font-medium mb-3">4.1 Permitted Uses</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Use the platform for legitimate business and investment purposes</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Respect the rights and privacy of other users</li>
            <li>Provide accurate information in all communications</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">4.2 Prohibited Activities</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Fraudulent, deceptive, or misleading activities</li>
            <li>Money laundering or terrorist financing</li>
            <li>Violation of securities laws or regulations</li>
            <li>Harassment, abuse, or threatening behavior</li>
            <li>Unauthorized access to other users' accounts</li>
            <li>Distribution of malware or harmful code</li>
            <li>Spam, phishing, or unsolicited communications</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Financial Services and Investments</h2>
          <h3 className="text-xl font-medium mb-3">5.1 Investment Risks</h3>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="font-semibold text-red-800 dark:text-red-200 mb-2">Important Investment Warning:</p>
            <ul className="list-disc pl-6 text-red-700 dark:text-red-300">
              <li>All investments carry risk of loss</li>
              <li>Past performance does not guarantee future results</li>
              <li>You may lose some or all of your investment</li>
              <li>Investments may be illiquid and difficult to sell</li>
            </ul>
          </div>

          <h3 className="text-xl font-medium mb-3">5.2 Platform Role</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>We facilitate connections between investors and franchise opportunities</li>
            <li>We do not provide investment advice or recommendations</li>
            <li>All investment decisions are your sole responsibility</li>
            <li>We are not liable for investment performance or losses</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Fees and Payments</h2>
          <h3 className="text-xl font-medium mb-3">6.1 Platform Fees</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Management fees may be charged on investments</li>
            <li>Transaction fees apply to certain activities</li>
            <li>Performance fees may be charged on returns</li>
            <li>All fees are disclosed before charging</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">6.2 Payment Processing</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Payments processed through secure third-party providers</li>
            <li>Blockchain technology used for certain transactions</li>
            <li>You are responsible for payment method fees</li>
            <li>Refunds subject to our refund policy</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
          <h3 className="text-xl font-medium mb-3">7.1 Platform Content</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>All platform content is owned by us or our licensors</li>
            <li>You may not copy, modify, or distribute our content</li>
            <li>Trademarks and logos are protected intellectual property</li>
            <li>Limited license granted for personal use only</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">7.2 User Content</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>You retain ownership of content you upload</li>
            <li>You grant us license to use your content on the platform</li>
            <li>You are responsible for ensuring you have rights to uploaded content</li>
            <li>We may remove content that violates these Terms</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Privacy and Data Protection</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Your privacy is important to us</li>
            <li>Our Privacy Policy governs data collection and use</li>
            <li>We implement security measures to protect your data</li>
            <li>You consent to data processing as described in our Privacy Policy</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Disclaimers and Limitations</h2>
          <h3 className="text-xl font-medium mb-3">9.1 Service Disclaimers</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Platform provided "as is" without warranties</li>
            <li>We do not guarantee uninterrupted service</li>
            <li>Information may contain errors or omissions</li>
            <li>Third-party content is not endorsed by us</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">9.2 Limitation of Liability</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Our liability is limited to the maximum extent permitted by law</li>
            <li>We are not liable for indirect or consequential damages</li>
            <li>Total liability limited to fees paid in the preceding 12 months</li>
            <li>Some jurisdictions may not allow these limitations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
          <h3 className="text-xl font-medium mb-3">10.1 Termination by You</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>You may terminate your account at any time</li>
            <li>Outstanding obligations survive termination</li>
            <li>Some data may be retained as required by law</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">10.2 Termination by Us</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>We may terminate accounts for Terms violations</li>
            <li>Immediate termination for serious violations</li>
            <li>Notice provided where legally required</li>
            <li>Refunds subject to our policies and applicable law</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Governing Law and Disputes</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>These Terms are governed by Indian law</li>
            <li>Disputes subject to jurisdiction of Bangalore courts</li>
            <li>Arbitration may be required for certain disputes</li>
            <li>Class action waivers may apply</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
          <p className="mb-4">
            We may update these Terms from time to time. Material changes will be communicated
            through the platform or by email. Continued use of the platform after changes
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
          <p className="mb-4">
            For questions about these Terms of Service, please contact us at:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p><strong>Email:</strong> legal@franchiseen.com</p>
            <p><strong>Address:</strong> WeWork, RMZ Latitude Commercial, 10th floor, Bellary Rd Hebbal, Bengaluru - 560024</p>
            <p><strong>Company:</strong> Codelude Technologies Private Limited</p>
          </div>
        </section>
      </div>
    </div>
  );
}