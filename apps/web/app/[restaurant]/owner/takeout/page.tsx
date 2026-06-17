import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { TakeoutClient } from "./TakeoutClient"

interface TakeoutPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: TakeoutPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}

  return {
    title: `Takeout & Delivery | ${restaurant.data.name || "Restaurant"}`,
    description: `Manage online takeout, carryout, and home delivery orders in real-time.`,
  }
}

export default async function TakeoutPage({ params }: TakeoutPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const menuItems = restaurant.menu || []

  return (
    <TakeoutClient
      restaurantSlug={decodedSlug}
      restaurantName={restaurant.data.name || "Restaurant"}
      currency={restaurant.data.app?.currency || "USD"}
      menu={menuItems}
      menuCategories={restaurant.data.menuCategories || []}
    />
  )
}
