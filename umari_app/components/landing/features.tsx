"use client"

import type React from "react"

import { motion, useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { geist } from "@/lib/fonts"
import { cn } from "@/lib/utils"

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const feature1Ref = useRef(null)
  const feature2Ref = useRef(null)
  const feature3Ref = useRef(null)
  const feature4Ref = useRef(null)
  const isFeature1InView = useInView(feature1Ref, { once: true, amount: 0.3 })
  const isFeature2InView = useInView(feature2Ref, { once: true, amount: 0.3 })
  const isFeature3InView = useInView(feature3Ref, { once: true, amount: 0.3 })
  const isFeature4InView = useInView(feature4Ref, { once: true, amount: 0.3 })
  const [isCliHovering, setIsCliHovering] = useState(false)
  const [isFeature3Hovering, setIsFeature3Hovering] = useState(false)
  const [isCartHovering, setIsCartHovering] = useState(false)
  const [isFeature4Hovering, setIsFeature4Hovering] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [activePopover, setActivePopover] = useState<string | null>('customer1')

  const togglePopover = (id: string) => {
    setActivePopover(activePopover === id ? null : id)
  }

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
        className="container mx-auto flex flex-col items-center gap-6 sm:gap-12 px-4 sm:px-6"
      >
        <h2
          className={cn(
            "via-foreground mb-8 bg-gradient-to-b from-neutral-800 to-neutral-700 bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent md:text-[54px] md:leading-[60px]",
            geist.className,
          )}
        >
          Features
        </h2>
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-12 gap-4 justify-center">
            <motion.div
              className="group border-secondary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-4 sm:p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-1 mx-2 sm:mx-0"
              onMouseEnter={() => setIsCliHovering(true)}
              onMouseLeave={() => setIsCliHovering(false)}
              ref={feature1Ref}
              initial={{ opacity: 0, y: 50 }}
              animate={isFeature1InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
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
              <div className="pointer-events-none flex grow items-center justify-center select-none relative min-h-[520px]">
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
                        {/* Latte with options */}
                        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-neutral-200/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">☕️</span>
                              <span className="text-sm font-medium text-neutral-700">Latte</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-primary">$8.00</span>
                              <div className="flex items-center gap-1">
                                <span className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600">-</span>
                                <span className="text-xs font-medium w-4 text-center">2</span>
                                <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">+</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-8 mt-2 flex gap-2">
                            <span className="px-2 py-0.5 text-[10px] bg-primary/10 text-primary rounded-full border border-primary/30">Single Shot</span>
                            <span className="px-2 py-0.5 text-[10px] bg-neutral-100 text-neutral-500 rounded-full border border-neutral-200">Double Shot +$1</span>
                          </div>
                        </div>

                        {/* Croissant with options */}
                        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-neutral-200/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🥐</span>
                              <span className="text-sm font-medium text-neutral-700">Croissant</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-primary">$3.00</span>
                              <div className="flex items-center gap-1">
                                <span className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600">-</span>
                                <span className="text-xs font-medium w-4 text-center">1</span>
                                <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">+</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-8 mt-2 flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 text-[10px] bg-neutral-100 text-neutral-500 rounded-full border border-neutral-200">Chocolate</span>
                            <span className="px-2 py-0.5 text-[10px] bg-primary/10 text-primary rounded-full border border-primary/30">Pistachio</span>
                          </div>
                        </div>

                        {/* Avocado Toast */}
                        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-neutral-200/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🥑</span>
                              <span className="text-sm font-medium text-neutral-700">Avocado Toast</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-primary">$6.00</span>
                              <div className="flex items-center gap-1">
                                <span className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600">-</span>
                                <span className="text-xs font-medium w-4 text-center">1</span>
                                <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">+</span>
                              </div>
                            </div>
                          </div>
                        </div>
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
              className="group border-secondary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-4 sm:p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-7 mx-2 sm:mx-0"
              onMouseEnter={() => {
                setIsFeature3Hovering(true)
              }}
              onMouseLeave={() => setIsFeature3Hovering(false)}
              ref={feature2Ref}
              initial={{ opacity: 0, y: 50 }}
              animate={isFeature2InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
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
              <div className="flex grow items-center justify-center select-none relative min-h-[480px] p-4">
                <div className="w-full max-w-lg">
                  <div className="relative rounded-2xl border border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-sm">
                    {/* Click outside overlay to close popover */}
                    {activePopover && (
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setActivePopover(null)}
                      />
                    )}
                    <div className="p-6 space-y-4">
                      {/* Order #1234 - Ready */}
                      <motion.div
                        className="relative p-4 rounded-lg bg-success/10 border border-success/30"
                        initial={{ opacity: 0, x: -20 }}
                        animate={(isFeature2InView || isFeature3Hovering) ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Order #1234</span>
                          <span className="px-2 py-1 text-xs bg-success/30 border border-success/50 rounded text-foreground">Ready</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3 pointer-events-auto">
                            <div className="relative">
                              <button onClick={() => togglePopover('customer1')} className={cn("underline underline-offset-2 cursor-pointer transition-colors", activePopover === 'customer1' ? "text-primary font-medium" : "hover:text-primary")}>Sarah M.</button>
                              {activePopover === 'customer1' && (
                                <div className="absolute left-0 top-6 z-30 w-44 bg-white rounded-lg shadow-xl border border-neutral-200 p-3">
                                  <div className="absolute -top-2 left-4 w-3 h-3 bg-white border-l border-t border-neutral-200 rotate-45"></div>
                                  <p className="text-xs font-medium text-neutral-800 mb-2">Sarah Miller</p>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10px] text-neutral-600"><span>📧</span><span>sarah@email.com</span></div>
                                    <div className="flex items-center gap-2 text-[10px] text-neutral-600"><span>📱</span><span>(555) 123-4567</span></div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="relative">
                              <button onClick={() => togglePopover('items1')} className={cn("underline underline-offset-2 cursor-pointer transition-colors", activePopover === 'items1' ? "text-primary font-medium" : "hover:text-primary")}>2x Latte</button>
                              {activePopover === 'items1' && (
                                <div className="absolute left-0 top-6 z-30 w-40 bg-white rounded-lg shadow-xl border border-neutral-200 p-3">
                                  <div className="absolute -top-2 left-4 w-3 h-3 bg-white border-l border-t border-neutral-200 rotate-45"></div>
                                  <p className="text-xs font-medium text-neutral-800 mb-2">2 items</p>
                                  <div className="flex justify-between text-[10px]"><span className="text-neutral-700">2x Latte</span><span className="text-neutral-600">$16.00</span></div>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-foreground font-medium">$15.50</span>
                        </div>
                      </motion.div>

                      {/* Order #1235 - Received */}
                      <motion.div
                        className="relative p-4 rounded-lg bg-warning/20 border border-warning/30"
                        initial={{ opacity: 0, x: -20 }}
                        animate={(isFeature2InView || isFeature3Hovering) ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Order #1235</span>
                          <span className="px-2 py-1 text-xs bg-warning/30 border border-warning/50 rounded text-foreground">Received</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3 pointer-events-auto">
                            <div className="relative">
                              <button onClick={() => togglePopover('customer2')} className={cn("underline underline-offset-2 cursor-pointer transition-colors", activePopover === 'customer2' ? "text-primary font-medium" : "hover:text-primary")}>John D.</button>
                              {activePopover === 'customer2' && (
                                <div className="absolute left-0 top-6 z-30 w-44 bg-white rounded-lg shadow-xl border border-neutral-200 p-3">
                                  <div className="absolute -top-2 left-4 w-3 h-3 bg-white border-l border-t border-neutral-200 rotate-45"></div>
                                  <p className="text-xs font-medium text-neutral-800 mb-2">John Davis</p>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10px] text-neutral-600"><span>📧</span><span>john.d@email.com</span></div>
                                    <div className="flex items-center gap-2 text-[10px] text-neutral-600"><span>📱</span><span>(555) 987-6543</span></div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="relative">
                              <button onClick={() => togglePopover('items2')} className={cn("underline underline-offset-2 cursor-pointer transition-colors", activePopover === 'items2' ? "text-primary font-medium" : "hover:text-primary")}>1x Croissant +1</button>
                              {activePopover === 'items2' && (
                                <div className="absolute left-0 top-6 z-30 w-44 bg-white rounded-lg shadow-xl border border-neutral-200 p-3">
                                  <div className="absolute -top-2 left-4 w-3 h-3 bg-white border-l border-t border-neutral-200 rotate-45"></div>
                                  <p className="text-xs font-medium text-neutral-800 mb-2">2 items</p>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px]"><span className="text-neutral-700">1x Croissant</span><span className="text-neutral-600">$3.00</span></div>
                                    <div className="flex justify-between text-[10px]"><span className="text-neutral-700">1x Latte</span><span className="text-neutral-600">$8.00</span></div>
                                    <div className="pl-2 text-[9px] text-neutral-500">• Double Shot (+$1)</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-foreground font-medium">$22.00</span>
                        </div>
                      </motion.div>

                      {/* Order #1236 - Cancelled */}
                      <motion.div
                        className="relative p-4 rounded-lg bg-destructive/10 border border-destructive/30"
                        initial={{ opacity: 0, x: -20 }}
                        animate={(isFeature2InView || isFeature3Hovering) ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Order #1236</span>
                          <span className="px-2 py-1 text-xs bg-destructive/30 border border-destructive/50 rounded text-foreground">Cancelled</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3 pointer-events-auto">
                            <div className="relative">
                              <button onClick={() => togglePopover('customer3')} className={cn("underline underline-offset-2 cursor-pointer transition-colors", activePopover === 'customer3' ? "text-primary font-medium" : "hover:text-primary")}>Mike R.</button>
                              {activePopover === 'customer3' && (
                                <div className="absolute left-0 top-6 z-30 w-44 bg-white rounded-lg shadow-xl border border-neutral-200 p-3">
                                  <div className="absolute -top-2 left-4 w-3 h-3 bg-white border-l border-t border-neutral-200 rotate-45"></div>
                                  <p className="text-xs font-medium text-neutral-800 mb-2">Mike Roberts</p>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10px] text-neutral-600"><span>📧</span><span>mike.r@email.com</span></div>
                                    <div className="flex items-center gap-2 text-[10px] text-neutral-600"><span>📱</span><span>(555) 456-7890</span></div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="relative">
                              <button onClick={() => togglePopover('items3')} className={cn("underline underline-offset-2 cursor-pointer transition-colors", activePopover === 'items3' ? "text-primary font-medium" : "hover:text-primary")}>1x Espresso</button>
                              {activePopover === 'items3' && (
                                <div className="absolute left-0 top-6 z-30 w-40 bg-white rounded-lg shadow-xl border border-neutral-200 p-3">
                                  <div className="absolute -top-2 left-4 w-3 h-3 bg-white border-l border-t border-neutral-200 rotate-45"></div>
                                  <p className="text-xs font-medium text-neutral-800 mb-2">1 item</p>
                                  <div className="flex justify-between text-[10px]"><span className="text-neutral-700">1x Espresso</span><span className="text-neutral-600">$8.75</span></div>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-foreground font-medium">$8.75</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="group border-secondary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-4 sm:p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-1 mx-2 sm:mx-0"
              onMouseEnter={() => {
                setIsCartHovering(true)
              }}
              onMouseLeave={() => setIsCartHovering(false)}
              ref={feature3Ref}
              initial={{ opacity: 0, y: 50 }}
              animate={isFeature3InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              whileHover={{
                scale: 1.02,
                borderColor: "rgba(100, 120, 130, 0.6)",
                boxShadow: "0 0 30px rgba(100, 120, 130, 0.2)",
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex flex-col gap-4">
                <h3 className="text-2xl leading-none font-semibold tracking-tight">
                  Simple Cart & Checkout
                </h3>
                <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                  <p className="max-w-[460px]">
                    Customers can easily add items, adjust quantities, and checkout with just a few taps. Seamless ordering experience.
                  </p>
                </div>
              </div>

              <div className="flex grow items-center justify-center select-none relative min-h-[400px] p-4">
                <div className="w-full max-w-md">
                  <div className="relative rounded-2xl border-2 border-neutral-200 bg-background shadow-xl overflow-hidden">
                    {/* Cart Header */}
                    <div className="bg-primary p-4 flex items-center justify-between">
                      <h4 className="text-lg font-bold text-foreground">Your Cart</h4>
                      <div className="bg-foreground text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                    </div>

                    {/* Cart Items */}
                    <div className="p-4 space-y-3">
                      {/* Item 1 */}
                      <motion.div
                        className="flex items-center justify-between p-3 rounded-lg bg-card border border-neutral-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={(isFeature3InView || isCartHovering) ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-2xl">☕️</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">Latte</p>
                            <p className="text-xs text-muted-foreground">$8.00</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="w-6 h-6 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center text-xs font-bold">
                            -
                          </button>
                          <span className="text-sm font-medium w-6 text-center">2</span>
                          <button className="w-6 h-6 rounded-full bg-primary hover:bg-primary/80 flex items-center justify-center text-xs font-bold">
                            +
                          </button>
                        </div>
                      </motion.div>

                      {/* Item 2 */}
                      <motion.div
                        className="flex items-center justify-between p-3 rounded-lg bg-card border border-neutral-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={(isFeature3InView || isCartHovering) ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-2xl">🥐</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">Croissant</p>
                            <p className="text-xs text-muted-foreground">$3.00</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="w-6 h-6 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center text-xs font-bold">
                            -
                          </button>
                          <span className="text-sm font-medium w-6 text-center">1</span>
                          <button className="w-6 h-6 rounded-full bg-primary hover:bg-primary/80 flex items-center justify-center text-xs font-bold">
                            +
                          </button>
                        </div>
                      </motion.div>

                      {/* Total */}
                      <motion.div
                        className="pt-3 border-t-2 border-neutral-200 flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={(isFeature3InView || isCartHovering) ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        <span className="text-base font-bold text-foreground">Total</span>
                        <span className="text-lg font-bold text-primary">$19.00</span>
                      </motion.div>

                      {/* Continue Button */}
                      <motion.button
                        className="w-full bg-primary hover:bg-primary/90 text-foreground font-bold py-3 rounded-lg transition-colors mt-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={(isFeature3InView || isCartHovering) ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                      >
                        Continue to Checkout →
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="group border-secondary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-4 sm:p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-7 mx-2 sm:mx-0"
              onMouseEnter={() => {
                setIsFeature4Hovering(true)
              }}
              onMouseLeave={() => setIsFeature4Hovering(false)}
              ref={feature4Ref}
              initial={{ opacity: 0, y: 50 }}
              animate={isFeature4InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: 2.0 }}
              whileHover={{
                scale: 1.02,
                borderColor: "rgba(100, 120, 130, 0.6)",
                boxShadow: "0 0 30px rgba(100, 120, 130, 0.2)",
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex flex-col gap-4">
                <h3 className="text-2xl leading-none font-semibold tracking-tight">Order Tracking & Email Notifications</h3>
                <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                  <p className="max-w-[460px]">
                    Customers receive automatic email confirmations and status updates. Customers can also track orders anytime using the order tracking page with their order number and email.
                  </p>
                </div>
              </div>
              <div className="flex grow items-center justify-center select-none relative min-h-[300px] p-4">
                <div className="w-full max-w-[300px]">
                  <motion.div
                    className="relative rounded-xl border border-neutral-200 bg-white shadow-xl overflow-hidden"
                    initial={{ scale: 1 }}
                    animate={isFeature4Hovering ? { scale: 1.02 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-neutral-200">
                      <p className="text-lg font-semibold text-neutral-800">Order Status</p>
                    </div>

                    {/* Order Details */}
                    <div className="p-4 space-y-3">
                      <motion.div
                        className="flex justify-between items-center"
                        initial={{ opacity: 0, x: -10 }}
                        animate={(isFeature4InView || isFeature4Hovering) ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <span className="text-sm text-neutral-500">Order Number:</span>
                        <span className="text-sm font-mono font-medium text-neutral-800">ORD-1234-A3F2</span>
                      </motion.div>

                      <motion.div
                        className="flex justify-between items-center"
                        initial={{ opacity: 0, x: -10 }}
                        animate={(isFeature4InView || isFeature4Hovering) ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        <span className="text-sm text-neutral-500">Status:</span>
                        <span className="text-sm font-medium text-blue-600">Ready</span>
                      </motion.div>

                      <motion.div
                        className="flex justify-between items-center"
                        initial={{ opacity: 0, x: -10 }}
                        animate={(isFeature4InView || isFeature4Hovering) ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                      >
                        <span className="text-sm text-neutral-500">Payment:</span>
                        <span className="text-sm font-medium text-green-600">Succeeded</span>
                      </motion.div>
                    </div>

                    {/* Auto-refresh notice */}
                    <motion.div
                      className="px-4 py-3 border-t border-neutral-200 bg-neutral-50"
                      initial={{ opacity: 0 }}
                      animate={(isFeature4InView || isFeature4Hovering) ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      <p className="text-xs text-center text-neutral-500">Status updates automatically</p>
                    </motion.div>
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

