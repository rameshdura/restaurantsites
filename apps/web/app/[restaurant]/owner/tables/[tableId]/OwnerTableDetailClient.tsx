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
  const [isFlushDialogOpen, setIsFlushDialogOpen] = useState(false)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<string | null>(null)

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
      if (!res.ok) throw new Error("Failed to complete session")

      setIsCompleteDialogOpen(false)
      await fetchTableData()
    } catch (err) {
      console.error(err)
      alert("Error completing session.")
    } finally {
      setIsCompleting(false)
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

                {isPacked && (
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
                )}
              </div>
            </section>

            {/* Current Session Order Details */}
            {isPacked && (
              <section className="overflow-hidden rounded-3xl border border-border bg-card mt-8">
                <div className="border-b border-border bg-muted/20 p-6">
                  <h3 className="text-lg font-semibold">Current Order Details</h3>
                </div>

                {!activeSession?.orders?.items || activeSession.orders.items.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No items recorded for this session.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {activeSession.orders.items.map(
                      (item: TableSessionItem, idx: number) => {
                        const itemDetails = flatItems.find(
                          (i) => i.id === item.item_id
                        )
                      const name = itemDetails?.name || item.name || item.item_id
                      const itemPrice = itemDetails
                        ? parseFloat(String(itemDetails.price)) || 0
                        : parseFloat(String(item.price)) || 0

                      const qty = item.quantity || item.qty || 1
                      const uniqueKey = `${item.item_id}-${item.notes || ""}`
                      const isUpdatingThis = isUpdatingOrder === uniqueKey

                      return (
                        <div
                          key={idx}
                          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between p-4 sm:p-6"
                        >
                          <div>
                            <p className="font-semibold">{name}</p>
                            {item.notes && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                Note: {item.notes}
                              </p>
                            )}
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
