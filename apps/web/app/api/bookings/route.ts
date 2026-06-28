import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkAvailability } from "@/lib/availability"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantSlug = searchParams.get("restaurantSlug")
    const date = searchParams.get("date")
    const checkAvail = searchParams.get("checkAvailability") === "true"
    const time = searchParams.get("time")
    const partySize = searchParams.get("partySize")

    if (!restaurantSlug) {
      return NextResponse.json({ error: "Missing restaurantSlug parameter" }, { status: 400 })
    }

    if (checkAvail) {
      if (!date || !time || !partySize) {
        return NextResponse.json({ error: "Missing required parameters for availability check" }, { status: 400 })
      }
      const availResult = await checkAvailability(restaurantSlug, date, time, Number(partySize))
      return NextResponse.json(availResult)
    }

    const where: any = { restaurantSlug }
    if (date) {
      where.date = date
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: [
        { date: "asc" },
        { time: "asc" }
      ]
    })

    return NextResponse.json({ bookings })
  } catch (error: any) {
    console.error("GET Bookings error:", error)
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      restaurantSlug,
      date,
      time,
      partySize,
      customerName,
      customerEmail,
      customerPhone
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
      return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 })
    }

    // Check availability using real business rules
    const availResult = await checkAvailability(restaurantSlug, date, time, Number(partySize))
    if (!availResult.available) {
      return NextResponse.json({ error: availResult.message }, { status: 409 })
    }

    // Save booking
    const booking = await prisma.booking.create({
      data: {
        restaurantSlug,
        date,
        time,
        partySize: Number(partySize),
        customerName,
        customerEmail,
        customerPhone,
        status: "confirmed"
      }
    })

    return NextResponse.json({ success: true, message: "Booking confirmed successfully", booking }, { status: 201 })
  } catch (error: any) {
    console.error("POST Bookings error:", error)
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
  }
}
