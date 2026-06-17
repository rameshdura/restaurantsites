"use client"

import { useState, useEffect, useCallback } from "react"
import { RefreshCw, CheckCircle, XCircle, Clock, Menu } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { PayViewType } from "./PaySidebar"

import { TableSession, fetchFilteredSessions } from "@/lib/sessions"

interface PayListClientProps {
  restaurantSlug: string
  currency: string
  view: PayViewType
  onSessionSelect: (sessionId: string) => void
  onToggleSidebar?: () => void
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

export function PayListClient({
  restaurantSlug,
  currency,
  view,
  onSessionSelect,
  onToggleSidebar,
}: PayListClientProps) {
  const [sessions, setSessions] = useState<TableSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const symbol = CURRENCY_SYMBOLS[currency] || ""

  const fetchSessions = useCallback(
    async (reset = false) => {
      if (reset) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }

      try {
        const result = await fetchFilteredSessions({
          restaurantSlug,
          view: view as import("@/lib/sessions").SessionViewType,
          limit: 10,
          cursor: reset ? null : nextCursor,
        })

        if (reset) {
          setSessions(result.data)
        } else {
          setSessions((prev) => [...prev, ...result.data])
        }
        setNextCursor(result.nextCursor)
        setHasMore(result.hasMore)
      } catch (err) {
        console.error("Error loading sessions:", err)
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [restaurantSlug, view, nextCursor]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSessions(true)
  }, [restaurantSlug, view, fetchSessions]) // Re-fetch when view changes

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
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
              {view === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              {view === "success"
                ? "Successful Payments"
                : "Failed / Inactive Sessions"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {view === "success"
                ? "List of completed and paid orders."
                : "List of sessions with 0 items, unpaid, or closed without payment."}
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchSessions(true)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <main className="mx-auto max-w-7xl">
        {isLoading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <RefreshCw className="mb-4 h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Loading...
            </p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              {view === "success" ? (
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
              ) : (
                <XCircle className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="mb-2 text-lg font-bold">No sessions found</h3>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find any {view} sessions.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => onSessionSelect(session.session_id)}
                  className="flex flex-col rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="mb-4 flex w-full items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">
                        Table {session.table_number}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {session.session_id.split("-")[0]}...
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        session.status === "closed"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>

                  <div className="mt-auto flex w-full items-end justify-between border-t border-border/50 pt-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(session.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-right">
                      <span className="mr-2 text-xs text-muted-foreground">
                        {session.orders?.items?.length || 0} items
                      </span>
                      <span className="text-lg font-black">
                        {symbol}
                        {session.orders?.total || 0}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-4 pb-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fetchSessions(false)}
                  disabled={isLoadingMore}
                  className="min-w-[200px] rounded-xl"
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
