import { NextResponse } from "next/server"
import { getRestaurant } from "@/lib/restaurant"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get("slug")

  if (!slug) {
    return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 })
  }

  // Validate authorization
  const authHeader = request.headers.get("authorization")
  const expectedSecret = process.env.INTERNAL_SYNC_SECRET

  if (!expectedSecret) {
    console.error("INTERNAL_SYNC_SECRET is not configured on the server.")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const restaurant = await getRestaurant(slug)

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    // Return the raw data object
    return NextResponse.json(restaurant.data)
  } catch (error) {
    console.error(`Error fetching data for ${slug}:`, error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
