'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          <p className="text-gray-300 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Crow's Eye Marketing Suite ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p>
                Crow's Eye Marketing Suite is an AI-powered marketing automation platform that helps users create, schedule, and manage social media content. The Service includes but is not limited to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>AI-powered content generation</li>
                <li>Social media scheduling and automation</li>
                <li>Analytics and performance tracking</li>
                <li>Media processing and optimization</li>
                <li>Team collaboration tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts and Registration</h2>
              <p>
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Subscription Plans and Billing</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">4.1 Subscription Tiers</h3>
                <p>We offer multiple subscription tiers:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Spark (Free):</strong> Limited features for personal use</li>
                  <li><strong>Creator ($29/month):</strong> Enhanced features for content creators</li>
                  <li><strong>Pro ($99/month):</strong> Advanced features for businesses</li>
                  <li><strong>Enterprise:</strong> Custom pricing for large organizations</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6">4.2 Billing Terms</h3>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>Subscriptions are billed monthly or annually in advance</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>We reserve the right to change pricing with 30 days notice</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6">4.3 BYOK (Bring Your Own Key) Pricing</h3>
                <p>
                  Users who provide their own API keys for third-party services (OpenAI, etc.) may be eligible for discounted pricing. BYOK users are responsible for their own API usage costs and compliance with third-party terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use Policy</h2>
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Distribute spam, malware, or harmful content</li>
                <li>Harass, abuse, or harm others</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the Service for illegal or unethical marketing practices</li>
                <li>Generate content that violates platform policies of social media networks</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">6.1 Our Rights</h3>
                <p>
                  The Service and its original content, features, and functionality are owned by Crow's Eye Marketing Suite and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>

                <h3 className="text-xl font-semibold text-white">6.2 Your Content</h3>
                <p>
                  You retain ownership of content you create using the Service. By using the Service, you grant us a limited license to process, store, and display your content solely for the purpose of providing the Service.
                </p>

                <h3 className="text-xl font-semibold text-white">6.3 AI-Generated Content</h3>
                <p>
                  Content generated by AI tools within the Service is provided "as is." You are responsible for reviewing and ensuring the appropriateness of AI-generated content before publication.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed by our <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</Link>. By using the Service, you consent to the collection and use of information as outlined in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Third-Party Integrations</h2>
              <p>
                The Service integrates with third-party platforms and APIs. Your use of these integrations is subject to the respective terms of service of those platforms. We are not responsible for the availability, content, or practices of third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Service Availability and Modifications</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>We strive for 99.9% uptime but do not guarantee uninterrupted service</li>
                <li>We may modify or discontinue features with reasonable notice</li>
                <li>Scheduled maintenance will be announced in advance when possible</li>
                <li>We reserve the right to suspend accounts that violate these terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CROW'S EYE MARKETING SUITE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless Crow's Eye Marketing Suite from and against any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney's fees) arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Governing Law</h2>
              <p>
                These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be resolved in the courts of [Your Jurisdiction].
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                <p><strong>Email:</strong> help@crowseye.tech</p>
                <p><strong>Address:</strong> [Your Business Address]</p>
                <p><strong>Phone:</strong> [Your Phone Number]</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-600">
            <p className="text-center text-gray-400">
              By using Crow's Eye Marketing Suite, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
            <div className="text-center mt-6">
              <Link 
                href="/" 
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 