"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Receipt, Clock, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

interface OwnerSessionDetailClientProps {
  restaurantSlug: string
  sessionId: string
}

export function OwnerSessionDetailClient({
  restaurantSlug,
  sessionId,
}: OwnerSessionDetailClientProps) {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
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
      setSession(data)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  return (
    <div className="p-4 sm:p-8">
      {/* Header Controls */}
      <div className="mx-auto mb-8 flex max-w-4xl items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Transaction Details
          </h2>
          <p className="text-sm text-muted-foreground mt-1 text-ellipsis overflow-hidden max-w-[250px] sm:max-w-none whitespace-nowrap">
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
          <div className="text-center p-12 bg-card rounded-3xl border border-border">
            <p className="text-muted-foreground">Session not found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overview Card */}
            <div className="md:col-span-1 space-y-6">
              <section className="rounded-3xl border border-border bg-card p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Summary
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status</p>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-widest uppercase bg-primary/10 text-primary">
                      {session.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Table</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Table {session.table_number}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Date</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatDate(session.created_at)}
                    </p>
                  </div>
                  
                  {(session.orders?.total > 0 || session.orders?.total === 0) && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total Paid</p>
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
              <section className="rounded-3xl border border-border bg-card overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/20">
                  <h3 className="font-semibold text-lg">Order Items</h3>
                </div>
                
                {(!session.orders?.items || session.orders.items.length === 0) ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No items recorded for this session.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {session.orders.items.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 sm:p-6 flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground mt-1">Note: {item.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.price)}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {session.orders?.subtotal !== undefined && (
                  <div className="p-6 bg-muted/10 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatCurrency(session.orders.subtotal)}</span>
                    </div>
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
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2">
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
