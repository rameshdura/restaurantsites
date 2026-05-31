"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  UserX,
  Clock,
  Receipt,
  Trash2,
  Banknote,
  Plus,
  Minus,
  UserPlus,
  Search,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { MenuCategory } from "@/components/food-menu/types"

interface OwnerTableDetailClientProps {
  restaurantSlug: string
  tableId: string
  currency?: string
  categories?: MenuCategory[]
}

interface TableSessionItem {
  item_id: string
  name?: string
  price?: string | number
  notes?: string
  quantity?: number
  qty?: number
  served_qty?: number
}

interface TableSession {
  session_id: string
  status: string
  created_at: string
  orders?: {
    items?: TableSessionItem[]
    subtotal: number
    service_charge: number
    tax: number
    tips: number
    discount: number
    total: number
  }
}

export function OwnerTableDetailClient({
  restaurantSlug,
  tableId,
  currency = "USD",
  categories = [],
}: OwnerTableDetailClientProps) {
  const [sessions, setSessions] = useState<TableSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isFlushDialogOpen, setIsFlushDialogOpen] = useState(false)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({})
  const [activeQuantities, setActiveQuantities] = useState<Record<string, number>>({})
  const [visibleNoteInputs, setVisibleNoteInputs] = useState<Record<string, boolean>>({})
  const [completedSession, setCompletedSession] = useState<TableSession | null>(null)
  const [newSessionPersons, setNewSessionPersons] = useState<number>(2)
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<string | null>(null)
  const [isUpdatingServe, setIsUpdatingServe] = useState<string | null>(null)

  const fetchTableData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("table_sessions")
        .select("*")
        .eq("restaurant_slug", restaurantSlug)
        .eq("table_number", Number(tableId))
        .order("created_at", { ascending: false })
        .limit(6) // Fetch 1 active + 5 history

      if (error) throw error
      setSessions(data || [])
    } catch (err) {
      console.error("Error loading table details:", err)
    } finally {
      setIsLoading(false)
    }
  }, [restaurantSlug, tableId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTableData()
  }, [fetchTableData])

  const activeSession = sessions.find(
    (s) => s.status === "active" || s.status === "payment_pending"
  )
  const historySessions = sessions
    .filter((s) => s.status === "closed" || s.status === "completed")
    .slice(0, 5)
  const isPacked = !!activeSession

  const handleFlushSession = () => setIsFlushDialogOpen(true)

  const confirmFlushSession = async () => {
    if (!activeSession) return
    setIsClosing(true)
    try {
      const res = await fetch("/api/table/session/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: activeSession.session_id }),
      })
      if (!res.ok) throw new Error("Failed to close session")

      setIsFlushDialogOpen(false)
      await fetchTableData()
    } catch (err) {
      console.error(err)
      alert("Error closing session.")
    } finally {
      setIsClosing(false)
    }
  }

  const handleCompleteSession = () => setIsCompleteDialogOpen(true)

  const confirmCompleteSession = async () => {
    if (!activeSession) return
    setIsCompleting(true)
    try {
      const res = await fetch("/api/table/session/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: activeSession.session_id, status: "completed" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error("Failed to complete session")

      setCompletedSession(data.session)
      setIsCompleteDialogOpen(false)
      await fetchTableData()
    } catch (err) {
      console.error(err)
      alert("Error completing session.")
    } finally {
      setIsCompleting(false)
    }
  }

  const handleCreateSession = () => setIsCreateDialogOpen(true)

  const confirmCreateSession = async () => {
    setIsCreating(true)
    try {
      const res = await fetch("/api/table/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: Number(tableId),
          restaurantSlug,
          persons: newSessionPersons,
        }),
      })
      if (!res.ok) throw new Error("Failed to create session")

      setIsCreateDialogOpen(false)
      await fetchTableData()
    } catch (err) {
      console.error(err)
      alert("Error creating session.")
    } finally {
      setIsCreating(false)
    }
  }

  const updateOrderItem = async (itemId: string, newQty: number, notes?: string) => {
    if (!activeSession) return
    setIsUpdatingOrder(`${itemId}-${notes || ""}`)
    try {
      const res = await fetch("/api/table/order/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeSession.session_id,
          restaurantSlug,
          item_id: itemId,
          qty: newQty,
          notes: notes || "",
          isOwner: true,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to update item")
      }
      
      await fetchTableData()
    } catch (err) {
      console.error(err)
      alert("Error updating item.")
    } finally {
      setIsUpdatingOrder(null)
    }
  }

  const addOrderItem = async (itemId: string, qty: number, notes?: string) => {
    if (!activeSession) return
    setIsUpdatingOrder(`${itemId}-${notes || ""}`)
    try {
      const res = await fetch("/api/table/order/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeSession.session_id,
          restaurantSlug,
          cartItems: [{ item_id: itemId, qty, notes: notes || "" }],
          isOwner: true,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to add item")
      }
      
      await fetchTableData()
    } catch (err) {
      console.error(err)
      alert("Error adding item.")
    } finally {
      setIsUpdatingOrder(null)
    }
  }

  const updateServedQty = async (itemId: string, newServedQty: number, notes?: string) => {
    if (!activeSession) return
    setIsUpdatingServe(`${itemId}-${notes || ""}`)
    try {
      const res = await fetch("/api/table/order/serve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeSession.session_id,
          item_id: itemId,
          notes: notes || "",
          served_qty: newServedQty,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to update serving status")
      }
      
      await fetchTableData()
    } catch (err) {
      console.error(err)
      alert("Error updating serving status.")
    } finally {
      setIsUpdatingServe(null)
    }
  }

  const flatItems = categories.flatMap((c) => c.items)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0)

  return (
    <div className="p-4 sm:p-8">
      {/* Header Controls */}
      <div className="mx-auto mb-8 flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${restaurantSlug}/owner/tables`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              Table {tableId} Details
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage availability and view history
            </p>
          </div>
        </div>
        <button
          onClick={fetchTableData}
          disabled={isLoading}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-1.5 text-xs font-semibold transition-all hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <main className="mx-auto max-w-4xl space-y-8">
        {isLoading && sessions.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Payment Success Card */}
            {completedSession && (
              <section className="animate-in fade-in zoom-in duration-300 overflow-hidden rounded-3xl border-2 border-emerald-500/20 bg-emerald-500/5 p-8 text-center shadow-lg shadow-emerald-500/10">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                </div>
                <h3 className="mb-2 text-3xl font-black text-foreground">Payment Successful</h3>
                <p className="mb-6 text-muted-foreground">Session for Table {tableId} has been closed.</p>
                
                <div className="mx-auto mb-8 max-w-sm rounded-2xl border border-emerald-500/10 bg-card p-6 shadow-inner">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount Paid</span>
                    <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(completedSession.orders?.total || 0)}
                    </span>
                    <span className="mt-2 text-xs text-muted-foreground">
                      {completedSession.orders?.items?.length || 0} items processed
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setCompletedSession(null)}
                  className="flex w-full max-w-sm mx-auto cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-600 active:scale-95"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Done
                </button>
              </section>
            )}

            {/* Current Status Section */}
            <section className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="border-b border-border bg-muted/20 p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Current Status
                </h3>
              </div>
              <div className="flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                      isPacked
                        ? "border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
                        : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isPacked ? (
                      <UserX className="h-8 w-8" />
                    ) : (
                      <CheckCircle2 className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <h4 className="mb-1 text-2xl font-black tracking-tight">
                      {isPacked ? "Table is Packed" : "Table is Available"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {isPacked
                        ? `Session started at ${formatDate(activeSession.created_at)}`
                        : "Ready for new guests."}
                    </p>
                  </div>
                </div>

                {isPacked ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCompleteSession}
                      disabled={isCompleting || isClosing}
                      title="Mark as Paid & Completed"
                      className="flex cursor-pointer items-center justify-center h-12 px-4 gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isCompleting ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Banknote className="h-5 w-5" />
                          <span className="hidden sm:inline">Pay & Close</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleFlushSession}
                      disabled={isClosing || isCompleting}
                      title="Flush Session"
                      className="flex cursor-pointer items-center justify-center h-12 w-12 rounded-xl bg-red-600 text-sm font-semibold text-white shadow-sm shadow-red-900/20 transition-all hover:bg-red-700 disabled:opacity-50"
                    >
                      {isClosing ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCreateSession}
                    disabled={isLoading || isCreating}
                    className="flex cursor-pointer items-center justify-center h-12 px-6 gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isCreating ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5" />
                        <span>Create Session</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </section>

            {/* Current Session Order Details */}
            {isPacked && (
              <section className="overflow-hidden rounded-3xl border border-border bg-card mt-8">
                <div className="border-b border-border bg-muted/20 p-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Current Order Details</h3>
                  <button
                    onClick={() => setIsAddItemDialogOpen(true)}
                    className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                {!activeSession?.orders?.items || activeSession.orders.items.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No items recorded for this session.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {activeSession.orders.items.map(
                      (item: TableSessionItem) => {
                        const itemDetails = flatItems.find(
                          (i) => i.id === item.item_id
                        )
                      const name = itemDetails?.name || item.name || item.item_id
                      const itemPrice = itemDetails
                        ? parseFloat(String(itemDetails.price)) || 0
                        : parseFloat(String(item.price)) || 0

                      const qty = item.quantity || item.qty || 1
                      const servedQty = item.served_qty || 0
                      const isFullyServed = servedQty >= qty
                      const uniqueKey = `${item.item_id}-${item.notes || ""}`
                      const isUpdatingThis = isUpdatingOrder === uniqueKey
                      const isUpdatingThisServe = isUpdatingServe === uniqueKey

                      return (
                        <div
                          key={uniqueKey}
                          className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between p-4 sm:p-6 transition-colors ${
                            isFullyServed ? "bg-muted/30 opacity-70" : ""
                          }`}
                        >
                          <div className="flex-1">
                            <p className="font-semibold flex items-center gap-2">
                              {name}
                              {isFullyServed && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              )}
                            </p>
                            {item.notes && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                Note: {item.notes}
                              </p>
                            )}
                            
                            {/* Serving Tracker */}
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Served:
                              </span>
                              {isUpdatingThisServe ? (
                                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => updateServedQty(item.item_id, servedQty - 1, item.notes)}
                                    className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent disabled:opacity-50"
                                    disabled={servedQty <= 0}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className={`text-xs font-medium ${isFullyServed ? "text-emerald-500" : ""}`}>
                                    {servedQty} / {qty}
                                  </span>
                                  <button
                                    onClick={() => updateServedQty(item.item_id, servedQty + 1, item.notes)}
                                    className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent disabled:opacity-50"
                                    disabled={servedQty >= qty}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-2 w-full sm:w-auto">
                            <div className="text-left sm:text-right">
                              <p className="font-medium">
                                {formatCurrency(itemPrice)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {isUpdatingThis ? (
                                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                              ) : (
                                <>
                                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1 hidden sm:inline">
                                    Qty:
                                  </span>
                                  <button
                                    onClick={() => updateOrderItem(item.item_id, qty - 1, item.notes)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent disabled:opacity-50"
                                    disabled={qty <= 0}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-medium">
                                    {qty}
                                  </span>
                                  <button
                                    onClick={() => updateOrderItem(item.item_id, qty + 1, item.notes)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => updateOrderItem(item.item_id, 0, item.notes)}
                                    className="ml-2 flex h-8 w-8 items-center justify-center rounded-md border border-red-500/20 bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                                    title="Remove Item"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {activeSession?.orders?.subtotal !== undefined && (
                  <div className="space-y-2 border-t border-border bg-muted/10 p-6">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatCurrency(activeSession.orders.subtotal)}</span>
                    </div>
                    {activeSession.orders.service_charge > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Service Charge</span>
                        <span>{formatCurrency(activeSession.orders.service_charge)}</span>
                      </div>
                    )}
                    {activeSession.orders.tax > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tax</span>
                        <span>{formatCurrency(activeSession.orders.tax)}</span>
                      </div>
                    )}
                    {activeSession.orders.tips > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tip</span>
                        <span>{formatCurrency(activeSession.orders.tips)}</span>
                      </div>
                    )}
                    {activeSession.orders.discount > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Discount</span>
                        <span className="text-green-500">-{formatCurrency(activeSession.orders.discount)}</span>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between border-t border-border pt-2 text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(activeSession.orders.total)}</span>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* History Section */}
            <section className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="border-b border-border bg-muted/20 p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Transactions (Last 5)
                </h3>
              </div>

              {historySessions.length === 0 ? (
                <div className="p-12 text-center">
                  <Receipt className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h4 className="mb-1 text-base font-semibold text-foreground">
                    No recent transactions
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    This table hasn&apos;t had any completed sessions yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {historySessions.map((session) => (
                    <Link
                      key={session.session_id}
                      href={`/${restaurantSlug}/owner/sessions/${session.session_id}`}
                      className="group flex flex-col items-start justify-between p-4 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:p-6"
                    >
                      <div className="mb-4 flex items-center gap-4 sm:mb-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Receipt className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="mb-0.5 font-semibold transition-colors group-hover:text-primary">
                            {formatDate(session.created_at)}
                          </p>
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Completed
                          </p>
                        </div>
                      </div>

                      <div className="flex w-full items-center justify-between gap-6 pl-16 sm:w-auto sm:pl-0">
                        <div className="text-left sm:text-right">
                          <p className="text-lg font-bold">
                            {formatCurrency(session.orders?.total || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.orders?.items?.length || 0} items
                          </p>
                        </div>
                        <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Add Items to Order</DialogTitle>
            <DialogDescription>
              Browse or search the menu to add items to the current session.
            </DialogDescription>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 pt-4">
            {filteredCategories.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No items found matching your search.
              </div>
            ) : (
              <div className="space-y-8">
                {filteredCategories.map((category) => (
                  <div key={category.title}>
                    <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      {category.title}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {category.items.map((item) => {
                        const noteKey = item.id
                        const currentNote = activeNotes[noteKey] || ""
                        const currentQty = activeQuantities[noteKey] || 1
                        const showNoteInput = visibleNoteInputs[noteKey] || false
                        const isUpdatingThis = isUpdatingOrder?.startsWith(item.id)

                        return (
                          <div
                            key={item.id}
                            className="flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/30"
                          >
                            <div className="flex items-center justify-between p-4">
                              <div className="flex-1 min-w-0 mr-4">
                                <p className="font-semibold leading-tight truncate">{item.name}</p>
                                <p className="mt-1 text-xs font-medium text-primary">
                                  {formatCurrency(parseFloat(String(item.price)))}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {/* Qty Selector in Dialog */}
                                <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                                  <button
                                    onClick={() => setActiveQuantities(prev => ({ ...prev, [noteKey]: Math.max(1, currentQty - 1) }))}
                                    className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-background transition-colors"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="w-5 text-center text-xs font-bold">{currentQty}</span>
                                  <button
                                    onClick={() => setActiveQuantities(prev => ({ ...prev, [noteKey]: currentQty + 1 }))}
                                    className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-background transition-colors"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => setVisibleNoteInputs(prev => ({ ...prev, [noteKey]: !showNoteInput }))}
                                  className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                                    showNoteInput || currentNote
                                      ? "border-primary/20 bg-primary/5 text-primary"
                                      : "border-border bg-background text-muted-foreground hover:bg-accent"
                                  }`}
                                  title="Add Note"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </button>
                                
                                <button
                                  onClick={async () => {
                                    await addOrderItem(item.id, currentQty, currentNote)
                                    // Reset local states for this item
                                    setActiveNotes(prev => {
                                      const next = { ...prev }
                                      delete next[noteKey]
                                      return next
                                    })
                                    setActiveQuantities(prev => {
                                      const next = { ...prev }
                                      delete next[noteKey]
                                      return next
                                    })
                                    setVisibleNoteInputs(prev => {
                                      const next = { ...prev }
                                      delete next[noteKey]
                                      return next
                                    })
                                  }}
                                  disabled={isUpdatingOrder !== null}
                                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-90 disabled:opacity-50"
                                >
                                  {isUpdatingThis ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Plus className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </div>
                            
                            {(showNoteInput || currentNote) && (
                              <div className="bg-muted/30 px-4 pb-4 pt-0">
                                <Input
                                  placeholder="Special instructions..."
                                  className="h-8 text-xs bg-background"
                                  value={currentNote}
                                  autoFocus={showNoteInput}
                                  onChange={(e) => setActiveNotes(prev => ({ ...prev, [noteKey]: e.target.value }))}
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="bg-muted/20 p-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
            <DialogDescription>
              Start a new session for Table {tableId}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            <p className="mb-4 text-sm font-medium text-muted-foreground">Number of Guests</p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setNewSessionPersons(Math.max(1, newSessionPersons - 1))}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card transition-all hover:bg-accent"
              >
                <Minus className="h-6 w-6" />
              </button>
              <span className="text-5xl font-black">{newSessionPersons}</span>
              <button
                onClick={() => setNewSessionPersons(newSessionPersons + 1)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card transition-all hover:bg-accent"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={confirmCreateSession} disabled={isCreating}>
              {isCreating ? "Creating..." : "Start Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFlushDialogOpen} onOpenChange={setIsFlushDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flush Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to flush this session? This will mark the table as available.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFlushDialogOpen(false)} disabled={isClosing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmFlushSession} disabled={isClosing}>
              {isClosing ? "Flushing..." : "Flush Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this session as paid and completed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)} disabled={isCompleting}>
              Cancel
            </Button>
            <Button onClick={confirmCompleteSession} disabled={isCompleting}>
              {isCompleting ? "Completing..." : "Pay & Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
