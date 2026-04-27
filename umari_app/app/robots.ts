import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms"],
        disallow: [
          "/api/",
          "/auth/",
          "/home/",
          "/menus/",
          "/orders/",
          "/payments/",
          "/profile/",
          "/checkout/",
          "/order-confirmation/",
          "/confirm-email/",
          "/track-order/",
          "/view/",
        ],
      },
    ],
    sitemap: "https://umari.app/sitemap.xml",
  }
}
