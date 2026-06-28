import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"
import type { Reservation } from "@/lib/supabase-types"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch the reservation
    const { data: reservation, error: fetchError } = (await supabaseServer
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single()) as {
      data: Reservation | null
      error: { message: string } | null
    }

    if (fetchError || !reservation) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check oauth connection
    const { data: oauth } = await supabaseServer
      .from("oauth_connections")
      .select("id")
      .eq("restaurant_id", reservation.restaurant_id)
      .eq("provider", "google")
      .single()

    if (!oauth) {
      return NextResponse.json(
        { error: "Google Calendar connection not found for this restaurant" },
        { status: 400 }
      )
    }

    const mcpUrl = process.env.MCP_SERVER_URL || "http://localhost:3001"
    const mcpApiKey = process.env.MCP_API_KEY
    if (!mcpApiKey) {
      return NextResponse.json(
        { error: "MCP API Key not configured" },
        { status: 500 }
      )
    }

    const response = await fetch(`${mcpUrl}/calendar/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mcpApiKey}`,
      },
      body: JSON.stringify({
        restaurant_id: reservation.restaurant_id,
        reservation_id: id,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Calendar sync failed: ${errorText}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    if (result?.google_event_id) {
      await supabaseServer
        .from("reservations")
        .update({
          calendar_provider: "google",
          calendar_event_id: result.google_event_id,
        } as never)
        .eq("id", id)

      return NextResponse.json({
        success: true,
        google_event_id: result.google_event_id,
      })
    }

    return NextResponse.json(
      { error: "Calendar sync did not return an event ID" },
      { status: 500 }
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}
