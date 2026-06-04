"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { KitchenClient, KitchenSession } from "./KitchenClient"
import { KitchenSidebar } from "./KitchenSidebar"
import { MenuItem } from "@/lib/restaurant"
import { supabase } from "@/lib/supabase"

interface MenuCategoryGroup {
  name: string
  items: MenuItem[]
}

interface KitchenPageWrapperProps {
  restaurantSlug: string
  menu: MenuItem[]
  menuCategories: MenuCategoryGroup[]
  initialView?: 'orders' | 'items' | 'category'
}

export function KitchenPageWrapper({ restaurantSlug, menu, menuCategories, initialView = 'orders' }: KitchenPageWrapperProps) {
  const [sessions, setSessions] = useState<KitchenSession[]>([])
  const [view, setView] = useState<'orders' | 'items' | 'category'>(initialView)

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
      console.error("Error loading kitchen sessions:", err)
    }
  }, [restaurantSlug])

  const fetchSessionsRef = useRef(fetchSessions)

  useEffect(() => {
    fetchSessionsRef.current = fetchSessions
  }, [fetchSessions])

  useEffect(() => {
    // Use ref to avoid the set-state-in-effect warning while keeping
    // the initial fetch + polling pattern.
    void fetchSessionsRef.current()
    const interval = setInterval(() => { void fetchSessionsRef.current() }, 5000)
    return () => clearInterval(interval)
  }, [])

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

