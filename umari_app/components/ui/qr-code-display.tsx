"use client"

import { useRef, useState } from "react"
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRCodeDisplayProps {
  url: string
  menuName: string
  size?: number
  showDownload?: boolean
}

export function QRCodeDisplay({
  url,
  menuName,
  size = 200,
  showDownload = true,
}: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const sanitizeFilename = (name: string) => {
    return name
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase()
      .substring(0, 50)
  }

  const downloadPNG = async () => {
    if (!qrRef.current) return

    setIsDownloading(true)
    try {
      const svgElement = qrRef.current.querySelector("svg")
      if (!svgElement) {
        throw new Error("SVG element not found")
      }

      // Get SVG dimensions
      const svgWidth = svgElement.clientWidth || size
      const svgHeight = svgElement.clientHeight || size
      const scale = 3 // Higher resolution

      // Create canvas
      const canvas = document.createElement("canvas")
      canvas.width = svgWidth * scale
      canvas.height = svgHeight * scale
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Failed to get canvas context")
      }

      // Scale for higher resolution
      ctx.scale(scale, scale)

      // Fill white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, svgWidth, svgHeight)

      // Convert SVG to blob
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const url = URL.createObjectURL(svgBlob)

      // Create image from SVG
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, svgWidth, svgHeight)
        URL.revokeObjectURL(url)

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            toast({
              title: "Download Failed",
              description: "Failed to create image.",
              variant: "destructive",
            })
            setIsDownloading(false)
            return
          }

          const downloadUrl = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = downloadUrl
          link.download = `${sanitizeFilename(menuName)}-qr.png`
          link.click()

          URL.revokeObjectURL(downloadUrl)

          toast({
            title: "QR Code Downloaded",
            description: "PNG file saved successfully.",
          })
          setIsDownloading(false)
        }, "image/png")
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        toast({
          title: "Download Failed",
          description: "Failed to load QR code image.",
          variant: "destructive",
        })
        setIsDownloading(false)
      }

      img.src = url
    } catch (error) {
      console.error("PNG download error:", error)
      toast({
        title: "Download Failed",
        description: "Please try again.",
        variant: "destructive",
      })
      setIsDownloading(false)
    }
  }

  const downloadSVG = () => {
    if (!qrRef.current) return

    setIsDownloading(true)
    try {
      const svgElement = qrRef.current.querySelector("svg")
      if (!svgElement) {
        throw new Error("SVG element not found")
      }

      const svgData = new XMLSerializer().serializeToString(svgElement)
      const blob = new Blob([svgData], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `${sanitizeFilename(menuName)}-qr.svg`
      link.click()

      URL.revokeObjectURL(url)

      toast({
        title: "QR Code Downloaded",
        description: "SVG file saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  if (!url) {
    return (
      <p className="text-sm text-muted-foreground">QR code unavailable</p>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        ref={qrRef}
        className="bg-white p-4 rounded-lg border-2 border-border"
      >
        <QRCode
          value={url}
          size={size}
          level="H"
          fgColor="#000000"
          bgColor="#FFFFFF"
        />
      </div>

      {showDownload && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadPNG}
            disabled={isDownloading}
            className="border-border hover:bg-secondary/10"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download PNG"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadSVG}
            disabled={isDownloading}
            className="border-border hover:bg-secondary/10"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download SVG"}
          </Button>
        </div>
      )}
    </div>
  )
}
