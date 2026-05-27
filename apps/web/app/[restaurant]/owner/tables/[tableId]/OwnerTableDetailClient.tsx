"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, RefreshCw, CheckCircle2, UserX, Clock, Receipt, AlertCircle } from "lucide-react"
import Link from "next/link"

interface OwnerTableDetailClientProps {
  restaurantSlug: string
  tableId: string
}

export function OwnerTableDetailClient({
  restaurantSlug,
  tableId,
}: OwnerTableDetailClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClosing, setIsClosing] = useState(false)

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

  const activeSession = sessions.find(s => s.status === "active" || s.status === "payment_pending")
  const historySessions = sessions.filter(s => s.status === "closed" || s.status === "completed").slice(0, 5)
  const isPacked = !!activeSession

  const handleFlushSession = async () => {
    if (!activeSession) return
    if (!confirm("Are you sure you want to flush this session? This will mark the table as available.")) return

    setIsClosing(true)
    try {
      const res = await fetch("/api/table/session/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: activeSession.session_id }),
      })
      if (!res.ok) throw new Error("Failed to close session")
      
      // Refresh data
      await fetchTableData()
    } catch (err) {
      console.error(err)
      alert("Error closing session.")
    } finally {
      setIsClosing(false)
    }
  }

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
      <div className="mx-auto mb-8 flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${restaurantSlug}/owner/tables`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Table {tableId} Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage availability and view history
            </p>
          </div>
        </div>
        <button
          onClick={fetchTableData}
          disabled={isLoading}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-1.5 text-xs font-semibold hover:bg-accent transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
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
            <section className="rounded-3xl border border-border bg-card overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/20">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Current Status
                </h3>
              </div>
              <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                    isPacked 
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20" 
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {isPacked ? <UserX className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black tracking-tight mb-1">
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
                  <button
                    onClick={handleFlushSession}
                    disabled={isClosing}
                    className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 shadow-sm shadow-red-900/20"
                  >
                    {isClosing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
                    Flush Session
                  </button>
                )}
              </div>
            </section>

            {/* History Section */}
            <section className="rounded-3xl border border-border bg-card overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/20">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Transactions (Last 5)
                </h3>
              </div>
              
              {historySessions.length === 0 ? (
                <div className="p-12 text-center">
                  <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h4 className="text-base font-semibold text-foreground mb-1">No recent transactions</h4>
                  <p className="text-sm text-muted-foreground">This table hasn&apos;t had any completed sessions yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {historySessions.map((session) => (
                    <Link
                      key={session.session_id}
                      href={`/${restaurantSlug}/owner/sessions/${session.session_id}`}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Receipt className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold mb-0.5 group-hover:text-primary transition-colors">
                            {formatDate(session.created_at)}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Completed
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 pl-16 sm:pl-0">
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-lg">
                            {formatCurrency(session.orders?.total || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.orders?.items?.length || 0} items
                          </p>
                        </div>
                        <ArrowLeft className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity rotate-180" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
