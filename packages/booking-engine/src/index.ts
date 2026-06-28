export interface AvailabilityResult {
  available: boolean
  message: string
}

export interface BookingSettings {
  store_id: string
  booking_enabled: boolean
  slot_duration_minutes: number
  max_party_size: number
  max_days_in_advance: number
  opening_time: string // "HH:MM:SS"
  closing_time: string // "HH:MM:SS"
  buffer_between_bookings: number
  auto_confirm: boolean
  timezone: string
  updated_at: string
}

export interface StoreData {
  name: string
  address?: string
  openingHours?: {
    day: string
    lunch?: string
    lunchLO?: string
    dinner?: string
    dinnerLO?: string
    time?: string
    isClosed?: boolean
    notes?: string
  }[]
  reservation?: {
    acceptsReservations: boolean
    reservationMethods: string[]
    onlineBookingUrl?: string
    minimumPartySize?: number
    maximumPartySize?: number
    largeGroups?: boolean
    largeGroupCapacity?: number
  }
}

// Backwards compatibility alias
export type RestaurantData = StoreData;

export const DAYS_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export const DEFAULT_BOOKING_SETTINGS: Omit<
  BookingSettings,
  "store_id" | "updated_at"
> = {
  booking_enabled: true,
  slot_duration_minutes: 30,
  max_party_size: 8,
  max_days_in_advance: 30,
  opening_time: "11:00:00",
  closing_time: "22:00:00",
  buffer_between_bookings: 0,
  auto_confirm: true,
  timezone: "Asia/Tokyo",
}

// ─── Day-range matching (e.g. "Mon - Thu", "Everyday") ────────
export function dayMatchesRange(dayName: string, rangeStr: string): boolean {
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
export function timeToMinutes(t: string): number {
  const [h = "0", m = "0"] = t.split(":")
  return Number(h) * 60 + Number(m)
}

export function timeIsWithinShift(timeStr: string, shiftStr?: string): boolean {
  if (!shiftStr?.trim()) return false
  const parts = shiftStr.split("-").map((p) => p.trim())
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false
  const t = timeToMinutes(timeStr)
  const s = timeToMinutes(parts[0])
  const e = timeToMinutes(parts[1])
  return t >= s && t <= e
}

// ─── Pure availability check ──────────────────────────────────
export function verifyAvailability({
  storeData,
  existingBookings,
  dateStr,
  timeStr,
  partySize,
}: {
  storeData: StoreData
  existingBookings: Array<{ party_size: number }>
  dateStr: string
  timeStr: string
  partySize: number
}): AvailabilityResult {
  const reservation = storeData.reservation

  // 1. Check if store accepts reservations at all
  if (!reservation || reservation.acceptsReservations === false) {
    return {
      available: false,
      message: "This store does not accept online reservations.",
    }
  }

  // 2. Validate party size using data.json reservation config
  const minPartySize = reservation.minimumPartySize ?? 1
  const maxPartySizeFromJson = reservation.maximumPartySize ?? 20

  if (partySize < minPartySize || partySize > maxPartySizeFromJson) {
    return {
      available: false,
      message: `Party size must be between ${minPartySize} and ${maxPartySizeFromJson} guests.`,
    }
  }

  // 3. Validate date
  const dateObj = new Date(dateStr)
  if (isNaN(dateObj.getTime())) {
    return { available: false, message: "Invalid date format. Use YYYY-MM-DD." }
  }

  // 4. Check opening hours from data.json
  const dayName = DAYS_MAP[dateObj.getDay()] ?? "Sun"
  const openingHours = storeData.openingHours ?? []
  const daySchedule = openingHours.find(
    (h) => h.day && dayMatchesRange(dayName, h.day)
  )

  if (!daySchedule || daySchedule.isClosed) {
    return {
      available: false,
      message: `The store is closed on ${dayName} (${dateStr}).`,
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
      message: `The store is closed at ${timeStr} on ${dayName}.${
        parts.length ? ` Available: ${parts.join(", ")}` : ""
      }`,
    }
  }

  // 5. Capacity check using passed existingBookings
  const currentGuests = existingBookings.reduce(
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

// Backwards compatibility wrapper
export function verifyAvailabilityRestaurant({
  restaurantData,
  existingBookings,
  dateStr,
  timeStr,
  partySize,
}: {
  restaurantData: RestaurantData
  existingBookings: Array<{ party_size: number }>
  dateStr: string
  timeStr: string
  partySize: number
}): AvailabilityResult {
  return verifyAvailability({
    storeData: restaurantData,
    existingBookings,
    dateStr,
    timeStr,
    partySize,
  });
}
