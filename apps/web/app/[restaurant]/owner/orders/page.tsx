import { getRestaurant } from "@/lib/restaurant"
import { notFound } from "next/navigation"
import { OrdersPageWrapper } from "./OrdersPageWrapper"

interface OrdersPageProps {
  params: Promise<{ restaurant: string }>
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { restaurant: slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  const restaurantData = await getRestaurant(decodedSlug)

  if (!restaurantData) {
    notFound()
  }

  const menuCategories = restaurantData.data?.menuCategories || []
  const menuItems = restaurantData.menu || []

  return (
    <OrdersPageWrapper
      restaurantSlug={decodedSlug}
      menu={menuItems}
      menuCategories={menuCategories}
    />
  )
}
