"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Receipt, Clock, MapPin, QrCode, X, Trash2, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import QRCode from "react-qr-code"

import { MenuCategory } from "@/components/food-menu/types"

interface OwnerSessionDetailClientProps {
  sessionId: string
  currency?: string
  categories?: MenuCategory[]
}

interface TableSession {
  session_id: string
  restaurant_slug?: string
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
      qty?: number
      quantity?: number
      served_qty?: number
      name?: string
      price?: string | number
      notes?: string
      [key: string]: unknown
    }[]
  }
  [key: string]: unknown
}

export function OwnerSessionDetailClient({
  sessionId,
  currency = "USD",
  categories = [],
}: OwnerSessionDetailClientProps) {
  const router = useRouter()
  const [session, setSession] = useState<TableSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showQrModal, setShowQrModal] = useState(false)
  const [domain, setDomain] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDomain(window.location.origin)
    }
  }, [])

  const fetchSession = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("table_sessions")
        .select("*")
        .eq("session_id", sessionId)
        .single()

      if (error) throw error
      setSession(data as TableSession)
    } catch (err) {
      console.error("Error loading session:", err)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  const handleDeleteSession = async () => {
    if (!confirm("Are you sure you want to permanently delete this session? This action cannot be undone.")) return
    
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("table_sessions")
        .delete()
        .eq("session_id", sessionId)

      if (error) throw error

      if (session?.restaurant_slug && session?.table_number) {
        router.push(`/${session.restaurant_slug}/owner/tables/${session.table_number}`)
      } else {
        router.back()
      }
    } catch (err: unknown) {
      console.error("Error deleting session:", err)
      alert(err instanceof Error ? err.message : "Failed to delete session.")
      setIsLoading(false)
    }
  }

  const handleReopenSession = async () => {
    if (!confirm("Are you sure you want to mark this session as unpaid and reopen it?")) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("table_sessions")
        .update({ status: "active" })
        .eq("session_id", sessionId)

      if (error) throw error

      await fetchSession()
    } catch (err: unknown) {
      console.error("Error reopening session:", err)
      alert(err instanceof Error ? err.message : "Failed to reopen session.")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSession()
  }, [fetchSession])

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
      <div className="mx-auto mb-8 flex max-w-4xl items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              Transaction Details
            </h2>
            <p className="mt-1 max-w-[250px] overflow-hidden text-sm text-ellipsis whitespace-nowrap text-muted-foreground sm:max-w-none">
              Session ID: <span className="font-mono text-xs">{sessionId}</span>
            </p>
          </div>
          {session && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteSession}
                className="flex items-center gap-2 rounded-full border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive transition-all hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
              {(session.status === "completed" || session.status === "closed") && (
                <button
                  onClick={handleReopenSession}
                  className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-600 transition-all hover:bg-emerald-500 hover:text-white dark:text-emerald-400"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Mark as Unpaid</span>
                </button>
              )}
              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
              >
                <QrCode className="h-4 w-4" />
                <span className="hidden sm:inline">Restore</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-4xl">
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : !session ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Session not found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Overview Card */}
            <div className="space-y-6 md:col-span-1">
              <section className="rounded-3xl border border-border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Receipt className="h-5 w-5 text-primary" />
                  Summary
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Status
                    </p>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold tracking-widest text-primary uppercase">
                      {session.status}
                    </span>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Table
                    </p>
                    <p className="flex items-center gap-1.5 font-medium">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Table {session.table_number}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Date
                    </p>
                    <p className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatDate(session.created_at)}
                    </p>
                  </div>

                  {(session.orders?.total ?? -1) >= 0 && (
                    <div className="border-t border-border pt-4">
                      <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Total Paid
                      </p>
                      <p className="text-3xl font-black text-primary">
                        {formatCurrency(session.orders?.total || 0)}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Order Items Details */}
            <div className="md:col-span-2">
              <section className="overflow-hidden rounded-3xl border border-border bg-card">
                <div className="border-b border-border bg-muted/20 p-6">
                  <h3 className="text-lg font-semibold">Order Items</h3>
                </div>

                {!session.orders?.items || session.orders.items.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No items recorded for this session.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {session.orders.items.map((item, idx: number) => {
                      const itemDetails = flatItems.find(
                        (i) => i.id === item.item_id
                      )
                      const name =
                        itemDetails?.name || item.name || item.item_id
                      const itemPrice = itemDetails
                        ? parseFloat(String(itemDetails.price)) || 0
                        : parseFloat(String(item.price)) || 0

                      return (
                        <div
                          key={idx}
                          className="flex items-start justify-between p-4 sm:p-6"
                        >
                          <div>
                            <p className="font-semibold">{name}</p>
                            {item.notes && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                Note: {item.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="mb-1 font-medium">
                              {formatCurrency(itemPrice)}
                            </p>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-sm text-muted-foreground">
                                Qty: {item.quantity || item.qty}
                              </span>
                              {item.served_qty !== undefined && (
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
                                  {item.served_qty} Served
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {session.orders?.subtotal !== undefined && (
                  <div className="space-y-2 border-t border-border bg-muted/10 p-6">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatCurrency(session.orders.subtotal)}</span>
                    </div>
                    {(session.orders.service_charge ?? 0) > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Service Charge</span>
                        <span>
                          {formatCurrency(session.orders.service_charge || 0)}
                        </span>
                      </div>
                    )}
                    {(session.orders.tax ?? 0) > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tax</span>
                        <span>{formatCurrency(session.orders.tax || 0)}</span>
                      </div>
                    )}
                    {(session.orders.tips ?? 0) > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tip</span>
                        <span>{formatCurrency(session.orders.tips || 0)}</span>
                      </div>
                    )}
                    {(session.orders.discount ?? 0) > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Discount</span>
                        <span className="text-green-500">
                          -{formatCurrency(session.orders.discount || 0)}
                        </span>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between border-t border-border pt-2 text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(session.orders.total || 0)}</span>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Restore Session QR Modal */}
      {showQrModal && session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="text-center">
              <h3 className="mb-2 text-lg font-bold">Restore Session</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Have the customer scan this QR code to securely restore their session on their device.
              </p>
              <div className="mx-auto inline-block rounded-xl bg-white p-4">
                <QRCode
                  value={`${domain}/${session.restaurant_slug || "demo"}/table/${session.table_number}?restore_token=${session.session_id}`}
                  size={200}
                  level="M"
                />
              </div>
              <div className="mt-6">
                <Link
                  href={`${domain}/${session.restaurant_slug || "demo"}/table/${session.table_number}?restore_token=${session.session_id}`}
                  target="_blank"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Or click here to open on this device
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
