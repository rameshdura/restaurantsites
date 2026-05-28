"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MenuCategory } from "./types"
import { CategoryNav } from "./category-nav"
import { MenuSection } from "./menu-section"
import { MOCK_MENU } from "./mock-data"
import { SectionHeader } from "@workspace/ui/components/section-header"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { getSessionCookie, clearSessionCookie } from "@/lib/cookies"
import {
  ShoppingBag,
  Sparkles,
  Utensils,
  Check,
  ArrowLeft,
  ClipboardList,
  CheckCircle,
  RefreshCw,
} from "lucide-react"
import QRCode from "react-qr-code"

interface FoodMenuProps {
  categories?: MenuCategory[]
  hideHeader?: boolean
  menuLink?: string
  currency?: string
  translations?: {
    common?: {
      foodMenu?: {
        subtitle?: string
        title?: string
        description?: string
        backgroundTitle?: string
        downloadButton?: string
      }
    }
  }
  initialTableMode?: boolean
  initialSession?: Record<string, any> | null
  onSessionChange?: (session: Record<string, any> | null) => void
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

export function FoodMenu({
  categories = MOCK_MENU,
  hideHeader = false,
  menuLink,
  currency: initialCurrency,
  translations,
  initialTableMode = false,
  initialSession = null,
  onSessionChange,
}: FoodMenuProps) {
  const params = useParams()
  const restaurantSlug = (params?.restaurant as string) || ""
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState(categories[0]?.id || "")
  const [tableMode, setTableMode] = useState(initialTableMode)
  const [session, setSession] = useState<Record<string, any> | null>(
    initialSession
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptSession, setReceiptSession] = useState<Record<
    string,
    any
  > | null>(null)
  const [customTip, setCustomTip] = useState("")
  const [showCustomTipInput, setShowCustomTipInput] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<"cart" | "orders">("cart")
  const [cart, setCart] = useState<
    { item_id: string; qty: number; notes: string }[]
  >([])

  const [prevInitialSession, setPrevInitialSession] = useState(initialSession)
  const [prevInitialTableMode, setPrevInitialTableMode] =
    useState(initialTableMode)

  if (initialSession !== prevInitialSession) {
    setSession(initialSession)
    setPrevInitialSession(initialSession)
  }

  if (initialTableMode !== prevInitialTableMode) {
    setTableMode(initialTableMode)
    setPrevInitialTableMode(initialTableMode)
  }

  const navItems = categories.map((c) => ({ id: c.id, title: c.title }))
  const activeCategory = categories.find((c) => c.id === activeTab)
  const t = translations?.common?.foodMenu || {}

  const currency =
    (session as any)?.orders?.priceCurrency || initialCurrency || "USD"
  const symbol = CURRENCY_SYMBOLS[currency] || ""

  // 1. Check for active session cookie on mount
  useEffect(() => {
    if (initialTableMode) return

    async function loadTableSession() {
      const cookie = getSessionCookie()
      if (!cookie) return

      try {
        const res = await fetch(
          `/api/table/session?session_id=${cookie.session_id}`
        )
        const data = await res.json()
        if (data.valid && data.session) {
          setTableMode(true)
          setSession(data.session)
        } else {
          // If expired or closed, remove cookie
          clearSessionCookie()
        }
      } catch (err) {
        console.error("Failed to fetch table session:", err)
      }
    }
    loadTableSession()
  }, [initialTableMode])

  // 1b. Prevent background scrolling when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isSidebarOpen])

  // 1c. Automatically show receipt if session is loaded as closed
  useEffect(() => {
    if (
      session &&
      (session.status === "closed" || session.status === "payment_pending") &&
      !showReceipt
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReceiptSession(session)

      setShowReceipt(true)
    }
  }, [session, showReceipt])

  // 1d. Poll for session status if showing receipt and payment_pending
  useEffect(() => {
    if (
      !showReceipt ||
      !receiptSession ||
      receiptSession.status !== "payment_pending"
    )
      return

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/table/session?session_id=${receiptSession.session_id}`
        )
        const data = await res.json()
        if (data.valid && data.session) {
          if (data.session.status !== "payment_pending") {
            setReceiptSession(data.session)
            setSession(data.session)
            onSessionChange?.(data.session)
          }
        } else {
          setReceiptSession((prev) =>
            prev ? { ...prev, status: "closed" } : null
          )
        }
      } catch (err) {
        console.error("Failed to poll session status:", err)
      }
    }, 4000)

    return () => clearInterval(intervalId)
  }, [showReceipt, receiptSession, onSessionChange])

  // 2. Local Cart update handler
  const handleUpdateCart = (itemId: string, qty: number, notes: string) => {
    if (qty > 0) {
      setSidebarTab("cart")
    }
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.item_id === itemId && (i.notes || "") === (notes || "")
      )
      if (existingIndex > -1) {
        if (qty <= 0) {
          const newCart = [...prev]
          newCart.splice(existingIndex, 1)
          return newCart
        }
        const newCart = [...prev]
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          item_id: newCart[existingIndex]!.item_id,
          qty,
          notes,
        }
        return newCart
      } else if (qty > 0) {
        return [...prev, { item_id: itemId, qty, notes }]
      }
      return prev
    })
  }

  // 2b. Place order (move cart to server)
  const handlePlaceOrder = async () => {
    if (!session || cart.length === 0) return
    setIsUpdating(true)
    try {
      const res = await fetch("/api/table/order/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.session_id,
          restaurantSlug,
          cartItems: cart,
        }),
      })
      const data = await res.json()
      if (data.success && data.session) {
        setSession(data.session)
        onSessionChange?.(data.session)
        setCart([]) // Clear local cart
        setSidebarTab("orders") // Switch to orders tab
      } else if (
        data.error === "Session is closed" ||
        data.error === "Session is closed or awaiting payment" ||
        data.error === "Session not found"
      ) {
        toast({
          title: "Session Closed",
          description: "This ordering session has been closed by the host.",
          variant: "destructive",
        })
        clearSessionCookie()
        setTableMode(false)
        setSession(null)
        onSessionChange?.(null)
      }
    } catch (err) {
      console.error("Failed to place order:", err)
    } finally {
      setIsUpdating(false)
    }
  }

  // 3. Tip update handler
  const handleUpdateTip = async (tipAmount: number) => {
    if (!session) return
    setIsUpdating(true)
    try {
      const res = await fetch("/api/table/order/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.session_id,
          restaurantSlug,
          tips: tipAmount,
        }),
      })
      const data = await res.json()
      if (data.success && data.session) {
        setSession(data.session)
        onSessionChange?.(data.session)
      }
    } catch (err) {
      console.error("Failed to update tip amount:", err)
    } finally {
      setIsUpdating(false)
    }
  }

  // 4. Checkout / Close Session handler
  const handleCheckout = async () => {
    if (!session) return

    setIsCheckingOut(true)
    try {
      const res = await fetch("/api/table/session/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.session_id,
          status: "payment_pending",
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSession(data.session)
        onSessionChange?.(data.session)
        setReceiptSession(data.session)
        setShowReceipt(true)
        // We do NOT clear the session cookie here. It will be cleared when the user clicks "Done" on the receipt.
      } else {
        toast({
          title: "Checkout Failed",
          description: "Failed to checkout. Please ask a staff member.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Failed to checkout:", err)
      toast({
        title: "Checkout Error",
        description: "An error occurred during checkout. Please ask a staff member.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  // Flatten items to perform reverse lookup (id -> details) in cart
  const flatItems = categories.flatMap((c) => c.items)

  // Persisted orders from server
  const orderItems = session?.orders?.items || []

  // Local cart items (picker)
  const cartTotalItemCount = cart.reduce(
    (sum: number, item) => sum + item.qty,
    0
  )
  const cartSubtotal = cart.reduce((sum: number, cartItem) => {
    const itemDetails = flatItems.find((i) => i.id === cartItem.item_id)
    const price = itemDetails ? parseFloat(String(itemDetails.price)) || 0 : 0
    return sum + price * cartItem.qty
  }, 0)

  const renderSidebarContent = () => {
    return (
      <>
        {/* Tab Headers */}
        <div className="mb-6 flex border-b border-border">
          <button
            onClick={() => setSidebarTab("cart")}
            className={`flex-1 cursor-pointer border-b-2 pb-3 text-sm font-semibold transition-all ${
              sidebarTab === "cart"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Cart ({cartTotalItemCount})
          </button>
          <button
            onClick={() => setSidebarTab("orders")}
            className={`flex-1 cursor-pointer border-b-2 pb-3 text-sm font-semibold transition-all ${
              sidebarTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Orders
          </button>
        </div>

        {/* Tab Content */}
        {sidebarTab === "cart" ? (
          <div>
            {/* Cart items */}
            {cart.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <ShoppingBag className="mx-auto mb-3 h-8 w-8 opacity-40" />
                <p className="text-sm">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                  {cart.map((cartItem) => {
                    const itemDetails = flatItems.find(
                      (i) => i.id === cartItem.item_id
                    )
                    const name = itemDetails?.name || cartItem.item_id
                    const itemPrice = itemDetails
                      ? parseFloat(String(itemDetails.price)) || 0
                      : 0
                    return (
                      <div
                        key={cartItem.item_id + (cartItem.notes || "")}
                        className="border-b border-border/40 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {symbol}
                              {itemPrice} each
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-foreground">
                            {symbol}
                            {itemPrice * cartItem.qty}
                          </span>
                        </div>

                        {/* Quantity & Notes controls */}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              disabled={isUpdating}
                              onClick={() =>
                                handleUpdateCart(
                                  cartItem.item_id,
                                  cartItem.qty - 1,
                                  cartItem.notes || ""
                                )
                              }
                              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-xs font-bold text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="w-4 text-center text-xs font-semibold text-foreground select-none">
                              {cartItem.qty}
                            </span>
                            <button
                              disabled={isUpdating}
                              onClick={() =>
                                handleUpdateCart(
                                  cartItem.item_id,
                                  cartItem.qty + 1,
                                  cartItem.notes || ""
                                )
                              }
                              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-xs font-bold text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>

                          <input
                            type="text"
                            placeholder="Note..."
                            defaultValue={cartItem.notes || ""}
                            onBlur={(e) => {
                              if (e.target.value !== (cartItem.notes || "")) {
                                handleUpdateCart(
                                  cartItem.item_id,
                                  cartItem.qty,
                                  e.target.value
                                )
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur()
                              }
                            }}
                            className="max-w-[120px] flex-1 rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px] text-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Cart Subtotal */}
                <div className="border-t border-border/60 pt-4">
                  <div className="flex justify-between text-sm font-bold text-foreground">
                    <span>Subtotal</span>
                    <span className="text-primary">
                      {symbol}
                      {cartSubtotal}
                    </span>
                  </div>
                  <button
                    disabled={isUpdating}
                    onClick={handlePlaceOrder}
                    className="mt-4 w-full cursor-pointer rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Orders tab: Finalized Bill */
          <div>
            {orderItems.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Utensils className="mx-auto mb-3 h-8 w-8 animate-pulse text-primary opacity-40" />
                <p className="text-sm">No items ordered yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                  {orderItems.map((orderItem: any) => {
                    const itemDetails = flatItems.find(
                      (i) => i.id === orderItem.item_id
                    )
                    const name = itemDetails?.name || orderItem.item_id
                    const itemPrice = itemDetails
                      ? parseFloat(String(itemDetails.price)) || 0
                      : 0
                    return (
                      <div
                        key={orderItem.item_id + (orderItem.notes || "")}
                        className="border-b border-border/30 pb-2 last:border-0"
                      >
                        <div className="flex items-start justify-between text-xs">
                          <div>
                            <p className="font-semibold text-foreground">
                              {name}
                              <span className="ml-1.5 text-xs font-bold text-primary">
                                x{orderItem.qty}
                              </span>
                            </p>
                            {orderItem.notes && (
                              <p className="mt-0.5 text-[10px] text-muted-foreground italic">
                                &ldquo;{orderItem.notes}&rdquo;
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 font-medium text-foreground">
                            {symbol}
                            {itemPrice * orderItem.qty}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Tips Section */}
                <div className="border-t border-border/60 pt-4">
                  <h4 className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Add a Tip
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[0, 500, 1000, 1500].map((tipVal) => {
                      const isSelected =
                        Number(session?.orders?.tips) === tipVal &&
                        !showCustomTipInput
                      return (
                        <button
                          key={tipVal}
                          disabled={isUpdating}
                          onClick={() => {
                            setShowCustomTipInput(false)
                            handleUpdateTip(tipVal)
                          }}
                          className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-accent/40 text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {tipVal === 0 ? "No Tip" : `${symbol}${tipVal}`}
                        </button>
                      )
                    })}
                    <button
                      disabled={isUpdating}
                      onClick={() => setShowCustomTipInput(true)}
                      className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                        showCustomTipInput
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent/40 text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                  {showCustomTipInput && (
                    <div className="mt-2.5 flex max-w-[180px] items-center gap-1.5">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {symbol}
                      </span>
                      <input
                        type="number"
                        placeholder="Tip"
                        value={customTip}
                        onChange={(e) => setCustomTip(e.target.value)}
                        className="w-full rounded-md border border-border/60 bg-background px-2 py-0.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const amount = parseFloat(customTip) || 0
                          handleUpdateTip(amount)
                        }}
                        className="cursor-pointer rounded-md bg-accent px-2 py-1 text-xs font-bold text-primary hover:bg-accent/80"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Bill Breakdown */}
                <div className="space-y-2 border-t border-border/60 pt-4 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>
                      {symbol}
                      {session?.orders?.subtotal}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Service Charge (10%)</span>
                    <span>
                      {symbol}
                      {session?.orders?.service_charge}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (10%)</span>
                    <span>
                      {symbol}
                      {session?.orders?.tax}
                    </span>
                  </div>
                  {Number(session?.orders?.tips) > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tip</span>
                      <span className="font-semibold text-primary">
                        +{symbol}
                        {session?.orders?.tips}
                      </span>
                    </div>
                  )}
                  {Number(session?.orders?.discount) > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Discount</span>
                      <span className="font-semibold text-green-500">
                        -{symbol}
                        {session?.orders?.discount}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border/40 pt-2 text-sm font-bold text-foreground">
                    <span>Grand Total</span>
                    <span className="text-primary">
                      {symbol}
                      {session?.orders?.total}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    disabled={
                      isUpdating || isCheckingOut || orderItems.length === 0
                    }
                    onClick={handleCheckout}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCheckingOut
                      ? "Closing Table..."
                      : "Checkout & Close Table"}
                  </button>

                  <p className="text-center text-[10px] tracking-wider text-muted-foreground uppercase">
                    Please pay at the register when finished
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    )
  }

  const renderSidebar = () => {
    return (
      <div className="sticky top-6 rounded-3xl border border-border bg-card p-6 text-left shadow-md">
        {renderSidebarContent()}
      </div>
    )
  }

  const menuContent = (
    <>
      <CategoryNav
        categories={navItems}
        activeId={activeTab}
        onTabChange={setActiveTab}
      />

      <div
        className={`min-h-[400px] ${tableMode && (cartTotalItemCount > 0 || orderItems.length > 0) ? "pb-24 lg:pb-0" : ""}`}
      >
        {activeCategory && (
          <MenuSection
            key={activeCategory.id}
            category={activeCategory}
            currency={currency}
            tableMode={tableMode}
            activeOrderItems={cart}
            onUpdateQty={handleUpdateCart}
          />
        )}
      </div>
    </>
  )

  if (showReceipt && receiptSession) {
    const qrUrl = receiptSession.session_id
    const receiptOrderItems = receiptSession.orders?.items || []

    return (
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div
            className={`border-b p-6 text-center transition-colors duration-500 ${
              receiptSession.status === "closed"
                ? "border-green-500/20 bg-green-500/10"
                : "border-primary/20 bg-primary/10"
            }`}
          >
            <CheckCircle
              className={`mx-auto mb-3 h-12 w-12 transition-colors duration-500 ${
                receiptSession.status === "closed"
                  ? "text-green-500"
                  : "text-primary"
              }`}
            />
            <h2 className="text-2xl font-black text-foreground">
              {receiptSession.status === "closed"
                ? "Payment Accepted"
                : "Checkout Complete"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {receiptSession.status === "closed"
                ? "Thank you for dining with us!"
                : "Please show this at the register"}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center bg-white p-8 text-black">
            <QRCode value={qrUrl} size={180} level="M" />
            <p className="mt-4 font-mono text-[10px] text-zinc-500 uppercase">
              Table {receiptSession.table_number}
            </p>
          </div>

          {/* Amount & Summary */}
          <div className="p-6 text-sm">
            <div className="mb-6 text-center">
              <span className="block text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Amount Due
              </span>
              <span className="text-4xl font-black text-primary">
                {symbol}
                {receiptSession.orders?.total}
              </span>
            </div>

            <div className="mb-4 border-b border-border/60 pb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Order Summary
            </div>

            <div className="max-h-48 space-y-3 overflow-y-auto pr-1">
              {receiptOrderItems.map((item: any) => {
                const itemDetails = flatItems.find((i) => i.id === item.item_id)
                const name = itemDetails?.name || item.item_id
                const itemPrice = itemDetails
                  ? parseFloat(String(itemDetails.price)) || 0
                  : 0
                return (
                  <div
                    key={item.item_id + (item.notes || "")}
                    className="flex items-start justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {name}
                        <span className="ml-1.5 text-xs font-bold text-primary">
                          x{item.qty}
                        </span>
                      </p>
                    </div>
                    <span className="font-medium text-foreground">
                      {symbol}
                      {itemPrice * item.qty}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Totals */}
            <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>
                  {symbol}
                  {receiptSession.orders?.subtotal}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (10%)</span>
                <span>
                  {symbol}
                  {receiptSession.orders?.tax}
                </span>
              </div>
              {Number(receiptSession.orders?.tips) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tip</span>
                  <span className="font-semibold text-primary">
                    +{symbol}
                    {receiptSession.orders?.tips}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="p-6 pt-0">
            {receiptSession.status === "payment_pending" ? (
              <div className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3.5 text-sm font-bold text-amber-600 transition-all">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Waiting for Confirmation...
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowReceipt(false)
                  setReceiptSession(null)
                  setTableMode(false)
                  setSession(null)
                  onSessionChange?.(null)
                  setIsSidebarOpen(false)
                  clearSessionCookie()
                }}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-500 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-green-600 active:scale-95"
              >
                <CheckCircle className="h-5 w-5" />
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {!hideHeader && (
        <div className="mb-10 text-center">
          <SectionHeader
            subtitle={t.subtitle || "Delicacies"}
            title={t.title || "Our Menu"}
            description={
              <>
                {t.description || "Artisanal dishes crafted with passion."}
                {menuLink && (
                  <>
                    {" "}
                    <a
                      href={menuLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      {t.downloadButton || "Download Menu PDF"}
                    </a>
                  </>
                )}
              </>
            }
            backgroundTitle={t.backgroundTitle || "Flavors"}
            align="center"
          />
        </div>
      )}

      {tableMode && session && !hideHeader && (
        <div className="mb-6 flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-center">
          <Sparkles className="h-4 w-4 animate-pulse text-primary" />
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            Ordering from Table {session.table_number} • Order is live
          </span>
        </div>
      )}

      {tableMode && session ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">{menuContent}</div>
          <div className="hidden lg:block">
            {/* Sidebar with Tabs */}
            {renderSidebar()}
          </div>
        </div>
      ) : (
        menuContent
      )}

      {/* Floating Bottom Bar (Mobile Dock) - Hidden on desktop/tablet */}
      {tableMode && session && (
        <div className="fixed right-6 bottom-6 left-6 z-40 mx-auto max-w-md rounded-2xl border border-border bg-card/90 p-2 shadow-[0_12px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <button
              onClick={() => {
                setSidebarTab("cart")
                setIsSidebarOpen(true)
              }}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold tracking-wide uppercase transition-all duration-200 active:scale-95 ${
                sidebarTab === "cart" && isSidebarOpen
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-accent/40 text-foreground hover:bg-accent/60"
              }`}
            >
              <div className="relative flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                {cartTotalItemCount > 0 && (
                  <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-primary-foreground ring-2 ring-card">
                    {cartTotalItemCount}
                  </span>
                )}
              </div>
              <span className="ml-1">Cart</span>
            </button>

            {/* Orders Button */}
            <button
              onClick={() => {
                setSidebarTab("orders")
                setIsSidebarOpen(true)
              }}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold tracking-wide uppercase transition-all duration-200 active:scale-95 ${
                sidebarTab === "orders" && isSidebarOpen
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-accent/40 text-foreground hover:bg-accent/60"
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              <span>Orders</span>
            </button>
          </div>
        </div>
      )}

      {/* Slide-over Sidebar Drawer - Hidden on desktop/tablet */}
      {tableMode && session && (
        <div
          className={`fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
            isSidebarOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <div
            className="absolute inset-0"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 flex max-w-full">
            <div
              className={`w-screen max-w-md transform border-l border-border bg-card p-6 text-left shadow-2xl transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {/* Drawer Header with back button to slide it back out */}
              <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Table {session.table_number}
                    </h3>
                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Live Ordering Session
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex cursor-pointer items-center justify-center rounded-full border border-border bg-background p-1.5 text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="h-[calc(100%-80px)] overflow-y-auto pr-1">
                {renderSidebarContent()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
