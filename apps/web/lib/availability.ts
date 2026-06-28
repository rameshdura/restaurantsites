import { supabaseServer } from "./supabase"
import { getRestaurant } from "./restaurant"
import type { BookingSettings } from "./supabase-types"
import { DEFAULT_BOOKING_SETTINGS } from "./supabase-types"
import { verifyAvailability } from "@workspace/booking-engine"
import type { AvailabilityResult } from "@workspace/booking-engine"

export type { AvailabilityResult }

// ─── Fetch booking settings from Supabase (with defaults) ─────
export async function getBookingSettings(
  restaurantId: string
): Promise<Omit<BookingSettings, "restaurant_id" | "store_id" | "updated_at">> {
  const { data } = await supabaseServer
    .from("booking_settings")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .single()

  if (!data) return DEFAULT_BOOKING_SETTINGS
  return data
}

// ─── Main availability check ──────────────────────────────────
export async function checkAvailability(
  slug: string,
  dateStr: string,
  timeStr: string,
  partySize: number
): Promise<AvailabilityResult> {
  // 1. Load restaurant data.json (for opening hours & reservation config)
  const restaurant = await getRestaurant(slug)
  if (!restaurant) {
    return { available: false, message: "Restaurant not found." }
  }

  // 2. Capacity check — query Supabase reservations table
  const { data: existingBookings, error } = await supabaseServer
    .from("reservations")
    .select("party_size")
    .eq("restaurant_slug", slug)
    .eq("reservation_date", dateStr)
    .eq("reservation_time", timeStr)
    .in("status", ["pending", "confirmed"])

  if (error) {
    console.error("[availability] Supabase query error:", error)
  }

  // 3. Delegate to the decoupled booking engine
  return verifyAvailability({
    storeData: restaurant.data,
    existingBookings: existingBookings ?? [],
    dateStr,
    timeStr,
    partySize,
  })
}
