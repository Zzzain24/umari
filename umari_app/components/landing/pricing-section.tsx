"use client"

import { motion } from "framer-motion"
import { Check, Sparkles } from "lucide-react"
import { useState } from "react"

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for getting started with Umari and menu creation",
    features: ["5 free menu generations", "No access to payment processing", "No acecss to order management", "Limited support"],
    popular: false,
    cta: "Get Started",
  },
  {
    name: "Pro",
    id: "pro-fixed",
    monthlyPrice: 25,
    annualPrice: 20,
    description: "For small businesses that want to work smarter",
    features: [
      "Ulimited menu creations",
      "Access to payment processing",
      "Access to order management",
      "Priority support",
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Pro",
    id: "pro-rate",
    monthlyPercent: 7,
    annualPercent: 5,
    isPercentage: true,
    description: "For small businesses that want to work smarter",
    features: [
      "Ulimited menu creations",
      "Access to payment processing",
      "Access to order management",
      "Priority support",
    ],
    popular: false,
    cta: "Start Free Trial",
  },
]

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Pricing</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose your plan
          </h2>

          <p className="text-lg text-foreground max-w-2xl mx-auto mb-8">
            Start building beautiful components today. Upgrade anytime as your needs grow.
          </p>

          {/* Monthly/Annual Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-4 p-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm w-fit mx-auto"
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !isAnnual ? "bg-primary text-white shadow-lg" : "text-foreground hover:text-foreground/80"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                isAnnual ? "bg-primary text-white shadow-lg" : "text-foreground hover:text-foreground/80"
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-success text-white text-xs px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id || plan.name + index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative rounded-2xl p-8 backdrop-blur-sm border-2 transition-all duration-300 ${
                plan.popular
                  ? "bg-gradient-to-b from-primary/10 to-transparent border-primary/30 shadow-lg shadow-primary/10 hover:border-primary/60 hover:shadow-primary/20"
                  : "bg-white/5 border-secondary/40 hover:border-secondary/60"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-medium px-4 py-2 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  {plan.price ? (
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  ) : plan.isPercentage ? (
                    <>
                      <span className="text-4xl font-bold text-foreground">
                        {isAnnual ? plan.annualPercent : plan.monthlyPercent}%
                      </span>
                      <span className="text-foreground/60 text-lg">/transaction</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-foreground">
                        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-foreground/60 text-lg">{isAnnual ? "/year" : "/month"}</span>
                    </>
                  )}
                </div>
                <p className="text-foreground/60 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground/80 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  plan.popular
                    ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40"
                    : "bg-neutral-200 text-foreground border border-neutral-300 hover:bg-neutral-300"
                }`}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-foreground/60 mb-4">Need a custom solution? We're here to help.</p>
          <motion.a
            href="mailto:umarigroup@gmail.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Contact our sales team →
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

