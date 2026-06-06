import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { session_id, order_item_id, served_qty } = await request.json()

    if (!session_id || !order_item_id || served_qty === undefined) {
      return NextResponse.json(
        { error: "Missing session_id, order_item_id, or served_qty" },
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
        "[POST /api/table/order/serve] Fetch session error:",
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
      served_qty?: number
    }> = [...(currentOrders.items || [])]

    const existingItemIndex = items.findIndex(
      (i) => i.order_item_id === order_item_id
    )

    if (existingItemIndex > -1) {
      const existingItem = items[existingItemIndex]
      if (existingItem) {
        // Ensure served_qty doesn't exceed qty and isn't less than 0
        existingItem.served_qty = Math.max(
          0,
          Math.min(served_qty, existingItem.qty)
        )
      }
    } else {
      return NextResponse.json(
        { error: "Item not found in order" },
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
        "[POST /api/table/order/serve] Update session error:",
        updateError
      )
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, session: updatedSession })
  } catch (error) {
    console.error("[POST /api/table/order/serve] Internal Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
