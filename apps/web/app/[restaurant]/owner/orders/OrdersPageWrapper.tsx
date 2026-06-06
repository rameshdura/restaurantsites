"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { OrdersClient, KitchenSession } from "./OrdersClient"
import { OrdersSidebar } from "./OrdersSidebar"
import { MenuItem } from "@/lib/restaurant"
import { supabase } from "@/lib/supabase"
import { Sheet, SheetContent } from "@workspace/ui/components/sheet"

interface MenuCategoryGroup {
  name: string
  items: MenuItem[]
}

interface OrdersPageWrapperProps {
  restaurantSlug: string
  menu: MenuItem[]
  menuCategories: MenuCategoryGroup[]
  initialView?: "orders" | "items" | "category" | "all"
}

export function OrdersPageWrapper({
  restaurantSlug,
  menu,
  menuCategories,
  initialView = "orders",
}: OrdersPageWrapperProps) {
  const [sessions, setSessions] = useState<KitchenSession[]>([])
  const [view, setView] = useState<"orders" | "items" | "category" | "all">(
    initialView
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const fetchSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("table_sessions")
        .select("*")
        .eq("restaurant_slug", restaurantSlug)
        .in("status", ["active", "payment_pending"])

      if (error) throw error
      setSessions((data as KitchenSession[]) || [])
    } catch (err) {
      console.error("Error loading orders sessions:", err)
    }
  }, [restaurantSlug])

  const fetchSessionsRef = useRef(fetchSessions)

  useEffect(() => {
    fetchSessionsRef.current = fetchSessions
  }, [fetchSessions])

  useEffect(() => {
    void fetchSessionsRef.current()
    const interval = setInterval(() => {
      void fetchSessionsRef.current()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden w-48 flex-shrink-0 md:block">
        <OrdersSidebar
          restaurantSlug={restaurantSlug}
          view={view}
          onViewChange={setView}
        />
      </div>

      {/* Mobile Sidebar (Off-canvas) */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <OrdersSidebar
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

      <div className="flex-1 overflow-y-auto">
        <OrdersClient
          menu={menu}
          menuCategories={menuCategories}
          view={view}
          sessions={sessions}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />
      </div>
    </div>
  )
}
