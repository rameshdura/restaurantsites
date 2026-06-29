import { NextResponse } from "next/server"
import { supabaseServer, getDbTables } from "@/lib/supabase"
import type { Reservation, UpdateReservation } from "@/lib/supabase-types"

// ─── GET /api/bookings/[id] ───────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDbTables()
    const { data: booking, error } = (await supabaseServer
      .from(db.reservations)
      .select("*")
      .eq("id", id)
      .single()) as {
      data: Reservation | null
      error: { message: string } | null
    }

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }
    return NextResponse.json({ booking })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}

// ─── PATCH /api/bookings/[id] ─────────────────────────────────
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDbTables()
    const body = await request.json()
    const {
      status,
      date,
      time,
      partySize,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    } = body

    const { data: existing, error: fetchError } = (await supabaseServer
      .from(db.reservations)
      .select("*")
      .eq("id", id)
      .single()) as {
      data: Reservation | null
      error: { message: string } | null
    }

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const update: UpdateReservation = {
      ...(status && { status }),
      ...(date && { reservation_date: date }),
      ...(time && { reservation_time: time }),
      ...(partySize && { party_size: Number(partySize) }),
      ...(customerName && { customer_name: customerName }),
      ...(customerEmail && { customer_email: customerEmail }),
      ...(customerPhone && { customer_phone: customerPhone }),
      ...(notes !== undefined && { notes }),
    }

    const { data: updated, error: updateError } = (await supabaseServer
      .from("reservations")
      .update(update as never)
      .eq("id", id)
      .select()
      .single()) as {
      data: Reservation | null
      error: { message: string } | null
    }

    if (updateError || !updated) {
      return NextResponse.json(
        { error: "Failed to update booking", details: updateError?.message },
        { status: 500 }
      )
    }

    // Sync calendar
    if (existing.calendar_event_id && existing.calendar_provider === "google") {
      const mcpUrl = process.env.MCP_SERVER_URL || "http://localhost:3001"
      const mcpApiKey = process.env.MCP_API_KEY
      if (mcpApiKey) {
        const tool =
          status === "cancelled" || status === "no_show"
            ? "calendar/delete"
            : "calendar/update"
        fetch(`${mcpUrl}/${tool}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mcpApiKey}`,
          },
          body: JSON.stringify({
            store_id:
              existing[db.storeIdCol as keyof Reservation] ||
              existing.store_id ||
              existing.restaurant_id ||
              "",
            restaurant_id:
              existing[db.storeIdCol as keyof Reservation] ||
              existing.store_id ||
              existing.restaurant_id ||
              "",
            reservation_id: id,
            calendar_event_id: existing.calendar_event_id,
          }),
        }).catch((err) =>
          console.error(
            `[PATCH /api/bookings/${id}] Calendar ${tool} error:`,
            err
          )
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      booking: updated,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}

// ─── DELETE /api/bookings/[id] ────────────────────────────────
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDbTables()

    const { data: existing, error: fetchError } = (await supabaseServer
      .from(db.reservations)
      .select("*")
      .eq("id", id)
      .single()) as {
      data: Reservation | null
      error: { message: string } | null
    }

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const { error: deleteError } = await supabaseServer
      .from(db.reservations)
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json(
        {
          error: "Failed to delete booking",
          details: (deleteError as { message: string }).message,
        },
        { status: 500 }
      )
    }

    if (existing.calendar_event_id && existing.calendar_provider === "google") {
      const mcpUrl = process.env.MCP_SERVER_URL || "http://localhost:3001"
      const mcpApiKey = process.env.MCP_API_KEY
      if (mcpApiKey) {
        fetch(`${mcpUrl}/calendar/delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mcpApiKey}`,
          },
          body: JSON.stringify({
            store_id:
              existing[db.storeIdCol as keyof Reservation] ||
              existing.store_id ||
              existing.restaurant_id ||
              "",
            restaurant_id:
              existing[db.storeIdCol as keyof Reservation] ||
              existing.store_id ||
              existing.restaurant_id ||
              "",
            reservation_id: id,
            calendar_event_id: existing.calendar_event_id,
          }),
        }).catch((err) =>
          console.error(
            `[DELETE /api/bookings/${id}] Calendar delete error:`,
            err
          )
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}
