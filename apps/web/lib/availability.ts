import { supabaseServer } from "./supabase"
import { getRestaurant } from "./restaurant"
import type { BookingSettings } from "./supabase-types"
import { DEFAULT_BOOKING_SETTINGS } from "./supabase-types"

export interface AvailabilityResult {
  available: boolean
  message: string
}

const DAYS_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// ─── Day-range matching (e.g. "Mon - Thu", "Everyday") ────────
function dayMatchesRange(dayName: string, rangeStr: string): boolean {
  const norm = rangeStr.toLowerCase().trim()
  const day = dayName.toLowerCase()

  if (["everyday", "daily", "mon - sun"].includes(norm)) return true
  if (norm === day) return true

  if (norm.includes("-")) {
    const [start, end] = norm.split("-").map((p) => p.trim())
    const si = DAYS_MAP.findIndex((d) => d.toLowerCase() === start)
    const ei = DAYS_MAP.findIndex((d) => d.toLowerCase() === end)
    const ti = DAYS_MAP.findIndex((d) => d.toLowerCase() === day)
    if (si !== -1 && ei !== -1 && ti !== -1) {
      return si <= ei ? ti >= si && ti <= ei : ti >= si || ti <= ei
    }
  }

  if (norm.includes(",")) {
    return norm
      .split(",")
      .map((d) => d.trim())
      .includes(day)
  }

  return false
}

// ─── Time helpers ─────────────────────────────────────────────
function timeToMinutes(t: string): number {
  const [h = "0", m = "0"] = t.split(":")
  return Number(h) * 60 + Number(m)
}

function timeIsWithinShift(timeStr: string, shiftStr?: string): boolean {
  if (!shiftStr?.trim()) return false
  const parts = shiftStr.split("-").map((p) => p.trim())
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false
  const t = timeToMinutes(timeStr)
  const s = timeToMinutes(parts[0])
  const e = timeToMinutes(parts[1])
  return t >= s && t <= e
}

// ─── Fetch booking settings from Supabase (with defaults) ─────
export async function getBookingSettings(
  restaurantId: string
): Promise<Omit<BookingSettings, "restaurant_id" | "updated_at">> {
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

  const data = restaurant.data
  const reservation = data.reservation

  // 2. Check if restaurant accepts reservations at all
  if (!reservation || reservation.acceptsReservations === false) {
    return {
      available: false,
      message: "This restaurant does not accept online reservations.",
    }
  }

  // 3. Validate party size using Supabase booking_settings if available,
  //    otherwise fall back to data.json reservation config
  const minPartySize = reservation.minimumPartySize ?? 1
  const maxPartySizeFromJson = reservation.maximumPartySize ?? 20

  if (partySize < minPartySize || partySize > maxPartySizeFromJson) {
    return {
      available: false,
      message: `Party size must be between ${minPartySize} and ${maxPartySizeFromJson} guests.`,
    }
  }

  // 4. Validate date
  const dateObj = new Date(dateStr)
  console.log("[checkAvailability] Inputs:", {
    slug,
    dateStr,
    timeStr,
    partySize,
  })
  console.log("[checkAvailability] dateObj parsing:", {
    iso: dateObj.toISOString(),
    dayIndex: dateObj.getDay(),
    timezoneOffset: dateObj.getTimezoneOffset(),
  })
  if (isNaN(dateObj.getTime())) {
    return { available: false, message: "Invalid date format. Use YYYY-MM-DD." }
  }

  // 5. Check opening hours from data.json
  const dayName = DAYS_MAP[dateObj.getDay()] ?? "Sun"
  const openingHours = data.openingHours ?? []
  const daySchedule = openingHours.find(
    (h) => h.day && dayMatchesRange(dayName, h.day)
  )
  console.log(
    "[checkAvailability] dayName:",
    dayName,
    "daySchedule:",
    daySchedule
  )

  if (!daySchedule || daySchedule.isClosed) {
    return {
      available: false,
      message: `The restaurant is closed on ${dayName} (${dateStr}).`,
    }
  }

  const isWithinLunch = daySchedule.lunch
    ? timeIsWithinShift(timeStr, daySchedule.lunch)
    : false
  const isWithinDinner = daySchedule.dinner
    ? timeIsWithinShift(timeStr, daySchedule.dinner)
    : false
  const isWithinGeneric = daySchedule.time
    ? timeIsWithinShift(timeStr, daySchedule.time)
    : false

  if (!isWithinLunch && !isWithinDinner && !isWithinGeneric) {
    const parts: string[] = []
    if (daySchedule.lunch) parts.push(`Lunch: ${daySchedule.lunch}`)
    if (daySchedule.dinner) parts.push(`Dinner: ${daySchedule.dinner}`)
    if (daySchedule.time) parts.push(`Hours: ${daySchedule.time}`)
    return {
      available: false,
      message: `The restaurant is closed at ${timeStr} on ${dayName}.${
        parts.length ? ` Available: ${parts.join(", ")}` : ""
      }`,
    }
  }

  // 6. Capacity check — query Supabase reservations table
  const { data: existingBookings, error } = await supabaseServer
    .from("reservations")
    .select("party_size")
    .eq("restaurant_slug", slug)
    .eq("reservation_date", dateStr)
    .eq("reservation_time", timeStr)
    .in("status", ["pending", "confirmed"])

  if (error) {
    console.error("[availability] Supabase query error:", error)
    // Fail open — let the booking proceed and handle conflicts later
    return { available: true, message: "This slot is available." }
  }

  const currentGuests = (existingBookings ?? []).reduce(
    (sum, b) => sum + b.party_size,
    0
  )
  const slotCapacity = maxPartySizeFromJson * 2 // simple heuristic: 2x max party per slot

  if (currentGuests + partySize > slotCapacity) {
    return {
      available: false,
      message: `We are fully booked at ${timeStr} on ${dateStr}. Please select another time.`,
    }
  }

  return { available: true, message: "This slot is available." }
}
