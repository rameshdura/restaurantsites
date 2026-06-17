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

    if (
      session.status === "closed" ||
      (!isOwner && session.status === "payment_pending")
    ) {
      return NextResponse.json(
        { error: "Session is closed or awaiting payment" },
        { status: 400 }
      )
    }

    if (!isOwner && new Date(session.expires_at).getTime() < Date.now()) {
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
    const items: Array<{
      order_item_id: string
      item_id: string
      qty: number
      notes?: string
      served_qty?: number
      cooked_qty?: number
      selectedOptions?: Record<string, string>
    }> = [...(currentOrders.items || [])]

    // 3. Update items list
    // 3a. Handle single item update
    if (order_item_id && qty !== undefined) {
      const existingItemIndex = items.findIndex(
        (i) => i.order_item_id === order_item_id
      )
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
        order_item_id:
          Date.now().toString() + Math.random().toString(36).substr(2, 5),
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
          order_item_id:
            Date.now().toString() + Math.random().toString(36).substr(2, 5),
          item_id: cartItem.item_id,
          qty: cartItem.qty,
          notes: cartItem.notes || "",
          served_qty: 0,
          selectedOptions: cartItem.selectedOptions,
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

      const basePrice = parseFloat(String(menuItem.price)) || 0
      const optionsPrice =
        item.selectedOptions && menuItem.options
          ? menuItem.options.reduce((total, opt) => {
              const selectedId = item.selectedOptions![opt.id]
              const selection = opt.selections.find((s) => s.id === selectedId)
              return total + (Number(selection?.price) || 0)
            }, 0)
          : 0

      subtotal += (basePrice + optionsPrice) * item.qty
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ops = (restaurant.data.operations || {}) as any

    // 1. Tax Logic
    // Defaults: showTax=true, taxIncluded=true, taxPercent=10
    const showTax = ops.showTax !== undefined ? ops.showTax : true
    const taxIncluded = ops.taxIncluded !== undefined ? ops.taxIncluded : true
    const taxPercent =
      ops.taxPercent !== undefined ? Number(ops.taxPercent) : 10

    let tax = 0
    if (showTax) {
      if (taxIncluded) {
        // Calculate the tax portion of the subtotal (subtotal already includes tax)
        // E.g. subtotal = 110, taxPercent = 10 -> tax = 110 - (110 / 1.1) = 10
        tax = roundToCurrency(
          subtotal - subtotal / (1 + taxPercent / 100),
          currency
        )
      } else {
        // Tax is additional
        tax = roundToCurrency(subtotal * (taxPercent / 100), currency)
      }
    }

    // 2. Service Charge Logic
    // Defaults: showServiceTax=false, serviceTaxIncluded=false, serviceTaxPercent=0
    const showServiceTax =
      ops.showServiceTax !== undefined ? ops.showServiceTax : false
    const serviceTaxIncluded =
      ops.serviceTaxIncluded !== undefined ? ops.serviceTaxIncluded : false
    const serviceTaxPercent =
      ops.serviceTaxPercent !== undefined ? Number(ops.serviceTaxPercent) : 0

    let serviceCharge = 0
    if (showServiceTax) {
      if (serviceTaxIncluded) {
        serviceCharge = roundToCurrency(
          subtotal - subtotal / (1 + serviceTaxPercent / 100),
          currency
        )
      } else {
        serviceCharge = roundToCurrency(
          subtotal * (serviceTaxPercent / 100),
          currency
        )
      }
    }

    // Preserve or update tips and discounts
    const currentTips =
      tips !== undefined ? Number(tips) : Number(currentOrders.tips || 0)
    const currentDiscount =
      discount !== undefined
        ? Number(discount)
        : Number(currentOrders.discount || 0)

    const taxToAdd = !taxIncluded && showTax ? tax : 0
    const serviceToAdd =
      !serviceTaxIncluded && showServiceTax ? serviceCharge : 0

    const rawTotal =
      subtotal + serviceToAdd + taxToAdd + currentTips - currentDiscount
    const total = Math.max(0, roundToCurrency(rawTotal, currency))

    const updatedOrders = {
      items,
      subtotal: roundToCurrency(subtotal, currency),
      service_charge: serviceCharge,
      tax: tax,
      discount: roundToCurrency(currentDiscount, currency),
      tips: roundToCurrency(currentTips, currency),
      total: total,
      show_tax: showTax,
      tax_included: taxIncluded,
      tax_percent: taxPercent,
      show_service_tax: showServiceTax,
      service_tax_included: serviceTaxIncluded,
      service_tax_percent: serviceTaxPercent,
      customer_info: currentOrders.customer_info || null,
    }

    // 5. Update Supabase
    const updatePayload: {
      orders: typeof updatedOrders
      last_activity: string
      expires_at?: string
    } = {
      orders: updatedOrders,
      last_activity: new Date().toISOString(),
    }

    if (isOwner) {
      // Extend the session by another 5 hours from now
      updatePayload.expires_at = new Date(
        Date.now() + 5 * 60 * 60 * 1000
      ).toISOString()
    }

    const { data: updatedSession, error: updateError } = await supabase
      .from("table_sessions")
      .update(updatePayload)
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
