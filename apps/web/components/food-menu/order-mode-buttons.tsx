"use client"

import { Button } from "@workspace/ui/components/button"
import { ShoppingBag, Bike, Download } from "lucide-react"
import { useRouter } from "next/navigation"

interface OrderModeButtonsProps {
  restaurantSlug: string
  hasTakeout?: boolean
  hasDelivery?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  translations?: any
  menuLinkUrl?: string | null
}

export function OrderModeButtons({
  restaurantSlug,
  hasTakeout,
  hasDelivery,
  translations,
  menuLinkUrl,
}: OrderModeButtonsProps) {
  const router = useRouter()

  if (!hasTakeout && !hasDelivery && !menuLinkUrl) return null

  const handleTakeout = () => {
    // Takeout numbers: 1000 - 9999
    const tableId = Math.floor(1000 + Math.random() * 9000)
    router.push(`/${restaurantSlug}/table/${tableId}`)
  }

  const handleDelivery = () => {
    // Delivery numbers: 10000 - 99999
    const tableId = Math.floor(10000 + Math.random() * 90000)
    router.push(`/${restaurantSlug}/table/${tableId}`)
  }

  const takeoutLabel = translations?.takeoutButton || "Order Takeout"
  const deliveryLabel = translations?.deliveryButton || "Order Delivery"

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-4 px-6 pt-4 pb-8 sm:flex-row sm:justify-end">
      {menuLinkUrl && (
        <Button
          size="lg"
          variant="outline"
          asChild
          className="h-16 w-full rounded-2xl px-8 text-lg font-bold shadow-lg transition-all hover:-translate-y-1 active:translate-y-0 active:scale-95 sm:w-auto"
        >
          <a href={menuLinkUrl} target="_blank" rel="noopener noreferrer">
            <Download className="mr-3 h-6 w-6" />
            {translations?.menuPage?.downloadButton || "Download Menu PDF"}
          </a>
        </Button>
      )}
      {hasDelivery && (
        <Button
          onClick={handleDelivery}
          variant="secondary"
          size="lg"
          className="h-16 w-full rounded-2xl border border-border px-8 text-lg font-bold shadow-lg transition-all hover:-translate-y-1 active:translate-y-0 active:scale-95 sm:w-auto"
        >
          <Bike className="mr-3 h-6 w-6" />
          {deliveryLabel}
        </Button>
      )}
      {hasTakeout && (
        <Button
          onClick={handleTakeout}
          size="lg"
          className="h-16 w-full rounded-2xl px-8 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-primary/40 active:translate-y-0 active:scale-95 sm:w-auto"
        >
          <ShoppingBag className="mr-3 h-6 w-6" />
          {takeoutLabel}
        </Button>
      )}
    </div>
  )
}
