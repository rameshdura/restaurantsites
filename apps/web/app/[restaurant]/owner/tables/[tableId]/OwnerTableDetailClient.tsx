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
  Menu,
  ShoppingBag,
  X,
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
import { MenuItemCard } from "@/components/food-menu/menu-item"

interface OwnerTableDetailClientProps {
  restaurantSlug: string
  tableId: string
  currency?: string
  categories?: MenuCategory[]
  onToggleSidebar?: () => void
}

interface TableSessionItem {
  order_item_id: string
  item_id: string
  name?: string
  price?: string | number
  notes?: string
  quantity?: number
  qty?: number
  served_qty?: number
  cooked_qty?: number
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
  onToggleSidebar,
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
  const [completedSession, setCompletedSession] = useState<TableSession | null>(
    null
  )
  const [newSessionPersons, setNewSessionPersons] = useState<number>(2)
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<string | null>(null)
  const [isUpdatingServe, setIsUpdatingServe] = useState<string | null>(null)
  const [isUpdatingCook, setIsUpdatingCook] = useState<string | null>(null)

  const [localCart, setLocalCart] = useState<
    {
      cart_id: string
      item_id: string
      qty: number
      notes: string
    }[]
  >([])
  const [activeDialogTab, setActiveDialogTab] = useState<"menu" | "cart">(
    "menu"
  )
  const [isSubmittingCart, setIsSubmittingCart] = useState(false)

  useEffect(() => {
    if (!isAddItemDialogOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalCart([])
      setActiveDialogTab("menu")
    }
  }, [isAddItemDialogOpen])

  const handleUpdateLocalCart = (
    itemId: string,
    qty: number,
    notes: string,
    cartId?: string
  ) => {
    setLocalCart((prev) => {
      if (cartId) {
        const existingIndex = prev.findIndex((i) => i.cart_id === cartId)
        if (existingIndex > -1) {
          if (qty <= 0) {
            const newCart = [...prev]
            newCart.splice(existingIndex, 1)
            return newCart
          }
          const newCart = [...prev]
          newCart[existingIndex] = {
            ...newCart[existingIndex]!,
            qty,
            notes,
          }
          return newCart
        }
      } else {
        const existingIndex = prev.findIndex(
          (i) => i.item_id === itemId && i.notes === notes
        )
        if (existingIndex > -1) {
          const newCart = [...prev]
          newCart[existingIndex]!.qty += qty
          return newCart
        } else {
          return [
            ...prev,
            {
              cart_id:
                Date.now().toString() +
                Math.random().toString(36).substring(2, 7),
              item_id: itemId,
              qty,
              notes,
            },
          ]
        }
      }
      return prev
    })
  }

  const handlePlaceLocalCartOrder = async () => {
    if (!activeSession) return
    if (localCart.length === 0) return

    setIsSubmittingCart(true)
    try {
      const res = await fetch("/api/table/order/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeSession.session_id,
          restaurantSlug,
          cartItems: localCart.map((item) => ({
            item_id: item.item_id,
            qty: item.qty,
            notes: item.notes,
          })),
          isOwner: true,
        }),
      })

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to add items to order")
      }

      setLocalCart([])
      setIsAddItemDialogOpen(false)
      await fetchTableData()
    } catch (err) {
      console.error(err)
      alert("Error adding items to table.")
    } finally {
      setIsSubmittingCart(false)
    }
  }

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
        body: JSON.stringify({
          session_id: activeSession.session_id,
          status: "completed",
        }),
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

  const updateOrderItem = async (order_item_id: string, newQty: number) => {
    if (!activeSession) return

    setIsUpdatingOrder(`item-${order_item_id}`)
    try {
      const res = await fetch("/api/table/order/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeSession.session_id,
          restaurantSlug,
          order_item_id: order_item_id,
          qty: newQty,
          isOwner: true,
        }),
      })

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Unknown error" }))
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

  const updateServedQty = async (
    order_item_id: string,
    newServedQty: number
  ) => {
    if (!activeSession) return
    setIsUpdatingServe(`item-${order_item_id}`)
    try {
      const res = await fetch("/api/table/order/serve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeSession.session_id,
          order_item_id: order_item_id,
          served_qty: newServedQty,
        }),
      })

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Unknown error" }))
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

  const updateCookedQty = async (
    order_item_id: string,
    newCookedQty: number
  ) => {
    if (!activeSession) return
    setIsUpdatingCook(`item-${order_item_id}`)
    try {
      const res = await fetch("/api/table/order/cook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeSession.session_id,
          updates: [
            {
              order_item_id: order_item_id,
              cooked_qty: newCookedQty,
            },
          ],
        }),
      })

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to update cooking status")
      }

      await fetchTableData()
    } catch (err) {
      console.error(err)
      alert("Error updating cooking status.")
    } finally {
      setIsUpdatingCook(null)
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
              <section className="animate-in overflow-hidden rounded-3xl border-2 border-emerald-500/20 bg-emerald-500/5 p-8 text-center shadow-lg shadow-emerald-500/10 duration-300 fade-in zoom-in">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                </div>
                <h3 className="mb-2 text-3xl font-black text-foreground">
                  Payment Successful
                </h3>
                <p className="mb-6 text-muted-foreground">
                  Session for Table {tableId} has been closed.
                </p>

                <div className="mx-auto mb-8 max-w-sm rounded-2xl border border-emerald-500/10 bg-card p-6 shadow-inner">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                      Amount Paid
                    </span>
                    <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(completedSession.orders?.total || 0)}
                    </span>
                    <span className="mt-2 text-xs text-muted-foreground">
                      {completedSession.orders?.items?.length || 0} items
                      processed
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setCompletedSession(null)}
                  className="mx-auto flex w-full max-w-sm cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-600 active:scale-95"
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
                      className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
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
                      className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl bg-red-600 text-sm font-semibold text-white shadow-sm shadow-red-900/20 transition-all hover:bg-red-700 disabled:opacity-50"
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
                    className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
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
              <section className="mt-8 overflow-hidden rounded-3xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border bg-muted/20 p-6">
                  <h3 className="text-lg font-semibold">
                    Current Order Details
                  </h3>
                  <button
                    onClick={() => setIsAddItemDialogOpen(true)}
                    className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                {!activeSession?.orders?.items ||
                activeSession.orders.items.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No items recorded for this session.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {activeSession.orders.items.map(
                      (item: TableSessionItem, index: number) => {
                        const itemDetails = flatItems.find(
                          (i) => i.id === item.item_id
                        )
                        const name =
                          itemDetails?.name || item.name || item.item_id
                        const itemPrice = itemDetails
                          ? parseFloat(String(itemDetails.price)) || 0
                          : parseFloat(String(item.price)) || 0

                        const qty = item.quantity || item.qty || 1
                        const servedQty = item.served_qty || 0
                        const isFullyServed = servedQty >= qty
                        const cookedQty = item.cooked_qty || 0
                        const isFullyCooked = cookedQty >= qty
                        const uniqueKey = item.order_item_id
                        const isUpdatingThis = isUpdatingOrder === uniqueKey
                        const isUpdatingThisServe =
                          isUpdatingServe === uniqueKey
                        const isUpdatingThisCook = isUpdatingCook === uniqueKey

                        return (
                          <div
                            key={item.order_item_id || index}
                            className={`flex flex-col gap-4 p-4 transition-colors sm:flex-row sm:items-start sm:justify-between sm:p-6 ${
                              isFullyServed ? "bg-muted/30 opacity-70" : ""
                            }`}
                          >
                            <div className="flex-1">
                              <p className="flex items-center gap-2 font-semibold">
                                {name}
                                <span className="text-xs font-normal text-muted-foreground">
                                  ({formatCurrency(itemPrice)})
                                </span>
                                {isFullyServed && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                )}
                              </p>
                              {item.notes && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Note: {item.notes}
                                </p>
                              )}

                              {/* Cooking Tracker */}
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                  Cooked:
                                </span>
                                {isUpdatingThisCook ? (
                                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() =>
                                        updateCookedQty(
                                          item.order_item_id,
                                          cookedQty - 1
                                        )
                                      }
                                      className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent disabled:opacity-50"
                                      disabled={cookedQty <= 0}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span
                                      className={`text-xs font-medium ${isFullyCooked ? "text-emerald-500" : ""}`}
                                    >
                                      {cookedQty} / {qty}
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateCookedQty(
                                          item.order_item_id,
                                          cookedQty + 1
                                        )
                                      }
                                      className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent disabled:opacity-50"
                                      disabled={cookedQty >= qty}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Serving Tracker */}
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                  Served:
                                </span>
                                {isUpdatingThisServe ? (
                                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() =>
                                        updateServedQty(
                                          item.order_item_id,
                                          servedQty - 1
                                        )
                                      }
                                      className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent disabled:opacity-50"
                                      disabled={servedQty <= 0}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span
                                      className={`text-xs font-medium ${isFullyServed ? "text-emerald-500" : ""}`}
                                    >
                                      {servedQty} / {qty}
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateServedQty(
                                          item.order_item_id,
                                          servedQty + 1
                                        )
                                      }
                                      className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent disabled:opacity-50"
                                      disabled={servedQty >= qty}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end sm:gap-2">
                              <div className="text-left sm:text-right">
                                <p className="text-lg font-bold">
                                  {formatCurrency(itemPrice * qty)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {isUpdatingThis ? (
                                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                                ) : (
                                  <>
                                    <span className="mr-1 hidden text-xs font-bold tracking-wider text-muted-foreground uppercase sm:inline">
                                      Qty:
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateOrderItem(
                                          item.order_item_id,
                                          qty - 1
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent disabled:opacity-50"
                                      disabled={qty <= 0}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-6 text-center text-sm font-medium">
                                      {qty}
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateOrderItem(
                                          item.order_item_id,
                                          qty + 1
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        updateOrderItem(item.order_item_id, 0)
                                      }
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
                      }
                    )}
                  </div>
                )}

                {activeSession?.orders?.subtotal !== undefined && (
                  <div className="space-y-2 border-t border-border bg-muted/10 p-6">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>
                        {formatCurrency(activeSession.orders.subtotal)}
                      </span>
                    </div>
                    {activeSession.orders.service_charge > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Service Charge</span>
                        <span>
                          {formatCurrency(activeSession.orders.service_charge)}
                        </span>
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
                        <span className="text-green-500">
                          -{formatCurrency(activeSession.orders.discount)}
                        </span>
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
        <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col p-0 [&>button]:hidden md:[&>button]:flex">
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg">
            <DialogHeader className="sr-only">
              <DialogTitle>Add Items to Order</DialogTitle>
              <DialogDescription>
                Select items from the menu and add them to the temporary cart
                before confirming.
              </DialogDescription>
            </DialogHeader>

            {/* Mobile Tab Toggle */}
            <div className="flex shrink-0 border-b border-border md:hidden">
              <button
                onClick={() => setActiveDialogTab("menu")}
                className={`flex-1 border-b-2 py-3 text-center text-sm font-bold transition-all ${
                  activeDialogTab === "menu"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Browse Menu
              </button>
              <button
                onClick={() => setActiveDialogTab("cart")}
                className={`relative flex-1 border-b-2 py-3 text-center text-sm font-bold transition-all ${
                  activeDialogTab === "cart"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Cart
                {localCart.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {localCart.reduce((sum, item) => sum + item.qty, 0)}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsAddItemDialogOpen(false)}
                className="flex items-center justify-center border-b-2 border-transparent px-4 py-3 text-muted-foreground transition-all hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
              {/* Left Column: Menu (Visible on mobile if tab is 'menu', always visible on desktop) */}
              <div
                className={`flex flex-1 flex-col overflow-hidden border-r border-border ${activeDialogTab === "menu" ? "flex" : "hidden md:flex"}`}
              >
                <div className="shrink-0 border-b border-border/60 p-4">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search menu items by name or description..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-4">
                  {filteredCategories.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      No items found matching your search.
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {filteredCategories.map((category) => (
                        <div key={category.title}>
                          <h4 className="mb-3 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            {category.title}
                          </h4>
                          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                            {category.items.map((item) => {
                              return (
                                <MenuItemCard
                                  key={item.id}
                                  item={item}
                                  currency={currency}
                                  tableMode={true}
                                  onUpdateQty={(qty, notes) =>
                                    handleUpdateLocalCart(item.id, qty, notes)
                                  }
                                />
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Cart (Visible on mobile if tab is 'cart', always visible on desktop) */}
              <div
                className={`flex w-full flex-1 flex-col overflow-hidden bg-muted/5 md:w-[360px] md:flex-none md:shrink-0 ${activeDialogTab === "cart" ? "flex" : "hidden md:flex"}`}
              >
              <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-muted/20 p-4">
                <h4 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
                  Temporary Cart
                </h4>
                <span className="text-xs font-medium text-muted-foreground">
                  {localCart.reduce((sum, item) => sum + item.qty, 0)} items
                </span>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {localCart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <ShoppingBag className="mb-2 h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm font-medium">Cart is empty</p>
                    <p className="mt-1 max-w-[200px] text-xs text-muted-foreground/80">
                      Add items from the menu grid on the left
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {localCart.map((cartItem) => {
                      const itemDetails = flatItems.find(
                        (i) => i.id === cartItem.item_id
                      )
                      const name = itemDetails?.name || cartItem.item_id
                      const itemPrice = itemDetails
                        ? parseFloat(String(itemDetails.price)) || 0
                        : 0

                      return (
                        <div
                          key={cartItem.cart_id}
                          className="space-y-3 rounded-xl border border-border bg-card p-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h5 className="truncate text-sm font-semibold">
                                {name}
                              </h5>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(itemPrice)} each
                              </p>
                            </div>
                            <span className="shrink-0 text-sm font-bold">
                              {formatCurrency(itemPrice * cartItem.qty)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            {/* Quantity buttons */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleUpdateLocalCart(
                                    cartItem.item_id,
                                    cartItem.qty - 1,
                                    cartItem.notes,
                                    cartItem.cart_id
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-xs font-bold text-foreground hover:bg-accent"
                              >
                                -
                              </button>
                              <span className="w-5 text-center text-xs font-semibold">
                                {cartItem.qty}
                              </span>
                              <button
                                onClick={() =>
                                  handleUpdateLocalCart(
                                    cartItem.item_id,
                                    cartItem.qty + 1,
                                    cartItem.notes,
                                    cartItem.cart_id
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-xs font-bold text-foreground hover:bg-accent"
                              >
                                +
                              </button>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() =>
                                handleUpdateLocalCart(
                                  cartItem.item_id,
                                  0,
                                  cartItem.notes,
                                  cartItem.cart_id
                                )
                              }
                              className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Notes field */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">
                              Notes
                            </label>
                            <input
                              type="text"
                              placeholder="E.g. No onion, extra spicy..."
                              value={cartItem.notes}
                              onChange={(e) =>
                                handleUpdateLocalCart(
                                  cartItem.item_id,
                                  cartItem.qty,
                                  e.target.value,
                                  cartItem.cart_id
                                )
                              }
                              className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-base md:text-xs transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              <div className="shrink-0 space-y-4 border-t border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>Subtotal</span>
                  <span className="text-base text-primary">
                    {formatCurrency(
                      localCart.reduce((sum, item) => {
                        const itemDetails = flatItems.find(
                          (i) => i.id === item.item_id
                        )
                        const price = itemDetails
                          ? parseFloat(String(itemDetails.price)) || 0
                          : 0
                        return sum + price * item.qty
                      }, 0)
                    )}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => {
                      setLocalCart([])
                      setIsAddItemDialogOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={localCart.length === 0 || isSubmittingCart}
                    className="flex-1 rounded-xl"
                    onClick={handlePlaceLocalCartOrder}
                  >
                    {isSubmittingCart ? (
                      <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : null}
                    Add to Table
                  </Button>
                </div>
              </div>
            </div>
          </div>
          </div>
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
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              Number of Guests
            </p>
            <div className="flex items-center gap-6">
              <button
                onClick={() =>
                  setNewSessionPersons(Math.max(1, newSessionPersons - 1))
                }
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
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating}
            >
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
              Are you sure you want to flush this session? This will mark the
              table as available.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFlushDialogOpen(false)}
              disabled={isClosing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmFlushSession}
              disabled={isClosing}
            >
              {isClosing ? "Flushing..." : "Flush Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this session as paid and completed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCompleteDialogOpen(false)}
              disabled={isCompleting}
            >
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
