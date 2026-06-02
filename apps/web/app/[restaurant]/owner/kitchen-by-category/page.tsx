import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { KitchenPageWrapper } from "../kitchen/KitchenPageWrapper"

interface KitchenByCategoryPageProps {
  params: Promise<{ restaurant: string }>
}

export default async function KitchenByCategoryPage({ params }: KitchenByCategoryPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  const restaurantData = await getRestaurant(decodedSlug)

  if (!restaurantData) {
    notFound()
  }

  const menuCategories = restaurantData.data?.menuCategories || []
  const menuItems = restaurantData.menu || []

  return (
    <KitchenPageWrapper
      restaurantSlug={decodedSlug}
      menu={menuItems}
      menuCategories={menuCategories}
      initialView="category"
    />
  )
}
