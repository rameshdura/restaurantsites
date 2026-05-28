"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Receipt, Clock, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

import { MenuCategory } from "@/components/food-menu/types"

interface OwnerSessionDetailClientProps {
  sessionId: string
  currency?: string
  categories?: MenuCategory[]
}

interface TableSession {
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
      qty?: number
      quantity?: number
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
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            Transaction Details
          </h2>
          <p className="mt-1 max-w-[250px] overflow-hidden text-sm text-ellipsis whitespace-nowrap text-muted-foreground sm:max-w-none">
            Session ID: <span className="font-mono text-xs">{sessionId}</span>
          </p>
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

                  {(session.orders?.total > 0 ||
                    session.orders?.total === 0) && (
                    <div className="border-t border-border pt-4">
                      <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Total Paid
                      </p>
                      <p className="text-3xl font-black text-primary">
                        {formatCurrency(session.orders.total)}
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
                    const name = itemDetails?.name || item.name || item.item_id
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
                          <p className="font-medium">
                            {formatCurrency(itemPrice)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity || item.qty}
                          </p>
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
                    {session.orders.service_charge > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Service Charge</span>
                        <span>{formatCurrency(session.orders.service_charge)}</span>
                      </div>
                    )}
                    {session.orders.tax > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tax</span>
                        <span>{formatCurrency(session.orders.tax)}</span>
                      </div>
                    )}
                    {session.orders.tips > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tip</span>
                        <span>{formatCurrency(session.orders.tips)}</span>
                      </div>
                    )}
                    {session.orders.discount > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Discount</span>
                        <span className="text-green-500">-{formatCurrency(session.orders.discount)}</span>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between border-t border-border pt-2 text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(session.orders.total)}</span>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
