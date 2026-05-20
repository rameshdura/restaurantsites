import { getRestaurant, generateRestaurantLlmTxt } from "@/lib/restaurant"

interface RouteProps {
  params: Promise<{ restaurant: string }>
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { restaurant: slug } = await params
    const decodedSlug = decodeURIComponent(slug)
    const restaurant = await getRestaurant(decodedSlug)

    if (!restaurant) {
      return new Response("Not Found", { status: 404 })
    }

    const md = generateRestaurantLlmTxt(restaurant.data)

    return new Response(md, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error serving restaurant llms.txt:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
