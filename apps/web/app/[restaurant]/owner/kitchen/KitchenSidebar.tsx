"use client"

import { useRouter } from "next/navigation"
import { ChefHat, ClipboardList, Utensils, LayoutList } from "lucide-react"

interface KitchenSidebarProps {
  restaurantSlug: string
  view: 'orders' | 'items' | 'category'
  onViewChange: (view: 'orders' | 'items' | 'category') => void
}

export function KitchenSidebar({ restaurantSlug, view, onViewChange }: KitchenSidebarProps) {
  const router = useRouter()

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <button
          onClick={() => router.push(`/${restaurantSlug}/owner/kitchen`)}
          className="flex items-center gap-2 text-lg font-bold hover:text-primary transition-colors"
        >
          <ChefHat className="h-5 w-5" />
          Kitchen
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => onViewChange('orders')}
          className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
            view === 'orders' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
        >
          <ClipboardList className="h-5 w-5" />
          <span className="font-semibold">By Order</span>
        </button>

        <button
          onClick={() => onViewChange('items')}
          className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
            view === 'items' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
        >
          <Utensils className="h-5 w-5" />
          <span className="font-semibold">By Item</span>
        </button>

        <button
          onClick={() => onViewChange('category')}
          className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
            view === 'category' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
        >
          <LayoutList className="h-5 w-5" />
          <span className="font-semibold">By Category</span>
        </button>
      </div>
    </div>
  )
}
