import { prisma } from "./db"
import { getRestaurant } from "./restaurant"

export interface AvailabilityResult {
  available: boolean
  message: string
}

const DAYS_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Helper to check if a day name matches a day range string (e.g., "Mon - Thu", "Fri", "Everyday")
function dayMatchesRange(dayName: string, rangeStr: string): boolean {
  const normalizedRange = rangeStr.toLowerCase().trim()
  const normalizedDay = dayName.toLowerCase()

  if (normalizedRange === "everyday" || normalizedRange === "daily" || normalizedRange === "mon - sun") {
    return true
  }

  // Handle single day (e.g., "sun")
  if (normalizedRange === normalizedDay) {
    return true
  }

  // Handle lists or ranges (e.g. "mon - thu", "fri - sat")
  if (normalizedRange.includes("-")) {
    const parts = normalizedRange.split("-").map(p => p.trim())
    if (parts.length === 2) {
      const startDayIndex = DAYS_MAP.findIndex(d => d.toLowerCase() === parts[0])
      const endDayIndex = DAYS_MAP.findIndex(d => d.toLowerCase() === parts[1])
      const targetDayIndex = DAYS_MAP.findIndex(d => d.toLowerCase() === normalizedDay)

      if (startDayIndex !== -1 && endDayIndex !== -1 && targetDayIndex !== -1) {
        if (startDayIndex <= endDayIndex) {
          return targetDayIndex >= startDayIndex && targetDayIndex <= endDayIndex
        } else {
          // Cross-weekend range (e.g., "Fri - Mon")
          return targetDayIndex >= startDayIndex || targetDayIndex <= endDayIndex
        }
      }
    }
  }

  // Handle comma-separated lists (e.g., "mon, wed, fri")
  if (normalizedRange.includes(",")) {
    const days = normalizedRange.split(",").map(d => d.trim())
    return days.includes(normalizedDay)
  }

  return false
}

// Helper to convert "HH:MM" string to minutes from midnight
function timeToMinutes(timeStr: string): number {
  const parts = timeStr.split(":")
  const hours = Number(parts[0] || 0)
  const minutes = Number(parts[1] || 0)
  return hours * 60 + minutes
}

// Helper to check if a time is within a shift "start - end"
function timeIsWithinShift(timeStr: string, shiftStr?: string): boolean {
  if (!shiftStr || shiftStr.trim() === "") return false
  const parts = shiftStr.split("-").map(p => p.trim())
  if (parts.length !== 2) return false
  
  const part0 = parts[0]
  const part1 = parts[1]
  if (!part0 || !part1) return false

  const timeMins = timeToMinutes(timeStr)
  const startMins = timeToMinutes(part0)
  const endMins = timeToMinutes(part1)

  return timeMins >= startMins && timeMins <= endMins
}

export async function checkAvailability(
  slug: string,
  dateStr: string,
  timeStr: string,
  partySize: number
): Promise<AvailabilityResult> {
  const restaurant = await getRestaurant(slug)
  if (!restaurant) {
    return { available: false, message: "Restaurant not found." }
  }

  const data = restaurant.data
  const reservation = data.reservation

  // 1. Check if restaurant accepts reservations
  if (!reservation || reservation.acceptsReservations === false) {
    return { available: false, message: "This restaurant does not accept online reservations." }
  }

  // 2. Validate party size bounds
  const minPartySize = reservation.minimumPartySize ?? 1
  const maxPartySize = reservation.maximumPartySize ?? 20

  if (partySize < minPartySize || partySize > maxPartySize) {
    return {
      available: false,
      message: `Party size must be between ${minPartySize} and ${maxPartySize} guests.`
    }
  }

  // 3. Validate Opening Hours
  const dateObj = new Date(dateStr)
  if (isNaN(dateObj.getTime())) {
    return { available: false, message: "Invalid date format. Use YYYY-MM-DD." }
  }

  const dayName = DAYS_MAP[dateObj.getDay()] || "Sunday"
  const openingHours = data.openingHours || []
  
  const daySchedule = openingHours.find(h => h.day && dayMatchesRange(dayName, h.day))

  if (!daySchedule || daySchedule.isClosed) {
    return { available: false, message: `The restaurant is closed on ${dayName} (${dateStr}).` }
  }

  // Check lunch or dinner shift
  const isWithinLunch = daySchedule.lunch ? timeIsWithinShift(timeStr, daySchedule.lunch) : false
  const isWithinDinner = daySchedule.dinner ? timeIsWithinShift(timeStr, daySchedule.dinner) : false
  const isWithinGeneric = daySchedule.time ? timeIsWithinShift(timeStr, daySchedule.time) : false

  if (!isWithinLunch && !isWithinDinner && !isWithinGeneric) {
    let msg = `The restaurant is closed at ${timeStr} on ${dayName}.`
    const hoursMsgParts: string[] = []
    if (daySchedule.lunch) hoursMsgParts.push(`Lunch: ${daySchedule.lunch}`)
    if (daySchedule.dinner) hoursMsgParts.push(`Dinner: ${daySchedule.dinner}`)
    if (daySchedule.time) hoursMsgParts.push(`Hours: ${daySchedule.time}`)
    if (hoursMsgParts.length > 0) {
      msg += ` Available slots: ${hoursMsgParts.join(", ")}`
    }
    return { available: false, message: msg }
  }

  // 4. Capacity constraints
  // For SQLite dev mode: Let's assume a capacity limit of 30 guests / table bookings per 30-minute window.
  // We check existing bookings at this date and time.
  const existingBookings = await prisma.booking.findMany({
    where: {
      restaurantSlug: slug,
      date: dateStr,
      time: timeStr,
      status: "confirmed"
    }
  })

  const currentGuests = existingBookings.reduce((sum, b) => sum + b.partySize, 0)
  const slotCapacity = 20 // Max 20 guests per exact time slot

  if (currentGuests + partySize > slotCapacity) {
    return {
      available: false,
      message: `We are fully booked at ${timeStr} on ${dateStr}. Please select another time slot.`
    }
  }

  return { available: true, message: "This slot is available." }
}
