"use client"

import { useRef, useEffect, useState } from "react"
import QRCode from "react-qr-code"
import { Download } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"

interface TableQRCodeProps {
  restaurantName: string
  restaurantSlug: string
  tableId: string | number
  tableLabel: string
}

export function TableQRCode({
  restaurantName,
  restaurantSlug,
  tableId,
  tableLabel,
}: TableQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true)
  }, [])

  // The URL guests will scan to order from this table
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const qrValue = `${origin}/${restaurantSlug}/table/${tableId}`

  const downloadQR = async () => {
    if (!qrRef.current) return

    try {
      // Import dynamically to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default

      const canvas = await html2canvas(qrRef.current, {
        scale: 3, // Higher resolution
        backgroundColor: "#ffffff",
      })

      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = `${restaurantSlug}-table-${tableId}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Failed to download QR code", error)
    }
  }

  return (
    <Card className="flex flex-col items-center justify-center border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      {/* The QR Code Container to be captured */}
      <div
        ref={qrRef}
        className="flex w-full max-w-[280px] flex-col items-center justify-between rounded-xl border-2 p-6"
        style={{
          backgroundColor: "#ffffff",
          color: "#000000",
          borderColor: "#f1f5f9",
        }}
      >
        <div className="mb-4 flex w-full flex-1 items-center justify-center">
          {mounted ? (
            <QRCode
              value={qrValue}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          ) : (
            <div style={{ width: "100%", aspectRatio: "1/1" }} />
          )}
        </div>

        <div className="flex w-full flex-col items-center justify-end">
          <h3
            className="w-full truncate text-center text-lg font-bold tracking-tight"
            style={{ color: "#0f172a" }}
          >
            {restaurantName}
          </h3>
          <p
            className="text-center text-2xl font-black tracking-widest uppercase"
            style={{ color: "#0f172a" }}
          >
            {tableLabel}
          </p>
        </div>
      </div>

      <Button
        onClick={downloadQR}
        className="mt-6 flex w-full items-center gap-2 font-semibold"
        variant="default"
      >
        <Download className="h-4 w-4" />
        Download QR
      </Button>
    </Card>
  )
}
