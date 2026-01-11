"use client"

import { motion } from "framer-motion"
import { Sparkles, CreditCard, Percent, Calculator } from "lucide-react"

interface PricingSectionProps {
  showCTA?: boolean
}

export function PricingSection({ showCTA = true }: PricingSectionProps) {
  const feeItems = [
    {
      icon: Percent,
      label: "Umari Platform Fee",
      value: "2%",
      description: "Per transaction",
    },
    {
      icon: CreditCard,
      label: "Stripe Processing Fee",
      value: "2.9% + $0.30",
      description: "Per transaction",
    },
    {
      icon: Calculator,
      label: "Total Fees",
      value: "~5%",
      description: "Of transaction value",
      highlight: true,
    },
  ]

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
            Simple, transparent pricing
          </h2>

          <p className="text-lg text-foreground max-w-2xl mx-auto">
            No monthly fees or hidden costs. You only pay when you make sales.
          </p>
        </motion.div>

        {/* Fee Breakdown Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl p-8 backdrop-blur-sm bg-white/5 border-2 border-secondary/40">
            <div className="space-y-6">
              {feeItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    item.highlight
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        item.highlight ? "bg-primary/20" : "bg-white/10"
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 ${
                          item.highlight ? "text-primary" : "text-foreground/60"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-foreground/60">{item.description}</p>
                    </div>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      item.highlight ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {item.value}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stripe Explanation */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="text-sm text-foreground/60 text-center mt-6 pt-6 border-t border-white/10"
            >
              Stripe is used to manage payment processing and provides your payment dashboard.
            </motion.p>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        {showCTA && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16"
          >
            <p className="text-foreground/60 mb-4">Have questions about pricing? We're here to help.</p>
            <motion.a
              href="mailto:umarigroup@gmail.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Contact us →
            </motion.a>
          </motion.div>
        )}
      </div>
    </section>
  )
}
