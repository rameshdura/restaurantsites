"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PaySidebar, PayViewType } from "./PaySidebar"
import { OwnerPayClient } from "./OwnerPayClient"
import { PayListClient } from "./PayListClient"
import { MenuItem } from "@/lib/restaurant"
import { Sheet, SheetContent } from "@workspace/ui/components/sheet"

interface MenuCategoryGroup {
  name: string
  items: MenuItem[]
}

interface PayPageWrapperProps {
  restaurantSlug: string
  currency: string
  menu: MenuItem[]
  menuCategories: MenuCategoryGroup[]
}

export function PayPageWrapper({
  restaurantSlug,
  currency,
  menu,
  menuCategories,
}: PayPageWrapperProps) {
  const router = useRouter()
  const [view, setView] = useState<PayViewType>("scanner")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // When a session is clicked from the list, we switch to scanner view to show details
  const handleSessionSelect = (sessionId: string) => {
    setView("scanner")
    // Update the URL to include session_id, OwnerPayClient will pick it up
    router.replace(`/${restaurantSlug}/owner/pay?session_id=${sessionId}`)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden w-48 flex-shrink-0 md:block print:hidden">
        <PaySidebar
          restaurantSlug={restaurantSlug}
          view={view}
          onViewChange={setView}
        />
      </div>

      {/* Mobile Sidebar (Off-canvas) */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <PaySidebar
            restaurantSlug={restaurantSlug}
            view={view}
            onViewChange={(newView) => {
              setView(newView)
              setIsSidebarOpen(false)
            }}
            onHeaderClick={() => setIsSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex-1 overflow-y-auto print:overflow-visible print:bg-white text-black">
        {view === "scanner" ? (
          <OwnerPayClient
            restaurantSlug={restaurantSlug}
            currency={currency}
            menu={menu}
            menuCategories={menuCategories}
            onToggleSidebar={() => setIsSidebarOpen(true)}
          />
        ) : (
          <PayListClient
            restaurantSlug={restaurantSlug}
            currency={currency}
            view={view}
            onSessionSelect={handleSessionSelect}
            onToggleSidebar={() => setIsSidebarOpen(true)}
          />
        )}
      </div>
    </div>
  )
}
