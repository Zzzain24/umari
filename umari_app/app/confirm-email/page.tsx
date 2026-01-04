"use client"

import type React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Home</span>
      </Link>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center space-x-2">
              <img
                src="/images/umari-logo.png"
                alt="Umari Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Check your email</h1>
          <p className="text-muted-foreground">We've sent a confirmation link to your email</p>
        </div>

        {/* Confirmation Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card backdrop-blur-xl border border-border rounded-2xl p-8 shadow-lg"
        >
          <div className="text-center space-y-6">
            {/* Email Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
                The confirmation link is invalid or has expired. Please try signing up again.
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-2">
              <p className="text-foreground">
                We've sent a confirmation email to:
              </p>
              {email && (
                <p className="text-primary font-medium text-lg break-all">
                  {email}
                </p>
              )}
              <p className="text-muted-foreground text-sm mt-4">
                Click the confirmation link in the email to verify your account and get started.
              </p>
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Didn't receive the email? Check your spam folder or try signing up again.
              </p>
            </div>

            {/* Back to Login Link */}
            <div className="pt-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full border-secondary/40 hover:border-secondary/60 text-foreground"
                >
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

