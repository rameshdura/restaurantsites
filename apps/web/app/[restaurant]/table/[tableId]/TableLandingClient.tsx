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
  const [isStartingSession, setIsStartingSession] = useState(false)
  const [showPersonSelection, setShowPersonSelection] = useState(false)
  const [persons, setPersons] = useState<string>("")

  useEffect(() => {
    if (!session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowPersonSelection(false)
       
      setPersons("")
    }
  }, [session])

  useEffect(() => {
    async function initSession() {
      setIsLoading(true)
      try {
        const existing = getSessionCookie(restaurantSlug)

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

        // If no valid session, just clear cookie. User will need to manually start a session.
        clearSessionCookie(restaurantSlug)
      } catch (err) {
        console.error("Error setting up table session:", err)
      } finally {
        setIsLoading(false)
      }
    }

    initSession()
  }, [tableId, restaurantSlug])

  const handleStartSession = async () => {
    setIsStartingSession(true)
    try {
      const res = await fetch(`/api/table/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: Number(tableId),
          restaurantSlug,
          persons: Number(persons),
        }),
      })
      const data = await res.json()

      if (data.success && data.session) {
        const expiresAt = new Date(data.session.expires_at).getTime() / 1000
        setSessionCookie(
          restaurantSlug,
          data.session.session_id,
          data.session.table_number,
          expiresAt
        )
        setSession(data.session)
      }
    } catch (err) {
      console.error("Error creating table session:", err)
    } finally {
      setIsStartingSession(false)
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-hidden bg-background text-foreground antialiased">
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
              Loading Table...
            </p>
          </div>
        ) : !session ? (
          !showPersonSelection ? (
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center p-6 text-center select-none">
              <div className="mb-10 flex flex-col items-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/20 bg-primary/10 shadow-xl">
                  <Utensils className="h-10 w-10 text-primary" />
                </div>
                <h1 className="mb-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
                  {restaurantName}
                </h1>
                <p className="text-lg font-medium text-muted-foreground">
                  {tableLabel.toLowerCase().includes("table")
                    ? tableLabel
                    : `Table ${tableLabel}`}
                </p>
              </div>

              <button
                onClick={() => setShowPersonSelection(true)}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-5 text-lg font-black text-primary-foreground shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 transition-all hover:-translate-y-1 hover:shadow-primary/40 active:translate-y-0 active:scale-95"
              >
                <Utensils className="h-6 w-6" />
                Start Order
              </button>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                <Lock className="h-3.5 w-3.5 opacity-70" />
                <span>Secure Table Session</span>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center p-6 text-center select-none">
              <div className="mb-8 flex flex-col items-center">
                <h1 className="mb-2 text-2xl font-black tracking-tight text-foreground">
                  Welcome to {restaurantName}
                </h1>
                <p className="text-sm font-medium text-muted-foreground">
                  Please enter the number of guests
                </p>
              </div>

              <div className="mx-auto mb-6 w-full max-w-xs">
                <div className="mb-4 flex min-h-[72px] items-center justify-center rounded-2xl border-2 border-primary/20 bg-background p-4 text-center text-4xl font-black shadow-inner">
                  {persons || (
                    <span className="text-muted-foreground/30">0</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() =>
                        setPersons((prev) =>
                          prev.length < 2 ? prev + num : prev
                        )
                      }
                      className="rounded-xl border border-border bg-card py-4 text-2xl font-bold shadow-sm transition-all hover:bg-accent active:scale-90"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowPersonSelection(false)}
                    className="rounded-xl border border-border bg-card py-4 text-lg font-bold shadow-sm transition-all hover:bg-accent active:scale-90"
                  >
                    BACK
                  </button>
                  <button
                    onClick={() =>
                      setPersons((prev) =>
                        prev.length < 2 ? prev + "0" : prev
                      )
                    }
                    className="rounded-xl border border-border bg-card py-4 text-2xl font-bold shadow-sm transition-all hover:bg-accent active:scale-90"
                  >
                    0
                  </button>
                  <button
                    onClick={() => setPersons((prev) => prev.slice(0, -1))}
                    className="flex items-center justify-center rounded-xl border border-border bg-card py-4 text-2xl font-bold shadow-sm transition-all hover:bg-accent active:scale-90"
                  >
                    ⌫
                  </button>
                </div>
              </div>

              <button
                onClick={handleStartSession}
                disabled={
                  isStartingSession || !persons || Number(persons) === 0
                }
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-5 text-lg font-black text-primary-foreground shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 transition-all hover:-translate-y-1 hover:shadow-primary/40 active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                {isStartingSession ? (
                  <>
                    <Utensils className="h-6 w-6 animate-bounce" />
                    Starting Order...
                  </>
                ) : (
                  <>
                    <Utensils className="h-6 w-6" />
                    Open Menu
                  </>
                )}
              </button>
            </div>
          )
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
                Session:{" "}
                {session?.session_id ? String(session.session_id) : "None"}
              </p>
            </footer>
          </div>
        )}
      </div>
    </div>
  )
}
