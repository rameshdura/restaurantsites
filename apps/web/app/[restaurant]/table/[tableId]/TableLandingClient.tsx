"use client"

import { useState, useEffect } from "react"
import { Lock, Utensils } from "lucide-react"
import {
  getSessionCookie,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/cookies"
import { MenuCategory } from "@/components/food-menu/types"
import { FoodMenu } from "@/components/food-menu/food-menu"

interface TableLandingClientProps {
  restaurantName: string
  restaurantSlug: string
  logoUrl: string | null
  tableId: string
  tableLabel: string
  currency: string
  categories: MenuCategory[]
}

export function TableLandingClient({
  restaurantName,
  restaurantSlug,
  tableId,
  tableLabel,
  currency,
  categories,
}: TableLandingClientProps) {
  const [session, setSession] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initSession() {
      setIsLoading(true)
      try {
        const existing = getSessionCookie()

        // If cookie matches current table, validate with backend
        if (existing && Number(existing.table) === Number(tableId)) {
          const res = await fetch(
            `/api/table/session?session_id=${existing.session_id}`
          )
          const data = await res.json()
          if (data.valid && data.session) {
            setSession(data.session)
            setIsLoading(false)
            return
          }
        }

        // If no valid session, delete cookie and create a new session
        clearSessionCookie()
        const res = await fetch(`/api/table/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tableNumber: Number(tableId),
            restaurantSlug,
          }),
        })
        const data = await res.json()

        if (data.success && data.session) {
          const expiresAt = new Date(data.session.expires_at).getTime() / 1000
          setSessionCookie(
            data.session.session_id,
            data.session.table_number,
            expiresAt
          )
          setSession(data.session)
        }
      } catch (err) {
        console.error("Error setting up table session:", err)
      } finally {
        setIsLoading(false)
      }
    }

    initSession()
  }, [tableId, restaurantSlug])

  return (
    <div className="relative flex min-h-svh flex-col bg-background text-foreground antialiased">
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-600/5 blur-[80px]" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-1 flex-col">
        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center select-none">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted/60 shadow-lg">
              <Utensils className="h-8 w-8 animate-bounce text-primary" />
            </div>
            <p className="mt-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Loading Table Session...
            </p>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-8 select-none sm:px-6 md:py-12">
            {/* Header / Table Identifier */}
            <header className="mt-4 mb-8 flex flex-col items-center text-center">
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {restaurantName} |{" "}
                {tableLabel.toLowerCase().includes("table")
                  ? tableLabel
                  : `Table ${tableLabel}`}
              </h1>
            </header>

            {/* Main Content: Food Menu */}
            <main className="my-6 flex flex-col">
              <FoodMenu
                categories={categories}
                hideHeader={true}
                currency={currency}
                initialTableMode={true}
                initialSession={session}
                onSessionChange={setSession}
              />
            </main>

            {/* Footer */}
            <footer className="mt-8 flex flex-col items-center gap-1.5 text-center text-muted-foreground">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-wide uppercase">
                <Lock className="h-3 w-3 text-muted-foreground/80" />
                <span>Secure Table Ordering</span>
              </div>
              <p className="font-mono text-[9px] text-muted-foreground/60 uppercase select-all">
                Session: {session?.session_id ? String(session.session_id) : "None"}
              </p>
            </footer>
          </div>
        )}
      </div>
    </div>
  )
}
