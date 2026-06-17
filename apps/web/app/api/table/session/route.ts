import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")
    const deviceId = searchParams.get("device_id")
    const isExplicit = searchParams.get("is_explicit") === "true"

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
    if (expiresAt < now && !isExplicit) {
      return NextResponse.json({ valid: false, reason: "session_expired" })
    }

    // Refresh last_activity timestamp and conditionally bind device_id
    const updateData: Record<string, string> = {
      last_activity: new Date().toISOString(),
    }

    // Bind device_id if session has none, allowing restored devices to "own" the session
    if (!session.device_id && deviceId) {
      updateData.device_id = deviceId
      session.device_id = deviceId // update local object to return
    }

    await supabase
      .from("table_sessions")
      .update(updateData)
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
    const { tableNumber, restaurantSlug, persons, device_id, customer_info } =
      await request.json()

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
      // If the requesting device is the same one that created the session, allow reconnection
      if (
        device_id &&
        existingActiveSession.device_id &&
        device_id === existingActiveSession.device_id
      ) {
        return NextResponse.json({
          success: true,
          session: existingActiveSession,
        })
      }

      // If the session has NO device_id (e.g. created by owner), allow the first device to bind to it!
      if (!existingActiveSession.device_id && device_id) {
        await supabase
          .from("table_sessions")
          .update({ device_id })
          .eq("session_id", existingActiveSession.session_id)

        existingActiveSession.device_id = device_id
        return NextResponse.json({
          success: true,
          session: existingActiveSession,
        })
      }

      // Otherwise, reject — table is occupied by another device
      return NextResponse.json(
        {
          success: false,
          occupied: true,
          error:
            "Previous guest has not checked out. Please call the staff or retry after 1 minute.",
        },
        { status: 409 }
      )
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString() // 5 hours expiry

    // Fetch restaurant data to get tax config
    const { getRestaurant } = await import("@/lib/restaurant")
    const restaurant = await getRestaurant(restaurantSlug)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ops = (restaurant?.data?.operations || {}) as any

    const defaultOrders = {
      items: [],
      subtotal: 0,
      service_charge: 0,
      tax: 0,
      discount: 0,
      tips: 0,
      total: 0,
      show_tax: ops.showTax !== undefined ? ops.showTax : true,
      tax_included: ops.taxIncluded !== undefined ? ops.taxIncluded : true,
      tax_percent: ops.taxPercent !== undefined ? Number(ops.taxPercent) : 10,
      show_service_tax:
        ops.showServiceTax !== undefined ? ops.showServiceTax : false,
      service_tax_included:
        ops.serviceTaxIncluded !== undefined ? ops.serviceTaxIncluded : false,
      service_tax_percent:
        ops.serviceTaxPercent !== undefined ? Number(ops.serviceTaxPercent) : 0,
      customer_info: customer_info || null,
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
        device_id: device_id || null,
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
