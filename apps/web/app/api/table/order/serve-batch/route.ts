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
        "[POST /api/table/order/serve-batch] Fetch session error:",
        fetchError
      )
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const currentOrders = session.orders || { items: [] }
    const items: Array<{
      order_item_id: string
      item_id: string
      qty: number
      notes?: string
      cooked_qty?: number
      served_qty?: number
    }> = [...(currentOrders.items || [])]

    let updatedCount = 0
    for (const update of updates) {
      const { order_item_id, item_id, notes, served_qty } = update

      if (served_qty === undefined) continue

      // Try matching by order_item_id first (primary key)
      let existingItemIndex = -1
      if (order_item_id) {
        existingItemIndex = items.findIndex(
          (i) => String(i.order_item_id) === String(order_item_id)
        )
      }

      // Fallback: match by item_id + notes
      if (existingItemIndex === -1 && item_id) {
        const normalizedNotes = (notes || "").trim()
        existingItemIndex = items.findIndex(
          (i) =>
            String(i.item_id) === String(item_id) &&
            (i.notes || "").trim() === normalizedNotes
        )
      }

      if (existingItemIndex > -1) {
        const existingItem = items[existingItemIndex]
        if (existingItem) {
          // Ensure served_qty doesn't exceed qty and isn't less than 0
          existingItem.served_qty = Math.max(
            0,
            Math.min(served_qty, existingItem.qty)
          )
          updatedCount++
        }
      }
    }

    if (updatedCount === 0) {
      return NextResponse.json(
        { error: "No matching items found to update" },
        { status: 404 }
      )
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
        "[POST /api/table/order/serve-batch] Update session error:",
        updateError
      )
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, session: updatedSession })
  } catch (error) {
    console.error("[POST /api/table/order/serve-batch] Internal Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
