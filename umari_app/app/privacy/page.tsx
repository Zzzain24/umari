import Link from "next/link"

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last Updated: January 11, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-8 shadow-lg space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Umari (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our order and payment platform for small businesses.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Information We Collect</h2>

            <h3 className="text-lg font-medium text-foreground mb-2">Business Owner Information</h3>
            <p className="text-muted-foreground mb-3">When you create a business account, we collect:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li>First and last name</li>
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Payment account information via Stripe Connect</li>
              <li>Menu items and business settings</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mb-2">Customer Information</h3>
            <p className="text-muted-foreground mb-3">When customers place orders, we collect:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Customer name</li>
              <li>Email address</li>
              <li>Phone number (optional)</li>
              <li>Order details and history</li>
              <li>Payment information (processed securely via Stripe)</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Process orders and payments</li>
              <li>Manage your business or customer account</li>
              <li>Send order confirmations and status updates</li>
              <li>Provide customer support</li>
              <li>Improve our platform and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground mb-3">We use the following third-party services to operate our platform:</p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground">Stripe</h3>
                <p className="text-muted-foreground">
                  We use Stripe to process payments. When you make or receive payments, Stripe collects and processes payment information according to their{" "}
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                    Privacy Policy
                  </a>.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground">Supabase</h3>
                <p className="text-muted-foreground">
                  We use Supabase for authentication and data storage. Your data is stored securely on Supabase&apos;s infrastructure.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground">Google</h3>
                <p className="text-muted-foreground">
                  If you sign in with Google, we receive basic profile information from your Google account according to Google&apos;s{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                    Privacy Policy
                  </a>.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground">Vercel Analytics</h3>
                <p className="text-muted-foreground">
                  We use Vercel Analytics to understand how our platform is used. This may collect anonymized usage data.
                </p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. Order history is preserved to allow customers to reference past orders. If a business owner deletes their account, customer order data is retained with identifying business information removed.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your information, including encrypted connections (HTTPS), secure authentication, and access controls. Payment information is handled by Stripe, which is PCI-DSS compliant. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Rights</h2>
            <p className="text-muted-foreground mb-3">You have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Access your personal information</li>
              <li>Update or correct your information</li>
              <li>Delete your account and associated data</li>
              <li>Request a copy of your data</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              To exercise these rights, contact us at the email address below.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies to maintain your session and remember your preferences. Third-party services like Vercel Analytics may also use cookies for analytics purposes.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-3 text-muted-foreground">
              <p>Email: <a href="mailto:umarigroup@gmail.com" className="text-primary hover:text-primary/80">umarigroup@gmail.com</a></p>
              <p>Phone: 832-216-3553</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link href="/terms" className="text-primary hover:text-primary/80 text-sm">
            View Terms of Service
          </Link>
        </div>
      </div>
    </div>
  )
}
