"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isLandingPage = pathname === "/" || pathname === "/landing"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 120
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  const handleNavClick = (e: React.MouseEvent, sectionId: string) => {
    if (isLandingPage) {
      e.preventDefault()
      scrollToSection(sectionId)
    }
  }

  const handleMobileNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false)
    if (isLandingPage) {
      setTimeout(() => scrollToSection(sectionId), 100)
    }
  }

  return (
    <>
      {/* Desktop Header */}
      <header
        className={`sticky top-4 z-[9999] mx-auto hidden w-full flex-row items-center justify-between self-start rounded-full bg-background/80 md:flex backdrop-blur-sm border border-border/50 shadow-lg transition-all duration-300 ${
          isScrolled ? "max-w-3xl px-2" : "max-w-5xl px-4"
        } py-2`}
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          perspective: "1000px",
        }}
      >
        <a
          className={`z-50 flex items-center justify-center gap-2 transition-all duration-300 ${
            isScrolled ? "ml-4" : ""
          }`}
          href="/"
        >
          <img src="/images/umari-logo.png" alt="Umari Logo" className="w-8 h-8 object-contain" />
          <span className="text-lg font-bold text-foreground">Umari</span>
        </a>

        <div className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-muted-foreground transition duration-200 hover:text-foreground md:flex md:space-x-2">
          <Link
            href="/#features"
            onClick={(e) => handleNavClick(e, "features")}
            className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span className="relative z-20">Features</span>
          </Link>
          <Link
            href="/#pricing"
            onClick={(e) => handleNavClick(e, "pricing")}
            className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span className="relative z-20">Pricing</span>
          </Link>
          <Link
            href="/#faq"
            onClick={(e) => handleNavClick(e, "faq")}
            className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span className="relative z-20">FAQ</span>
          </Link>
          <Link
            href="/track-order"
            className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span className="relative z-20">Track Order</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">

          <Link
            href="/login"
            className="rounded-md font-medium relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center border-2 border-secondary/40 hover:border-secondary/60 text-foreground px-4 py-2 text-sm"
          >
            Log In
          </Link>

          <Link
            href="/signup"
            className="rounded-md font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-primary text-foreground px-4 py-2 text-sm"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-4 z-[9999] mx-4 flex w-auto flex-row items-center justify-between rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg md:hidden px-4 py-3">
        <a className="flex items-center justify-center gap-2" href="/">
          <img src="/images/umari-logo.png" alt="Umari Logo" className="w-7 h-7 object-contain" />
          <span className="text-base font-bold text-foreground">Umari</span>
        </a>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-background/50 border border-border/50 transition-colors hover:bg-background/80"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col items-center justify-center w-5 h-5 space-y-1">
            <span
              className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
            ></span>
            <span
              className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
            ></span>
          </div>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm md:hidden">
          <div className="absolute top-25 left-6 right-6 max-w-sm mx-auto bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl p-6">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/#features"
                onClick={(e) => {
                  if (isLandingPage) e.preventDefault()
                  handleMobileNavClick("features")
                }}
                className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                onClick={(e) => {
                  if (isLandingPage) e.preventDefault()
                  handleMobileNavClick("pricing")
                }}
                className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50"
              >
                Pricing
              </Link>
              <Link
                href="/#faq"
                onClick={(e) => {
                  if (isLandingPage) e.preventDefault()
                  handleMobileNavClick("faq")
                }}
                className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50"
              >
                FAQ
              </Link>
              <Link
                href="/track-order"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50"
              >
                Track Order
              </Link>
              <div className="border-t border-border/50 pt-4 mt-4 flex flex-col space-y-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50 cursor-pointer"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-lg font-bold text-center bg-primary text-foreground rounded-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
