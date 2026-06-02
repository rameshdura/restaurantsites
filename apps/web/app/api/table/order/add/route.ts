import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getRestaurant, MenuItem } from "@/lib/restaurant"

export const dynamic = "force-dynamic"

function roundToCurrency(value: number, currency: string): number {
  const c = currency.toUpperCase()
  if (c === "JPY" || c === "KRW") {
    return Math.round(value)
  }
  return parseFloat(value.toFixed(2))
}

export async function POST(request: Request) {
  try {
    const {
      session_id,
      restaurantSlug,
      order_item_id,
      item_id,
      qty,
      notes,
      tips,
      discount,
      cartItems,
      isOwner,
    } = await request.json()

    if (!session_id || !restaurantSlug) {
      return NextResponse.json(
        { error: "Missing session_id or restaurantSlug" },
        { status: 400 }
      )
    }

    // 1. Fetch current session from Supabase
    const { data: session, error: fetchError } = await supabase
      .from("table_sessions")
      .select("*")
      .eq("session_id", session_id)
      .maybeSingle()

    if (fetchError) {
      console.error(
        "[POST /api/table/order/add] Fetch session error:",
        fetchError
      )
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (session.status === "closed" || (!isOwner && session.status === "payment_pending")) {
      return NextResponse.json(
        { error: "Session is closed or awaiting payment" },
        { status: 400 }
      )
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Session has expired" },
        { status: 400 }
      )
    }

    // 2. Fetch restaurant data to check prices
    const restaurant = await getRestaurant(restaurantSlug)
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      )
    }

    const currency = restaurant.data.app?.currency || "USD"
    const currentOrders = session.orders || { items: [] }
    const items: Array<{ order_item_id: string; item_id: string; qty: number; notes?: string; served_qty?: number; cooked_qty?: number }> = [
      ...(currentOrders.items || []),
    ]

    // 3. Update items list
    // 3a. Handle single item update
    if (order_item_id && qty !== undefined) {
      const existingItemIndex = items.findIndex((i) => i.order_item_id === order_item_id)
      if (existingItemIndex > -1) {
        if (qty <= 0) {
          items.splice(existingItemIndex, 1)
        } else {
          items[existingItemIndex]!.qty = qty
        }
      }
    } else if (item_id !== undefined && qty !== undefined) {
      // Add new item
      items.push({
        order_item_id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        item_id: item_id,
        qty: qty,
        notes: notes || "",
        served_qty: 0,
      })
    }

    // 3b. Handle bulk cart items (new logic)
    if (cartItems && Array.isArray(cartItems)) {
      for (const cartItem of cartItems) {
        if (!cartItem.item_id || !cartItem.qty || cartItem.qty <= 0) continue

        // Add as a new entry with a unique ID
        items.push({
          order_item_id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          item_id: cartItem.item_id,
          qty: cartItem.qty,
          notes: cartItem.notes || "",
          served_qty: 0,
        })
      }
    }

    // 4. Recalculate totals
    let subtotal = 0
    for (const item of items) {
      // Find item in restaurant menu or categories
      let menuItem: MenuItem | undefined = restaurant.menu.find(
        (i: MenuItem) => i.id === item.item_id
      )
      if (!menuItem && restaurant.data.menuCategories) {
        for (const cat of restaurant.data.menuCategories) {
          const found = cat.items?.find((i: MenuItem) => i.id === item.item_id)
          if (found) {
            menuItem = found
            break
          }
        }
      }

      if (!menuItem) {
        console.warn(
          `[POST /api/table/order/add] Item ${item.item_id} not found in menu.`
        )
        continue
      }

      const price = parseFloat(String(menuItem.price)) || 0
      subtotal += price * item.qty
    }

    const serviceChargeRate = 0.1 // 10%
    const taxRate = 0.1 // 10%

    const serviceCharge = roundToCurrency(
      subtotal * serviceChargeRate,
      currency
    )
    const tax = roundToCurrency(subtotal * taxRate, currency)

    // Preserve or update tips and discounts
    const currentTips =
      tips !== undefined ? Number(tips) : Number(currentOrders.tips || 0)
    const currentDiscount =
      discount !== undefined
        ? Number(discount)
        : Number(currentOrders.discount || 0)

    const rawTotal =
      subtotal + serviceCharge + tax + currentTips - currentDiscount
    const total = Math.max(0, roundToCurrency(rawTotal, currency))

    const updatedOrders = {
      items,
      subtotal: roundToCurrency(subtotal, currency),
      service_charge: serviceCharge,
      tax: tax,
      discount: roundToCurrency(currentDiscount, currency),
      tips: roundToCurrency(currentTips, currency),
      total: total,
    }

    // 5. Update Supabase
    const { data: updatedSession, error: updateError } = await supabase
      .from("table_sessions")
      .update({
        orders: updatedOrders,
        last_activity: new Date().toISOString(),
      })
      .eq("session_id", session_id)
      .select()
      .single()

    if (updateError) {
      console.error(
        "[POST /api/table/order/add] Update session error:",
        updateError
      )
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, session: updatedSession })
  } catch (error) {
    console.error("[POST /api/table/order/add] Internal Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
