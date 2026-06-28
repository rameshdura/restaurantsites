import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"
import { DEFAULT_BOOKING_SETTINGS } from "@/lib/supabase-types"
import type {
  BookingSettings,
  UpsertBookingSettings,
  Restaurant,
} from "@/lib/supabase-types"

// ─── GET /api/booking-settings?restaurantSlug=xxx ─────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantSlug = searchParams.get("restaurantSlug")

    if (!restaurantSlug) {
      return NextResponse.json(
        { error: "Missing restaurantSlug parameter" },
        { status: 400 }
      )
    }

    const { data: restaurant } = (await supabaseServer
      .from("restaurants")
      .select("id")
      .eq("slug", restaurantSlug)
      .single()) as { data: Pick<Restaurant, "id"> | null; error: unknown }

    if (!restaurant) {
      return NextResponse.json({
        settings: DEFAULT_BOOKING_SETTINGS,
        isDefault: true,
      })
    }

    const { data: settings } = (await supabaseServer
      .from("booking_settings")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .single()) as { data: BookingSettings | null; error: unknown }

    if (!settings) {
      return NextResponse.json({
        settings: { restaurant_id: restaurant.id, ...DEFAULT_BOOKING_SETTINGS },
        isDefault: true,
      })
    }

    return NextResponse.json({ settings, isDefault: false })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("[GET /api/booking-settings]", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}

// ─── PUT /api/booking-settings ────────────────────────────────
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { restaurantSlug, ...settingsFields } = body

    if (!restaurantSlug) {
      return NextResponse.json(
        { error: "Missing restaurantSlug" },
        { status: 400 }
      )
    }

    const { data: restaurant } = (await supabaseServer
      .from("restaurants")
      .select("id")
      .eq("slug", restaurantSlug)
      .single()) as { data: Pick<Restaurant, "id"> | null; error: unknown }

    if (!restaurant) {
      return NextResponse.json(
        { error: `Restaurant "${restaurantSlug}" not found` },
        { status: 404 }
      )
    }

    const upsert: UpsertBookingSettings = {
      restaurant_id: restaurant.id,
      ...DEFAULT_BOOKING_SETTINGS,
      ...settingsFields,
    }

    const { data: settings, error } = (await supabaseServer
      .from("booking_settings")
      .upsert(upsert as never, { onConflict: "restaurant_id" })
      .select()
      .single()) as {
      data: BookingSettings | null
      error: { message: string } | null
    }

    if (error) {
      console.error("[PUT /api/booking-settings] Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to save settings", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, settings })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("[PUT /api/booking-settings]", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}
