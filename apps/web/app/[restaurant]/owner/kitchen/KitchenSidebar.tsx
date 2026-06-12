"use client"

import Link from "next/link"
import {
  ChefHat,
  ClipboardList,
  Utensils,
  LayoutList,
  LayoutGrid,
} from "lucide-react"

interface KitchenSidebarProps {
  restaurantSlug: string
  view: "orders" | "items" | "category" | "all"
  onViewChange: (view: "orders" | "items" | "category" | "all") => void
  onHeaderClick?: () => void
}

export function KitchenSidebar({
  restaurantSlug,
  view,
  onViewChange,
  onHeaderClick,
}: KitchenSidebarProps) {
  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <Link
          href={`/${restaurantSlug}/owner/kitchen`}
          onClick={() => {
            onViewChange("orders")
            onHeaderClick?.()
          }}
          className="flex items-center gap-2 text-lg font-bold transition-colors hover:text-primary"
        >
          <ChefHat className="h-5 w-5" />
          Kitchen
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => onViewChange("orders")}
          className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
            view === "orders"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
        >
          <ClipboardList className="h-5 w-5" />
          <span className="font-semibold">By Table</span>
        </button>

        <button
          onClick={() => onViewChange("items")}
          className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
            view === "items"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
        >
          <Utensils className="h-5 w-5" />
          <span className="font-semibold">By Item</span>
        </button>

        <button
          onClick={() => onViewChange("category")}
          className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
            view === "category"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
        >
          <LayoutList className="h-5 w-5" />
          <span className="font-semibold">By Category</span>
        </button>

        <button
          onClick={() => onViewChange("all")}
          className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
            view === "all"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          }`}
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="font-semibold">All Items</span>
        </button>
      </div>
    </div>
  )
}
