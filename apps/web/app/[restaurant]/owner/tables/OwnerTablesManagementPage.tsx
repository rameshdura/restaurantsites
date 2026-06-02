"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { TableListSidebar } from "./TableListSidebar"
import { OwnerTableDetailClient } from "./[tableId]/OwnerTableDetailClient"
import { OwnerTablesClient } from "./OwnerTablesClient"

interface TableSession {
  session_id: string
  table_number: string
  status: string
  created_at: string
  last_activity: string
  orders?: {
    total?: number
    subtotal?: number
    service_charge?: number
    tax?: number
    tips?: number
    discount?: number
    items?: {
      item_id: string
      qty: number
      notes?: string
      [key: string]: unknown
    }[]
  }
  persons?: number
  [key: string]: unknown
}

export function OwnerTablesManagementPage({
  restaurantSlug,
  tables,
  categories,
  currency,
}: {
  restaurantSlug: string
  tables: { id: string | number; label: string; persons?: number }[]
  categories: any[]
  currency: string
}) {
  const searchParams = useSearchParams()
  const tableId = searchParams.get("tableId")

  const [sessions, setSessions] = useState<TableSession[]>([])

  const fetchSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("table_sessions")
        .select("*")
        .eq("restaurant_slug", restaurantSlug)
        .in("status", ["active", "payment_pending"])

      if (error) throw error
      setSessions((data as TableSession[]) || [])
    } catch (err) {
      console.error("Error loading active sessions:", err)
    }
  }, [restaurantSlug])

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 5000)
    return () => clearInterval(interval)
  }, [fetchSessions])

  return (
    <div className="flex h-screen w-full">
      <div className="w-40 flex-shrink-0">
        <TableListSidebar
          restaurantSlug={restaurantSlug}
          tables={tables}
          sessions={sessions}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {tableId ? (
          <OwnerTableDetailClient
            restaurantSlug={restaurantSlug}
            tableId={tableId}
            currency={currency}
            categories={categories}
          />
        ) : (
          <OwnerTablesClient
            restaurantSlug={restaurantSlug}
            tables={tables}
            useQueryParam={true}
          />
        )}
      </div>
    </div>
  )
}
