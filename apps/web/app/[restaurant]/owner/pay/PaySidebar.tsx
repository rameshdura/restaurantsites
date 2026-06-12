"use client"

import { useRouter } from "next/navigation"
import {
  QrCode,
  CheckCircle,
  XCircle,
  Banknote,
} from "lucide-react"

export type PayViewType = "scanner" | "success" | "failed"

interface PaySidebarProps {
  restaurantSlug: string
  view: PayViewType
  onViewChange: (view: PayViewType) => void
  onHeaderClick?: () => void
}

export function PaySidebar({
  restaurantSlug,
  view,
  onViewChange,
  onHeaderClick,
}: PaySidebarProps) {
  const router = useRouter()

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <button
          onClick={() => {
            router.push(`/${restaurantSlug}/owner/pay`)
            onViewChange("scanner")
            onHeaderClick?.()
          }}
          className="flex items-center gap-2 text-lg font-bold transition-colors hover:text-primary"
        >
          <Banknote className="h-5 w-5" />
          Payments
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => onViewChange("scanner")}
          className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
            view === "scanner"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
        >
          <QrCode className="h-5 w-5" />
          <span className="font-semibold">Scanner</span>
        </button>

        <button
          onClick={() => onViewChange("success")}
          className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
            view === "success"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
        >
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Success</span>
        </button>

        <button
          onClick={() => onViewChange("failed")}
          className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
            view === "failed"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
        >
          <XCircle className="h-5 w-5" />
          <span className="font-semibold">Failed</span>
        </button>
      </div>
    </div>
  )
}
