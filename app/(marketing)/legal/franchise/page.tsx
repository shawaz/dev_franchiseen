import React from 'react';

export default function FranchisePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">Franchise Policy</h1>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last updated: January 2024
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Franchiseen, a multi-tenant fintech franchise management and crowdfunding platform.
            This Franchise Policy outlines the terms, conditions, and guidelines governing franchise
            opportunities, operations, and relationships within our platform.
          </p>
          <p className="mb-4">
            By participating in our franchise ecosystem, you agree to comply with this policy and
            all applicable laws and regulations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Franchise Eligibility</h2>
          <h3 className="text-xl font-medium mb-3">2.1 General Requirements</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Must be at least 18 years of age</li>
            <li>Complete KYC (Know Your Customer) verification</li>
            <li>Demonstrate financial capability to meet minimum investment requirements</li>
            <li>Pass background checks as required by applicable regulations</li>
            <li>Agree to platform terms and conditions</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">2.2 Financial Requirements</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Minimum investment varies by franchise opportunity</li>
            <li>Proof of funds or financing arrangements</li>
            <li>Ongoing operational capital requirements</li>
            <li>Compliance with anti-money laundering (AML) regulations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Franchise Operations</h2>
          <h3 className="text-xl font-medium mb-3">3.1 Platform Usage</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>All franchise operations must be conducted through our platform</li>
            <li>Compliance with platform guidelines and best practices</li>
            <li>Regular reporting and transparency requirements</li>
            <li>Adherence to brand standards and quality guidelines</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">3.2 Revenue Sharing</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Revenue distribution based on shareholding percentages</li>
            <li>Monthly payout schedules as defined in franchise agreements</li>
            <li>Transparent accounting and financial reporting</li>
            <li>Platform fees and charges clearly disclosed</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Crowdfunding and Investment</h2>
          <h3 className="text-xl font-medium mb-3">4.1 Investment Process</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>All investments processed through secure blockchain technology</li>
            <li>Smart contracts govern investment terms and conditions</li>
            <li>Minimum and maximum investment limits apply</li>
            <li>Investment opportunities subject to regulatory approval</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">4.2 Risk Disclosure</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>All investments carry inherent risks</li>
            <li>Past performance does not guarantee future results</li>
            <li>Investors may lose some or all of their investment</li>
            <li>Market conditions may affect franchise performance</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibent mb-4">5. Compliance and Regulations</h2>
          <h3 className="text-xl font-medium mb-3">5.1 Legal Compliance</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Adherence to local franchise laws and regulations</li>
            <li>Compliance with securities regulations for investment activities</li>
            <li>Anti-money laundering (AML) and counter-terrorism financing (CTF) compliance</li>
            <li>Data protection and privacy law compliance</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">5.2 Reporting Requirements</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Regular financial reporting to platform and investors</li>
            <li>Compliance with tax obligations in relevant jurisdictions</li>
            <li>Disclosure of material changes to franchise operations</li>
            <li>Cooperation with regulatory audits and investigations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Termination and Exit</h2>
          <h3 className="text-xl font-medium mb-3">6.1 Voluntary Exit</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Franchisees may exit subject to notice periods</li>
            <li>Asset valuation and distribution procedures</li>
            <li>Transfer of franchise rights subject to platform approval</li>
            <li>Settlement of outstanding obligations</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">6.2 Involuntary Termination</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Breach of franchise agreement or platform terms</li>
            <li>Non-compliance with legal or regulatory requirements</li>
            <li>Failure to meet performance standards</li>
            <li>Fraudulent or illegal activities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
          <p className="mb-4">
            For questions about this Franchise Policy, please contact us at:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p><strong>Email:</strong> legal@franchiseen.com</p>
            <p><strong>Address:</strong> WeWork, RMZ Latitude Commercial, 10th floor, Bellary Rd Hebbal, Bengaluru - 560024</p>
            <p><strong>Company:</strong> Codelude Technologies Private Limited</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Policy Updates</h2>
          <p className="mb-4">
            We reserve the right to update this Franchise Policy at any time. Material changes
            will be communicated to all franchisees with appropriate notice periods. Continued
            participation in our franchise ecosystem constitutes acceptance of policy updates.
          </p>
        </section>
      </div>
    </div>
  );
}