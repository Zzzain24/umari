import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Back navigation */}
      <Link
        href="/signup"
        className="fixed top-6 left-6 z-20 text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Sign Up</span>
      </Link>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
            <img
              src="/images/umari-logo.png"
              alt="Umari Logo"
              className="w-16 h-16 object-contain mx-auto"
            />
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last Updated: January 11, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-8 shadow-lg space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Umari. These Terms of Service (&quot;Terms&quot;) govern your use of our order and payment platform. By accessing or using Umari, you agree to be bound by these Terms. If you do not agree, please do not use our platform.
            </p>
          </section>

          {/* Platform Description */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Platform Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              Umari is a platform that enables small businesses (such as food vendors, coffee carts, and artisans) to create menus, accept orders, and receive payments from customers. Umari acts as an intermediary between merchants and customers and does not directly provide goods or services.
            </p>
          </section>

          {/* Account Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Account Terms</h2>
            <p className="text-muted-foreground mb-3">To use certain features, you must create an account. You agree to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be at least 18 years old (or the age of majority in your jurisdiction)</li>
            </ul>
          </section>

          {/* Merchant Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Merchant Terms</h2>
            <p className="text-muted-foreground mb-3">If you use Umari as a business (merchant), you agree to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li>Connect a valid Stripe account to receive payments</li>
              <li>Provide accurate menu information, including pricing</li>
              <li>Fulfill all orders in a timely manner</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not sell prohibited, illegal, or regulated items without proper licensing</li>
              <li>Handle customer inquiries and complaints professionally</li>
            </ul>
            <p className="text-muted-foreground">
              Umari is not responsible for the quality, safety, or legality of items sold through the platform. Merchants bear full responsibility for their products and services.
            </p>
          </section>

          {/* Customer Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Customer Terms</h2>
            <p className="text-muted-foreground mb-3">If you place orders as a customer, you agree to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Provide accurate contact information for order communication</li>
              <li>Pay for orders at the time of purchase</li>
              <li>Pick up or receive orders as arranged with the merchant</li>
              <li>Direct any issues with orders to the merchant</li>
            </ul>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Payment Terms</h2>

            <h3 className="text-lg font-medium text-foreground mb-2">Payment Processing</h3>
            <p className="text-muted-foreground mb-4">
              All payments are processed through Stripe. By using our platform, you agree to Stripe&apos;s{" "}
              <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                Terms of Service
              </a>.
            </p>

            <h3 className="text-lg font-medium text-foreground mb-2">Fee Structure</h3>
            <p className="text-muted-foreground mb-3">The following fees apply to transactions:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li><strong>Platform Fee:</strong> 2% of the order subtotal</li>
              <li><strong>Stripe Processing Fee:</strong> 2.9% + $0.30 per transaction</li>
            </ul>
            <p className="text-muted-foreground">
              Merchants receive the order amount minus the above fees. Fee structure is subject to change with notice.
            </p>
          </section>

          {/* Refund Policy */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Refund Policy</h2>
            <p className="text-muted-foreground mb-3">Refunds are handled as follows:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li>Refund requests should be directed to the merchant</li>
              <li>Merchants may issue refunds through the Umari platform</li>
              <li>Upon refund, the Umari platform fee (2%) is returned</li>
              <li>Stripe processing fees (2.9% + $0.30) are <strong>non-refundable</strong></li>
            </ul>
            <p className="text-muted-foreground">
              Umari is not responsible for disputes between merchants and customers regarding refunds.
            </p>
          </section>

          {/* Prohibited Uses */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Prohibited Uses</h2>
            <p className="text-muted-foreground mb-3">You may not use Umari to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Sell illegal, counterfeit, or stolen goods</li>
              <li>Engage in fraudulent activities</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Harass, abuse, or harm others</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper operation of the platform</li>
              <li>Use the platform for money laundering or terrorist financing</li>
            </ul>
          </section>

          {/* Liability Limitations */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              UMARI IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY LAW, UMARI SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li>The quality, safety, or legality of items sold by merchants</li>
              <li>Order fulfillment or delivery issues</li>
              <li>Disputes between merchants and customers</li>
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Service interruptions or technical issues</li>
            </ul>
            <p className="text-muted-foreground">
              Our total liability shall not exceed the fees paid by you to Umari in the 12 months preceding the claim.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless Umari, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the platform or violation of these Terms.
            </p>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">11. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to maintain platform availability but do not guarantee uninterrupted service. We may modify, suspend, or discontinue any part of the platform at any time without notice.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">12. Termination</h2>
            <p className="text-muted-foreground mb-3">We may suspend or terminate your account if you:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li>Violate these Terms</li>
              <li>Engage in fraudulent or illegal activity</li>
              <li>Pose a risk to other users or the platform</li>
            </ul>
            <p className="text-muted-foreground">
              You may delete your account at any time through your profile settings. Upon termination, your right to use the platform ceases immediately.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">13. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. We will notify you of significant changes by posting the new Terms on this page. Continued use of the platform after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">14. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by the laws of the State of Texas, United States, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts of Texas.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">15. Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">16. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms, please contact us at:
            </p>
            <div className="mt-3 text-muted-foreground">
              <p>Email: <a href="mailto:umarigroup@gmail.com" className="text-primary hover:text-primary/80">umarigroup@gmail.com</a></p>
              <p>Phone: 832-216-3553</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link href="/privacy" className="text-primary hover:text-primary/80 text-sm">
            View Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}
