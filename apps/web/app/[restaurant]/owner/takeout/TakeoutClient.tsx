"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MenuItem } from "@/lib/restaurant"
import { supabase } from "@/lib/supabase"
import {
  ShoppingBag,
  Bike,
  Phone,
  MapPin,
  Clock,
  Check,
  Search,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Printer,
  TrendingUp,
  User,
  Mail,
  Loader2,
  ChevronRight,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useToast } from "@workspace/ui/hooks/use-toast"
import Link from "next/link"

function ElapsedTime({ createdString }: { createdString: string }) {
  const [elapsed, setElapsed] = useState("")

  useEffect(() => {
    const updateElapsed = () => {
      const mins = Math.floor(
        (Date.now() - new Date(createdString).getTime()) / 60000
      )
      if (mins < 1) {
        setElapsed("just now")
      } else if (mins < 60) {
        setElapsed(`${mins}m ago`)
      } else {
        setElapsed(`${Math.floor(mins / 60)}h ${mins % 60}m ago`)
      }
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 60000)
    return () => clearInterval(interval)
  }, [createdString])

  return <span>{elapsed}</span>
}

interface OrderItem {
  item_id: string
  order_item_id: string
  qty: number
  cooked_qty?: number
  served_qty?: number
  notes?: string
  name?: string
  selectedOptions?: Record<string, string>
}

interface TakeoutSession {
  session_id: string
  table_number: string
  created_at: string
  status: string
  orders?: {
    items?: OrderItem[]
    total?: number
    subtotal?: number
    service_charge?: number
    tax?: number
    tips?: number
    discount?: number
    customer_info?: {
      name: string
      phone: string
      email?: string
      address?: string
    }
  }
  persons?: number
  [key: string]: unknown
}

interface TakeoutClientProps {
  restaurantSlug: string
  restaurantName: string
  currency: string
  menu: MenuItem[]
  menuCategories: { items?: MenuItem[]; [key: string]: unknown }[]
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

export function TakeoutClient({
  restaurantSlug,
  restaurantName,
  currency,
  menu,
  menuCategories,
}: TakeoutClientProps) {
  const [sessions, setSessions] = useState<TakeoutSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "preparing" | "ready" | "completed"
  >("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const currencySymbol = CURRENCY_SYMBOLS[currency] || ""

  // Load and refresh sessions
  const fetchSessions = useCallback(async () => {
    try {
      // Fetch active sessions
      const { data: activeData, error: activeError } = await supabase
        .from("table_sessions")
        .select("*")
        .eq("restaurant_slug", restaurantSlug)
        .in("status", ["active", "payment_pending"])
        .order("created_at", { ascending: false })

      if (activeError) throw activeError

      // Fetch recently closed sessions (limit to 30 for history)
      const { data: closedData, error: closedError } = await supabase
        .from("table_sessions")
        .select("*")
        .eq("restaurant_slug", restaurantSlug)
        .eq("status", "closed")
        .order("created_at", { ascending: false })
        .limit(30)

      if (closedError) throw closedError

      const combined = [...(activeData || []), ...(closedData || [])]

      // Filter only virtual tables (table_number >= 1000)
      const takeoutSessions = combined.filter((s) => {
        const num = Number(s.table_number)
        return !isNaN(num) && num >= 1000
      }) as TakeoutSession[]

      setSessions(takeoutSessions)
    } catch (err) {
      console.error("Error loading takeout sessions:", err)
    } finally {
      setIsLoading(false)
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
    }, 6000) // Poll every 6 seconds
    return () => clearInterval(interval)
  }, [])

  // Resolve item name from menu structure
  const getItemDetails = (itemId: string) => {
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

  // Complete Order & Mark as Paid (close session)
  const handleCompleteOrder = async (sessionId: string) => {
    setIsUpdating(sessionId)
    try {
      const res = await fetch("/api/table/session/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          status: "closed",
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Order Completed",
          description:
            "Takeout order completed and marked as paid successfully.",
        })
        void fetchSessions()
      } else {
        throw new Error(data.error || "Failed to complete order")
      }
    } catch (err: unknown) {
      toast({
        title: "Error Completing Order",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  // Print order ticket helper
  const handlePrintTicket = (session: TakeoutSession) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const itemsHtml = (session.orders?.items || [])
      .map((item) => {
        const details = getItemDetails(item.item_id)
        const name = details?.name || item.item_id
        return `
          <div style="display: flex; justify-between; margin-bottom: 6px; font-size: 14px;">
            <div style="flex: 1;">
              <strong>${item.qty}x</strong> ${name}
              ${item.notes ? `<div style="font-size: 12px; color: #555; margin-left: 20px;">* Note: ${item.notes}</div>` : ""}
            </div>
            <div style="text-align: right; font-weight: bold;">
              ${currencySymbol}${(parseFloat(String(details?.price || 0)) * item.qty).toFixed(0)}
            </div>
          </div>
        `
      })
      .join("")

    const isDelivery = Number(session.table_number) >= 10000
    const info = session.orders?.customer_info

    printWindow.document.write(`
      <html>
        <head>
          <title>Order Ticket - #${session.table_number}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; color: #000; }
            hr { border: 0; border-top: 1px dashed #000; margin: 15px 0; }
            .header { text-align: center; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { font-size: 12px; margin-bottom: 15px; }
            .section { font-size: 13px; margin-bottom: 10px; }
            .total { font-size: 16px; font-weight: bold; text-align: right; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <div class="title">${restaurantName}</div>
            <div class="subtitle">${isDelivery ? "DELIVERY ORDER" : "TAKEOUT ORDER"}</div>
          </div>
          <div class="section">
            <strong>Order ID:</strong> #${session.table_number}<br>
            <strong>Date:</strong> ${new Date(session.created_at).toLocaleString()}<br>
          </div>
          <hr />
          <div class="section">
            <strong>Customer Details:</strong><br>
            Name: ${info?.name || "N/A"}<br>
            Phone: ${info?.phone || "N/A"}<br>
            ${isDelivery && info?.address ? `Address: ${info.address}<br>` : ""}
          </div>
          <hr />
          <div>
            ${itemsHtml}
          </div>
          <hr />
          <div class="total">
            Total: ${currencySymbol}${session.orders?.total || 0}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Calculate session classification & details
  const getSessionDetails = (session: TakeoutSession) => {
    const isDelivery = Number(session.table_number) >= 10000
    const items = session.orders?.items || []
    const totalItems = items.reduce((sum, i) => sum + i.qty, 0)
    const cookedItems = items.reduce((sum, i) => sum + (i.cooked_qty || 0), 0)

    // Status resolution
    let displayStatus: "unpaid" | "preparing" | "ready" | "completed" =
      "preparing"

    if (session.status === "closed") {
      displayStatus = "completed"
    } else if (session.status === "payment_pending") {
      displayStatus = "unpaid"
    } else if (cookedItems >= totalItems && totalItems > 0) {
      displayStatus = "ready"
    }

    return {
      isDelivery,
      totalItems,
      cookedItems,
      displayStatus,
    }
  }

  // Stats calculation
  const totalRevenueToday = sessions
    .filter((s) => s.status === "closed")
    .reduce((sum, s) => sum + (s.orders?.total || 0), 0)
  const totalUnpaid = sessions.filter(
    (s) => s.status === "payment_pending"
  ).length

  const activeTakeouts = sessions.filter((s) => {
    const details = getSessionDetails(s)
    return s.status !== "closed" && !details.isDelivery
  }).length

  const activeDeliveries = sessions.filter((s) => {
    const details = getSessionDetails(s)
    return s.status !== "closed" && details.isDelivery
  }).length

  // Filter & Search Logic
  const filteredSessions = sessions.filter((session) => {
    const details = getSessionDetails(session)

    // Search match
    const info = session.orders?.customer_info
    const nameMatch =
      info?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
    const phoneMatch = info?.phone
      ? String(info.phone).includes(searchQuery)
      : false
    const idMatch = String(session.table_number).includes(searchQuery)
    const matchesSearch =
      nameMatch || phoneMatch || idMatch || searchQuery === ""

    if (!matchesSearch) return false

    // Tab match
    if (activeTab === "all") return true
    if (activeTab === "pending") return details.displayStatus === "unpaid"
    if (activeTab === "preparing") return details.displayStatus === "preparing"
    if (activeTab === "ready") return details.displayStatus === "ready"
    if (activeTab === "completed") return details.displayStatus === "completed"

    return true
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Takeout & Delivery
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage incoming carryout and home delivery requests in real-time.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsLoading(true)
            void fetchSessions()
          }}
          variant="outline"
          size="sm"
          className="gap-2 self-start rounded-xl"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Feed
        </Button>
      </div>

      {/* ── Stats Row ── */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat 1 */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Active Takeouts
              </p>
              <h3 className="text-2xl font-black">{activeTakeouts}</h3>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-4 -bottom-4 opacity-5">
            <ShoppingBag size={80} />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Bike className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Active Deliveries
              </p>
              <h3 className="text-2xl font-black">{activeDeliveries}</h3>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-4 -bottom-4 opacity-5">
            <Bike size={80} />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Awaiting Payment
              </p>
              <h3 className="text-2xl font-black">{totalUnpaid}</h3>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-4 -bottom-4 opacity-5">
            <AlertCircle size={80} />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Today&apos;s Revenue
              </p>
              <h3 className="text-2xl font-black">
                {currencySymbol}
                {totalRevenueToday}
              </h3>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-4 -bottom-4 opacity-5">
            <DollarSign size={80} />
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2.5 pr-4 pl-10 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: `All (${sessions.length})` },
            { id: "pending", label: `Unpaid (${totalUnpaid})` },
            {
              id: "preparing",
              label: `Preparing (${sessions.filter((s) => getSessionDetails(s).displayStatus === "preparing").length})`,
            },
            {
              id: "ready",
              label: `Ready (${sessions.filter((s) => getSessionDetails(s).displayStatus === "ready").length})`,
            },
            {
              id: "completed",
              label: `Completed (${sessions.filter((s) => s.status === "closed").length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as
                    | "all"
                    | "pending"
                    | "preparing"
                    | "ready"
                    | "completed"
                )
              }
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "border border-border bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Orders Grid/List ── */}
      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading orders...
          </p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-card p-16 text-center shadow-sm">
          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-bold">No Orders Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search query or switching filters."
              : "No active orders matching the selected status filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSessions.map((session) => {
            const { isDelivery, totalItems, displayStatus } =
              getSessionDetails(session)
            const info = session.orders?.customer_info
            const items = session.orders?.items || []

            return (
              <div
                key={session.session_id}
                className={`flex flex-col overflow-hidden rounded-3xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md ${
                  displayStatus === "completed"
                    ? "border-emerald-500/20 opacity-75"
                    : displayStatus === "unpaid"
                      ? "border-rose-500/30"
                      : displayStatus === "ready"
                        ? "border-primary/50 ring-2 ring-primary/10"
                        : "border-border"
                }`}
              >
                {/* Header */}
                <div className="border-b border-border bg-primary/5 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase">
                        {isDelivery ? (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Bike className="h-3 w-3" /> Delivery
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-primary">
                            <ShoppingBag className="h-3 w-3" /> Takeout
                          </span>
                        )}
                      </span>
                      <Link
                        href={`/${restaurantSlug}/owner/sessions/${session.session_id}`}
                        className="group/title mt-1 flex items-center gap-0.5"
                      >
                        <h3 className="text-xl font-black tracking-tight transition-colors group-hover/title:underline hover:text-primary">
                          #{session.table_number}
                        </h3>
                        <ChevronRight className="h-4 w-4 shrink-0 -translate-x-1 text-primary opacity-0 transition-all group-hover/title:translate-x-0 group-hover/title:opacity-100" />
                      </Link>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase ${
                          displayStatus === "completed"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : displayStatus === "unpaid"
                              ? "bg-rose-500/10 text-rose-500"
                              : displayStatus === "ready"
                                ? "bg-primary text-primary-foreground"
                                : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {displayStatus === "completed"
                          ? "Completed"
                          : displayStatus === "unpaid"
                            ? "Unpaid"
                            : displayStatus === "ready"
                              ? isDelivery
                                ? "Ready / Packaged"
                                : "Ready / Bagged"
                              : "Cooking"}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <ElapsedTime createdString={session.created_at} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Details Block */}
                <div className="space-y-2.5 border-b border-border bg-accent/25 px-5 py-4 text-xs">
                  {info ? (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="text-sm font-bold text-foreground">
                          {info.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <a
                          href={`tel:${info.phone}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {info.phone}
                        </a>
                      </div>
                      {info.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <a
                            href={`mailto:${info.email}`}
                            className="font-medium text-muted-foreground hover:underline"
                          >
                            {info.email}
                          </a>
                        </div>
                      )}
                      {isDelivery && info.address && (
                        <div className="mt-2 flex items-start gap-2 border-t border-border/60 pt-2">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                          <div>
                            <span className="mb-0.5 block text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                              Delivery Address
                            </span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block leading-relaxed font-medium text-foreground transition-colors hover:text-primary"
                            >
                              {info.address}
                            </a>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-muted-foreground italic">
                      No customer details provided.
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="max-h-[240px] flex-1 divide-y divide-border/40 overflow-y-auto p-4">
                  {items.map((item, idx) => {
                    const details = getItemDetails(item.item_id)
                    const name = details?.name || item.item_id
                    const isCooked = (item.cooked_qty || 0) >= item.qty

                    return (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 py-2.5 text-xs first:pt-0 last:pb-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">
                              {item.qty}x
                            </span>
                            <span className="font-semibold text-foreground">
                              {name}
                            </span>
                            {isCooked && (
                              <span className="rounded bg-green-500/10 px-1 py-0.5 text-[8px] font-black text-green-500 uppercase">
                                Cooked
                              </span>
                            )}
                          </div>
                          {item.notes && (
                            <p className="mt-1 text-[11px] font-medium text-red-500 italic">
                              Note: &ldquo;{item.notes}&rdquo;
                            </p>
                          )}
                          {item.selectedOptions && (
                            <div className="mt-1 text-[10px] text-muted-foreground">
                              {Object.entries(item.selectedOptions)
                                .map(([key, val]) => {
                                  const opt = details?.options?.find(
                                    (o) => o.id === key
                                  )
                                  const sel = opt?.selections?.find(
                                    (s) => s.id === val
                                  )
                                  return sel
                                    ? `${opt?.name}: ${sel.name}`
                                    : null
                                })
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-foreground">
                          {currencySymbol}
                          {(
                            parseFloat(String(details?.price || 0)) * item.qty
                          ).toFixed(0)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Footer / Summary */}
                <div className="border-t border-border bg-accent/10 px-5 py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      Total: {totalItems} items
                    </span>
                    <span className="text-lg font-black text-primary">
                      {currencySymbol}
                      {session.orders?.total || 0}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handlePrintTicket(session)}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 rounded-xl border-border bg-card text-xs font-bold"
                    >
                      <Printer className="h-3.5 w-3.5" /> Label
                    </Button>

                    {displayStatus !== "completed" && (
                      <Button
                        onClick={() => handleCompleteOrder(session.session_id)}
                        disabled={isUpdating === session.session_id}
                        size="sm"
                        className="flex-[2] gap-1.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
                      >
                        {isUpdating === session.session_id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        {displayStatus === "unpaid"
                          ? "Collect & Complete"
                          : "Complete Order"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
