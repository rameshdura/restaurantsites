import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id parameter" },
        { status: 400 }
      )
    }

    const { data: session, error } = await supabase
      .from("table_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle()

    if (error) {
      console.error("[GET /api/table/session] Supabase error:", error)
      return NextResponse.json(
        { valid: false, error: error.message },
        { status: 500 }
      )
    }

    if (!session) {
      return NextResponse.json({ valid: false, reason: "session_not_found" })
    }

    // We no longer reject closed sessions here, so the frontend can display the receipt
    // if (session.status === "closed") {
    //   return NextResponse.json({ valid: false, reason: "session_closed" })
    // }

    const expiresAt = new Date(session.expires_at).getTime()
    const now = Date.now()
    if (expiresAt < now) {
      return NextResponse.json({ valid: false, reason: "session_expired" })
    }

    // Refresh last_activity timestamp (optional but good for tracking)
    await supabase
      .from("table_sessions")
      .update({ last_activity: new Date().toISOString() })
      .eq("session_id", sessionId)

    return NextResponse.json({ valid: true, session })
  } catch (error) {
    console.error("[GET /api/table/session] Internal Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { tableNumber, restaurantSlug, persons } = await request.json()

    if (tableNumber === undefined || !restaurantSlug) {
      return NextResponse.json(
        { error: "Missing tableNumber or restaurantSlug" },
        { status: 400 }
      )
    }

    // Check if there is already an active session for this table
    const { data: existingActiveSession, error: checkError } = await supabase
      .from("table_sessions")
      .select("*")
      .eq("restaurant_slug", restaurantSlug)
      .eq("table_number", Number(tableNumber))
      .in("status", ["active", "payment_pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (checkError) {
      console.error(
        "[POST /api/table/session] Check existing session error:",
        checkError
      )
    }

    if (existingActiveSession) {
      // Return the existing active session so the new user joins the same table session
      return NextResponse.json({
        success: true,
        session: existingActiveSession,
      })
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString() // 5 hours expiry
    const defaultOrders = {
      items: [],
      subtotal: 0,
      service_charge: 0,
      tax: 0,
      discount: 0,
      tips: 0,
      total: 0,
    }

    const { data: newSession, error } = await supabase
      .from("table_sessions")
      .insert({
        table_number: Number(tableNumber),
        restaurant_slug: restaurantSlug,
        status: "active",
        expires_at: expiresAt,
        orders: defaultOrders,
        persons: persons ? Number(persons) : null,
      })
      .select()
      .single()

    if (error) {
      console.error("[POST /api/table/session] Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, session: newSession })
  } catch (error) {
    console.error("[POST /api/table/session] Internal Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
