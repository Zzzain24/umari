import Hero from "@/components/landing/hero"
import Features from "@/components/landing/features"
import { PricingSection } from "@/components/landing/pricing-section"
import { FAQSection } from "@/components/landing/faq-section"
import { StickyFooter } from "@/components/landing/sticky-footer"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { LightModeEnforcer } from "@/components/landing/light-mode-enforcer"
import { DemoVideoLoader } from "@/components/landing/demo-video-loader"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Umari",
  url: "https://umari.app",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Create digital menus, accept orders, and get paid instantly. Perfect for coffee carts, food vendors, pop-ups, and small businesses. No app required for customers.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free to start",
  },
  featureList: [
    "Digital menu creation with QR code sharing",
    "Real-time order tracking",
    "Stripe payments with Apple Pay and Google Pay",
    "Guest checkout — no app required for customers",
    "Email order notifications",
  ],
}

export default function Landing() {
  return (
    <div className="min-h-screen w-full relative bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LightModeEnforcer />

      {/* Pearl Mist Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226, 232, 240, 0.3), transparent 60%)",
        }}
      />

      <LandingNavbar />

      {/* Hero Section */}
      <Hero />

      {/* Demo Video Section */}
      <div id="demo">
        <DemoVideoLoader />
      </div>

      {/* Features Section */}
      <div id="features">
        <Features />
      </div>

      {/* Pricing Section */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* FAQ Section */}
      <div id="faq" className="pb-24">
        <FAQSection />
      </div>

      {/* Sticky Footer */}
      <StickyFooter />
    </div>
  )
}
