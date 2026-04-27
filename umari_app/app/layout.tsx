import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import "plyr/dist/plyr.css"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  metadataBase: new URL("https://umari.app"),
  title: {
    default: "Umari - Digital Menus & Instant Ordering for Small Businesses",
    template: "%s | Umari",
  },
  description:
    "Create digital menus, accept orders, and get paid instantly. Perfect for coffee carts, food vendors, pop-ups, and small businesses. No app required for customers.",
  icons: {
    icon: "/images/umari-logo.png",
    apple: "/images/umari-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://umari.app",
    siteName: "Umari",
    title: "Umari - Digital Menus & Instant Ordering for Small Businesses",
    description:
      "Create digital menus, accept orders, and get paid instantly. Perfect for coffee carts, food vendors, pop-ups, and small businesses.",
    images: [
      {
        url: "/images/umari-logo.png",
        width: 512,
        height: 512,
        alt: "Umari - Digital Menu & Ordering Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Umari - Digital Menus & Instant Ordering",
    description:
      "Create digital menus, accept orders, and get paid instantly. No app required for customers.",
    images: ["/images/umari-logo.png"],
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
