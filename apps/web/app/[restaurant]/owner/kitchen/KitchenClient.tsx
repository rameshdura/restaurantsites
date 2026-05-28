"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { MenuItem } from "@/lib/restaurant"
import {
  RefreshCw,
  ChefHat,
  CheckCircle,
  Clock,
  Plus,
  Minus,
  UtensilsCrossed
} from "lucide-react"

interface KitchenClientProps {
  restaurantSlug: string
  menu: MenuItem[]
  menuCategories: {
    name: string
    items: MenuItem[]
  }[]
}

function ElapsedTime({ createdString }: { createdString: string }) {
  const [elapsed, setElapsed] = useState("")
  const [isWarning, setIsWarning] = useState(false)
  const [isCritical, setIsCritical] = useState(false)

  useEffect(() => {
    const updateElapsed = () => {
      const elapsedMs = Date.now() - new Date(createdString).getTime()
      const mins = Math.floor(elapsedMs / 60000)
      
      setIsWarning(mins >= 15 && mins < 30)
      setIsCritical(mins >= 30)

      if (mins < 1) {
        setElapsed("just now")
      } else if (mins < 60) {
        setElapsed(`${mins}m ago`)
      } else {
        const hours = Math.floor(mins / 60)
        setElapsed(`${hours}h ${mins % 60}m ago`)
      }
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 60000)
    return () => clearInterval(interval)
  }, [createdString])

  return (
    <span className={`inline-flex items-center gap-1 font-medium ${isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-muted-foreground'}`}>
      <Clock className="h-3 w-3" />
      {elapsed}
    </span>
  )
}

export function KitchenClient({
  restaurantSlug,
  menu,
  menuCategories,
}: KitchenClientProps) {
  const [sessions, setSessions] = useState<
    {
      session_id: string
      table_number: string
      status: string
      created_at: string
      orders?: {
        items?: {
          item_id: string
          qty: number
          cooked_qty?: number
          served_qty?: number
          notes?: string
          [key: string]: unknown
        }[]
      }
      [key: string]: unknown
    }[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isUpdatingSession, setIsUpdatingSession] = useState<string | null>(null)
  
  // Local state for pending quantity updates.
  // Record<sessionId, Record<uniqueKey, { item_id, notes, cooked_qty }>>
  const [pendingUpdates, setPendingUpdates] = useState<
    Record<string, Record<string, { item_id: string; notes: string; cooked_qty: number }>>
  >({})

  const fetchSessions = useCallback(
    async (showLoading = false) => {
      if (showLoading) setIsLoading(true)
      else setIsRefreshing(true)

      try {
        const { data, error } = await supabase
          .from("table_sessions")
          .select("*")
          .eq("restaurant_slug", restaurantSlug)
          .in("status", ["active", "payment_pending"])
          .order("created_at", { ascending: true }) // Oldest first for KDS

        if (error) throw error
        setSessions(data || [])
      } catch (err) {
        console.error("Error loading kitchen sessions:", err)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [restaurantSlug]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions(true)
  }, [fetchSessions])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchSessions(false)
    }, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchSessions])

  const getMenuItemDetails = (itemId: string) => {
    let found = menu.find((i) => i.id === itemId)
    if (!found) {
      for (const cat of menuCategories) {
        const match = cat.items?.find((i: MenuItem) => i.id === itemId)
        if (match) {
          found = match
          break
        }
      }
    }
    return found
  }

  const handleLocalQtyChange = (
    sessionId: string,
    itemId: string,
    notes: string | undefined,
    qty: number
  ) => {
    const uniqueKey = `${itemId}::${notes || ""}`
    setPendingUpdates((prev) => ({
      ...prev,
      [sessionId]: {
        ...(prev[sessionId] || {}),
        [uniqueKey]: { item_id: itemId, notes: notes || "", cooked_qty: qty },
      },
    }))
  }

  const updateSessionTicket = async (sessionId: string) => {
    const sessionUpdates = pendingUpdates[sessionId]
    if (!sessionUpdates || Object.keys(sessionUpdates).length === 0) return

    setIsUpdatingSession(sessionId)
    try {
      const updates = Object.values(sessionUpdates)

      const res = await fetch("/api/table/order/cook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          updates,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to update cooking status")
      }

      setPendingUpdates((prev) => {
        const next = { ...prev }
        delete next[sessionId]
        return next
      })
      await fetchSessions()
    } catch (err) {
      console.error(err)
      alert("Error updating cooking status.")
    } finally {
      setIsUpdatingSession(null)
    }
  }

  // Filter out sessions that have no items to cook
  const activeOrders = sessions.filter(
    (s) => s.orders?.items && s.orders.items.length > 0
  )

  return (
    <div className="p-4 sm:p-8 bg-zinc-50 dark:bg-zinc-950 min-h-[calc(100vh-4rem)]">
      {/* Header Controls */}
      <div className="mx-auto mb-8 flex max-w-7xl items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-primary" />
            Kitchen Display
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Live order tickets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground select-none shadow-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded accent-primary"
            />
            Auto-refresh (5s)
          </label>

          <button
            onClick={() => fetchSessions(false)}
            disabled={isRefreshing}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-1.5 text-xs font-semibold transition-all hover:bg-accent disabled:opacity-50 shadow-sm"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl">
        {isLoading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <RefreshCw className="mb-4 h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Loading tickets...
            </p>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-20 text-center shadow-sm">
            <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-bold text-foreground">No Active Orders</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              The kitchen is all caught up.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
            {activeOrders.map((session) => {
              const items = session.orders?.items || []
              const sessionPending = pendingUpdates[session.session_id] || {}
              const hasPending = Object.keys(sessionPending).length > 0

              const totalItemsCount = items.reduce((sum, i) => sum + (i.qty || 0), 0)
              
              // Calculate total cooked based on real value + local overrides
              const totalCookedCount = items.reduce((sum, i) => {
                const uniqueKey = `${i.item_id}::${i.notes || ""}`
                const localOverride = sessionPending[uniqueKey]
                const cookedQty = localOverride ? localOverride.cooked_qty : (i.cooked_qty || 0)
                return sum + cookedQty
              }, 0)
              
              const isFullyCooked = totalCookedCount >= totalItemsCount && !hasPending

              return (
                <div
                  key={session.session_id}
                  className={`relative flex flex-col rounded-2xl border bg-card shadow-sm transition-all duration-300 overflow-hidden ${
                    isFullyCooked
                      ? "border-emerald-500/30 opacity-70"
                      : "border-border shadow-md"
                  }`}
                >
                  {/* Ticket Header */}
                  <div className={`p-4 border-b ${isFullyCooked ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-primary/5 border-border'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-2xl font-black tabular-nums tracking-tight">
                        T-{session.table_number}
                      </h3>
                      <div className="text-right">
                        <ElapsedTime createdString={session.created_at} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <span>{totalItemsCount} Items</span>
                      <span className={isFullyCooked ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                        {totalCookedCount} / {totalItemsCount} Cooked
                      </span>
                    </div>
                  </div>

                  {/* Ticket Items */}
                  <div className="p-2 divide-y divide-border/50">
                    {items.map((item, idx) => {
                      const details = getMenuItemDetails(item.item_id)
                      const name = details?.name || item.item_id
                      const qty = item.qty || 1
                      const uniqueKey = `${item.item_id}::${item.notes || ""}`
                      const localOverride = pendingUpdates[session.session_id]?.[uniqueKey]
                      const cookedQty = localOverride ? localOverride.cooked_qty : (item.cooked_qty || 0)
                      const isItemFullyCooked = cookedQty >= qty

                      return (
                        <div
                          key={idx}
                          className={`p-3 transition-colors rounded-xl ${
                            isItemFullyCooked ? "bg-muted/50" : "bg-card"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className={`font-bold text-base leading-tight ${isItemFullyCooked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                <span className="text-primary mr-1.5">{qty}x</span>
                                {name}
                              </p>
                              {item.notes && (
                                <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 inline-block px-2 py-0.5 rounded text-left">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                            
                            {/* Cooked Tracker Controls */}
                            <div className="flex items-center gap-1 bg-muted rounded-lg p-1 shrink-0">
                              <button
                                onClick={() => handleLocalQtyChange(session.session_id, item.item_id, item.notes, cookedQty - 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm hover:bg-accent disabled:opacity-50 transition-colors"
                                disabled={cookedQty <= 0}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-6 text-center text-sm font-bold tabular-nums">
                                {cookedQty}
                              </span>
                              <button
                                onClick={() => handleLocalQtyChange(session.session_id, item.item_id, item.notes, cookedQty + 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm hover:bg-accent disabled:opacity-50 transition-colors"
                                disabled={cookedQty >= qty}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Ticket Footer */}
                  {hasPending && (
                    <div className="p-3 border-t border-border bg-muted/30">
                      <button
                        onClick={() => updateSessionTicket(session.session_id)}
                        disabled={isUpdatingSession === session.session_id}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isUpdatingSession === session.session_id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Update Ticket
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
