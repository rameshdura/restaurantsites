import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { session_id, updates } = await request.json()

    if (!session_id || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Missing session_id or updates array" },
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
        "[POST /api/table/order/cook] Fetch session error:",
        fetchError
      )
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }
const currentOrders = session.orders || { items: [] }
console.log(`[POST /api/table/order/cook] session_id: ${session_id}`);
console.log(`[POST /api/table/order/cook] Current session items:`, JSON.stringify(currentOrders.items, null, 2));
console.log(`[POST /api/table/order/cook] Received updates:`, JSON.stringify(updates, null, 2));

const items: Array<{ order_item_id: string; item_id: string; qty: number; notes?: string; cooked_qty?: number; served_qty?: number }> = [
  ...(currentOrders.items || []),
]

let updatedCount = 0
for (const update of updates) {
  const { order_item_id, item_id, notes, cooked_qty } = update

  if (cooked_qty === undefined) {
    console.log(`[POST /api/table/order/cook] Skipping update: cooked_qty is undefined`);
    continue
  }

  // Try matching by order_item_id first (primary key)
  let existingItemIndex = -1
  if (order_item_id) {
    existingItemIndex = items.findIndex((i) => String(i.order_item_id) === String(order_item_id))
    console.log(`[POST /api/table/order/cook] Match by order_item_id '${order_item_id}': index ${existingItemIndex}`);
  }

  // Fallback: match by item_id + notes if order_item_id didn't match
  if (existingItemIndex === -1 && item_id) {
    const normalizedNotes = (notes || "").trim()
    existingItemIndex = items.findIndex((i) =>
      String(i.item_id) === String(item_id) &&
      (i.notes || "").trim() === normalizedNotes
    )
    console.log(`[POST /api/table/order/cook] Fallback match by item_id '${item_id}' + notes '${normalizedNotes}': index ${existingItemIndex}`);
  }

  if (existingItemIndex > -1) {
    const existingItem = items[existingItemIndex]
    if (existingItem) {
      // Ensure cooked_qty doesn't exceed qty and isn't less than 0
      existingItem.cooked_qty = Math.max(0, Math.min(cooked_qty, existingItem.qty))
      updatedCount++
    }
  } else {
    console.log(`[POST /api/table/order/cook] Item not found. order_item_id: '${order_item_id}', item_id: '${item_id}'`);
  }
}

if (updatedCount === 0) {
   return NextResponse.json({ error: "No matching items found to update" }, { status: 404 })
}

    const updatedOrders = {
      ...currentOrders,
      items,
    }

    // Update Supabase
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
        "[POST /api/table/order/cook] Update session error:",
        updateError
      )
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, session: updatedSession })
  } catch (error) {
    console.error("[POST /api/table/order/cook] Internal Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
