import { supabase } from "@/lib/supabase"

export type SessionViewType = "success" | "failed" | "all" | "active"

export interface TableSession {
  session_id: string
  table_number: string | number
  status: string
  created_at: string
  last_activity: string
  orders?: {
    total?: number
    items?: Record<string, unknown>[]
  }
}

export interface FetchSessionsOptions {
  restaurantSlug: string
  tableNumber?: number
  view?: SessionViewType
  limit?: number
  cursor?: string | null
}

/**
 * Fetches and filters table sessions with cursor-based pagination.
 * Since complex JSON filtering (e.g. orders.total > 0) is tricky in PostgREST directly,
 * this fetches chunks of sessions and filters them in-memory until the limit is reached.
 */
export async function fetchFilteredSessions({
  restaurantSlug,
  tableNumber,
  view = "all",
  limit = 20,
  cursor,
}: FetchSessionsOptions): Promise<{ data: TableSession[]; nextCursor: string | null; hasMore: boolean }> {
  const results: TableSession[] = []
  let hasMoreData = true
  let currentCursor = cursor

  while (results.length < limit && hasMoreData) {
    let query = supabase
      .from("table_sessions")
      .select("*")
      .eq("restaurant_slug", restaurantSlug)
      .order("created_at", { ascending: false })
      .limit(50) // Fetch in chunks

    if (tableNumber !== undefined) {
      query = query.eq("table_number", tableNumber)
    }

    if (currentCursor) {
      query = query.lt("created_at", currentCursor)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      hasMoreData = false
      break
    }

    const chunkLastItem = data[data.length - 1]
    let chunkCursor = chunkLastItem.created_at

    for (const s of data as TableSession[]) {
      const hasItems = s.orders?.items && s.orders.items.length > 0
      const isClosed = s.status === "closed"
      const total = s.orders?.total || 0

      let matches = false
      if (view === "success") {
        matches = Boolean(isClosed && hasItems && total > 0)
      } else if (view === "failed") {
        if (isClosed && (!hasItems || total === 0)) matches = true
        else if (s.status === "cancelled" || s.status === "abandoned") matches = true
        else matches = Boolean(isClosed && (!hasItems || total === 0))
      } else if (view === "active") {
        matches = s.status === "active" || s.status === "payment_pending"
      } else {
        matches = true
      }

      if (matches) {
        results.push(s)
      }

      if (results.length >= limit) {
        chunkCursor = s.created_at
        break
      }
    }
    
    currentCursor = chunkCursor
    
    if (data.length < 50) {
      // Reached the end of the table
      hasMoreData = false
    }
  }

  const reachedLimit = results.length >= limit
  return {
    data: results,
    nextCursor: (hasMoreData || reachedLimit) ? (currentCursor ?? null) : null,
    hasMore: hasMoreData || reachedLimit
  }
}
