"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Lock,
  Utensils,
  AlertTriangle,
  HandHelping,
  RotateCw,
  X,
} from "lucide-react"
import QRCode from "react-qr-code"
import {
  getSessionCookie,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/cookies"
import { MenuCategory } from "@/components/food-menu/types"
import { FoodMenu } from "@/components/food-menu/food-menu"
import { TableTopBar } from "./TableTopBar"

interface TableLandingClientProps {
  restaurantName: string
  restaurantSlug: string
  logoUrl: string | null
  tableId: string
  tableLabel: string
  currency: string
  categories: MenuCategory[]
  defaultLanguage?: string
}

/* ── Device fingerprint helpers ── */
const DEVICE_ID_KEY = "rs_device_id"

function getDeviceId(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

export function TableLandingClient({
  restaurantName,
  restaurantSlug,
  logoUrl,
  tableId,
  tableLabel,
  currency,
  categories,
  defaultLanguage,
}: TableLandingClientProps) {
  const [session, setSession] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStartingSession, setIsStartingSession] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [showPersonSelection, setShowPersonSelection] = useState(false)
  const [persons, setPersons] = useState<string>("")
  const [occupied, setOccupied] = useState(false)
  const [occupiedMessage, setOccupiedMessage] = useState("")
  const [retryCountdown, setRetryCountdown] = useState(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [domain, setDomain] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDomain(window.location.origin)
    }
  }, [])

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
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search)
          const restoreToken = params.get("restore_token")
          const friendDevice = params.get("friend_device")

          let modified = false
          if (friendDevice) {
            localStorage.setItem(DEVICE_ID_KEY, friendDevice)
            modified = true
          }
          if (restoreToken) {
            // Restore session valid for 4 hours
            const expiresAt = Math.floor(Date.now() / 1000) + 4 * 60 * 60
            setSessionCookie(restaurantSlug, restoreToken, Number(tableId), expiresAt)
            modified = true
          }

          if (modified) {
            window.history.replaceState({}, "", `/${restaurantSlug}/table/${tableId}`)
          }
        }

        const existing = getSessionCookie(restaurantSlug)

        // If cookie matches current table, validate with backend
        if (existing && Number(existing.table) === Number(tableId)) {
          const res = await fetch(
            `/api/table/session?session_id=${existing.session_id}`
          )
          const data = await res.json()
          if (data.valid && data.session) {
            if (data.session.status === "closed") {
              // Stale cookie from a closed session.
              // Clear it so the user can start a new order.
              clearSessionCookie(restaurantSlug)
            } else {
              setSession(data.session)
              setOccupied(false)
              setIsLoading(false)
              return
            }
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

  // Cleanup countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const startRetryCountdown = useCallback(() => {
    setRetryCountdown(60) // 1 minute
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const handleRetry = async () => {
    setIsLoading(true)
    setOccupied(false)
    try {
      const deviceId = getDeviceId()
      const res = await fetch(`/api/table/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: Number(tableId),
          restaurantSlug,
          persons: 1,
          device_id: deviceId,
        }),
      })
      const data = await res.json()

      if (res.status === 409 && data.occupied) {
        setOccupied(true)
        setOccupiedMessage(
          data.error ||
            "Previous guest has not checked out. Please call the staff or retry after 1 minute."
        )
        startRetryCountdown()
      } else if (data.success && data.session) {
        const expiresAt = new Date(data.session.expires_at).getTime() / 1000
        setSessionCookie(
          restaurantSlug,
          data.session.session_id,
          data.session.table_number,
          expiresAt
        )
        setSession(data.session)
        setOccupied(false)
      }
    } catch (err) {
      console.error("Error retrying session:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartSession = async () => {
    setIsStartingSession(true)
    try {
      const deviceId = getDeviceId()
      const res = await fetch(`/api/table/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: Number(tableId),
          restaurantSlug,
          persons: Number(persons),
          device_id: deviceId,
        }),
      })
      const data = await res.json()

      if (res.status === 409 && data.occupied) {
        // Table is occupied by another device
        setOccupied(true)
        setOccupiedMessage(
          data.error ||
            "Previous guest has not checked out. Please call the staff or retry after 1 minute."
        )
        startRetryCountdown()
      } else if (data.success && data.session) {
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

  const handleLeaveTable = async () => {
    if (!session) return
    setIsLeaving(true)
    try {
      const res = await fetch("/api/table/session/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          session_id: (session as any).session_id,
          status: "closed",
        }),
      })
      const data = await res.json()
      if (data.success) {
        clearSessionCookie(restaurantSlug)
        setSession(null)
      } else {
        console.error("Failed to leave table:", data.error)
      }
    } catch (err) {
      console.error("Error leaving table:", err)
    } finally {
      setIsLeaving(false)
    }
  }

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-clip bg-background text-foreground antialiased">
      <TableTopBar
        restaurantName={restaurantName}
        logoUrl={logoUrl}
        tableLabel={tableLabel}
        defaultLanguage={defaultLanguage}
        showLeaveTable={
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          !!session && !((session as any)?.orders?.items?.length > 0)
        }
        isLeaving={isLeaving}
        onLeaveTable={handleLeaveTable}
        onShareTable={session ? () => setShowShareModal(true) : undefined}
      />
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-600/5 blur-[80px]" />

      {/* Main Container */}
      <div className="relative flex flex-1 flex-col">
        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center select-none">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted/60 shadow-lg">
              <Utensils className="h-8 w-8 animate-bounce text-primary" />
            </div>
            <p className="mt-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Loading Table...
            </p>
          </div>
        ) : occupied ? (
          /* ─── Table Occupied Blocking Screen ─── */
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center p-6 text-center select-none">
            <div className="mb-8 flex flex-col items-center">
              {/* Animated warning icon */}
              <div className="mb-6 flex h-24 w-24 animate-pulse items-center justify-center rounded-full border-4 border-amber-500/30 bg-amber-500/10 shadow-xl shadow-amber-500/10">
                <AlertTriangle className="h-10 w-10 text-amber-500" />
              </div>

              <h1 className="mb-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Table Occupied
              </h1>
              <p className="mb-1 text-base font-medium text-muted-foreground">
                {tableLabel.toLowerCase().includes("table")
                  ? tableLabel
                  : `Table ${tableLabel}`}
              </p>
            </div>

            {/* Message card */}
            <div className="mb-8 w-full rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-left shadow-lg shadow-amber-500/5">
              <p className="text-sm leading-relaxed font-medium text-foreground/90">
                {occupiedMessage}
              </p>
            </div>

            {/* Retry button */}
            <button
              onClick={handleRetry}
              disabled={retryCountdown > 0}
              className="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-primary/40 active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              <RotateCw
                className={`h-5 w-5 ${retryCountdown > 0 ? "" : "animate-none"}`}
              />
              {retryCountdown > 0
                ? `Retry in ${formatCountdown(retryCountdown)}`
                : "Retry Now"}
            </button>

            {/* Notify Staff info box */}
            <div className="w-full rounded-2xl border border-border bg-muted/30 p-5">
              <div className="mb-2 flex items-center gap-2.5">
                <HandHelping className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-bold text-foreground">
                  Notify a Staff
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Please raise your hand or approach the nearest staff member for
                assistance. They can clear the table session so you can start a
                new order.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground/60">
              <Lock className="h-3.5 w-3.5 opacity-70" />
              <span>One device per table session</span>
            </div>
          </div>
        ) : !session ? (
          !showPersonSelection ? (
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center p-6 text-center select-none">
              <div className="mb-10 flex flex-col items-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-primary/20 bg-primary/10 shadow-xl">
                  {logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={logoUrl}
                      alt={restaurantName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Utensils className="h-10 w-10 text-primary" />
                  )}
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
                        prev === "" ? "" : prev.length < 2 ? prev + "0" : prev
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
          <div className="relative mx-auto flex w-full max-w-7xl flex-col py-8 select-none md:py-12">
            {/* Main Content: Food Menu */}
            <main className="flex flex-col">
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
            <footer className="mt-8 flex flex-col items-center gap-1.5 px-4 text-center text-muted-foreground sm:px-6">
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

      {/* Share Table / Add Friend Modal */}
      {showShareModal && session && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl relative">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="text-center">
              <h3 className="mb-2 text-lg font-bold">Share Table</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Have your friend scan this QR code. They will instantly join your table and can add items to your bill.
              </p>
              <div className="mx-auto inline-block rounded-xl bg-white p-4">
                <QRCode
                  value={`${domain}/${restaurantSlug}/table/${tableId}?restore_token=${session.session_id}&friend_device=${getDeviceId()}`}
                  size={200}
                  level="M"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
