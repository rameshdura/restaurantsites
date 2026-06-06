"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { RefreshCw, LayoutGrid, CheckCircle2, UserX, Menu } from "lucide-react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"

interface OwnerTablesClientProps {
  restaurantSlug: string
  tables: { id: string | number; label: string; persons?: number }[]
  useQueryParam?: boolean
  onToggleSidebar?: () => void
}

export function OwnerTablesClient({
  restaurantSlug,
  tables,
  useQueryParam = false,
  onToggleSidebar,
}: OwnerTablesClientProps) {
  const [sessions, setSessions] = useState<
    { table_number: string; status: string; persons?: number }[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchSessions = useCallback(
    async (showLoading = false) => {
      if (showLoading) setIsLoading(true)
      else setIsRefreshing(true)

      try {
        const { data, error } = await supabase
          .from("table_sessions")
          .select("table_number, status, persons")
          .eq("restaurant_slug", restaurantSlug)
          .in("status", ["active", "payment_pending"])

        if (error) throw error
        setSessions(data || [])
      } catch (err) {
        console.error("Error loading active sessions:", err)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [restaurantSlug]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions(true)
  }, [fetchSessions])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchSessions(false)
    }, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchSessions])

  return (
    <div className="p-4 sm:p-8">
      {/* Header Controls */}
      <div className="mx-auto mb-8 flex max-w-7xl items-center justify-between">
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

          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <LayoutGrid className="h-5 w-5 text-primary" />
              Table Overview
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time status of all tables in your restaurant.
            </p>
          </div>
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
              Loading tables...
            </p>
          </div>
        ) : tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-20 text-center">
            <LayoutGrid className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              No tables are currently defined for this restaurant.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Add tables in your data.json configuration to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {tables.map((table) => {
              const activeSession = sessions.find(
                (s) => String(s.table_number) === String(table.id)
              )
              const isPacked = !!activeSession

              return (
                <Link
                  href={
                    useQueryParam
                      ? `?tableId=${table.id}`
                      : `/${restaurantSlug}/owner/tables/${table.id}`
                  }
                  key={table.id}
                  className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-4 text-center transition-all duration-300 ${
                    isPacked
                      ? "border-red-900/40 bg-red-900/10 text-red-700 shadow-sm shadow-red-900/5 hover:-translate-y-1 hover:shadow-md dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-400"
                      : "border-emerald-700/30 bg-emerald-700/10 text-emerald-700 shadow-sm shadow-emerald-700/5 hover:-translate-y-1 hover:shadow-md dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400"
                  }`}
                >
                  <div className="mb-3">
                    {isPacked ? (
                      <UserX className="h-8 w-8 opacity-80" />
                    ) : (
                      <CheckCircle2 className="h-8 w-8 opacity-80" />
                    )}
                  </div>

                  <h3 className="mb-1 w-full truncate px-2 text-lg font-black tracking-tight">
                    {table.label}
                  </h3>

                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase ${
                      isPacked
                        ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                    }`}
                  >
                    {isPacked
                      ? `${activeSession.persons || "?"}/${table.persons || 4} P`
                      : `Max ${table.persons || 4}P`}
                  </span>

                  {/* Decorative glowing orb effect behind the icon based on status */}
                  <div
                    className={`pointer-events-none absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[24px] ${
                      isPacked ? "bg-red-500/10" : "bg-emerald-500/10"
                    }`}
                  />
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
