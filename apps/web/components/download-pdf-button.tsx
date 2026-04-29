"use client"

import { Button } from "@workspace/ui/components/button"
import { Download } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useState } from "react"

interface DownloadPdfButtonProps {
  elementId: string
  filename: string
  widthMm: number
  heightMm: number
}

export function DownloadPdfButton({ elementId, filename, widthMm, heightMm }: DownloadPdfButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    const element = document.getElementById(elementId)
    if (!element) return

    setIsDownloading(true)
    try {
      const canvas = await html2canvas(element, {
        scale: 3, // High quality
        useCORS: true,
        logging: false,
        backgroundColor: null,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: widthMm > heightMm ? "l" : "p",
        unit: "mm",
        format: [widthMm, heightMm],
      })

      pdf.addImage(imgData, "PNG", 0, 0, widthMm, heightMm)
      pdf.save(`${filename}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2" 
      onClick={handleDownload}
      disabled={isDownloading}
    >
      <Download className="w-4 h-4" />
      {isDownloading ? "Generating..." : "Download PDF"}
    </Button>
  )
}
