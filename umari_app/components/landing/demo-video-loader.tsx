"use client"

import dynamic from "next/dynamic"

const DemoVideo = dynamic(() => import("./demo-video").then(m => m.DemoVideo), { ssr: false })

export function DemoVideoLoader() {
  return <DemoVideo />
}
