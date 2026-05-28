import { Metadata } from "next"
import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { OwnerActivityClient } from "./OwnerActivityClient"

interface OwnerActivityPageProps {
  params: Promise<{ restaurant: string }>
}

export async function generateMetadata({
  params,
}: OwnerActivityPageProps): Promise<Metadata> {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)
  if (!restaurant) return {}

  return {
    title: `Activity | ${restaurant.data.name || "Restaurant"}`,
    description: `Track orders, manage tables, and check analytics in real-time.`,
  }
}

export default async function OwnerActivityPage({
  params,
}: OwnerActivityPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const menuItems = restaurant.menu || []

  return (
    <OwnerActivityClient
      restaurantSlug={decodedSlug}
      currency={restaurant.data.app?.currency || "USD"}
      menu={menuItems}
      menuCategories={restaurant.data.menuCategories || []}
    />
  )
}
