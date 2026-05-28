import { OwnerTableDetailClient } from "./OwnerTableDetailClient"
import { getRestaurant, groupMenuByCategory } from "@/lib/restaurant"
import { notFound } from "next/navigation"

export default async function TableDetailPage({
  params,
}: {
  params: Promise<{ restaurant: string; tableId: string }>
}) {
  const resolvedParams = await params
  const decodedSlug = decodeURIComponent(resolvedParams.restaurant)
  const restaurant = await getRestaurant(decodedSlug)

  if (!restaurant) {
    notFound()
  }

  const { data, menu } = restaurant
  const categories = groupMenuByCategory(menu, decodedSlug)

  return (
    <OwnerTableDetailClient
      restaurantSlug={decodedSlug}
      tableId={resolvedParams.tableId}
      currency={data.app?.currency || "USD"}
      categories={categories}
    />
  )
}
