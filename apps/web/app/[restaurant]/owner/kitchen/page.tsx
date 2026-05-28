import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { KitchenClient } from "./KitchenClient"

interface KitchenPageProps {
  params: Promise<{ restaurant: string }>
}

export default async function KitchenPage({ params }: KitchenPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  // Fetch restaurant data to get the menu details
  const restaurantData = await getRestaurant(decodedSlug)

  if (!restaurantData) {
    notFound()
  }

  // Handle missing data gracefully
  const menuCategories = restaurantData.data?.menuCategories || []
  const menuItems = restaurantData.menu || []

  return (
    <KitchenClient
      restaurantSlug={decodedSlug}
      menu={menuItems}
      menuCategories={menuCategories}
    />
  )
}
