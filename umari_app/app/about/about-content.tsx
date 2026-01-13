"use client"

import { useEffect } from "react"
import Hero from "@/components/landing/hero"
import Features from "@/components/landing/features"
import { PricingSection } from "@/components/landing/pricing-section"
import { FAQSection } from "@/components/landing/faq-section"
import { StickyFooter } from "@/components/landing/sticky-footer"

export function AboutContent() {
  useEffect(() => {
    // Set light theme for consistency with landing page
    const root = window.document.documentElement
    root.classList.remove("dark", "system")
    root.classList.add("light")
  }, [])

  return (
    <div className="min-h-screen w-full relative bg-background">
      {/* Pearl Mist Background with Top Glow Border */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226, 232, 240, 0.3), transparent 60%)",
        }}
      />

      {/* Hero Section - without CTA */}
      <Hero showCTA={false} />

      {/* Features Section */}
      <div id="features">
        <Features />
      </div>

      {/* Pricing Section - without CTAs */}
      <div id="pricing">
        <PricingSection showCTA={false} />
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
