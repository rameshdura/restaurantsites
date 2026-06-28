import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const booking = await prisma.booking.findUnique({
      where: { id }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({ booking })
  } catch (error: any) {
    console.error("GET Booking by ID error:", error)
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, date, time, partySize, customerName, customerEmail, customerPhone } = body

    const booking = await prisma.booking.findUnique({
      where: { id }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(date && { date }),
        ...(time && { time }),
        ...(partySize && { partySize: Number(partySize) }),
        ...(customerName && { customerName }),
        ...(customerEmail && { customerEmail }),
        ...(customerPhone && { customerPhone })
      }
    })

    return NextResponse.json({ success: true, message: "Booking updated successfully", booking: updated })
  } catch (error: any) {
    console.error("PATCH Booking error:", error)
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const booking = await prisma.booking.findUnique({
      where: { id }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    await prisma.booking.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: "Booking deleted successfully" })
  } catch (error: any) {
    console.error("DELETE Booking error:", error)
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
  }
}
