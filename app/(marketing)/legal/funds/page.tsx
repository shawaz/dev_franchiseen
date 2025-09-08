import React from 'react';

export default function InvestmentPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">Investment Policy</h1>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last updated: January 2024
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            This Investment Policy governs all investment activities on the Franchiseen platform,
            including crowdfunding opportunities, franchise investments, and related financial services.
            Our platform facilitates investment opportunities while maintaining compliance with applicable
            securities regulations and investor protection standards.
          </p>
          <p className="mb-4">
            By investing through our platform, you acknowledge that you have read, understood, and
            agree to be bound by this Investment Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Investment Eligibility</h2>
          <h3 className="text-xl font-medium mb-3">2.1 Investor Requirements</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Must be at least 18 years of age or the age of majority in your jurisdiction</li>
            <li>Complete identity verification and KYC procedures</li>
            <li>Provide proof of income and financial capacity</li>
            <li>Acknowledge investment risks and suitability</li>
            <li>Comply with applicable securities laws in your jurisdiction</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">2.2 Accredited Investor Status</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Certain investment opportunities may be limited to accredited investors</li>
            <li>Accreditation requirements vary by jurisdiction</li>
            <li>Self-certification and documentation may be required</li>
            <li>Regular re-verification of accredited status</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Investment Process</h2>
          <h3 className="text-xl font-medium mb-3">3.1 Due Diligence</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>All investment opportunities undergo thorough due diligence</li>
            <li>Financial statements and business plans are reviewed</li>
            <li>Management teams and track records are evaluated</li>
            <li>Market conditions and competitive landscape analysis</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">3.2 Investment Execution</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Investments processed through secure blockchain technology</li>
            <li>Smart contracts govern investment terms and conditions</li>
            <li>Multi-signature wallets for enhanced security</li>
            <li>Real-time transaction tracking and confirmation</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Risk Management</h2>
          <h3 className="text-xl font-medium mb-3">4.1 Investment Risks</h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Important Risk Disclosure:</p>
            <ul className="list-disc pl-6 text-yellow-700 dark:text-yellow-300">
              <li>All investments carry the risk of partial or total loss</li>
              <li>Past performance does not guarantee future results</li>
              <li>Franchise businesses may fail or underperform</li>
              <li>Market conditions may adversely affect returns</li>
              <li>Liquidity may be limited for certain investments</li>
            </ul>
          </div>

          <h3 className="text-xl font-medium mb-3">4.2 Risk Mitigation</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Diversification across multiple franchise opportunities</li>
            <li>Regular monitoring and reporting of investment performance</li>
            <li>Professional management and oversight</li>
            <li>Insurance coverage where applicable</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Investment Limits and Restrictions</h2>
          <h3 className="text-xl font-medium mb-3">5.1 Investment Limits</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Minimum investment amounts vary by opportunity</li>
            <li>Maximum investment limits based on investor profile</li>
            <li>Annual investment limits for non-accredited investors</li>
            <li>Concentration limits to promote diversification</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">5.2 Restricted Investments</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Certain investments may be restricted by jurisdiction</li>
            <li>Compliance with local securities regulations</li>
            <li>Exclusion of prohibited or sanctioned entities</li>
            <li>Age and sophistication requirements for complex products</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Returns and Distributions</h2>
          <h3 className="text-xl font-medium mb-3">6.1 Return Expectations</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Returns are not guaranteed and may vary significantly</li>
            <li>Performance projections are estimates only</li>
            <li>Actual returns may differ from projections</li>
            <li>Market conditions affect investment performance</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">6.2 Distribution Schedule</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Monthly distributions where franchise generates profits</li>
            <li>Distributions subject to operational requirements</li>
            <li>Automatic reinvestment options available</li>
            <li>Tax reporting and documentation provided</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Fees and Charges</h2>
          <h3 className="text-xl font-medium mb-3">7.1 Platform Fees</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Management fees charged on invested capital</li>
            <li>Performance fees on returns above certain thresholds</li>
            <li>Transaction fees for investment processing</li>
            <li>Withdrawal and transfer fees may apply</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">7.2 Fee Transparency</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>All fees clearly disclosed before investment</li>
            <li>Regular fee reporting and reconciliation</li>
            <li>No hidden charges or undisclosed fees</li>
            <li>Fee structure updates communicated in advance</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Liquidity and Exit</h2>
          <h3 className="text-xl font-medium mb-3">8.1 Liquidity Considerations</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Franchise investments are typically illiquid</li>
            <li>Limited secondary market for investment shares</li>
            <li>Lock-up periods may apply to certain investments</li>
            <li>Early exit may result in penalties or reduced returns</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">8.2 Exit Mechanisms</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Sale of franchise or business assets</li>
            <li>Transfer to other qualified investors</li>
            <li>Platform-facilitated secondary market (where available)</li>
            <li>Redemption programs subject to availability</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Regulatory Compliance</h2>
          <h3 className="text-xl font-medium mb-3">9.1 Securities Regulations</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Compliance with applicable securities laws</li>
            <li>Registration or exemption requirements</li>
            <li>Investor protection measures</li>
            <li>Regular regulatory reporting and filings</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">9.2 Anti-Money Laundering</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Strict AML and CTF compliance procedures</li>
            <li>Source of funds verification</li>
            <li>Ongoing monitoring of transactions</li>
            <li>Reporting of suspicious activities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
          <p className="mb-4">
            For questions about this Investment Policy or investment opportunities, please contact us at:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p><strong>Email:</strong> investments@franchiseen.com</p>
            <p><strong>Address:</strong> WeWork, RMZ Latitude Commercial, 10th floor, Bellary Rd Hebbal, Bengaluru - 560024</p>
            <p><strong>Company:</strong> Codelude Technologies Private Limited</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Policy Updates</h2>
          <p className="mb-4">
            This Investment Policy may be updated from time to time to reflect changes in regulations,
            market conditions, or platform operations. Material changes will be communicated to all
            investors with appropriate notice periods.
          </p>
        </section>
      </div>
    </div>
  );
}