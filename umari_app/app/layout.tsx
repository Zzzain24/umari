import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Umari - Menu & Orders, Simplified",
  description:
    "Create simple menus, accept orders, and get paid instantly. Perfect for coffee carts, food vendors, and small businesses.",
  generator: "v0.app",
  icons: {
    icon: "/images/umari-logo.png",
    apple: "/images/umari-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=TASA+Explorer:wght@400..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
