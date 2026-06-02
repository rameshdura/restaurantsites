"use client"

import { useState, useEffect, useCallback } from "react"
import { KitchenClient } from "./KitchenClient"
import { KitchenSidebar } from "./KitchenSidebar"
import { MenuItem } from "@/lib/restaurant"
import { supabase } from "@/lib/supabase"

interface KitchenPageWrapperProps {
  restaurantSlug: string
  menu: MenuItem[]
  menuCategories: any[]
  initialView?: 'orders' | 'items' | 'category'
}

export function KitchenPageWrapper({ restaurantSlug, menu, menuCategories, initialView = 'orders' }: KitchenPageWrapperProps) {
  const [sessions, setSessions] = useState<any[]>([])
  const [view, setView] = useState<'orders' | 'items' | 'category'>(initialView)
// ...

  const fetchSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("table_sessions")
        .select("*")
        .eq("restaurant_slug", restaurantSlug)
        .in("status", ["active", "payment_pending"])
      
      if (error) throw error
      setSessions(data || [])
    } catch (err) {
      console.error("Error loading kitchen sessions:", err)
    }
  }, [restaurantSlug])

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 5000)
    return () => clearInterval(interval)
  }, [fetchSessions])

  return (
    <div className="flex h-screen w-full">
      <div className="w-48 flex-shrink-0">
        <KitchenSidebar restaurantSlug={restaurantSlug} view={view} onViewChange={setView} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <KitchenClient
          menu={menu}
          menuCategories={menuCategories}
          view={view}
          sessions={sessions}
        />
      </div>
    </div>
  )
}
