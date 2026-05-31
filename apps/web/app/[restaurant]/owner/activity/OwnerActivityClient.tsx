"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { MenuItem } from "@/lib/restaurant"
import {
  RefreshCw,
  Sparkles,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertTriangle,
  LayoutGrid,
  Receipt,
} from "lucide-react"

interface OwnerActivityClientProps {
  restaurantSlug: string
  currency: string
  menu: MenuItem[]
  menuCategories: {
    name: string
    items: MenuItem[]
  }[]
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  JPY: "¥",
  USD: "$",
  EUR: "€",
  GBP: "£",
  KRW: "₩",
  CNY: "¥",
  INR: "₹",
}

function ElapsedTime({ createdString }: { createdString: string }) {
  const [elapsed, setElapsed] = useState("")

  useEffect(() => {
    const updateElapsed = () => {
      const elapsedMs = Date.now() - new Date(createdString).getTime()
      const mins = Math.floor(elapsedMs / 60000)
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

  return <span>{elapsed}</span>
}

export function OwnerActivityClient({
  restaurantSlug,
  currency,
  menu,
  menuCategories,
}: OwnerActivityClientProps) {
  const router = useRouter()
  const [sessions, setSessions] = useState<
    {
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
  const [isClosing, setIsClosing] = useState<string | null>(null)

  const symbol = CURRENCY_SYMBOLS[currency] || ""

  const handlePayAndClose = async (sessionId: string) => {
    if (!confirm("Are you sure you want to finalize this session and mark it as paid?")) {
      return
    }

    setIsClosing(sessionId)
    try {
      const response = await fetch("/api/table/session/close", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id: sessionId, status: "closed" }),
      })

      if (!response.ok) {
        throw new Error("Failed to close session")
      }

      // Refresh data
      await fetchSessions(false)
    } catch (err) {
      console.error("Error closing session:", err)
      alert("Failed to close session. Please try again.")
    } finally {
      setIsClosing(null)
    }
  }

  const fetchSessions = useCallback(
    async (showLoading = false) => {
      if (showLoading) setIsLoading(true)
      else setIsRefreshing(true)

      try {
        const { data, error } = await supabase
          .from("table_sessions")
          .select("*")
          .eq("restaurant_slug", restaurantSlug)
          .order("created_at", { ascending: false })

        if (error) throw error
        setSessions(data || [])
      } catch (err) {
        console.error("Error loading table sessions:", err)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [restaurantSlug]
  )

  useEffect(() => {
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

  const activeSessions = sessions.filter(
    (s) => s.status === "active" || s.status === "payment_pending"
  )
  const closedSessions = sessions.filter((s) => s.status === "closed")
  const totalSales = sessions.reduce(
    (sum, s) => sum + (s.orders?.total || 0),
    0
  )
  const activeSales = activeSessions.reduce(
    (sum, s) => sum + (s.orders?.total || 0),
    0
  )

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="p-4 sm:p-8">
      {/* Header Controls */}
      <div className="mx-auto mb-8 flex max-w-7xl items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Activity className="h-5 w-5 text-primary" />
            Activity Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitor live tables and sales.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground select-none">
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
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-1.5 text-xs font-semibold transition-all hover:bg-accent disabled:opacity-50"
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
              Loading dashboard data...
            </p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Live Tables
                  </span>
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-3xl font-extrabold text-foreground">
                  {activeSessions.length}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Currently ordering
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Active Sales
                  </span>
                  <Sparkles className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="text-3xl font-extrabold text-foreground">
                  {symbol}
                  {activeSales}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  In active sessions
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Total Sales
                  </span>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-3xl font-extrabold text-foreground">
                  {symbol}
                  {totalSales}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  All sessions today
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Closed Sessions
                  </span>
                  <CheckCircle className="h-5 w-5 text-muted-foreground/60" />
                </div>
                <h3 className="text-3xl font-extrabold text-foreground">
                  {closedSessions.length}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Completed checkouts
                </p>
              </div>
            </section>

            {/* Active Tables List */}
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <LayoutGrid className="h-5 w-5 text-primary" />
              Active Tables
            </h2>
            {activeSessions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-20 text-center">
                <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  No active tables at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeSessions.map((session) => {
                  const isPaymentPending = session.status === "payment_pending"
                  const isActive =
                    session.status === "active" || isPaymentPending
                  const orders = session.orders || {}
                  const items = orders.items || []
                  const totalItemsCount = items.reduce(
                    (
                      sum: number,
                      i: { qty?: number; [key: string]: unknown }
                    ) => sum + (i.qty || 0),
                    0
                  )

                  return (
                    <div
                      key={session.session_id}
                      className={`relative flex flex-col justify-between rounded-3xl border bg-card p-6 shadow-sm transition-all duration-300 ${
                        isActive
                          ? "border-primary/30 shadow-primary/5 hover:border-primary/50"
                          : "border-border opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div>
                        {/* Session Card Header */}
                        <div className="mb-4 flex items-start justify-between border-b border-border pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold">
                                Table {session.table_number}
                              </h3>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                                  isPaymentPending
                                    ? "animate-pulse border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : isActive
                                      ? "animate-pulse border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400"
                                      : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {isPaymentPending
                                  ? "Checkout Requested"
                                  : session.status}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                              {isActive ? (
                                <>
                                  Opened{" "}
                                  <ElapsedTime
                                    createdString={session.created_at}
                                  />
                                </>
                              ) : (
                                `Closed at ${formatTime(session.last_activity)}`
                              )}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="block text-xs font-bold text-muted-foreground uppercase">
                              Total
                            </span>
                            <span className="text-lg font-extrabold">
                              {symbol}
                              {orders.total || 0}
                            </span>
                          </div>
                        </div>

                        {/* Order Items Breakdown */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                              Order details ({totalItemsCount} items)
                            </h4>
                            {totalItemsCount > 0 && (
                              <div className="text-[10px] font-bold tracking-wider text-emerald-500 uppercase">
                                {items.reduce((sum: number, i: { served_qty?: number; [key: string]: unknown }) => sum + (i.served_qty || 0), 0)} / {totalItemsCount} Served
                              </div>
                            )}
                          </div>
                          {items.length === 0 ? (
                            <p className="py-2 text-xs text-muted-foreground italic">
                              No items ordered.
                            </p>
                          ) : (
                            <div className="max-h-48 space-y-2.5 overflow-y-auto pr-1">
                              {items.map(
                                (item: {
                                  item_id: string
                                  qty: number
                                  served_qty?: number
                                  notes?: string
                                  [key: string]: unknown
                                }) => {
                                  const details = getMenuItemDetails(
                                    item.item_id
                                  )
                                  const name = details?.name || item.item_id
                                  const itemPrice = details
                                    ? parseFloat(String(details.price)) || 0
                                    : 0
                                  const servedQty = item.served_qty || 0
                                  const isFullyServed = servedQty >= item.qty

                                  return (
                                    <div
                                      key={item.item_id + (item.notes || "")}
                                      className={`flex items-start justify-between text-xs transition-colors ${
                                        isFullyServed ? "opacity-50" : ""
                                      }`}
                                    >
                                      <div className="pr-4 flex-1">
                                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                                          {name}
                                          <span className="font-bold text-primary">
                                            x{item.qty}
                                          </span>
                                          {isFullyServed && (
                                            <CheckCircle className="h-3 w-3 text-emerald-500 inline" />
                                          )}
                                        </p>
                                        {item.notes && (
                                          <p className="mt-0.5 text-[10px] text-muted-foreground italic">
                                            &quot;{item.notes}&quot;
                                          </p>
                                        )}
                                        {servedQty > 0 && !isFullyServed && (
                                          <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                            {servedQty} served
                                          </p>
                                        )}
                                      </div>
                                      <span className="font-medium whitespace-nowrap">
                                        {symbol}
                                        {itemPrice * item.qty}
                                      </span>
                                    </div>
                                  )
                                }
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bill Totals Summary */}
                      <div className="mt-auto border-t border-border pt-4">
                        <div className="mb-4 grid grid-cols-2 gap-y-1 text-[11px] text-muted-foreground">
                          <div>Subtotal:</div>
                          <div className="text-right font-medium">
                            {symbol}
                            {orders.subtotal || 0}
                          </div>
                          <div>Tax (10%):</div>
                          <div className="text-right font-medium">
                            {symbol}
                            {orders.tax || 0}
                          </div>
                          {Number(orders.tips) > 0 && (
                            <>
                              <div>Tips:</div>
                              <div className="text-right font-semibold text-primary">
                                +{symbol}
                                {orders.tips}
                              </div>
                            </>
                          )}
                        </div>

                        <div className="mt-4 flex flex-col gap-2">
                          {isActive ? (
                            <>
                              <button
                                onClick={() =>
                                  handlePayAndClose(session.session_id)
                                }
                                disabled={isClosing === session.session_id}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                              >
                                {isClosing === session.session_id ? (
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                )}
                                Pay and Close
                              </button>
                              <button
                                onClick={() =>
                                  router.push(
                                    `/${restaurantSlug}/owner/tables/${session.table_number}`
                                  )
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-accent active:scale-[0.98]"
                              >
                                <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                                Update
                              </button>
                            </>
                          ) : (
                            <div className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-muted px-4 py-2 text-xs font-bold text-muted-foreground select-none">
                              Session Finalized
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Recent Transactions List */}
            <h2 className="mt-12 mb-4 flex items-center gap-2 text-lg font-bold">
              <Receipt className="h-5 w-5 text-primary" />
              Recent Transactions
            </h2>
            {closedSessions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-12 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  No transactions recorded yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Table</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {closedSessions.slice(0, 10).map((session) => {
                      const date = new Date(session.last_activity || session.created_at)
                      return (
                        <tr 
                          key={session.session_id} 
                          className="transition-colors hover:bg-muted/50 cursor-pointer"
                          onClick={() => router.push(`/${restaurantSlug}/owner/sessions/${session.session_id}`)}
                        >
                          <td className="px-4 py-3 font-medium">
                            Table {session.table_number}
                          </td>
                          <td className="px-4 py-3 font-bold text-foreground">
                            {symbol}
                            {session.orders?.total || 0}
                          </td>
                          <td className="px-4 py-3">{date.toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatTime(session.last_activity || session.created_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
