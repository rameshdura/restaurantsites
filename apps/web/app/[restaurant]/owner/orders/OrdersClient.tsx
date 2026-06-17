"use client"

import { useState, useEffect } from "react"
import { MenuItem } from "@/lib/restaurant"
import {
  RefreshCw,
  HandPlatter,
  CheckCircle,
  Clock,
  Plus,
  Minus,
  UtensilsCrossed,
  Menu,
  Check,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export interface OrderItem {
  item_id: string
  order_item_id: string
  qty: number
  cooked_qty?: number
  served_qty?: number
  notes?: string
  name?: string
  selectedOptions?: Record<string, string>
}

export interface KitchenSession {
  session_id: string
  table_number: string
  created_at: string
  status: string
  orders?: {
    items?: OrderItem[]
    customer_info?: {
      name: string
      phone: string
      address: string
    }
  }
  [key: string]: unknown
}

interface OrdersClientProps {
  menu: MenuItem[]
  menuCategories: {
    name: string
    items: MenuItem[]
  }[]
  view: "orders" | "items" | "category" | "all"
  sessions: KitchenSession[]
  onToggleSidebar?: () => void
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
    <span
      className={`inline-flex items-center gap-1 font-medium ${isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-muted-foreground"}`}
    >
      <Clock className="h-3 w-3" />
      {elapsed}
    </span>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function renderSelectedOptions(item: any, arg2?: any) {
  if (!item || !item.selectedOptions || !arg2) return null
  // Detect if arg2 is categories or menu
  const menu =
    Array.isArray(arg2) && arg2[0]?.items
      ? arg2.flatMap((c: any) => c.items)
      : arg2
  const itemId = item.item_id || item.info?.item_id // Added fallback just in case
  const menuItem = menu.find(
    (m: any) => m.id === itemId || m.id === item.item_id
  )
  if (!menuItem || !menuItem.options) return null

  const optionsText = menuItem.options
    .map((opt: any) => {
      const selId = item.selectedOptions[opt.id]
      const sel = opt.selections.find((s: any) => s.id === selId)
      return sel ? sel.name : null
    })
    .filter(Boolean)
    .join(", ")

  if (!optionsText) return null
  return (
    <div className="mt-0.5 inline-block rounded-md bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
      {optionsText}
    </div>
  )
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function OrdersClient({
  menu,
  menuCategories,
  view,
  sessions,
  onToggleSidebar,
}: OrdersClientProps) {
  const [isUpdatingSession, setIsUpdatingSession] = useState<string | null>(
    null
  )

  // Local state for pending quantity updates.
  const [pendingUpdates, setPendingUpdates] = useState<
    Record<
      string,
      Record<
        string,
        {
          item_id: string
          order_item_id: string
          notes: string
          served_qty: number
        }
      >
    >
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
        [uniqueKey]: {
          item_id: itemId,
          order_item_id: orderItemId,
          notes: notes || "",
          served_qty: qty,
        },
      },
    }))
  }

  const updateSessionTicket = async (sessionId: string) => {
    const sessionUpdates = pendingUpdates[sessionId]
    if (!sessionUpdates || Object.keys(sessionUpdates).length === 0) return

    setIsUpdatingSession(sessionId)
    try {
      const updates = Object.values(sessionUpdates).map((u) => ({
        order_item_id: u.order_item_id,
        item_id: u.item_id,
        notes: u.notes,
        served_qty: u.served_qty,
      }))

      const res = await fetch("/api/table/order/serve-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          updates,
        }),
      })

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to update served status")
      }

      setPendingUpdates((prev) => {
        const next = { ...prev }
        delete next[sessionId]
        return next
      })
    } catch (err) {
      console.error(err)
      alert("Error updating served status.")
    } finally {
      setIsUpdatingSession(null)
    }
  }

  // Filter out sessions that have no items
  const activeOrders = sessions.filter(
    (s) => s.orders?.items && s.orders.items.length > 0
  )

  const renderOrdersView = () => (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {activeOrders.map((session) => {
        const items = session.orders?.items || []
        const sessionPending = pendingUpdates[session.session_id] || {}
        const hasPending = Object.keys(sessionPending).length > 0

        const totalItemsCount = items.reduce(
          (sum: number, i: OrderItem) => sum + (i.qty || 0),
          0
        )

        const totalServedCount = items.reduce((sum: number, i: OrderItem) => {
          const uniqueKey = `${i.order_item_id || i.item_id}::${i.notes || ""}`
          const localOverride = sessionPending[uniqueKey]
          const servedQty = localOverride
            ? localOverride.served_qty
            : i.served_qty || 0
          return sum + servedQty
        }, 0)

        const isFullyServed = totalServedCount >= totalItemsCount && !hasPending

        return (
          <div
            key={session.session_id}
            className={`relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 ${
              isFullyServed
                ? "border-emerald-500/30 opacity-70"
                : "border-border shadow-md"
            }`}
          >
            {/* Ticket Header */}
            <div
              className={`border-b p-4 ${isFullyServed ? "border-emerald-500/20 bg-emerald-500/10" : "border-border bg-primary/5"}`}
            >
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-2xl font-black tracking-tight tabular-nums">
                  {Number(session.table_number) >= 10000
                    ? `DEL-${session.table_number}`
                    : Number(session.table_number) >= 1000
                      ? `TO-${session.table_number}`
                      : `T-${session.table_number}`}
                </h3>
                <div className="text-right">
                  <ElapsedTime createdString={session.created_at} />
                </div>
              </div>
              {session.orders?.customer_info && (
                <div className="mb-2 rounded-md bg-background/50 p-2 text-xs">
                  <p className="font-bold text-foreground">
                    {session.orders.customer_info.name}{" "}
                    <span className="ml-1 font-normal text-muted-foreground">
                      {session.orders.customer_info.phone}
                    </span>
                  </p>
                  {session.orders.customer_info.address && (
                    <p className="mt-0.5 text-muted-foreground">
                      {session.orders.customer_info.address}
                    </p>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between text-xs font-bold tracking-wider text-muted-foreground uppercase">
                <span>{totalItemsCount} Items</span>
                <span
                  className={
                    isFullyServed
                      ? "text-emerald-600 dark:text-emerald-400"
                      : ""
                  }
                >
                  {totalServedCount} / {totalItemsCount} Served
                </span>
              </div>
            </div>

            {/* Ticket Items */}
            <div className="divide-y divide-border/50 p-2">
              {items.map((item: OrderItem, idx: number) => {
                const details = getMenuItemDetails(item.item_id)
                const name = details?.name || item.item_id
                const qty = item.qty || 1
                const uniqueKey = `${item.order_item_id || item.item_id}::${item.notes || ""}`
                const localOverride =
                  pendingUpdates[session.session_id]?.[uniqueKey]
                const servedQty = localOverride
                  ? localOverride.served_qty
                  : item.served_qty || 0
                const isItemFullyServed = servedQty >= qty
                const isItemCooked = (item.cooked_qty || 0) >= qty

                return (
                  <div
                    key={idx}
                    className={`rounded-xl p-3 transition-colors ${
                      isItemFullyServed ? "bg-muted/50" : "bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-base leading-tight font-bold ${isItemFullyServed ? "text-muted-foreground line-through" : "text-foreground"}`}
                          >
                            <span className="mr-1.5 text-primary">{qty}x</span>
                            {name}
                          </p>
                          {isItemCooked && !isItemFullyServed && (
                            <span className="flex items-center gap-0.5 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-black text-orange-600 uppercase dark:bg-orange-900/30 dark:text-orange-400">
                              <Check className="h-3 w-3" /> Ready
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="mt-1 inline-block rounded bg-red-50 px-2 py-0.5 text-left text-sm font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
                            {item.notes}
                          </p>
                        )}
                        {renderSelectedOptions(item, menu)}
                      </div>

                      {/* Served Tracker Controls */}
                      <div className="flex shrink-0 items-center gap-1 rounded-lg bg-muted p-1">
                        <button
                          onClick={() =>
                            handleLocalQtyChange(
                              session.session_id,
                              item.item_id,
                              item.order_item_id,
                              item.notes,
                              servedQty - 1
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
                          disabled={servedQty <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold tabular-nums">
                          {servedQty}
                        </span>
                        <button
                          onClick={() =>
                            handleLocalQtyChange(
                              session.session_id,
                              item.item_id,
                              item.order_item_id,
                              item.notes,
                              servedQty + 1
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
                          disabled={servedQty >= qty}
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
              <div className="border-t border-border bg-muted/30 p-3">
                <button
                  onClick={() => updateSessionTicket(session.session_id)}
                  disabled={isUpdatingSession === session.session_id}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
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
    const itemMap: Record<
      string,
      {
        item_id: string
        name: string
        qty: number
        tables: {
          session_id: string
          table: string
          qty: number
          notes?: string
          served_qty: number
          order_item_id: string
          cooked_qty: number
          selectedOptions?: Record<string, string>
        }[]
      }
    > = {}

    activeOrders.forEach((session) => {
      if (!session.orders?.items) return
      session.orders.items.forEach((item: OrderItem) => {
        const details = getMenuItemDetails(item.item_id)
        const name = details?.name || item.name || item.item_id
        const uniqueKey = `${item.order_item_id || item.item_id}::${item.notes || ""}`
        if (!itemMap[uniqueKey]) {
          itemMap[uniqueKey] = {
            item_id: item.item_id,
            name,
            qty: 0,
            tables: [],
          }
        }
        itemMap[uniqueKey].qty += item.qty
        itemMap[uniqueKey].tables.push({
          session_id: session.session_id,
          table: session.table_number,
          qty: item.qty,
          served_qty: item.served_qty || 0,
          cooked_qty: item.cooked_qty || 0,
          notes: item.notes,
          order_item_id: item.order_item_id,
          selectedOptions: item.selectedOptions,
        })
      })
    })

    const filteredEntries = Object.entries(itemMap).filter(([key, info]) => {
      const hasPendingForItem = Object.keys(pendingUpdates).some(
        (sessionId) => pendingUpdates[sessionId]?.[key]
      )
      if (hasPendingForItem) return true

      return info.tables.some((t) => {
        const uKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
        const localOverride = pendingUpdates[t.session_id]?.[uKey]
        const servedQty = localOverride
          ? localOverride.served_qty
          : t.served_qty
        return servedQty < t.qty
      })
    })

    if (filteredEntries.length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-border bg-card p-20 text-center shadow-sm">
          <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-bold text-foreground">
            All Items Served
          </h3>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Everything has been delivered to tables.
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredEntries.map(([key, info]) => {
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
            return t.served_qty < t.qty
          })

          const remainingQty = activeTables.reduce((sum, t) => {
            const uKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
            const localOverride = pendingUpdates[t.session_id]?.[uKey]
            const servedQty = localOverride
              ? localOverride.served_qty
              : t.served_qty
            return sum + (t.qty - servedQty)
          }, 0)

          return (
            <div
              key={key}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-border bg-primary/5 p-4">
                <h4 className="text-lg font-black">{info.name}</h4>
                <span className="rounded-md bg-background px-2 py-1 text-sm font-bold">
                  {remainingQty} Left
                </span>
              </div>
              <div className="divide-y divide-border/50 p-2">
                {activeTables.map((t, idx) => {
                  const uniqueKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
                  const localOverride =
                    pendingUpdates[t.session_id]?.[uniqueKey]
                  const servedQty = localOverride
                    ? localOverride.served_qty
                    : t.served_qty
                  const remaining = t.qty - servedQty
                  const isCooked = t.cooked_qty >= t.qty

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold">
                            Table {t.table}
                          </span>
                          {isCooked && (
                            <span className="rounded bg-orange-100 px-1 text-[8px] font-black text-orange-600 uppercase dark:bg-orange-900/30 dark:text-orange-400">
                              Ready
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {t.qty}x
                          {t.notes && (
                            <span className="ml-1 text-red-500 italic">
                              ({t.notes})
                            </span>
                          )}
                          {renderSelectedOptions(
                            {
                              ...t,
                              item_id:
                                typeof info !== "undefined"
                                  ? info.item_id
                                  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    (t as any).item_id,
                            },
                            menu
                          )}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 rounded-lg bg-muted p-1">
                        <button
                          onClick={() =>
                            handleLocalQtyChange(
                              t.session_id,
                              info.item_id,
                              t.order_item_id,
                              t.notes,
                              servedQty - 1
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
                          disabled={servedQty <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="flex w-16 flex-col items-center">
                          <span className="text-sm font-bold tabular-nums">
                            {servedQty} / {t.qty}
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
                              servedQty + 1
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
                          disabled={servedQty >= t.qty}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {hasPending && (
                <div className="mt-auto border-t border-border bg-muted/30 p-3">
                  <button
                    onClick={async () => {
                      for (const sessionId of pendingSessions) {
                        await updateSessionTicket(sessionId)
                      }
                    }}
                    disabled={isUpdatingSession !== null}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
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
    const itemCategoryMap: Record<string, string> = {}
    menuCategories.forEach((cat) => {
      cat.items?.forEach((menuItem: MenuItem) => {
        if (menuItem.id) {
          itemCategoryMap[menuItem.id] = cat.name
        }
      })
    })

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
          served_qty: number
          cooked_qty: number
          order_item_id: string
          selectedOptions?: Record<string, string>
        }[]
      }
    > = {}

    activeOrders.forEach((session) => {
      if (!session.orders?.items) return
      session.orders.items.forEach((item: OrderItem) => {
        const details = getMenuItemDetails(item.item_id)
        const name = details?.name || item.name || item.item_id
        const category = itemCategoryMap[item.item_id] || "Uncategorized"
        const uniqueKey = `${item.order_item_id || item.item_id}::${item.notes || ""}`
        if (!itemMap[uniqueKey]) {
          itemMap[uniqueKey] = {
            item_id: item.item_id,
            name,
            category,
            qty: 0,
            tables: [],
          }
        }
        itemMap[uniqueKey].qty += item.qty
        itemMap[uniqueKey].tables.push({
          session_id: session.session_id,
          table: session.table_number,
          qty: item.qty,
          served_qty: item.served_qty || 0,
          cooked_qty: item.cooked_qty || 0,
          notes: item.notes,
          order_item_id: item.order_item_id,
          selectedOptions: item.selectedOptions,
        })
      })
    })

    const filteredEntries = Object.entries(itemMap).filter(([key, info]) => {
      const hasPendingForItem = Object.keys(pendingUpdates).some(
        (sessionId) => pendingUpdates[sessionId]?.[key]
      )
      if (hasPendingForItem) return true

      return info.tables.some((t) => {
        const uKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
        const localOverride = pendingUpdates[t.session_id]?.[uKey]
        const servedQty = localOverride
          ? localOverride.served_qty
          : t.served_qty
        return servedQty < t.qty
      })
    })

    if (filteredEntries.length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-border bg-card p-20 text-center shadow-sm">
          <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-bold text-foreground">
            All Items Served
          </h3>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Everything has been prepared and served.
          </p>
        </div>
      )
    }

    const categoryGroups: Record<string, typeof filteredEntries> = {}
    filteredEntries.forEach(([key, info]) => {
      const cat = info.category
      if (!categoryGroups[cat]) categoryGroups[cat] = []
      categoryGroups[cat].push([key, info])
    })

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

          const categoryRemaining = entries.reduce((sum, [, info]) => {
            return (
              sum +
              info.tables.reduce((tSum, t) => {
                const uKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
                const localOverride = pendingUpdates[t.session_id]?.[uKey]
                const servedQty = localOverride
                  ? localOverride.served_qty
                  : t.served_qty
                return tSum + (t.qty - servedQty)
              }, 0)
            )
          }, 0)

          return (
            <div key={categoryName}>
              <div className="mb-4 flex items-center gap-3">
                <h3 className="text-xl font-black tracking-tight text-foreground">
                  {categoryName}
                </h3>
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
                  {categoryRemaining} remaining
                </span>
                <div className="flex-1 border-t border-border/40" />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    return t.served_qty < t.qty
                  })

                  const remainingQty = activeTables.reduce((sum, t) => {
                    const uKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
                    const localOverride = pendingUpdates[t.session_id]?.[uKey]
                    const servedQty = localOverride
                      ? localOverride.served_qty
                      : t.served_qty
                    return sum + (t.qty - servedQty)
                  }, 0)

                  return (
                    <div
                      key={key}
                      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-border bg-primary/5 p-4">
                        <h4 className="text-lg font-black">{info.name}</h4>
                        <span className="rounded-md bg-background px-2 py-1 text-sm font-bold">
                          {remainingQty} Left
                        </span>
                      </div>
                      <div className="divide-y divide-border/50 p-2">
                        {activeTables.map((t, idx) => {
                          const uniqueKey = `${t.order_item_id || info.item_id}::${t.notes || ""}`
                          const localOverride =
                            pendingUpdates[t.session_id]?.[uniqueKey]
                          const servedQty = localOverride
                            ? localOverride.served_qty
                            : t.served_qty
                          const remaining = t.qty - servedQty
                          const isCooked = t.cooked_qty >= t.qty

                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3"
                            >
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold">
                                    Table {t.table}
                                  </span>
                                  {isCooked && (
                                    <span className="rounded bg-orange-100 px-1 text-[8px] font-black text-orange-600 uppercase dark:bg-orange-900/30 dark:text-orange-400">
                                      Ready
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {t.qty}x
                                  {t.notes && (
                                    <span className="ml-1 text-red-500 italic">
                                      ({t.notes})
                                    </span>
                                  )}
                                  {renderSelectedOptions(
                                    {
                                      ...t,
                                      item_id:
                                        typeof info !== "undefined"
                                          ? info.item_id
                                          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            (t as any).item_id,
                                    },
                                    menu
                                  )}
                                </span>
                              </div>
                              <div className="flex shrink-0 items-center gap-2 rounded-lg bg-muted p-1">
                                <button
                                  onClick={() =>
                                    handleLocalQtyChange(
                                      t.session_id,
                                      info.item_id,
                                      t.order_item_id,
                                      t.notes,
                                      servedQty - 1
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
                                  disabled={servedQty <= 0}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <div className="flex w-16 flex-col items-center">
                                  <span className="text-sm font-bold tabular-nums">
                                    {servedQty} / {t.qty}
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
                                      servedQty + 1
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
                                  disabled={servedQty >= t.qty}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {hasPending && (
                        <div className="mt-auto border-t border-border bg-muted/30 p-3">
                          <button
                            onClick={async () => {
                              for (const sessionId of pendingSessions) {
                                await updateSessionTicket(sessionId)
                              }
                            }}
                            disabled={isUpdatingSession !== null}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
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

  const renderAllItemsView = () => {
    const allPendingItems: {
      session_id: string
      table: string
      item_id: string
      order_item_id: string
      name: string
      qty: number
      served_qty: number
      cooked_qty: number
      notes?: string
      created_at: string
    }[] = []

    activeOrders.forEach((session) => {
      if (!session.orders?.items) return
      session.orders.items.forEach((item: OrderItem) => {
        const uniqueKey = `${item.order_item_id || item.item_id}::${item.notes || ""}`
        const localOverride = pendingUpdates[session.session_id]?.[uniqueKey]
        const servedQty = localOverride
          ? localOverride.served_qty
          : item.served_qty || 0

        if (servedQty < item.qty) {
          const details = getMenuItemDetails(item.item_id)
          allPendingItems.push({
            session_id: session.session_id,
            table: session.table_number,
            item_id: item.item_id,
            order_item_id: item.order_item_id,
            name: details?.name || item.name || item.item_id,
            qty: item.qty,
            served_qty: servedQty,
            cooked_qty: item.cooked_qty || 0,
            notes: item.notes,
            created_at: session.created_at,
          })
        }
      })
    })

    allPendingItems.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    if (allPendingItems.length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-border bg-card p-20 text-center shadow-sm">
          <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-bold text-foreground">
            No Pending Items
          </h3>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            All items have been served.
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allPendingItems.map((item, idx) => {
          const uniqueKey = `${item.order_item_id || item.item_id}::${item.notes || ""}`
          const hasPendingUpdate =
            !!pendingUpdates[item.session_id]?.[uniqueKey]
          const isCooked = item.cooked_qty >= item.qty

          return (
            <div
              key={`${item.session_id}-${idx}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="flex items-start justify-between border-b border-border bg-primary/5 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-black">{item.name}</h4>
                    {isCooked && (
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-black text-orange-600 uppercase dark:bg-orange-900/30 dark:text-orange-400">
                        Ready
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-bold">
                      Table {item.table}
                    </span>
                    <ElapsedTime createdString={item.created_at} />
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4">
                {item.notes && (
                  <p className="mb-4 inline-block rounded bg-red-50 px-2 py-0.5 text-sm font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
                    {item.notes}
                  </p>
                )}
                {renderSelectedOptions(item, menu)}

                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold">
                    <span className="mr-1 text-xl text-primary">
                      {item.qty}
                    </span>
                    <span className="text-muted-foreground">Ordered</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
                    <button
                      onClick={() =>
                        handleLocalQtyChange(
                          item.session_id,
                          item.item_id,
                          item.order_item_id,
                          item.notes,
                          item.served_qty - 1
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
                      disabled={item.served_qty <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="flex w-16 flex-col items-center">
                      <span className="text-sm font-bold tabular-nums">
                        {item.served_qty} / {item.qty}
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        {item.qty - item.served_qty} left
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleLocalQtyChange(
                          item.session_id,
                          item.item_id,
                          item.order_item_id,
                          item.notes,
                          item.served_qty + 1
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-background shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
                      disabled={item.served_qty >= item.qty}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {hasPendingUpdate && (
                <div className="border-t border-border bg-muted/30 p-3">
                  <button
                    onClick={() => updateSessionTicket(item.session_id)}
                    disabled={isUpdatingSession === item.session_id}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isUpdatingSession === item.session_id ? (
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
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 p-4 sm:p-8 dark:bg-zinc-950">
      {/* Header Controls */}
      <div className="mx-auto mb-8 flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl md:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="h-6 w-px bg-border md:hidden" aria-hidden="true" />

          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <HandPlatter className="h-5 w-5 text-primary" />
              Server Management
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {view === "orders"
                ? "Live table delivery tickets"
                : view === "items"
                  ? "Aggregated item delivery list"
                  : view === "category"
                    ? "Items grouped by menu category"
                    : "All pending delivery items"}
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl">
        {activeOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-20 text-center shadow-sm">
            <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-bold text-foreground">
              No Active Orders
            </h3>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              All orders have been served.
            </p>
          </div>
        ) : view === "orders" ? (
          renderOrdersView()
        ) : view === "items" ? (
          renderItemsView()
        ) : view === "category" ? (
          renderCategoryView()
        ) : (
          renderAllItemsView()
        )}
      </main>
    </div>
  )
}
