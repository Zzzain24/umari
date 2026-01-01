"use client"

import type React from "react"

import { motion, useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { geist } from "@/lib/fonts"
import { cn } from "@/lib/utils"

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [isCliHovering, setIsCliHovering] = useState(false)
  const [isFeature3Hovering, setIsFeature3Hovering] = useState(false)
  const [isFeature4Hovering, setIsFeature4Hovering] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      setInputValue("")
    }
  }

  return (
    <section id="features" className="text-foreground relative overflow-hidden py-12 sm:py-24 md:py-32">
      <div className="bg-primary absolute -top-10 left-1/2 h-16 w-44 -translate-x-1/2 rounded-full opacity-40 blur-3xl select-none"></div>
      <div className="via-primary/50 absolute top-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent transition-all ease-in-out"></div>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0 }}
        className="container mx-auto flex flex-col items-center gap-6 sm:gap-12"
      >
        <h2
          className={cn(
            "via-foreground mb-8 bg-gradient-to-b from-neutral-800 to-neutral-700 bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent md:text-[54px] md:leading-[60px]",
            geist.className,
          )}
        >
          Features
        </h2>
        <div>
          <div className="grid grid-cols-12 gap-4 justify-center">
              <motion.div
                className="group border-secondary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-1"
                onMouseEnter={() => setIsCliHovering(true)}
                onMouseLeave={() => setIsCliHovering(false)}
                ref={ref}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{
                  scale: 1.02,
                  borderColor: "rgba(100, 120, 130, 0.6)",
                  boxShadow: "0 0 30px rgba(100, 120, 130, 0.2)",
                }}
                style={{ transition: "all 0s ease-in-out" }}
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl leading-none font-semibold tracking-tight">Easy Menu Creation</h3>
                  <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                    <p className="max-w-[460px]">
                      Create and customize a menu in minutes with your items and prices. Recieve a shareable link and qr code with each menu you create. 
                    </p>
                  </div>
                </div>
                <div className="pointer-events-none flex grow items-center justify-center select-none relative min-h-[400px]">
                  <div
                    className="relative w-full h-full rounded-xl overflow-hidden"
                    style={{ borderRadius: "20px" }}
                  >
                    {/* Menu Template Card */}
                    <div className="absolute inset-0 m-1 bg-white rounded-2xl shadow-xl overflow-hidden">
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5"></div>

                      {/* Content */}
                      <div className="relative h-full p-6 flex flex-col">
                        {/* Menu Title */}
                        <h3 className="text-2xl font-bold text-neutral-800 mb-4">
                          Umari Coffee Cart
                        </h3>

                        {/* Menu Items */}
                        <div className="flex-1 space-y-3">
                          {[
                            { name: "Latte", price: "$8.00", emoji: "☕️" },
                            { name: "Croissant", price: "$3.00", emoji: "🥐" },
                            { name: "Avocado Toast", price: "$6.00", emoji: "🥑" },
                          ].map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-neutral-200/50"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{item.emoji}</span>
                                <span className="text-sm font-medium text-neutral-700">{item.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-primary">{item.price}</span>
                            </div>
                          ))}
                        </div>

                        {/* QR Code */}
                        <div className="mt-4 flex justify-center">
                          <div className="bg-white p-3 rounded-xl shadow-lg border-2 border-neutral-200">
                            {/* QR Code Image */}
                            <img
                              src="/images/qr_code.png"
                              alt="QR Code"
                              className="w-16 h-16 rounded"
                            />
                            <p className="text-[8px] text-center mt-1 text-neutral-500">Scan to Order</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="group border-secondary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-7"
                onMouseEnter={() => setIsFeature3Hovering(true)}
                onMouseLeave={() => setIsFeature3Hovering(false)}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                whileHover={{
                  scale: 1.02,
                  borderColor: "rgba(100, 120, 130, 0.6)",
                  boxShadow: "0 0 30px rgba(100, 120, 130, 0.2)",
                }}
                style={{ transition: "all 0s ease-in-out" }}
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl leading-none font-semibold tracking-tight">Track Orders & Payments</h3>
                  <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                    <p className="max-w-[460px]">
                      Real-time order tracking and instant payment processing via Stripe. Stay organized and get paid immediately.
                    </p>
                  </div>
                </div>
                <div className="flex grow items-center justify-center select-none relative min-h-[400px] p-4">
                  <div className="w-full max-w-lg">
                    <div className="relative rounded-2xl border border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-sm">
                      <div className="p-6 space-y-4">
                        <motion.div
                          className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/30"
                          initial={{ opacity: 0, x: -20 }}
                          animate={isFeature3Hovering ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                            <span className="text-sm font-medium">Order #1234</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">$15.50</span>
                            <button className="px-2 py-1 text-xs bg-success/30 hover:bg-success/50 border border-success/50 rounded text-foreground transition-colors">
                              Send SMS
                            </button>
                          </div>
                        </motion.div>

                        <motion.div
                          className="flex items-center justify-between p-4 rounded-lg bg-info/20 border border-info/30"
                          initial={{ opacity: 0, x: -20 }}
                          animate={isFeature3Hovering ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-info animate-pulse"></div>
                            <span className="text-sm font-medium">Order #1235</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">$22.00</span>
                            <button className="px-2 py-1 text-xs bg-info/30 hover:bg-info/50 border border-info/50 rounded text-foreground transition-colors">
                              Send SMS
                            </button>
                          </div>
                        </motion.div>

                        <motion.div
                          className="flex items-center justify-between p-4 rounded-lg bg-warning/20 border border-warning/30"
                          initial={{ opacity: 0, x: -20 }}
                          animate={isFeature3Hovering ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div>
                            <span className="text-sm font-medium">Order #1236</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">$8.75</span>
                            <button className="px-2 py-1 text-xs bg-warning/30 hover:bg-warning/50 border border-warning/50 rounded text-foreground transition-colors">
                              Send SMS
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="group border-secondary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-4"
                onMouseEnter={() => setIsFeature4Hovering(true)}
                onMouseLeave={() => setIsFeature4Hovering(false)}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                whileHover={{
                  scale: 1.02,
                  borderColor: "rgba(100, 120, 130, 0.6)",
                  boxShadow: "0 0 30px rgba(100, 120, 130, 0.2)",
                }}
                style={{ transition: "all 0s ease-in-out" }}
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl leading-none font-semibold tracking-tight">SMS Order Notifications</h3>
                  <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                    <p className="max-w-[460px]">
                      Automatically notify customers via SMS when their order is ready for pickup. Keep everyone
                      informed.
                    </p>
                  </div>
                </div>
                <div className="flex grow items-center justify-center select-none relative min-h-[300px] p-4">
                  <div className="w-full max-w-[200px]">
                    <motion.div
                      className="relative rounded-2xl border-4 border-neutral-800 bg-black shadow-2xl overflow-hidden"
                      style={{ aspectRatio: "9/19.5" }}
                      initial={{ rotateY: 0 }}
                      animate={isFeature4Hovering ? { rotateY: [0, 5, -5, 0] } : { rotateY: 0 }}
                      transition={{ duration: 2, repeat: isFeature4Hovering ? Number.POSITIVE_INFINITY : 0 }}
                    >
                      {/* Phone notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-b-xl z-10"></div>

                      {/* Phone screen */}
                      <div className="w-full h-full bg-gradient-to-b from-neutral-900 to-black p-2">
                        <div className="mt-4 space-y-2">
                          <motion.div
                            className="bg-success/20 border border-success/40 rounded-xl p-2 ml-auto max-w-[85%]"
                            initial={{ opacity: 0, x: 20 }}
                            animate={isFeature4Hovering ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                          >
                            <p className="text-[10px] text-white/90">Order #1234 at Umari Coffee Cart is being prepared! 👨‍🍳</p>
                          </motion.div>

                          <motion.div
                            className="bg-success/20 border border-success/40 rounded-xl p-2 ml-auto max-w-[85%]"
                            initial={{ opacity: 0, x: 20 }}
                            animate={isFeature4Hovering ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                          >
                            <p className="text-[10px] text-white/90">Order #1234 is ready for pickup! 🎉</p>
                          </motion.div>

                          <motion.div
                            className="flex items-center gap-1 text-[10px] text-neutral-500 justify-end"
                            initial={{ opacity: 0 }}
                            animate={isFeature4Hovering ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ duration: 0.5, delay: 0.9 }}
                          >
                            <span>Delivered</span>
                            <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
      </motion.div>
    </section>
  )
}
