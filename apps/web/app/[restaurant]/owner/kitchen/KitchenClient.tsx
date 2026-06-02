"use client"

import { useState, useEffect } from "react"
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
  menu: MenuItem[]
  menuCategories: {
    name: string
    items: MenuItem[]
  }[]
  view: 'orders' | 'items' | 'category'
  sessions: any[]
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
  menu,
  menuCategories,
  view,
  sessions,
}: KitchenClientProps) {
  const [isUpdatingSession, setIsUpdatingSession] = useState<string | null>(null)
  
  // Local state for pending quantity updates.
  // Record<sessionId, Record<uniqueKey, { item_id, order_item_id, notes, cooked_qty }>>
  const [pendingUpdates, setPendingUpdates] = useState<
    Record<string, Record<string, { item_id: string; order_item_id: string; notes: string; cooked_qty: number }>>
  >({})

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
    orderItemId: string,
    notes: string | undefined,
    qty: number
  ) => {
    const uniqueKey = `${orderItemId || itemId}::${notes || ""}`
    setPendingUpdates((prev) => ({
      ...prev,
      [sessionId]: {
        ...(prev[sessionId] || {}),
        [uniqueKey]: { item_id: itemId, order_item_id: orderItemId, notes: notes || "", cooked_qty: qty },
      },
    }))
  }

  const updateSessionTicket = async (sessionId: string) => {
    const sessionUpdates = pendingUpdates[sessionId]
    if (!sessionUpdates || Object.keys(sessionUpdates).length === 0) return

    setIsUpdatingSession(sessionId)
    try {
      const updates = Object.values(sessionUpdates).map(u => ({
        order_item_id: u.order_item_id,
        item_id: u.item_id,
        notes: u.notes,
        cooked_qty: u.cooked_qty
      }));

      console.log("[KitchenClient] Sending updates to API:", { session_id: sessionId, updates });

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
      // Refreshing sessions is handled by the parent wrapper's fetchSessions
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

  const renderOrdersView = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
        {activeOrders.map((session) => {
            const items = session.orders?.items || []
            const sessionPending = pendingUpdates[session.session_id] || {}
            const hasPending = Object.keys(sessionPending).length > 0

            const totalItemsCount = items.reduce((sum: number, i: any) => sum + (i.qty || 0), 0)
            
            // Calculate total cooked based on real value + local overrides
            const totalCookedCount = items.reduce((sum: number, i: any) => {
              const uniqueKey = `${i.order_item_id || i.item_id}::${i.notes || ""}`
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
                  {items.map((item: any, idx: number) => {
                    console.log("[KitchenClient] Rendering item:", item);
                    const details = getMenuItemDetails(item.item_id)
                    const name = details?.name || item.item_id
                    const qty = item.qty || 1
                    const uniqueKey = `${item.order_item_id || item.item_id}::${item.notes || ""}`
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
                              onClick={() => handleLocalQtyChange(session.session_id, item.item_id, item.order_item_id, item.notes, cookedQty - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm hover:bg-accent disabled:opacity-50 transition-colors"
                              disabled={cookedQty <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold tabular-nums">
                              {cookedQty}
                            </span>
                            <button
                              onClick={() => handleLocalQtyChange(session.session_id, item.item_id, item.order_item_id, item.notes, cookedQty + 1)}
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
  )

  const renderItemsView = () => {
    // Aggregate items across all sessions
    const itemMap: Record<string, { item_id: string, name: string, qty: number, tables: {session_id: string, table: string, qty: number, notes?: string, cooked_qty: number, order_item_id: string}[] }> = {}
    
    activeOrders.forEach(session => {
        if (!session.orders?.items) return
        session.orders.items.forEach((item: any) => {
        const details = getMenuItemDetails(item.item_id);
        const name = details?.name || item.name || item.item_id;
        const uniqueKey = `${item.order_item_id || item.item_id}::${item.notes || ""}`
        if (!itemMap[uniqueKey]) {
            itemMap[uniqueKey] = { item_id: item.item_id, name, qty: 0, tables: [] }
        }
        itemMap[uniqueKey].qty += item.qty
        itemMap[uniqueKey].tables.push({
            session_id: session.session_id,
            table: session.table_number,
            qty: item.qty,
            cooked_qty: item.cooked_qty || 0,
            notes: item.notes,
            order_item_id: item.order_item_id
        })
        })
        })

        // Filter out fully cooked items, BUT keep items that have pending updates
        // or are currently being updated so the user sees the loading state
        const filteredEntries = Object.entries(itemMap).filter(([key, info]) => {
            // Keep visible if this item has pending updates in any session
            const hasPendingForItem = Object.keys(pendingUpdates).some(sessionId =>
                pendingUpdates[sessionId]?.[key]
            )
            if (hasPendingForItem) return true

            // Otherwise, only show if there are remaining items to cook
            return info.tables.some(t => {
                const uKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
                const localOverride = pendingUpdates[t.session_id]?.[uKey]
                const cookedQty = localOverride ? localOverride.cooked_qty : t.cooked_qty
                return cookedQty < t.qty
            })
        })

        if (filteredEntries.length === 0) {
            return (
                <div className="rounded-3xl border border-dashed border-border bg-card p-20 text-center shadow-sm">
                    <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <h3 className="text-lg font-bold text-foreground">All Items Cooked</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                        Everything has been prepared.
                    </p>
                </div>
            )
        }

        return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEntries.map(([key, info]) => {
            // Determine if this item has any pending updates across any sessions
            const pendingSessions = new Set<string>();
            Object.keys(pendingUpdates).forEach(sessionId => {
              if (pendingUpdates[sessionId]?.[key]) {
                pendingSessions.add(sessionId);
              }
            });

            const hasPending = pendingSessions.size > 0;

            // Filter table rows: keep visible if it has a pending update, otherwise hide if fully cooked
            const activeTables = info.tables.filter(t => {
                const uKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
                const localOverride = pendingUpdates[t.session_id]?.[uKey]
                if (localOverride) return true
                const cookedQty = t.cooked_qty
                return cookedQty < t.qty
            })

            const remainingQty = activeTables.reduce((sum, t) => {
                const uKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
                const localOverride = pendingUpdates[t.session_id]?.[uKey]
                const cookedQty = localOverride ? localOverride.cooked_qty : t.cooked_qty
                return sum + (t.qty - cookedQty)
            }, 0)

            return (
                <div key={key} className="rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-border bg-primary/5 flex items-center justify-between">
                        <h4 className="font-black text-lg">{info.name}</h4>
                        <span className="text-sm font-bold bg-background px-2 py-1 rounded-md">{remainingQty} Left</span>
                    </div>
                    <div className="p-2 divide-y divide-border/50">
                        {activeTables.map((t, idx) => {
                            const uniqueKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
                            const localOverride = pendingUpdates[t.session_id]?.[uniqueKey]
                            const cookedQty = localOverride ? localOverride.cooked_qty : t.cooked_qty
                            const remaining = t.qty - cookedQty

                            return (
                                <div key={idx} className="p-3 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">Table {t.table}</span>
                                        <span className="text-xs text-muted-foreground">{t.qty}x{t.notes && <span className="italic text-red-500 ml-1">({t.notes})</span>}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-muted rounded-lg p-1 shrink-0">
                                        <button
                                          onClick={() => handleLocalQtyChange(t.session_id, info.item_id, t.order_item_id, t.notes, cookedQty - 1)}
                                          className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm hover:bg-accent disabled:opacity-50 transition-colors"
                                          disabled={cookedQty <= 0}
                                        >
                                          <Minus className="h-4 w-4" />
                                        </button>
                                        <div className="flex flex-col items-center w-16">
                                                <span className="text-sm font-bold tabular-nums">
                                                  {cookedQty} / {t.qty}
                                                </span>
                                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                                    {remaining} left
                                                </span>
                                            </div>
                                        <button
                                          onClick={() => handleLocalQtyChange(t.session_id, info.item_id, t.order_item_id, t.notes, cookedQty + 1)}
                                          className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm hover:bg-accent disabled:opacity-50 transition-colors"
                                          disabled={cookedQty >= t.qty}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </button>
                                      </div>
                                </div>
                            )
                        })}
                    </div>
                        
                        {hasPending && (
                            <div className="p-3 border-t border-border bg-muted/30 mt-auto">
                                <button
                                  onClick={async () => {
                                      // Update all pending sessions for this item
                                      for (const sessionId of pendingSessions) {
                                          await updateSessionTicket(sessionId);
                                      }
                                  }}
                                  disabled={isUpdatingSession !== null}
                                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {isUpdatingSession !== null ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4" />
                                    )}
                                    Update Pending ({pendingSessions.size} Tickets)
                                </button>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
  }

  const renderCategoryView = () => {
    // Build a lookup: item_id → category name
    const itemCategoryMap: Record<string, string> = {}
    menuCategories.forEach((cat) => {
      cat.items?.forEach((menuItem: MenuItem) => {
        if (menuItem.id) {
          itemCategoryMap[menuItem.id] = cat.name
        }
      })
    })

    // Aggregate items across all sessions (same logic as renderItemsView)
    const itemMap: Record<
      string,
      {
        item_id: string
        name: string
        category: string
        qty: number
        tables: {
          session_id: string
          table: string
          qty: number
          notes?: string
          cooked_qty: number
          order_item_id: string
        }[]
      }
    > = {}

    activeOrders.forEach((session) => {
      if (!session.orders?.items) return
      session.orders.items.forEach((item: any) => {
        const details = getMenuItemDetails(item.item_id)
        const name = details?.name || item.name || item.item_id
        const category = itemCategoryMap[item.item_id] || "Uncategorized"
        const uniqueKey = `${item.order_item_id || item.item_id}::${item.notes || ""}`
        if (!itemMap[uniqueKey]) {
          itemMap[uniqueKey] = { item_id: item.item_id, name, category, qty: 0, tables: [] }
        }
        itemMap[uniqueKey].qty += item.qty
        itemMap[uniqueKey].tables.push({
          session_id: session.session_id,
          table: session.table_number,
          qty: item.qty,
          cooked_qty: item.cooked_qty || 0,
          notes: item.notes,
          order_item_id: item.order_item_id,
        })
      })
    })

    // Filter out fully cooked items (same as renderItemsView)
    const filteredEntries = Object.entries(itemMap).filter(([key, info]) => {
      const hasPendingForItem = Object.keys(pendingUpdates).some(
        (sessionId) => pendingUpdates[sessionId]?.[key]
      )
      if (hasPendingForItem) return true

      return info.tables.some((t) => {
        const uKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
        const localOverride = pendingUpdates[t.session_id]?.[uKey]
        const cookedQty = localOverride ? localOverride.cooked_qty : t.cooked_qty
        return cookedQty < t.qty
      })
    })

    if (filteredEntries.length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-border bg-card p-20 text-center shadow-sm">
          <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-bold text-foreground">All Items Cooked</h3>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Everything has been prepared.
          </p>
        </div>
      )
    }

    // Group filtered entries by category
    const categoryGroups: Record<string, typeof filteredEntries> = {}
    filteredEntries.forEach(([key, info]) => {
      const cat = info.category
      if (!categoryGroups[cat]) categoryGroups[cat] = []
      categoryGroups[cat].push([key, info])
    })

    // Order categories by their order in menuCategories, put "Uncategorized" last
    const orderedCategoryNames = menuCategories
      .map((c) => c.name)
      .filter((name) => categoryGroups[name])
    if (categoryGroups["Uncategorized"]) {
      orderedCategoryNames.push("Uncategorized")
    }

    return (
      <div className="space-y-10">
        {orderedCategoryNames.map((categoryName) => {
          const entries = categoryGroups[categoryName]
          if (!entries || entries.length === 0) return null

          // Total remaining in this category
          const categoryRemaining = entries.reduce((sum, [, info]) => {
            return (
              sum +
              info.tables.reduce((tSum, t) => {
                const uKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
                const localOverride = pendingUpdates[t.session_id]?.[uKey]
                const cookedQty = localOverride ? localOverride.cooked_qty : t.cooked_qty
                return tSum + (t.qty - cookedQty)
              }, 0)
            )
          }, 0)

          return (
            <div key={categoryName}>
              {/* Category Header */}
              <div className="mb-4 flex items-center gap-3">
                <h3 className="text-xl font-black tracking-tight text-foreground">
                  {categoryName}
                </h3>
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
                  {categoryRemaining} remaining
                </span>
                <div className="flex-1 border-t border-border/40" />
              </div>

              {/* Item Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {entries.map(([key, info]) => {
                  const pendingSessions = new Set<string>()
                  Object.keys(pendingUpdates).forEach((sessionId) => {
                    if (pendingUpdates[sessionId]?.[key]) {
                      pendingSessions.add(sessionId)
                    }
                  })
                  const hasPending = pendingSessions.size > 0

                  const activeTables = info.tables.filter((t) => {
                    const uKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
                    const localOverride = pendingUpdates[t.session_id]?.[uKey]
                    if (localOverride) return true
                    return t.cooked_qty < t.qty
                  })

                  const remainingQty = activeTables.reduce((sum, t) => {
                    const uKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
                    const localOverride = pendingUpdates[t.session_id]?.[uKey]
                    const cookedQty = localOverride ? localOverride.cooked_qty : t.cooked_qty
                    return sum + (t.qty - cookedQty)
                  }, 0)

                  return (
                    <div
                      key={key}
                      className="rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden"
                    >
                      <div className="p-4 border-b border-border bg-primary/5 flex items-center justify-between">
                        <h4 className="font-black text-lg">{info.name}</h4>
                        <span className="text-sm font-bold bg-background px-2 py-1 rounded-md">
                          {remainingQty} Left
                        </span>
                      </div>
                      <div className="p-2 divide-y divide-border/50">
                        {activeTables.map((t, idx) => {
                          const uniqueKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
                          const localOverride = pendingUpdates[t.session_id]?.[uniqueKey]
                          const cookedQty = localOverride
                            ? localOverride.cooked_qty
                            : t.cooked_qty
                          const remaining = t.qty - cookedQty

                          return (
                            <div key={idx} className="p-3 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold">Table {t.table}</span>
                                <span className="text-xs text-muted-foreground">
                                  {t.qty}x
                                  {t.notes && (
                                    <span className="italic text-red-500 ml-1">({t.notes})</span>
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-muted rounded-lg p-1 shrink-0">
                                <button
                                  onClick={() =>
                                    handleLocalQtyChange(
                                      t.session_id,
                                      info.item_id,
                                      t.order_item_id,
                                      t.notes,
                                      cookedQty - 1
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm hover:bg-accent disabled:opacity-50 transition-colors"
                                  disabled={cookedQty <= 0}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <div className="flex flex-col items-center w-16">
                                  <span className="text-sm font-bold tabular-nums">
                                    {cookedQty} / {t.qty}
                                  </span>
                                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                    {remaining} left
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    handleLocalQtyChange(
                                      t.session_id,
                                      info.item_id,
                                      t.order_item_id,
                                      t.notes,
                                      cookedQty + 1
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm hover:bg-accent disabled:opacity-50 transition-colors"
                                  disabled={cookedQty >= t.qty}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {hasPending && (
                        <div className="p-3 border-t border-border bg-muted/30 mt-auto">
                          <button
                            onClick={async () => {
                              for (const sessionId of pendingSessions) {
                                await updateSessionTicket(sessionId)
                              }
                            }}
                            disabled={isUpdatingSession !== null}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
                          >
                            {isUpdatingSession !== null ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Update Pending ({pendingSessions.size} Tickets)
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 bg-zinc-50 dark:bg-zinc-950 min-h-[calc(100vh-4rem)]">
      {/* Header Controls */}
      <div className="mx-auto mb-8 flex max-w-7xl items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <ChefHat className="h-5 w-5 text-primary" />
            Kitchen Display
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {view === 'orders' ? 'Live order tickets' : view === 'items' ? 'Aggregated item preparation list' : 'Items grouped by menu category'}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl">
        {activeOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-20 text-center shadow-sm">
            <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-bold text-foreground">No Active Orders</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              The kitchen is all caught up.
            </p>
          </div>
        ) : (
            view === 'orders' ? renderOrdersView() : view === 'items' ? renderItemsView() : renderCategoryView()
        )}
      </main>
    </div>
  )
}
