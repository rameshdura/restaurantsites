"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  RefreshCw,
  Utensils,
  Sparkles,
  ArrowLeft,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

interface OwnerDashboardClientProps {
  restaurantSlug: string
  restaurantName: string
  currency: string
  menu: any[]
  menuCategories: any[]
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

export function OwnerDashboardClient({
  restaurantSlug,
  restaurantName,
  currency,
  menu,
  menuCategories,
}: OwnerDashboardClientProps) {
  const [sessions, setSessions] = useState<{ session_id: string; table_number: string; status: string; created_at: string; last_activity: string; orders?: { total?: number; subtotal?: number; service_charge?: number; tax?: number; tips?: number; discount?: number; items?: { item_id: string; qty: number; notes?: string; [key: string]: unknown }[] }; [key: string]: unknown }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [closingSessionId, setClosingSessionId] = useState<string | null>(null)

  const symbol = CURRENCY_SYMBOLS[currency] || ""

  // 1. Fetch sessions from Supabase
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

  // 2. Poll sessions periodically
  useEffect(() => {
    const init = async () => {
      await fetchSessions(true)
    }
    init()
  }, [fetchSessions])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchSessions(false)
    }, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchSessions])

  // 3. Close Session Handler
  const handleCloseSession = async (sessionId: string) => {
    if (
      !confirm(
        "Are you sure you want to close this table session? The guest will need to scan again to start a new order."
      )
    ) {
      return
    }
    setClosingSessionId(sessionId)
    try {
      const res = await fetch("/api/table/session/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchSessions(false)
      }
    } catch (err) {
      console.error("Error closing session:", err)
    } finally {
      setClosingSessionId(null)
    }
  }

  // Helper to look up menu item name
  const getMenuItemDetails = (itemId: string) => {
    let found = menu.find((i) => i.id === itemId)
    if (!found) {
      for (const cat of menuCategories) {
        const match = cat.items?.find((i: { id?: string; [key: string]: unknown }) => i.id === itemId)
        if (match) {
          found = match
          break
        }
      }
    }
    return found
  }

  // Calculate dashboard statistics
  const activeSessions = sessions.filter((s) => s.status === "active" || s.status === "payment_pending")
  const closedSessions = sessions.filter((s) => s.status === "closed")
  const totalSales = sessions.reduce(
    (sum, s) => sum + (s.orders?.total || 0),
    0
  )
  const activeSales = activeSessions.reduce(
    (sum, s) => sum + (s.orders?.total || 0),
    0
  )

  // Format date helper
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 text-zinc-100 antialiased sm:p-8">
      {/* Top Banner and Navigation */}
      <header className="mx-auto mb-8 flex max-w-7xl flex-col gap-4 border-b border-zinc-900 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/${restaurantSlug}`}
            className="mb-2 inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Site
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
            <Utensils className="h-6 w-6 text-primary" />
            {restaurantName} Dashboard
          </h1>
          <p className="mt-1 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            Table & Order Management
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-400 select-none">
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
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl">
        {isLoading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <RefreshCw className="mb-4 h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">
              Loading dashboard data...
            </p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-5 shadow-sm backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Live Tables
                  </span>
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-3xl font-extrabold text-white">
                  {activeSessions.length}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">Currently ordering</p>
              </div>

              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-5 shadow-sm backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Active Sales
                  </span>
                  <Sparkles className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="text-3xl font-extrabold text-white">
                  {symbol}
                  {activeSales}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">In active sessions</p>
              </div>

              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-5 shadow-sm backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Total Sales
                  </span>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-3xl font-extrabold text-white">
                  {symbol}
                  {totalSales}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">All sessions today</p>
              </div>

              <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-5 shadow-sm backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between text-zinc-500">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Closed Sessions
                  </span>
                  <CheckCircle className="h-5 w-5 text-zinc-400" />
                </div>
                <h3 className="text-3xl font-extrabold text-white">
                  {closedSessions.length}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Completed checkouts
                </p>
              </div>
            </section>

            {/* Table Sessions List */}
            <h2 className="mb-4 text-lg font-bold text-white">
              Table Session Logs
            </h2>
            {sessions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-800 p-20 text-center">
                <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-zinc-600" />
                <p className="text-sm font-medium text-zinc-500">
                  No order sessions recorded yet for this restaurant.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => {
                  const isPaymentPending = session.status === "payment_pending"
                  const isActive = session.status === "active" || isPaymentPending
                  const orders = session.orders || {}
                  const items = orders.items || []
                  const totalItemsCount = items.reduce(
                    (sum: number, i: { qty?: number; [key: string]: unknown }) => sum + (i.qty || 0),
                    0
                  )

                  return (
                    <div
                      key={session.session_id}
                      className={`relative flex flex-col justify-between rounded-3xl border bg-zinc-900/30 p-6 shadow-md backdrop-blur-xl transition-all duration-300 ${
                        isActive
                          ? "border-primary/20 shadow-primary/5 hover:border-primary/40"
                          : "border-zinc-900 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div>
                        {/* Session Card Header */}
                        <div className="mb-4 flex items-start justify-between border-b border-zinc-800/80 pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold text-white">
                                Table {session.table_number}
                              </h3>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                                  isPaymentPending
                                    ? "animate-pulse border border-amber-500/20 bg-amber-500/10 text-amber-500"
                                    : isActive
                                    ? "animate-pulse border border-green-500/20 bg-green-500/10 text-green-500"
                                    : "bg-zinc-800 text-zinc-500"
                                }`}
                              >
                                {isPaymentPending ? "Checkout Requested" : session.status}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[10px] font-medium text-zinc-500">
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
                            <span className="block text-xs font-bold text-zinc-500 uppercase">
                              Total
                            </span>
                            <span className="text-lg font-extrabold text-white">
                              {symbol}
                              {orders.total || 0}
                            </span>
                          </div>
                        </div>

                        {/* Order Items Breakdown */}
                        <div className="mb-6">
                          <h4 className="mb-2 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                            Order details ({totalItemsCount} items)
                          </h4>
                          {items.length === 0 ? (
                            <p className="py-2 text-xs text-zinc-600 italic">
                              No items ordered.
                            </p>
                          ) : (
                            <div className="max-h-48 space-y-2.5 overflow-y-auto pr-1">
                              {items.map((item: { item_id: string; qty: number; notes?: string; [key: string]: unknown }) => {
                                const details = getMenuItemDetails(item.item_id)
                                const name = details?.name || item.item_id
                                const itemPrice = details
                                  ? parseFloat(String(details.price)) || 0
                                  : 0
                                return (
                                  <div
                                    key={item.item_id + (item.notes || "")}
                                    className="flex items-start justify-between text-xs"
                                  >
                                    <div className="pr-4">
                                      <p className="font-semibold text-zinc-300">
                                        {name}
                                        <span className="ml-1.5 font-bold text-primary">
                                          x{item.qty}
                                        </span>
                                      </p>
                                      {item.notes && (
                                        <p className="mt-0.5 text-[10px] text-zinc-500 italic">
                                          &ldquo;{item.notes}&rdquo;
                                        </p>
                                      )}
                                    </div>
                                    <span className="font-medium text-zinc-400">
                                      {symbol}
                                      {itemPrice * item.qty}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bill Totals Summary and Controls */}
                      <div className="mt-auto border-t border-zinc-800/80 pt-4">
                        <div className="mb-4 grid grid-cols-2 gap-y-1 text-[11px] text-zinc-500">
                          <div>Subtotal:</div>
                          <div className="text-right font-medium">
                            {symbol}
                            {orders.subtotal || 0}
                          </div>
                          <div>Service Charge:</div>
                          <div className="text-right font-medium">
                            {symbol}
                            {orders.service_charge || 0}
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
                          {Number(orders.discount) > 0 && (
                            <>
                              <div>Discount:</div>
                              <div className="text-right font-semibold text-green-500">
                                -{symbol}
                                {orders.discount}
                              </div>
                            </>
                          )}
                        </div>

                        {isActive ? (
                          <button
                            onClick={() =>
                              handleCloseSession(session.session_id)
                            }
                            disabled={closingSessionId === session.session_id}
                            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-red-900/30 bg-gradient-to-r from-red-950/40 to-orange-950/40 px-4 py-2.5 text-xs font-bold text-red-400 transition-all duration-300 hover:border-red-900/60 hover:text-white disabled:opacity-50"
                          >
                            {closingSessionId === session.session_id && (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            )}
                            Close Table Session
                          </button>
                        ) : (
                          <div className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-zinc-900 bg-zinc-950 px-4 py-2 text-xs font-bold text-zinc-600 select-none">
                            Session Finalized
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
