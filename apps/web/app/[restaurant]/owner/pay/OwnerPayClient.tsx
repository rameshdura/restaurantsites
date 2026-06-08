"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Scanner } from "@yudiel/react-qr-scanner"
import { supabase } from "@/lib/supabase"
import { MenuItem } from "@/lib/restaurant"
import {
  CheckCircle,
  RefreshCw,
  QrCode,
  AlertTriangle,
  ArrowLeft,
  Camera,
} from "lucide-react"

const CURRENCY_SYMBOLS: Record<string, string> = {
  JPY: "¥",
  USD: "$",
  EUR: "€",
  GBP: "£",
  KRW: "₩",
  CNY: "¥",
  INR: "₹",
}

interface OwnerPayClientProps {
  restaurantSlug: string
  currency: string
  menu: MenuItem[]
  menuCategories: {
    name: string
    items: MenuItem[]
  }[]
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
      qty: number
      notes?: string
      [key: string]: unknown
    }[]
  }
  [key: string]: unknown
}

function PayContent({
  restaurantSlug,
  currency,
  menu,
  menuCategories,
}: OwnerPayClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialSessionId = searchParams.get("session_id")

  const [session, setSession] = useState<TableSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannedId, setScannedId] = useState<string | null>(initialSessionId)
  const [manualCode, setManualCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)

  const symbol = CURRENCY_SYMBOLS[currency] || ""

  // Fetch session data when scannedId changes
  useEffect(() => {
    if (!scannedId) return

    async function fetchSession() {
      setIsLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from("table_sessions")
          .select("*")
          .eq("restaurant_slug", restaurantSlug)
          .eq("session_id", scannedId)
          .maybeSingle()

        if (error) throw error
        if (!data) {
          setError(
            "Session not found. It may have been already closed or invalid."
          )
        } else {
          setSession(data as TableSession)
        }
      } catch (err) {
        console.error("Error fetching session:", err)
        setError("Failed to load session details.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [scannedId, restaurantSlug])

  const handleScan = (text: string) => {
    if (!text) return
    // The QR code contains the URL: origin/restaurantSlug/owner?session_id=XYZ
    try {
      const url = new URL(text)
      const sid = url.searchParams.get("session_id")
      if (sid) {
        setScannedId(sid)
        // Update URL to reflect the scanned session without reloading
        router.replace(`/${restaurantSlug}/owner/pay?session_id=${sid}`)
      } else {
        setError("Invalid QR Code: No session_id found.")
      }
    } catch {
      // If it's not a URL, maybe it's just the raw session ID
      if (text.length > 10) {
        setScannedId(text)
        router.replace(`/${restaurantSlug}/owner/pay?session_id=${text}`)
      } else {
        setError("Invalid QR Code format.")
      }
    }
  }

  const handleFinalize = async () => {
    if (!session) return
    setIsFinalizing(true)
    try {
      // In a real app, this might process a stripe payment.
      // Here we just mark it as closed.
      const res = await fetch("/api/table/session/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.session_id }),
      })
      const data = await res.json()
      if (data.success) {
        // Optimistically update
        setSession({ ...session, status: "closed" })
      } else {
        setError("Failed to finalize session.")
      }
    } catch (err) {
      console.error("Error finalizing:", err)
      setError("An error occurred while finalizing.")
    } finally {
      setIsFinalizing(false)
    }
  }

  const resetScanner = () => {
    setScannedId(null)
    setSession(null)
    setError(null)
    router.replace(`/${restaurantSlug}/owner/pay`)
  }

  // Helper to look up menu item name
  const getMenuItemDetails = (itemId: string) => {
    let found = menu.find((i) => i.id === itemId)
    if (!found) {
      for (const cat of menuCategories) {
        const match = cat.items?.find((i: MenuItem) => i.id === itemId)
        if (match) {
          found = match
          break
        }
      }
    }
    return found
  }

  const orders = session?.orders || {}
  const items = orders?.items || []

  return (
    <div className="p-4 sm:p-8">
      {/* Header Controls */}
      <div className="mx-auto mb-8 flex max-w-7xl items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <QrCode className="h-5 w-5 text-primary" />
            Scan Guest Receipt
          </h2>
          <p className="text-sm text-muted-foreground">
            Point your camera at the customer&apos;s checkout QR code to view
            and finalize their bill.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl">
        {isLoading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <RefreshCw className="mb-4 h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Loading bill details...
            </p>
          </div>
        ) : !session ? (
          <div className="mx-auto max-w-lg">
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/15 p-4 text-sm text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {error}
              </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
              {isScanning ? (
                <Scanner
                  onScan={(result) => {
                    const text = result[0]?.rawValue
                    if (text) handleScan(text)
                  }}
                  allowMultiple={false}
                />
              ) : (
                <div className="flex aspect-square flex-col items-center justify-center bg-muted/50 p-6">
                  <Camera className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="mb-4 text-sm text-muted-foreground">
                    Camera is paused
                  </p>
                  <button
                    onClick={() => setIsScanning(true)}
                    className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <QrCode className="h-4 w-4" />
                    Tap to Scan
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
                Or enter code manually
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter session code"
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <button
                  onClick={() => handleScan(manualCode)}
                  className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-lg">
            <button
              onClick={resetScanner}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Scan Another
            </button>

            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
              {/* Header */}
              <div
                className={`p-6 text-center ${session.status === "closed" ? "border-b border-green-500/20 bg-green-500/10" : "border-b border-primary/20 bg-primary/10"}`}
              >
                {session.status === "closed" ? (
                  <CheckCircle className="mx-auto mb-2 h-10 w-10 text-green-500" />
                ) : (
                  <QrCode className="mx-auto mb-2 h-10 w-10 text-primary" />
                )}
                <h2 className="text-2xl font-black">
                  Table {session.table_number}
                </h2>
                <span className="mt-1 inline-flex rounded-full bg-background px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  {session.status === "payment_pending"
                    ? "Awaiting Payment"
                    : session.status}
                </span>
              </div>

              {/* Bill Details */}
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  <span>Items</span>
                  <span>Amount</span>
                </div>

                <div className="mb-6 space-y-3">
                  {items.map(
                    (item: {
                      item_id: string
                      qty: number
                      notes?: string
                      [key: string]: unknown
                    }) => {
                      const details = getMenuItemDetails(item.item_id)
                      const name = details?.name || item.item_id
                      const itemPrice = details
                        ? parseFloat(String(details.price)) || 0
                        : 0
                      return (
                        <div
                          key={item.item_id + (item.notes || "")}
                          className="flex items-start justify-between text-sm"
                        >
                          <div>
                            <span className="font-semibold">{name}</span>
                            <span className="ml-2 font-bold text-primary">
                              x{item.qty}
                            </span>
                            {item.notes && (
                              <p className="text-[11px] text-muted-foreground italic">
                                &quot;{item.notes}&quot;
                              </p>
                            )}
                          </div>
                          <span className="font-medium">
                            {symbol}
                            {itemPrice * item.qty}
                          </span>
                        </div>
                      )
                    }
                  )}
                  {items.length === 0 && (
                    <p className="py-2 text-center text-sm text-muted-foreground italic">
                      No items found.
                    </p>
                  )}
                </div>

                <div className="space-y-2 border-t border-border/60 pt-4 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>
                      {symbol}
                      {orders.subtotal || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Service Charge</span>
                    <span>
                      {symbol}
                      {orders.service_charge || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>
                      {symbol}
                      {orders.tax || 0}
                    </span>
                  </div>
                  {Number(orders.tips) > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tip</span>
                      <span className="font-semibold text-primary">
                        +{symbol}
                        {orders.tips}
                      </span>
                    </div>
                  )}
                  {Number(orders.discount) > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Discount</span>
                      <span className="font-semibold text-green-500">
                        -{symbol}
                        {orders.discount}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-border/60 pt-3 text-xl font-black">
                    <span>Total Due</span>
                    <span className="text-primary">
                      {symbol}
                      {orders.total || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="bg-muted/30 p-6 pt-0">
                {session.status === "closed" ? (
                  <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 py-3.5 text-sm font-bold text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Payment Accepted
                  </div>
                ) : (
                  <button
                    onClick={handleFinalize}
                    disabled={isFinalizing}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                  >
                    {isFinalizing ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <CheckCircle className="h-5 w-5" />
                    )}
                    {isFinalizing
                      ? "Processing..."
                      : "Accept Payment & Finalize"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export function OwnerPayClient(props: OwnerPayClientProps) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PayContent {...props} />
    </Suspense>
  )
}
