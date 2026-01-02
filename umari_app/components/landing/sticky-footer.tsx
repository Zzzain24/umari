"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

export function StickyFooter() {
  const [isAtBottom, setIsAtBottom] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY
          const windowHeight = window.innerHeight
          const documentHeight = document.documentElement.scrollHeight
          const isNearBottom = scrollTop + windowHeight >= documentHeight - 100

          setIsAtBottom(isNearBottom)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial state
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isAtBottom && (
        <motion.div
          className="fixed z-50 bottom-0 left-0 w-full flex justify-center items-center py-4 px-4 sm:px-8 bg-primary"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-xs sm:text-sm text-foreground">
            {/* Left: Email */}
            <a
              href="mailto:umarigroup@gmail.com"
              className="hover:underline transition-colors text-foreground"
            >
              umarigroup@gmail.com
            </a>

            {/* Center: Copyright */}
            <div className="text-center">© 2026 Umari All rights reserved</div>

            {/* Right: Phone */}
            <a href="tel:832-216-3553" className="hover:underline transition-colors text-foreground">
              832-216-3553
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

