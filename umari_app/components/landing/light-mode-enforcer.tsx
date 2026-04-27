"use client"

import { useEffect } from "react"

export function LightModeEnforcer() {
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("dark", "system")
    root.classList.add("light")
  }, [])

  return null
}
