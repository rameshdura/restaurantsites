import { NextResponse } from "next/server"
import { supabaseServer, getDbTables } from "@/lib/supabase"
import { checkAvailability } from "@/lib/availability"
import type {
  InsertReservation,
  Reservation,
  Restaurant,
} from "@/lib/supabase-types"

// ─── Helper: resolve restaurant_id from slug ──────────────────
async function getRestaurantId(slug: string): Promise<string | null> {
  const db = await getDbTables()
  const { data } = (await supabaseServer
    .from(db.stores)
    .select("id")
    .eq("slug", slug)
    .single()) as { data: Pick<Restaurant, "id"> | null; error: unknown }
  return data?.id ?? null
}

// ─── GET /api/bookings ────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantSlug = searchParams.get("restaurantSlug")
    const date = searchParams.get("date")
    const checkAvail = searchParams.get("checkAvailability") === "true"
    const time = searchParams.get("time")
    const partySize = searchParams.get("partySize")

    if (!restaurantSlug) {
      return NextResponse.json(
        { error: "Missing restaurantSlug parameter" },
        { status: 400 }
      )
    }

    if (checkAvail) {
      if (!date || !time || !partySize) {
        return NextResponse.json(
          { error: "Missing required parameters: date, time, partySize" },
          { status: 400 }
        )
      }
      const result = await checkAvailability(
        restaurantSlug,
        date,
        time,
        Number(partySize)
      )
      return NextResponse.json(result)
    }

    const db = await getDbTables()
    let query = supabaseServer
      .from(db.reservations)
      .select("*")
      .eq(db.storeSlugCol, restaurantSlug)
      .order("reservation_date", { ascending: true })
      .order("reservation_time", { ascending: true })

    if (date) query = query.eq("reservation_date", date)

    const { data: bookings, error } = (await query) as {
      data: Reservation[] | null
      error: { message: string } | null
    }

    if (error) {
      return NextResponse.json(
        { error: "Database error", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookings: bookings ?? [] })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}

// ─── POST /api/bookings ───────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[POST /api/bookings] incoming request body:", body)
    const {
      restaurantSlug,
      date,
      time,
      partySize,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    } = body

    if (
      !restaurantSlug ||
      !date ||
      !time ||
      !partySize ||
      !customerName ||
      !customerEmail ||
      !customerPhone
    ) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 }
      )
    }

    const availResult = await checkAvailability(
      restaurantSlug,
      date,
      time,
      Number(partySize)
    )
    if (!availResult.available) {
      return NextResponse.json({ error: availResult.message }, { status: 409 })
    }

    const restaurantId = await getRestaurantId(restaurantSlug)
    if (!restaurantId) {
      return NextResponse.json(
        {
          error: `Restaurant "${restaurantSlug}" not found in database. Please seed the restaurants table first.`,
        },
        { status: 404 }
      )
    }

    const db = await getDbTables()
    const insert: any = {
      [db.storeIdCol]: restaurantId,
      [db.storeSlugCol]: restaurantSlug,
      customer_name: customerName,
      customer_email: customerEmail ?? null,
      customer_phone: customerPhone ?? null,
      party_size: Number(partySize),
      reservation_date: date,
      reservation_time: time,
      status: "confirmed",
      notes: notes ?? null,
    }
    if (db.useStores) {
      insert.store_id = restaurantId
      insert.store_slug = restaurantSlug
    } else {
      insert.restaurant_id = restaurantId
      insert.restaurant_slug = restaurantSlug
    }

    const { data: reservation, error } = (await supabaseServer
      .from(db.reservations)
      .insert(insert)
      .select()
      .single()) as {
      data: Reservation | null
      error: { message: string } | null
    }

    if (error || !reservation) {
      return NextResponse.json(
        { error: "Failed to create reservation", details: error?.message },
        { status: 500 }
      )
    }

    // Fire-and-forget calendar sync
    triggerCalendarSync(restaurantId, reservation.id).catch((err) =>
      console.error("[POST /api/bookings] Calendar sync error:", err)
    )

    return NextResponse.json(
      {
        success: true,
        message: "Booking confirmed successfully",
        booking: reservation,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}

// ─── Calendar Sync (fire-and-forget) ─────────────────────────
async function triggerCalendarSync(
  restaurantId: string,
  reservationId: string
): Promise<void> {
  const db = await getDbTables()
  const { data: oauth } = await supabaseServer
    .from(db.oauth_connections)
    .select("id")
    .eq(db.storeIdCol, restaurantId)
    .eq("provider", "google")
    .single()

  if (!oauth) return

  const mcpUrl = process.env.MCP_SERVER_URL || "http://localhost:3001"
  const mcpApiKey = process.env.MCP_API_KEY
  if (!mcpApiKey) return

  try {
    const response = await fetch(`${mcpUrl}/calendar/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mcpApiKey}`,
      },
      body: JSON.stringify({
        store_id: restaurantId,
        restaurant_id: restaurantId,
        reservation_id: reservationId,
      }),
    })
    if (!response.ok) return
    const result = await response.json()
    if (result?.google_event_id) {
      await supabaseServer
        .from(db.reservations)
        .update({
          calendar_provider: "google",
          calendar_event_id: result.google_event_id,
        } as never)
        .eq("id", reservationId)
    }
  } catch (err) {
    console.error("[calendar sync] Fetch error:", err)
  }
}
