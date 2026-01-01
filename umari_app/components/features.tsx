"use client"

import type React from "react"

import { useTheme } from "next-themes"
import Earth from "./ui/globe"
import ScrambleHover from "./ui/scramble"
import { FollowerPointerCard } from "./ui/following-pointer"
import { motion, useInView } from "framer-motion"
import { Suspense, useEffect, useRef, useState } from "react"
import { geist } from "@/lib/fonts"
import { cn } from "@/lib/utils"

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { theme } = useTheme()
  const [isHovering, setIsHovering] = useState(false)
  const [isCliHovering, setIsCliHovering] = useState(false)
  const [isFeature3Hovering, setIsFeature3Hovering] = useState(false)
  const [isFeature4Hovering, setIsFeature4Hovering] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const [baseColor, setBaseColor] = useState<[number, number, number]>([0.906, 0.541, 0.325]) // #e78a53 in RGB normalized
  const [glowColor, setGlowColor] = useState<[number, number, number]>([0.906, 0.541, 0.325]) // #e78a53 in RGB normalized

  const [dark, setDark] = useState<number>(theme === "dark" ? 1 : 0)

  useEffect(() => {
    setBaseColor([0.906, 0.541, 0.325]) // #e78a53
    setGlowColor([0.906, 0.541, 0.325]) // #e78a53
    setDark(theme === "dark" ? 1 : 0)
  }, [theme])

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
            "via-foreground mb-8 bg-gradient-to-b from-zinc-800 to-zinc-700 bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent md:text-[54px] md:leading-[60px]",
            geist.className,
          )}
        >
          Features
        </h2>
        <FollowerPointerCard
          title={
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span>Interactive Features</span>
            </div>
          }
        >
          <div className="cursor-none">
            <div className="grid grid-cols-12 gap-4 justify-center">
              <motion.div
                className="group border-secondary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-2"
                onMouseEnter={() => setIsCliHovering(true)}
                onMouseLeave={() => setIsCliHovering(false)}
                ref={ref}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{
                  scale: 1.02,
                  borderColor: "rgba(231, 138, 83, 0.6)",
                  boxShadow: "0 0 30px rgba(231, 138, 83, 0.2)",
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
                <div className="pointer-events-none flex grow items-center justify-center select-none relative">
                  <div
                    className="relative w-full h-[400px] rounded-xl overflow-hidden"
                    style={{ borderRadius: "20px" }}
                  >
                    {/* Menu Template Card */}
                    <div className="absolute inset-0 m-1 bg-white rounded-2xl shadow-xl overflow-hidden">
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50"></div>

                      {/* Content */}
                      <div className="relative h-full p-6 flex flex-col">
                        {/* Menu Title */}
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                          Umari Coffee Cart
                        </h3>

                        {/* Menu Items */}
                        <div className="flex-1 space-y-3">
                          {[
                            { name: "Latte", price: "$8.00", emoji: "☕️" },
                            { name: "Croissant", price: "$3.00", emoji: "🥐" },
                            { name: "Avocado Toast", price: "$8.00", emoji: "🥑" },
                          ].map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-gray-200/50"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{item.emoji}</span>
                                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-[#e78a53]">{item.price}</span>
                            </div>
                          ))}
                        </div>

                        {/* QR Code */}
                        <div className="mt-4 flex justify-center">
                          <div className="bg-white p-3 rounded-xl shadow-lg border-2 border-gray-200">
                            {/* QR Code Image */}
                            <img
                              src="/images/qr_code.png"
                              alt="QR Code"
                              className="w-16 h-16 rounded"
                            />
                            <p className="text-[8px] text-center mt-1 text-gray-500">Scan to Order</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="group border-secondary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-8"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                ref={ref}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{
                  scale: 1.02,
                  borderColor: "rgba(231, 138, 83, 0.6)",
                  boxShadow: "0 0 30px rgba(231, 138, 83, 0.2)",
                }}
                style={{ transition: "all 0s ease-in-out" }}
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl leading-none font-semibold tracking-tight">Shareable Links & QR Codes</h3>
                  <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                    <p className="max-w-[460px]">
                      Generate instant QR codes and shareable links for your menu. Customers can browse and order from
                      anywhere.
                    </p>
                  </div>
                </div>
                <div className="flex min-h-[300px] grow items-start justify-center select-none">
                  <h1 className="mt-8 text-center text-5xl leading-[100%] font-semibold sm:leading-normal lg:mt-12 lg:text-6xl">
                    <span className='bg-background relative mt-3 inline-block w-fit rounded-md border px-1.5 py-0.5 before:absolute before:top-0 before:left-0 before:z-10 before:h-full before:w-full before:bg-[url("/noise.gif")] before:opacity-[0.09] before:content-[""]'>
                      <ScrambleHover
                        text="Scan & Order"
                        scrambleSpeed={70}
                        maxIterations={20}
                        useOriginalCharsOnly={false}
                        className="cursor-pointer bg-gradient-to-t from-[#e78a53] to-[#e78a53] bg-clip-text text-transparent"
                        isHovering={isHovering}
                        setIsHovering={setIsHovering}
                        characters="abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;':\,./<>?"
                      />
                    </span>
                  </h1>
                  <div className="absolute top-64 z-10 flex items-center justify-center">
                    <div className="w-[400px] h-[400px]">
                      <Suspense
                        fallback={
                          <div className="bg-secondary/20 h-[400px] w-[400px] animate-pulse rounded-full"></div>
                        }
                      >
                        <Earth baseColor={baseColor} markerColor={[0, 0, 0]} glowColor={glowColor} dark={dark} />
                      </Suspense>
                    </div>
                  </div>
                  <div className="absolute top-1/2 w-full translate-y-20 scale-x-[1.2] opacity-70 transition-all duration-1000 group-hover:translate-y-8 group-hover:opacity-100">
                    <div className="from-primary/50 to-primary/0 absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-radial from-10% to-60% opacity-20 sm:h-[512px] dark:opacity-100"></div>
                    <div className="from-primary/30 to-primary/0 absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-200 rounded-[50%] bg-radial from-10% to-60% opacity-20 sm:h-[256px] dark:opacity-100"></div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="group border-secondary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-2"
                onMouseEnter={() => setIsFeature3Hovering(true)}
                onMouseLeave={() => setIsFeature3Hovering(false)}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                whileHover={{
                  scale: 1.02,
                  borderColor: "rgba(231, 138, 83, 0.5)",
                  boxShadow: "0 0 30px rgba(231, 138, 83, 0.2)",
                }}
                style={{ transition: "all 0s ease-in-out" }}
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl leading-none font-semibold tracking-tight">Track Orders & Payments</h3>
                  <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                    <p className="max-w-[460px]">
                      Real-time order tracking and instant payment processing. Stay organized and get paid immediately.
                    </p>
                  </div>
                </div>
                <div className="flex grow items-center justify-center select-none relative min-h-[300px] p-4">
                  <div className="w-full max-w-lg">
                    <div className="relative rounded-2xl border border-white/10 bg-black/20 dark:bg-white/5 backdrop-blur-sm">
                      <div className="p-6 space-y-4">
                        <motion.div
                          className="flex items-center justify-between p-4 rounded-lg bg-green-500/20 border border-green-500/30"
                          initial={{ opacity: 0, x: -20 }}
                          animate={isFeature3Hovering ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-medium">Order #1234</span>
                          </div>
                          <span className="text-sm text-green-400">$15.50</span>
                        </motion.div>

                        <motion.div
                          className="flex items-center justify-between p-4 rounded-lg bg-blue-500/20 border border-blue-500/30"
                          initial={{ opacity: 0, x: -20 }}
                          animate={isFeature3Hovering ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="text-sm font-medium">Order #1235</span>
                          </div>
                          <span className="text-sm text-blue-400">$22.00</span>
                        </motion.div>

                        <motion.div
                          className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/30"
                          initial={{ opacity: 0, x: -20 }}
                          animate={isFeature3Hovering ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                            <span className="text-sm font-medium">Order #1236</span>
                          </div>
                          <span className="text-sm text-yellow-400">$8.75</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="group border-secondary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-8"
                onMouseEnter={() => setIsFeature4Hovering(true)}
                onMouseLeave={() => setIsFeature4Hovering(false)}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                whileHover={{
                  scale: 1.02,
                  borderColor: "rgba(231, 138, 83, 0.5)",
                  boxShadow: "0 0 30px rgba(231, 138, 83, 0.2)",
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
                  <div className="w-full max-w-md">
                    <motion.div
                      className="relative rounded-3xl border-8 border-gray-800 bg-black shadow-2xl overflow-hidden"
                      style={{ aspectRatio: "9/19.5" }}
                      initial={{ rotateY: 0 }}
                      animate={isFeature4Hovering ? { rotateY: [0, 5, -5, 0] } : { rotateY: 0 }}
                      transition={{ duration: 2, repeat: isFeature4Hovering ? Number.POSITIVE_INFINITY : 0 }}
                    >
                      {/* Phone notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>

                      {/* Phone screen */}
                      <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black p-4">
                        <div className="mt-8 space-y-3">
                          <motion.div
                            className="bg-green-500/20 border border-green-500/40 rounded-2xl p-4 ml-auto max-w-[85%]"
                            initial={{ opacity: 0, x: 20 }}
                            animate={isFeature4Hovering ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                          >
                            <p className="text-xs text-white/90">Your order is being prepared! 👨‍🍳</p>
                          </motion.div>

                          <motion.div
                            className="bg-green-500/20 border border-green-500/40 rounded-2xl p-4 ml-auto max-w-[85%]"
                            initial={{ opacity: 0, x: 20 }}
                            animate={isFeature4Hovering ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                          >
                            <p className="text-xs text-white/90">Order #1234 is ready for pickup! 🎉</p>
                          </motion.div>

                          <motion.div
                            className="flex items-center gap-2 text-xs text-gray-500 justify-end"
                            initial={{ opacity: 0 }}
                            animate={isFeature4Hovering ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ duration: 0.5, delay: 0.9 }}
                          >
                            <span>Delivered</span>
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
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
        </FollowerPointerCard>
      </motion.div>
    </section>
  )
}
