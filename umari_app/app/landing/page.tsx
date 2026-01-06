"use client"
import { useEffect } from "react"
import Hero from "@/components/landing/hero"
import Features from "@/components/landing/features"
import { PricingSection } from "@/components/landing/pricing-section"
import { FAQSection } from "@/components/landing/faq-section"
import { StickyFooter } from "@/components/landing/sticky-footer"
import { LandingNavbar } from "@/components/landing/landing-navbar"

export default function Landing() {
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("dark", "system")
    root.classList.add("light")
  }, [])

  return (
    <div className="min-h-screen w-full relative bg-background">
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

